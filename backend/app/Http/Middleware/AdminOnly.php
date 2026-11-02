<?php

namespace App\Http\Middleware;

use Closure;

class AdminOnly
{
	public function handle($request, Closure $next)
	{
		if (!$request->user()->isAdmin()) {
			abort(403, 'Unauthorized');
		}

		return $next($request);
	}
}
