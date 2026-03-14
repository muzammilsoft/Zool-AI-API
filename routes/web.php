<?php

use App\Http\Controllers\ApiKeyController;
use Illuminate\Support\Facades\Route;

Route::get('/', [ApiKeyController::class, 'showRegistrationForm'])->name('register');
Route::post('/register', [ApiKeyController::class, 'register'])->name('register.submit');
Route::get('/docs', function () {
    return view('docs');
})->name('docs');
