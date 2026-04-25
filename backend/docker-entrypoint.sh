#!/bin/sh
set -e

# Instalar vendor si no existe
if [ ! -f /var/www/html/vendor/autoload.php ]; then
    composer install --no-interaction --optimize-autoloader
fi

# Generar APP_KEY si está vacía
if grep -q "^APP_KEY=$" /var/www/html/.env 2>/dev/null; then
    php artisan key:generate
fi

# Limpiar caché
php artisan config:clear
php artisan cache:clear

# Dar permisos
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

exec "$@"