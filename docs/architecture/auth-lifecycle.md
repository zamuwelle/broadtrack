# Authentication & User Lifecycle

BroadTrack restricts user authentication to institution email domains (`@student.laverdad.edu.ph` and `@laverdad.edu.ph`). Unverified registrations are kept for 24 hours before automated deletion.

---

## Registration & Verification Lifecycle

```mermaid
stateDiagram-v2
    [*] --> FormSubmitted: User Submits Register Form
    FormSubmitted --> UnverifiedCreated: Create Account (email_verified_at = NULL)
    UnverifiedCreated --> EmailDispatched: 6-Digit Verification Code Dispatched

    state UnverifiedCreated {
        [*] --> WaitingForVerification
        WaitingForVerification --> ReRegistered: User Submits Form Again (within 24h)
        ReRegistered --> WaitingForVerification: Updated Credentials + Fresh 6-Digit Code
        WaitingForVerification --> Pruned: 24 Hours Elapsed Without Verification
    }

    EmailDispatched --> VerifiedAccount: User Submits Valid Code Within 15 Min
    VerifiedAccount --> [*]: Permanent Borrower Access
    Pruned --> [*]: Permanently Deleted from Database
```

---

## 1. Domain Validation & Anchoring

In [`HasUserRules.php`](file:///home/sam/git/broadtrack/backend/app/Http/Requests/Concerns/HasUserRules.php):

- Student and employee email rules explicitly enforce the `@` anchor to prevent domain suffix spoofing:
    ```php
    protected function schoolEmailRule(): string
    {
        return 'ends_with:@student.laverdad.edu.ph,@laverdad.edu.ph';
    }
    ```
- This rule is enforced across [`RegisterRequest.php`](file:///home/sam/git/broadtrack/backend/app/Http/Requests/Api/V1/Auth/RegisterRequest.php), [`LoginRequest.php`](file:///home/sam/git/broadtrack/backend/app/Http/Requests/Api/V1/Auth/LoginRequest.php), and [`ForgotPasswordRequest.php`](file:///home/sam/git/broadtrack/backend/app/Http/Requests/Api/V1/Auth/ForgotPasswordRequest.php).

---

## 2. Unverified Registration Handling & OTP Verification

In [`RegisterRequest.php`](file:///home/sam/git/broadtrack/backend/app/Http/Requests/Api/V1/Auth/RegisterRequest.php), [`VerifyEmailRequest.php`](file:///home/sam/git/broadtrack/backend/app/Http/Requests/Api/V1/Auth/VerifyEmailRequest.php), and [`VerificationController.php`](file:///home/sam/git/broadtrack/backend/app/Http/Controllers/Api/V1/Auth/VerificationController.php):

- Email uniqueness is enforced only against verified accounts:
    ```php
    Rule::unique('users')->whereNotNull('email_verified_at')
    ```
- When a user registers, BroadTrack generates a cryptographic 6-digit code via `random_int(100000, 999999)` stored in `verification_code` alongside a `verification_sent_at` timestamp.
- If a user registered previously but did not verify within the 15-minute window, submitting the registration form again updates their unverified record, refreshes `created_at = now()`, and issues a fresh 6-digit OTP code.
- Verification is submitted directly inside the authentication modal via `POST /api/v1/verify-email`. [`VerificationController.php`](file:///home/sam/git/broadtrack/backend/app/Http/Controllers/Api/V1/Auth/VerificationController.php) validates the code using timing-safe `hash_equals()` and rejects expired codes (>15 minutes) or invalid submissions with a 422 Unprocessable Entity status.
- Resend requests (`POST /api/v1/resend-verification`) enforce a 60-second cooldown period, returning HTTP 429 if called within 60 seconds of dispatch.

---

## 3. 24-Hour Model Pruning

In [`User.php`](file:///home/sam/git/broadtrack/backend/app/Models/User.php):

- Implements Laravel's `Prunable` trait:
    ```php
    public function prunable(): Builder
    {
        return static::whereNull('email_verified_at')
            ->where('created_at', '<=', now()->subHours(24));
    }
    ```
- Unverified accounts older than 24 hours are removed by the daily `model:prune` task scheduled in `routes/console.php`.

---

## 4. Google OAuth Domain Verification

In [`OAuthController.php`](file:///home/sam/git/broadtrack/backend/app/Http/Controllers/Api/V1/Auth/OAuthController.php):

- Domain Filter: Only accounts with `@student.laverdad.edu.ph` or `@laverdad.edu.ph` emails are allowed to authenticate via `Str::is(...)`. External domains (e.g. `@gmail.com`) are immediately rejected with an error redirect.
- Unverified Redirect: If an unverified user logs in via Google, they are redirected with a message to check their email for the six-digit verification code.
- Selecting Google sign-in opens the API redirect in a separate window. The OAuth callback redirects that window to the frontend; if the browser blocks the window, the login form navigates there instead.
- Role Redirect:
    ```php
    $target = $user->isAdmin() ? '/dashboard' : '/equipment';
    return redirect($frontendUrl.$target.'?token='.$token);
    ```

---

## 5. Token Revocation & Password Reset

In [`PasswordResetController.php`](file:///home/sam/git/broadtrack/backend/app/Http/Controllers/Api/V1/Auth/PasswordResetController.php):

- When a borrower or administrator successfully resets their password, all active personal access tokens are immediately revoked:
    ```php
    $user->tokens()->delete();
    ```
- Token Lifetime: Configured in `config/sanctum.php` as 24 hours (`60 * 24`).
- Pruning Schedule: Configured in `routes/console.php`:
    ```php
    Schedule::command('sanctum:prune-expired --hours=24')->daily()->timezone('Asia/Manila');
    ```
