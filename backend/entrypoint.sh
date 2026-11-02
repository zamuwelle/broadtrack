#!/bin/sh
php artisan migrate --force

php artisan optimize

php artisan octane:start --server=frankenphp --host=0.0.0.0 --port=8000