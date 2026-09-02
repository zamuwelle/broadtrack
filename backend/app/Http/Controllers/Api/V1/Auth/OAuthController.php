<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\ApiController;
use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class OAuthController extends ApiController
{
    public function redirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function callback()
    {
        $frontendUrl = config('app.frontend_url');
        $fail = fn (string $msg) => redirect($frontendUrl.'/?error='.urlencode($msg));

        if (request('error') === 'access_denied') {
            return redirect($frontendUrl);
        }

        if (request()->has('error') || ! request()->has('code')) {
            return $fail('Google authentication was cancelled');
        }

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (Throwable) {
            return $fail('Google authentication failed. Please try again');
        }

        $email = $googleUser->getEmail();

        if (! Str::is(['*@student.laverdad.edu.ph', '*@laverdad.edu.ph'], $email)) {
            return $fail('Please use a valid La Verdad email address.');
        }

        $avatar = $googleUser->getAvatar();
        $profilePicture = $avatar ? Str::replaceMatches('/=s\d+(-c)?$/', '=s400-c', $avatar) : null;
        $user = User::where('email', $email)->first();

        if (! $user) {
            return redirect($frontendUrl.'/?'.http_build_query(array_filter([
                'tab' => 'register',
                'email' => $email,
                'firstname' => $googleUser->user['given_name'] ?? Str::before($googleUser->getName() ?? '', ' '),
                'lastname' => $googleUser->user['family_name'] ?? Str::after($googleUser->getName() ?? '', ' '),
                'profile_picture' => $profilePicture,
            ])));
        }

        if (! $user->email_verified_at) {
            VerificationController::sendVerification($user);

            return $fail('Please verify your email first. We sent you a link.');
        }

        if ($profilePicture && (! $user->profile_picture || str_contains($user->profile_picture, 'googleusercontent.com'))) {
            $user->update(['profile_picture' => $profilePicture]);
        }

        $user->tokens()->delete();
        $target = $user->isAdmin() ? '/admin' : '/borrow';

        return redirect($frontendUrl.$target.'?token='.$user->createToken('auth-token')->plainTextToken);
    }
}
