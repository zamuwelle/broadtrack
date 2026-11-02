<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role): Response
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
