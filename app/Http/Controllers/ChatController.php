<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Carbon;

class ChatController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate([
            'model' => 'required|string',
            'session' => 'required|string',
            'messages' => 'array',
            'source' => 'string',
            'tools' => 'array',
        ]);

        $source = $request->input('source');
        $allowedSources = ['zoolai', 'iai'];

        // Basic check for source, can be expanded later
        $isAuthorizedSource = in_array($source, $allowedSources);

        $sessionId = $request->input('session');
        $model = $request->input('model');
        $userMessageContent = $request->input('messages.0.content') ?? $request->input('content');

        if (!$userMessageContent && $request->isMethod('post')) {
            // Check if it's in a different format
            $msgs = $request->input('messages');
            if (is_array($msgs) && count($msgs) > 0) {
                $lastMsg = end($msgs);
                if (isset($lastMsg['content'])) {
                    $userMessageContent = $lastMsg['content'];
                }
            }
        }

        // 1. Manage Session History
        // Delete messages older than 5 minutes
        Message::where('session_id', $sessionId)
            ->where('created_at', '<', Carbon::now()->subMinutes(5))
            ->delete();

        // Get current history
        $history = Message::where('session_id', $sessionId)
            ->orderBy('created_at', 'asc')
            ->get();

        // Calculate total tokens (approximation: chars / 4 as per common LLM estimation in PHP)
        $totalTokens = $history->sum('tokens');
        // Add estimate for the new user message
        $newUserTokens = ceil(mb_strlen($userMessageContent) / 4);

        if (($totalTokens + $newUserTokens) > 6500) {
            Message::where('session_id', $sessionId)->delete();
            $history = collect();
        }

        // 2. Prepare Payload for Pollinations
        $systemPrompt = "انت نموذج الذكاء الاصطناعي اسمك زولاي Zool-AI تم تطويرك من قبل KG تتحدث العامية السودانية";

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt]
        ];

        foreach ($history as $msg) {
            $messages[] = ['role' => $msg->role, 'content' => $msg->content];
        }

        $messages[] = ['role' => 'user', 'content' => $userMessageContent];

        // 3. Request to Pollinations AI
        $apiKey = env('POLLINATIONS_API_KEY');

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
            ])->post('https://gen.pollinations.ai/v1/chat/completions', [
                'model' => $model,
                'messages' => $messages,
                'tools' => $request->input('tools'),
            ]);

            if ($response->failed()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'حدث خطأ أثناء الاتصال بمزود الخدمة.',
                    'details' => $response->json()
                ], $response->status());
            }

            $responseData = $response->json();
            $aiContent = $responseData['choices'][0]['message']['content'] ?? '';

            // 4. Save to History
            // Save user message
            Message::create([
                'session_id' => $sessionId,
                'role' => 'user',
                'content' => $userMessageContent,
                'tokens' => $newUserTokens
            ]);

            // Save AI message
            $aiTokens = ceil(mb_strlen($aiContent) / 4);
            Message::create([
                'session_id' => $sessionId,
                'role' => 'assistant',
                'content' => $aiContent,
                'tokens' => $aiTokens
            ]);

            return response()->json([
                'status' => 'success',
                'messages' => [
                    ['role' => 'assistant', 'content' => $aiContent]
                ],
                'created_at' => now()->toIso8601String()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'حدث خطأ داخلي في الخادم.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
