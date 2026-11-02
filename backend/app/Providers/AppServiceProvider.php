<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\ServiceProvider;
use Symfony\Component\Mailer\Bridge\Brevo\Transport\BrevoTransportFactory;
use Symfony\Component\Mailer\Transport\Dsn;
use Symfony\Component\Mailer\Transport\TransportInterface;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Mail::extend('brevo', fn (): TransportInterface => (new BrevoTransportFactory)->create(
            new Dsn('brevo+api', 'default', config('services.brevo.key')),
        ));

        if ($this->app->environment('local')) {
            Model::preventLazyLoading();
        }
    }
}
