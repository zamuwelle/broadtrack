<?php

namespace App\Http\Controllers;

use App\Enums\Department;
use App\Mail\ResetPasswordMail;
use App\Mail\VerifyEmailMail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
	public function register()
	{
		$validated = request()->validate([
			'firstname' => 'required|string|max:255',
			'lastname' => 'required|string|max:255',
			'email' => 'required|email|unique:users|ends_with:student.laverdad.edu.ph,laverdad.edu.ph',
			'phone' => 'required|string',
			'password' => 'required|string|min:8',
			'department' => ['required', Rule::enum(Department::class)],
		], ['email.ends_with' => 'Only La Verdad emails allowed']);

		$phone = $this->normalizePhone($validated['phone']);
		if (!$phone) {
			return $this->error('Invalid phone number format', 422);
		}
		$validated['phone'] = $phone;

		$user = User::create($validated);

		$this->sendVerification($user);

		return $this->success([
			'email' => $validated['email'],
		], 'Verification link sent to your email', 201);
	}

	public function login()
	{
		$validated = request()->validate([
			'email' => 'required|email|ends_with:student.laverdad.edu.ph,laverdad.edu.ph',
			'password' => 'required|string',
		], ['email.ends_with' => 'Only La Verdad emails allowed']);

		if (!Auth::attempt($validated)) {
			return $this->error('Email or password is incorrect', 401);
		}

		$user = User::where('email', $validated['email'])->first();

		if (!$user->email_verified_at) {
			$this->sendVerification($user);
			return $this->error('Please verify your email first. We sent you a link', 403);
		}

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
		$frontend = config('app.frontend_url');
		$googleUser = Socialite::driver('google')->stateless()->user();
		$email = $googleUser->getEmail();

		if (!str_ends_with($email, '@student.laverdad.edu.ph') && !str_ends_with($email, '@laverdad.edu.ph')) {
			return redirect($frontend . '/?error=' . urlencode('Only La Verdad emails allowed'));
		}

		$user = User::where('email', $email)->first();

		if ($user && !$user->email_verified_at) {
			$user->update(['email_verified_at' => now()]);
		}

		if (!$user) {
			$firstname = $googleUser->user['given_name'] ?? explode(' ', $googleUser->getName() ?? '')[0] ?? '';
			$lastname = $googleUser->user['family_name'] ?? explode(' ', $googleUser->getName() ?? '')[1] ?? '';
			$query = http_build_query([
				'tab' => 'register',
				'email' => $email,
				'firstname' => $firstname,
				'lastname' => $lastname,
			]);
			return redirect($frontend . '/?' . $query);
		}

		$token = $user->createToken('auth-token')->plainTextToken;

		return redirect($frontend . '/?token=' . $token);
	}

	public function me()
	{
		return $this->success(request()->user());
	}

	public function updateProfile()
	{
		$validated = request()->validate([
			'firstname' => 'sometimes|string|max:255',
			'lastname' => 'sometimes|string|max:255',
			'phone' => 'sometimes|string',
			'department' => ['sometimes', Rule::enum(Department::class)],
		]);

		if (isset($validated['phone'])) {
			$phone = $this->normalizePhone($validated['phone']);
			if (!$phone) {
				return $this->error('Invalid phone number format', 422);
			}
			$validated['phone'] = $phone;
		}

		$user = request()->user();
		$user->update($validated);

		return $this->success($user, 'Profile updated successfully');
	}

	private function normalizePhone($phone)
	{
		$phone = preg_replace('/[^0-9]/', '', $phone);

		if (str_starts_with($phone, '0')) {
			return '+63' . substr($phone, 1);
		}
		if (str_starts_with($phone, '63')) {
			return '+' . $phone;
		}

		return null;
	}

	public function verifyEmail()
	{
		$user = User::where('verification_token', request('token'))->first();
		$valid = $user && $user->verification_sent_at && !$user->verification_sent_at->addMinutes(15)->isPast();

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

		$verifyUrl = config('app.url') . '/api/verify-email?token=' . $token;

		Mail::to($user->email)->queue(new VerifyEmailMail($verifyUrl, $user->firstname));
	}

	public function logout()
	{
		request()->user()->currentAccessToken()->delete();

		return $this->success(null, 'Logged out successfully');
	}

	public function forgotPassword()
	{
		$validated = request()->validate([
			'email' => 'required|email|ends_with:student.laverdad.edu.ph,laverdad.edu.ph',
		], ['email.ends_with' => 'Only La Verdad emails allowed']);

		$user = User::where('email', $validated['email'])->first();

		if (!$user) {
			return $this->error('No account found with this email', 404);
		}

		$token = Str::random(64);

		DB::table('password_reset_tokens')->updateOrInsert(
			['email' => $validated['email']],
			['token' => $token, 'created_at' => now()]
		);

		$resetUrl = config('app.frontend_url') . '/?tab=reset&token=' . $token . '&email=' . urlencode($validated['email']);

		try {
			Mail::to($validated['email'])->queue(new ResetPasswordMail($resetUrl, $user->firstname));
		} catch (\Throwable) {
		}

		return $this->success(null, 'Reset link sent to your email');
	}

	public function resetPassword()
	{
		$validated = request()->validate([
			'token' => 'required|string',
			'email' => 'required|email',
			'password' => 'required|string|min:8',
		]);

		$record = DB::table('password_reset_tokens')
			->where('email', $validated['email'])
			->where('token', $validated['token'])
			->first();

		if (!$record || Carbon::parse($record->created_at)->addMinutes(15)->isPast()) {
			return $this->error('Invalid or expired reset token', 400);
		}

		$user = User::where('email', $validated['email'])->first();
		if (!$user) {
			return $this->error('User not found', 404);
		}

		$user->update(['password' => $validated['password']]);

		DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();

		return $this->success(null, 'Password reset successfully');
	}
}
