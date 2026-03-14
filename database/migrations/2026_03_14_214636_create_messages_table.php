<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->string('session_id')->index();
            $blueprint->string('role'); // system, user, assistant
            $blueprint->text('content');
            $blueprint->integer('tokens')->default(0);
            $blueprint->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
