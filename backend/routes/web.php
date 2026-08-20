<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Route;

Route::get('favicon.ico', [Controller::class, 'favicon']);

Route::prefix('api')->group(static function () {
    Route::get('auth/google/redirect', [AuthController::class, 'googleRedirect']);
    Route::get('auth/google/callback', [AuthController::class, 'googleCallback']);
    Route::get('verify-email', [AuthController::class, 'verifyEmail']);
});
