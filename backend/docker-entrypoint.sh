#!/bin/sh
set -e

if [ ! -f /var/www/html/vendor/autoload.php ]; then
    composer install --no-interaction --optimize-autoloader
fi

if grep -q "^APP_KEY=$" /var/www/html/.env 2>/dev/null; then
    php artisan key:generate
fi

php artisan config:clear
php artisan cache:clear

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

exec "$@" 