<?php

use App\Http\Controllers\Api\V1\Auth\OAuthController;
use App\Http\Controllers\Api\V1\Auth\VerificationController;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Route;

Route::get('favicon.ico', [Controller::class, 'favicon']);

Route::prefix('api/v1')->group(static function () {
    Route::get('auth/google/redirect', [OAuthController::class, 'redirect']);
    Route::get('auth/google/callback', [OAuthController::class, 'callback']);
    Route::get('verify-email', [VerificationController::class, 'verify']);
});
