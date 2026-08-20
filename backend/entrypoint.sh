#!/bin/sh
# php artisan migrate --force

php artisan optimize

while true; do
	php artisan queue:work --max-jobs=100 --max-time=3600
done &

while true; do
	php artisan reverb:start --host=0.0.0.0 --port=8080
done &

exec php artisan octane:start --server=frankenphp --caddyfile=/app/Caddyfile --host=0.0.0.0 --port=${PORT:-8000}