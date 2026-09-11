# Authentication and User Lifecycle

Authentication and account routes are defined in [`backend/routes/api.php`](../../backend/routes/api.php). Protected API routes use Sanctum bearer tokens. The registered user roles are defined in [`UserRole`](../../backend/app/Enums/UserRole.php).

Registration, login, forgot-password, and resend-verification requests accept only `@student.laverdad.edu.ph` and `@laverdad.edu.ph` addresses. Registration shares its domain rule through [`HasUserRules`](../../backend/app/Http/Requests/Concerns/HasUserRules.php); the other requests declare the same suffix rule in their Form Requests. Email or code validation failures return 422, and a resend inside the 60-second cooldown returns 429. See [`RegisterRequest`](../../backend/app/Http/Requests/Api/V1/Auth/RegisterRequest.php), [`LoginRequest`](../../backend/app/Http/Requests/Api/V1/Auth/LoginRequest.php), [`ForgotPasswordRequest`](../../backend/app/Http/Requests/Api/V1/Auth/ForgotPasswordRequest.php), and [`ResendVerificationRequest`](../../backend/app/Http/Requests/Api/V1/Auth/ResendVerificationRequest.php).

## Registration and verification

Registration creates an unverified account and queues a six-digit verification email. Verification codes expire after 15 minutes. An unverified account can register again with the same email; the existing record is updated and its creation time is refreshed. A verification resend has a 60-second cooldown. These rules are implemented in [`AuthController`](../../backend/app/Http/Controllers/Api/V1/Auth/AuthController.php) and [`VerificationController`](../../backend/app/Http/Controllers/Api/V1/Auth/VerificationController.php).

```mermaid
stateDiagram-v2
    [*] --> Unverified: Register
    Unverified --> Unverified: Re-register or resend code
    Unverified --> Verified: Submit valid code within 15 minutes
    Unverified --> Pruned: Unverified for 24 hours
    Verified --> [*]
    Pruned --> [*]
```

[`User::prunable`](../../backend/app/Models/User.php) selects unverified users at least 24 hours old. The daily `model:prune` task runs this model's query. The scheduler is configured in [`routes/console.php`](../../backend/routes/console.php).

## Login and tokens

Login rejects an unverified user and sends another verification code. On successful login, the application deletes the user's existing Sanctum tokens and creates a new `auth-token`. Logout deletes the current token. The configured Sanctum expiration is 24 hours, and the daily `sanctum:prune-expired --hours=24` task removes expired token records according to Sanctum's command behavior.

## Password reset

Forgot-password requests return a not-found response for an unknown email. For a known email, the controller creates a reset token that expires after 15 minutes and queues a reset email. If queuing throws, the failure is logged; the controller still returns the success response. Resetting a password deletes all of that user's Sanctum tokens and removes the reset-token record. These responses do not provide a uniform generic response for known and unknown email addresses; see [`PasswordResetController`](../../backend/app/Http/Controllers/Api/V1/Auth/PasswordResetController.php) before changing this behavior.

## OAuth

The login form currently displays a Google sign-in option in [`LoginForm.jsx`](../../frontend/web/src/features/auth/components/LoginForm.jsx), but the current [`api.php`](../../backend/routes/api.php) does not define OAuth endpoints. Google sign-in is therefore not an available API flow.
