<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
Route::post('reset-password', [AuthController::class, 'resetPassword']);
Route::post('contact', [ContactController::class, 'send']);

Route::middleware('auth:sanctum')->group(static function () {
    Route::get('me', [AuthController::class, 'me']);
    Route::patch('profile', [AuthController::class, 'updateProfile']);
    Route::post('profile/picture', [AuthController::class, 'uploadProfilePicture']);
    Route::post('logout', [AuthController::class, 'logout']);

    Route::get('equipment', [EquipmentController::class, 'index']);
    Route::get('bookings', [BookingController::class, 'index']);
    Route::get('bookings/{id}', [BookingController::class, 'show']);
});

Route::middleware(['auth:sanctum', 'role:borrower'])->group(static function () {
    Route::post('bookings', [BookingController::class, 'store']);
    Route::patch('bookings/{id}/read', [BookingController::class, 'isRead']);
    Route::put('bookings/{id}/cancel', [BookingController::class, 'cancel']);
});

Route::middleware(['auth:sanctum', 'role:admin'])->group(static function () {
    Route::post('equipment', [EquipmentController::class, 'store']);
    Route::put('equipment/{id}', [EquipmentController::class, 'update']);
    Route::post('equipment/{id}/upload', [EquipmentController::class, 'upload']);
    Route::delete('equipment/{id}', [EquipmentController::class, 'destroy']);

    Route::put('bookings/{id}/approve', [BookingController::class, 'approve']);
    Route::put('bookings/{id}/reject', [BookingController::class, 'reject']);
    Route::put('bookings/{id}/release', [BookingController::class, 'release']);
    Route::put('bookings/{id}/return', [BookingController::class, 'return']);
    Route::post('bookings/{id}/remind', [BookingController::class, 'remind']);
});

Route::middleware(['auth:sanctum', 'role:sysadmin'])->group(static function () {
    Route::get('users', [UserController::class, 'index']);
    Route::post('users', [UserController::class, 'store']);
    Route::patch('users/{id}', [UserController::class, 'update']);
    Route::delete('users/{id}', [UserController::class, 'destroy']);
});
