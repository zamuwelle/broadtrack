#!/bin/sh
php artisan migrate --force

php artisan octane:start --server=frankenphp --host=0.0.0.0 --port=8000