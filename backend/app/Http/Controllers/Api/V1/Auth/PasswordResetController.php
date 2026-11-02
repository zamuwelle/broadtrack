<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\Auth\CheckResetTokenRequest;
use App\Http\Requests\Api\V1\Auth\ForgotPasswordRequest;
use App\Http\Requests\Api\V1\Auth\ResetPasswordRequest;
use App\Mail\ResetPasswordMail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

class PasswordResetController extends ApiController
{
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (! $user) {
            return $this->success(message: 'Reset link sent to your email.');
        }

        $token = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $validated['email']],
            ['token' => $token, 'created_at' => now()]
        );

        $resetUrl = config('app.frontend_url').'/?tab=reset&token='.$token.'&email='.urlencode($validated['email']);

        try {
            Mail::to($validated['email'])->queue(new ResetPasswordMail($resetUrl, $user->firstname));
        } catch (Throwable $exception) {
            Log::error('Failed to queue password reset email.', [
                'user_id' => $user->id,
                'exception' => $exception,
            ]);
        }

        return $this->success(message: 'Reset link sent to your email.');
    }

    public function checkResetToken(CheckResetTokenRequest $request): JsonResponse
    {
        $validated = $request->validated();

        return $this->success(['valid' => $this->isValidToken($validated['email'], $validated['token'])]);
    }

    private function isValidToken(string $email, string $token): bool
    {
        $record = DB::table('password_reset_tokens')->where('email', $email)->where('token', $token)->first();

        return $record && ! Carbon::parse($record->created_at)->addMinutes(15)->isPast();
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if (! $this->isValidToken($validated['email'], $validated['token'])) {
            return $this->validationError(message: 'Invalid or expired reset token.');
        }

        $user = User::where('email', $validated['email'])->first();
        if (! $user) {
            return $this->notFound('User not found.');
        }

        $user->update(['password' => $validated['password']]);
        $user->tokens()->delete();

        DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();

        return $this->success(message: 'Password reset successfully.');
    }
}
