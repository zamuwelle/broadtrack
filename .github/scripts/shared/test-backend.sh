#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)/backend"
composer install --no-interaction --prefer-dist --no-scripts
vendor/bin/pint --test --config pint.json
php artisan test
