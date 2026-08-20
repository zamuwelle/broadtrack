<?php

use App\Http\Middleware\RoleMiddleware;
use Illuminate\Foundation\Application;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        channels: __DIR__.'/../routes/channels.php',
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(static fn ($middleware) => $middleware
        ->trustProxies(at: '*')
        ->alias(['role' => RoleMiddleware::class])
    )
    ->withExceptions(static fn ($exceptions) => $exceptions
        ->shouldRenderJsonWhen(static fn ($request) => $request->is('api/*') || $request->expectsJson())
    )->create();
