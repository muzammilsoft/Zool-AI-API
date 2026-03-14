<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProcessVideoGeneration implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $prompt;
    protected $apiKey;

    public function __construct($prompt, $apiKey)
    {
        $this->prompt = $prompt;
        $this->apiKey = $apiKey;
    }

    public function handle(): void
    {
        Log::info("Processing video generation for prompt: {$this->prompt}");

        // In a real scenario, we might want to download the video or ping another service
        // For now, we simulate the "load handling" by having the job process it.
        $url = "https://gen.pollinations.ai/video/" . urlencode($this->prompt) . "?key=" . $this->apiKey;

        try {
            $response = Http::get($url);
            if ($response->successful()) {
                Log::info("Video generated successfully for: {$this->prompt}");
            } else {
                Log::error("Video generation failed for: {$this->prompt}");
            }
        } catch (\Exception $e) {
            Log::error("Error generating video: " . $e->getMessage());
        }
    }
}
