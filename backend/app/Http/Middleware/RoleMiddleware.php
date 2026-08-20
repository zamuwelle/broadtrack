<?php

namespace App\Http\Middleware;

class RoleMiddleware
{
    public function handle($request, $next, $role)
    {
        $user = $request->user();
        $allowed = match ($role) {
            'admin' => $user?->isAdmin(),
            'sysadmin' => $user?->isSysAdmin(),
            'borrower' => $user?->isBorrower(),
            default => false,
        };

        if (! $allowed) {
            abort(403, 'Unauthorized');
        }

        return $next($request);
    }
}
