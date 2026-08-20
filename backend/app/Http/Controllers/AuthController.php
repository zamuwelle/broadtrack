<?php

namespace App\Http\Controllers;

use App\Http\Requests\Api\V1\Auth\ForgotPasswordRequest;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Requests\Api\V1\Auth\ResetPasswordRequest;
use App\Http\Requests\Api\V1\ImageRequest;
use App\Http\Requests\Api\V1\UpdateProfileRequest;
use App\Mail\ResetPasswordMail;
use App\Mail\VerifyEmailMail;
use App\Models\User;
use App\Services\CloudinaryService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        $user = User::create($validated);

        $this->sendVerification($user);

        return $this->success([
            'email' => $validated['email'],
        ], 'Verification link sent to your email', 201);
    }

    public function login(LoginRequest $request)
    {
        $validated = $request->validated();

        $throttleKey = Str::transliterate(Str::lower($validated['email']).'|'.request()->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            return $this->error("Too many login attempts. Please try again in {$seconds} seconds.", 429);
        }

        if (! Auth::attempt($validated)) {
            RateLimiter::hit($throttleKey, 60);

            return $this->error('Email or password is incorrect', 401);
        }

        RateLimiter::clear($throttleKey);

        $user = User::where('email', $validated['email'])->first();

        if (! $user->email_verified_at) {
            $this->sendVerification($user);

            return $this->error('Please verify your email first. We sent you a link', 403);
        }

        $user->tokens()->delete();

        return $this->success([
            'user' => $user,
            'token' => $user->createToken('auth-token')->plainTextToken,
        ], 'Logged in successfully');
    }

    public function googleRedirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function googleCallback()
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

    public function me()
    {
        return $this->success(request()->user());
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $validated = $request->validated();

        $user = $request->user();
        $user->update($validated);

        return $this->success($user, 'Profile updated successfully');
    }

    public function uploadProfilePicture(ImageRequest $request)
    {
        $user = request()->user();
        $cloudinaryService = new CloudinaryService;
        $rawIdentifier = "user-{$user->id}";
        $uploadResult = $cloudinaryService->upload(request()->file('image'), $rawIdentifier);

        if (! isset($uploadResult['secure_url'])) {
            return $this->error('Upload failed', 500);
        }

        $user->update(['profile_picture' => $uploadResult['secure_url']]);

        return $this->success($user, 'Profile picture updated');
    }

    public function verifyEmail()
    {
        $user = User::where('verification_token', request('token'))->first();
        $valid = $user && $user->verification_sent_at && ! $user->verification_sent_at->addMinutes(15)->isPast();

        if ($valid) {
            $user->update(['email_verified_at' => now(), 'verification_token' => null]);
        }

        return view('emails.verify-result', ['success' => $valid, 'frontendUrl' => config('app.frontend_url')]);
    }

    private function sendVerification($user)
    {
        if ($user->verification_sent_at && $user->verification_sent_at->gt(now()->subMinute())) {
            return;
        }

        $token = Str::random(64);

        $user->update(['verification_token' => $token, 'verification_sent_at' => now()]);

        $verifyUrl = config('app.url').'/api/verify-email?token='.$token;

        Mail::to($user->email)->queue(new VerifyEmailMail($verifyUrl, $user->firstname));
    }

    public function logout()
    {
        $token = request()->user()?->currentAccessToken();
        $token && method_exists($token, 'delete') && $token->delete();

        return $this->success(null, 'Logged out successfully');
    }

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (! $user) {
            return $this->error('No account found with this email', 404);
        }

        $token = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $validated['email']],
            ['token' => $token, 'created_at' => now()]
        );

        $resetUrl = config('app.frontend_url').'/?tab=reset&token='.$token.'&email='.urlencode($validated['email']);

        try {
            Mail::to($validated['email'])->queue(new ResetPasswordMail($resetUrl, $user->firstname));
        } catch (\Throwable) {
        }

        return $this->success(null, 'Reset link sent to your email');
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $validated = $request->validated();

        $record = DB::table('password_reset_tokens')
            ->where('email', $validated['email'])
            ->where('token', $validated['token'])
            ->first();

        if (! $record || Carbon::parse($record->created_at)->addMinutes(15)->isPast()) {
            return $this->error('Invalid or expired reset token', 400);
        }

        $user = User::where('email', $validated['email'])->first();
        if (! $user) {
            return $this->error('User not found', 404);
        }

        $user->update(['password' => $validated['password']]);

        DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();

        return $this->success(null, 'Password reset successfully');
    }
}
