<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class AuthController extends ApiController
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create($validated);

        VerificationController::sendVerification($user);

        return $this->created([
            'email' => $validated['email'],
        ], 'Verification link sent to your email.');
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if (! Auth::attempt($validated)) {
            return $this->unauthorized(__('auth.failed'));
        }

        $user = User::where('email', $validated['email'])->first();

        if (! $user->email_verified_at) {
            VerificationController::sendVerification($user);

            return $this->forbidden('Please verify your email first. We sent you a link.');
        }

        $user->tokens()->delete();

        return $this->success([
            'user' => new UserResource($user),
            'token' => $user->createToken('auth-token')->plainTextToken,
        ], 'Logged in successfully.');
    }

    public function logout(): JsonResponse
    {
        $token = request()->user()?->currentAccessToken();
        $token && method_exists($token, 'delete') && $token->delete();

        return $this->success(message: 'Logged out successfully.');
    }
}
