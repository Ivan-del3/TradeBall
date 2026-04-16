FROM php:8.2-fpm

# Dependencias del sistema
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev zip unzip git curl libzip-dev libicu-dev \
    && docker-php-ext-install pdo_mysql gd zip intl

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Permisos
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]