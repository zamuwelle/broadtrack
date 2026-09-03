FROM dunglas/frankenphp:1-php8.3-bookworm

RUN install-php-extensions \
	pcntl \
	pdo_mysql \
	pdo_sqlite \
	bcmath \
	zip \
	opcache

RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_CACHE_DIR=/root/.composer/cache

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./

RUN --mount=type=cache,target=/root/.composer/cache \
	composer install --no-interaction --no-dev --no-autoloader --no-scripts --prefer-dist

COPY . .

RUN --mount=type=cache,target=/root/.composer/cache \
	composer dump-autoload --optimize --classmap-authoritative --no-dev

RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache \
	&& chmod -R 775 /app/storage /app/bootstrap/cache

RUN setcap -r /usr/local/bin/frankenphp

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 8000 8080