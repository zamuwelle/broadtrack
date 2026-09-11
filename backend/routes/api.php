<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\Auth\VerificationController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\BookingReportController;
use App\Http\Controllers\Api\V1\BookingSlipController;
use App\Http\Controllers\Api\V1\ContactController;
use App\Http\Controllers\Api\V1\EquipmentController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword'])->middleware('throttle:5,1');
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])->middleware('throttle:5,1');
    Route::post('/resend-verification', [VerificationController::class, 'resend'])->middleware('throttle:5,1');
    Route::post('/verify-email', [VerificationController::class, 'verify'])->middleware('throttle:10,1');

    // Contact
    Route::post('/contact', [ContactController::class, 'send'])->middleware('throttle:5,1');

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {
        // Auth
        Route::post('/logout', [AuthController::class, 'logout']);

        // Profile
        Route::get('/me', [ProfileController::class, 'show']);

        // Equipment
        Route::get('/equipment', [EquipmentController::class, 'index']);

        // Equipment (admin & sysadmin)
        Route::middleware('role:admin')->group(function () {
            Route::post('/equipment', [EquipmentController::class, 'store']);
            Route::put('/equipment/{equipment}', [EquipmentController::class, 'update']);
            Route::post('/equipment/{equipment}/upload', [EquipmentController::class, 'upload']);
            Route::delete('/equipment/{equipment}', [EquipmentController::class, 'destroy']);
        });

        // Bookings
        Route::get('/bookings', [BookingController::class, 'index']);
        Route::get('/bookings/{booking}', [BookingController::class, 'show']);
        Route::get('/bookings/{booking}/slip/pdf', [BookingSlipController::class, 'show']);
        Route::put('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);

        // Bookings (borrower only)
        Route::middleware('role:borrower')->group(function () {
            Route::post('/bookings', [BookingController::class, 'store']);
            Route::put('/bookings/{booking}/read', [BookingController::class, 'markAsRead']);
        });

        // Bookings (admin & sysadmin)
        Route::middleware('role:admin')->group(function () {
            Route::get('/bookings/reports/pdf', [BookingReportController::class, 'exportPdf']);
            Route::get('/bookings/reports/csv', [BookingReportController::class, 'exportCsv']);
            Route::put('/bookings/{booking}/approve', [BookingController::class, 'approve']);
            Route::put('/bookings/{booking}/reject', [BookingController::class, 'reject']);
            Route::put('/bookings/{booking}/return', [BookingController::class, 'markAsReturned']);
            Route::post('/bookings/{booking}/remind', [BookingController::class, 'remind']);
        });

        // Users (sysadmin only)
        Route::middleware('role:sysadmin')->group(function () {
            Route::get('/users', [UserController::class, 'index']);
            Route::post('/users', [UserController::class, 'store']);
            Route::put('/users/{user}', [UserController::class, 'update']);
            Route::delete('/users/{user}', [UserController::class, 'destroy']);
        });
    });
});
