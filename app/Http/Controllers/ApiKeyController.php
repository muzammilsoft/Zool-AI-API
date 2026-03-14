<?php

namespace App\Http\Controllers;

use App\Models\ApiKey;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ApiKeyController extends Controller
{
    public function showRegistrationForm()
    {
        return view('register');
    }

    public function register(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'reason' => 'required|string',
        ]);

        $apiKey = Str::random(40);

        // We save it but keep it inactive or just store it for record.
        // The user said it's a manual process, so we just send the email.

        ApiKey::create([
            'key' => 'zoolai_' . $apiKey,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'company' => $request->company,
            'reason' => $request->reason,
            'is_active' => false, // Manual activation
        ]);

        // Send email (Mocking for now as per instructions "default settings")
        $details = [
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'company' => $request->company,
            'reason' => $request->reason,
            'suggested_key' => 'zoolai_' . $apiKey,
        ];

        try {
            Mail::raw("New API Key Request:\n\n" .
                "Name: {$details['first_name']} {$details['last_name']}\n" .
                "Email: {$details['email']}\n" .
                "Company: {$details['company']}\n" .
                "Reason: {$details['reason']}\n" .
                "Suggested Key: {$details['suggested_key']}", function ($message) use ($details) {
                $message->to('zoolai_api@proton.me')
                    ->subject('New Zool-AI API Key Request');
            });
        } catch (\Exception $e) {
            // Log error but proceed to show success page to user as requested
            \Log::error("Failed to send email: " . $e->getMessage());
        }

        return view('thank-you');
    }
}
