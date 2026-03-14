<?php

namespace Tests\Feature;

use App\Models\ApiKey;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_chat_api_requires_api_key()
    {
        $response = $this->postJson('/api/v1/chat', [
            'model' => 'openai',
            'session' => 'test_session',
            'messages' => [['role' => 'user', 'content' => 'Hello']]
        ]);

        $response->assertStatus(401);
    }

    public function test_chat_api_with_valid_key()
    {
        $apiKey = ApiKey::create([
            'key' => 'zoolai_test_key',
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'is_active' => true,
        ]);

        // Mocking the external HTTP call would be better, but let's check validation first
        $response = $this->withHeader('x-api-key', 'zoolai_test_key')
            ->postJson('/api/v1/chat', [
                'model' => 'openai',
                'session' => 'test_session',
                'messages' => [['role' => 'user', 'content' => 'Hello']]
            ]);

        // It might fail if no internet or invalid pollinations key, but should pass middleware
        $this->assertNotEquals(401, $response->status());
        $this->assertNotEquals(403, $response->status());
    }
}
