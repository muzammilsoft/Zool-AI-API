<?php

use App\Http\Middleware\ValidateApiKey;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ChatController;
use App\Http\Controllers\MediaController;

Route::middleware([ValidateApiKey::class])->group(function () {
    Route::post('/v1/chat', [ChatController::class, 'chat']);
    Route::post('/v1/image', [MediaController::class, 'generateImage']);
    Route::post('/v1/video', [MediaController::class, 'generateVideo']);
    Route::post('/v1/audio/speech', [MediaController::class, 'textToSpeech']);
    Route::post('/v1/audio/transcriptions', [MediaController::class, 'transcribe']);
});
