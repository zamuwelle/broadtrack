<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    public function register() {}

    public function boot()
    {
        if ($this->app->environment('local')) {
            Model::preventLazyLoading();
        }

        Sanctum::getAccessTokenFromRequestUsing(static function ($request) {
            if ($request->bearerToken()) {
                return $request->bearerToken();
            }

            return $request->is('api/events') ? $request->query('token') : null;
        });
    }
}
