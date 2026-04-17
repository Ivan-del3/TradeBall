# Pasos para el despliegue

## Clonar repositorio

## En linux

```sudo chown -R $USER:$USER TradeBall/```

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



# Alias en Docker
alias api='docker compose exec -it api sh'
alias artisan="docker compose exec api php artisan"
alias database='docker compose exec app_db mysql -u root -p'

# Crear rutas en routes/

Al crear una nueva ruta tenemos que instalarla
```docker compose exec api php artisan install:api```

despues registrarla en boostrap app.php

y reiniciar la caché de rutas:
```docker compose exec api php artisan route:clear```

Listar rutas:
```docker compose exec api php artisan route:list```
```docker compose exec api cat routes/api.php```