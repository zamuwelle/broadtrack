<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\ApiController;
use App\Mail\VerifyEmailMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class VerificationController extends ApiController
{
    public function verify(Request $request)
    {
        $token = $request->query('token');

        if (empty($token) || ! is_string($token)) {
            return view('emails.verify-result', [
                'success' => false,
                'frontendUrl' => config('app.frontend_url'),
            ]);
        }

        $user = User::where('verification_token', $token)->first();
        $valid = $user && $user->verification_sent_at && ! $user->verification_sent_at->addMinutes(15)->isPast();

        if ($valid) {
            $user->update(['email_verified_at' => now(), 'verification_token' => null]);
        }

        return view('emails.verify-result', [
            'success' => $valid,
            'frontendUrl' => config('app.frontend_url'),
        ]);
    }

    public function resend(Request $request): JsonResponse
    {
        $user = User::where('email', $request->input('email'))->first();

        if (! $user) {
            return $this->notFound('User not found.');
        }

        if ($user->email_verified_at) {
            return $this->validationError(message: 'Email is already verified.');
        }

        self::sendVerification($user);

        return $this->success(message: 'Verification link sent to your email.');
    }

    public static function sendVerification(User $user): void
    {
        if ($user->verification_sent_at && $user->verification_sent_at->gt(now()->subMinute())) {
            return;
        }

        $token = Str::random(64);

        $user->update(['verification_token' => $token, 'verification_sent_at' => now()]);

        $verifyUrl = config('app.url').'/api/v1/verify-email?token='.$token;

        Mail::to($user->email)->queue(new VerifyEmailMail($verifyUrl, $user->firstname));
    }
}
