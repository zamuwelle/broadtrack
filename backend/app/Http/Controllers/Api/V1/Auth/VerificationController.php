<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\Auth\ResendVerificationRequest;
use App\Http\Requests\Api\V1\Auth\VerifyEmailRequest;
use App\Mail\VerifyEmailMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;

class VerificationController extends ApiController
{
    public function verify(VerifyEmailRequest $request): JsonResponse
    {
        $email = $request->validated('email');
        $code = $request->validated('code');

        $user = User::where('email', $email)->first();

        if (! $user) {
            return $this->error('Incorrect verification code. Please try again.', 422);
        }

        if ($user->email_verified_at) {
            return $this->validationError(message: 'Email is already verified.');
        }

        if (! $user->verification_code || ! hash_equals($user->verification_code, (string)$code)) {
            return $this->error('Incorrect verification code. Please try again.', 422);
        }

        if ($user->verification_sent_at && $user->verification_sent_at->addMinutes(15)->isPast()) {
            return $this->error('Verification code has expired. Please request a new one.', 422);
        }

        $user->update([
            'email_verified_at' => now(),
            'verification_code' => null,
        ]);

        return $this->success(message: 'Email verified successfully.');
    }

    public function resend(ResendVerificationRequest $request): JsonResponse
    {
        $user = User::where('email', $request->validated('email'))->first();

        if (! $user) {
            return $this->success(message: 'If an account exists with that email and is unverified, a verification code has been sent.');
        }

        if ($user->email_verified_at) {
            return $this->validationError(message: 'Email is already verified.');
        }

        if ($user->verification_sent_at && $user->verification_sent_at->gt(now()->subMinute())) {
            return $this->error('Please wait before requesting another verification code.', 429);
        }

        self::sendVerification($user);

        return $this->success(message: 'Verification code sent to your email.');
    }

    public static function sendVerification(User $user): void
    {
        $code = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

        $user->update([
            'verification_code' => $code,
            'verification_sent_at' => now(),
        ]);

        Mail::to($user->email)->queue(new VerifyEmailMail($code, $user->firstname));
    }
}
