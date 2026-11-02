<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\EventStreamController;
use App\Http\Controllers\LocationController;
use Illuminate\Support\Facades\Route;

Route::post('register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::get('verify-email', [AuthController::class, 'verifyEmail']);
Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
Route::post('reset-password', [AuthController::class, 'resetPassword']);
Route::post('contact', [ContactController::class, 'send']);

Route::middleware('web')->group(function () {
	Route::get('auth/google/redirect', [AuthController::class, 'googleRedirect']);
	Route::get('auth/google/callback', [AuthController::class, 'googleCallback']);
});

Route::middleware('auth:sanctum')->group(function () {
	Route::get('me', [AuthController::class, 'me']);
	Route::patch('profile', [AuthController::class, 'updateProfile']);
	Route::post('logout', [AuthController::class, 'logout']);

	Route::get('categories', [CategoryController::class, 'index']);
	Route::get('locations', [LocationController::class, 'index']);

	Route::get('equipment', [EquipmentController::class, 'index']);
	Route::get('equipment/{id}', [EquipmentController::class, 'show']);

	Route::get('events', [EventStreamController::class, 'stream']);

	Route::get('bookings', [BookingController::class, 'index']);
	Route::get('bookings/{id}', [BookingController::class, 'show']);
	Route::post('bookings', [BookingController::class, 'store']);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
	Route::post('equipment', [EquipmentController::class, 'store']);
	Route::put('equipment/{id}', [EquipmentController::class, 'update']);
	Route::post('equipment/{id}/upload', [EquipmentController::class, 'upload']);
	Route::delete('equipment/{id}', [EquipmentController::class, 'destroy']);

	Route::post('categories', [CategoryController::class, 'store']);
	Route::put('categories/{id}', [CategoryController::class, 'update']);
	Route::delete('categories/{id}', [CategoryController::class, 'destroy']);

	Route::post('locations', [LocationController::class, 'store']);
	Route::put('locations/{id}', [LocationController::class, 'update']);
	Route::delete('locations/{id}', [LocationController::class, 'destroy']);

	Route::put('bookings/{id}/approve', [BookingController::class, 'approve']);
	Route::put('bookings/{id}/reject', [BookingController::class, 'reject']);
	Route::put('bookings/{id}/release', [BookingController::class, 'release']);
	Route::put('bookings/{id}/return', [BookingController::class, 'return']);
});