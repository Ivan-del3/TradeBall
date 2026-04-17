# Pasos para el despliegue

## Clonar repositorio

## Copiar el .env.example a .env

## Levantar contenedores

 ```docker compose up -d --build```

## Ejecutar los siguientes comandos:

### 1. Permisos
```docker compose exec api chown -R www-data:www-data storage bootstrap/cache```
```docker compose exec api chmod -R 775 storage bootstrap/cache```

### 2. El vendor está incompleto (falta laravel/pail), reinstalar

```docker compose exec api composer install --no-interaction```

### 3. Generar APP_KEY
```docker compose exec api php artisan key:generate```

### 4. Limpiar caché
```docker compose exec api php artisan config:clear```