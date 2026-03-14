<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\ApiKey;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $key = $request->header('x-api-key') ?? $request->bearerToken();

        if (!$key) {
            return response()->json([
                'status' => 'error',
                'message' => 'مفتاح الـ API مفقود.'
            ], 401);
        }

        $apiKey = ApiKey::where('key', $key)->where('is_active', true)->first();

        if (!$apiKey) {
            return response()->json([
                'status' => 'error',
                'message' => 'مفتاح الـ API غير صالح أو غير مفعل.'
            ], 403);
        }

        return $next($request);
    }
}
