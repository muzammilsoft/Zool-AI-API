<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class MediaController extends Controller
{
    private function getApiKey()
    {
        return env('POLLINATIONS_API_KEY');
    }

    public function generateImage(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string',
            'width' => 'integer|nullable',
            'height' => 'integer|nullable',
            'seed' => 'integer|nullable',
            'model' => 'string|nullable',
            'nologo' => 'boolean|nullable',
        ]);

        $prompt = $request->input('prompt');
        $params = $request->only(['width', 'height', 'seed', 'model', 'nologo']);
        $params['key'] = $this->getApiKey();

        $url = "https://gen.pollinations.ai/image/" . urlencode($prompt) . "?" . http_build_query($params);

        return response()->json([
            'status' => 'success',
            'image_url' => $url,
            'created_at' => now()->toIso8601String()
        ]);
    }

    public function generateVideo(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string',
        ]);

        $prompt = $request->input('prompt');
        $apiKey = $this->getApiKey();

        // Dispatch to queue to handle load as requested
        \App\Jobs\ProcessVideoGeneration::dispatch($prompt, $apiKey);

        // As per documentation: GET /video/{prompt}
        $url = "https://gen.pollinations.ai/video/" . urlencode($prompt) . "?key=" . $apiKey;

        return response()->json([
            'status' => 'success',
            'video_url' => $url,
            'message' => 'تمت إضافة طلب الفيديو إلى طابور المعالجة. يتم الآن التوليد، قد يستغرق ذلك بعض الوقت.',
            'created_at' => now()->toIso8601String()
        ]);
    }

    public function textToSpeech(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
            'voice' => 'string|nullable',
        ]);

        $text = $request->input('text');
        $voice = $request->input('voice', 'nova');
        $apiKey = $this->getApiKey();

        $url = "https://gen.pollinations.ai/audio/" . urlencode($text) . "?voice=" . $voice . "&key=" . $apiKey;

        return response()->json([
            'status' => 'success',
            'audio_url' => $url,
            'created_at' => now()->toIso8601String()
        ]);
    }

    public function transcribe(Request $request)
    {
        $request->validate([
            'file' => 'required|file',
            'model' => 'string|nullable',
        ]);

        $apiKey = $this->getApiKey();

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
        ])->attach(
            'file', file_get_contents($request->file('file')->getRealPath()), $request->file('file')->getClientOriginalName()
        )->post('https://gen.pollinations.ai/v1/audio/transcriptions', [
            'model' => $request->input('model', 'whisper-1'),
        ]);

        if ($response->failed()) {
            return response()->json([
                'status' => 'error',
                'message' => 'فشل التعرف على الصوت.',
                'details' => $response->json()
            ], $response->status());
        }

        return response()->json([
            'status' => 'success',
            'data' => $response->json(),
            'created_at' => now()->toIso8601String()
        ]);
    }
}
