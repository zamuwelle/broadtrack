<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\ApiController;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;

class OAuthController extends ApiController
{
    public function redirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function callback()
    {
        $frontendUrl = config('app.frontend_url');

        if (request()->has('error') || ! request()->has('code')) {
            $oauthError = request()->get('error');

            return redirect($oauthError === 'access_denied'
                ? $frontendUrl
                : $frontendUrl.'/?error='.urlencode('Google authentication was cancelled'));
        }

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Throwable) {
            return redirect($frontendUrl.'/?error='.urlencode('Google authentication failed. Please try again'));
        }

        $email = $googleUser->getEmail();

        if (! str_ends_with($email, '@student.laverdad.edu.ph') && ! str_ends_with($email, '@laverdad.edu.ph')) {
            return redirect($frontendUrl.'/?error='.urlencode('Please use a valid La Verdad email address.'));
        }

        $profilePictureUrl = $googleUser->getAvatar() ? preg_replace('/=s\d+(-c)?$/', '=s400-c', $googleUser->getAvatar()) : null;
        $user = User::where('email', $email)->first();

        if ($user) {
            $userUpdates = [];
            if (! $user->email_verified_at) {
                $userUpdates['email_verified_at'] = now();
            }
            if ($profilePictureUrl && $user->profile_picture !== $profilePictureUrl && (! $user->profile_picture || str_contains($user->profile_picture, 'googleusercontent.com'))) {
                $userUpdates['profile_picture'] = $profilePictureUrl;
            }
            if (! empty($userUpdates)) {
                $user->update($userUpdates);
            }
        }

        if (! $user) {
            $firstname = $googleUser->user['given_name'] ?? explode(' ', $googleUser->getName() ?? '')[0] ?? '';
            $lastname = $googleUser->user['family_name'] ?? explode(' ', $googleUser->getName() ?? '')[1] ?? '';
            $queryParameters = http_build_query(array_filter([
                'tab' => 'register',
                'email' => $email,
                'firstname' => $firstname,
                'lastname' => $lastname,
                'profile_picture' => $profilePictureUrl,
            ]));

            return redirect($frontendUrl.'/?'.$queryParameters);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth-token')->plainTextToken;
        $targetPath = $user->isAdmin() ? '/admin' : '/borrow';

        return redirect($frontendUrl.$targetPath.'?token='.$token);
    }
}
