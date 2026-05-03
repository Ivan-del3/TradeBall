# TradeBall — Documentación Técnica

Rama documentada: `feature/payment-system`
Fecha: 2026-04-27

---

## 1. Archivos creados

### `backend/app/Events/PurchaseConfirmed.php`

Evento que se dispara en el momento en que un vendedor confirma una solicitud de compra. Transporta la instancia del `Order` confirmado hacia los listeners registrados.

```
App\Events\PurchaseConfirmed
  └── public readonly Order $order
```

Se creó para desacoplar la lógica de transferencia de fondos del controlador: el servicio solo confirma el pedido y dispara el evento; el listener se encarga del movimiento de dinero.

---

### `backend/app/Events/UserRegistered.php`

Evento que se dispara al crear un nuevo usuario. Transporta la instancia del `User` recién creado.

```
App\Events\UserRegistered
  └── public readonly User $user
```

Permite que la creación de la wallet del usuario ocurra de forma automática y desacoplada, sin añadir código de wallet directamente en `AuthController`.

---

### `backend/app/Listeners/CreateUserWallet.php`

Escucha el evento `UserRegistered` y crea una wallet con saldo `0` para el usuario si todavía no tiene una (`firstOrCreate`). Se ejecuta de forma síncrona en el mismo ciclo de la petición de registro.

---

### `backend/app/Listeners/DeductBuyerWallet.php`

Escucha el evento `PurchaseConfirmed` y ejecuta dos operaciones atómicas sobre la base de datos:

1. Descuenta el `purchase_price` del pedido del saldo del comprador y registra una transacción de tipo `pago_pedido`.
2. Suma ese mismo importe al saldo del vendedor y registra una transacción de tipo `cobro_pedido`.

Ambas operaciones se delegan en `WalletRepository`, que garantiza que cada movimiento quede trazado en la tabla `transactions`.

---

### `backend/app/Repositories/WalletRepository.php`

Concentra todas las consultas y mutaciones sobre `Wallet` y `Transaction`. Sus métodos públicos son:

| Método | Descripción |
|---|---|
| `findByUser(int $userId)` | Devuelve la wallet del usuario o `null` |
| `createForUser(int $userId)` | Crea una wallet nueva con saldo 0 |
| `addBalance(Wallet, float, string, ?int)` | Incrementa el saldo y escribe la transacción |
| `subtractBalance(Wallet, float, string, ?int)` | Decrementa el saldo y escribe la transacción |

Se creó para que `WalletService` y `DeductBuyerWallet` compartan la misma lógica de persistencia sin duplicarla.

---

### `backend/app/Repositories/PurchaseRepository.php`

Contiene un único método `createOrder` que inserta un pedido en la tabla `orders` con estado `pendiente` y `escrow_active = true`. Se creó para mantener la lógica de inserción separada del servicio.

---

### `backend/app/Services/WalletService.php`

Orquesta las operaciones del monedero que tienen reglas de negocio:

- **`deposit`**: valida que el importe sea positivo, que no supere 99.999 € y que el saldo resultante no exceda ese límite.
- **`withdraw`**: valida que el importe sea positivo y que haya saldo suficiente.

Delega la escritura a `WalletRepository` y devuelve la wallet actualizada con las últimas 20 transacciones ya cargadas.

---

### `backend/app/Services/PurchaseService.php`

Orquesta el ciclo de vida de una compra:

- **`requestPurchase`**: verifica que el producto exista, esté disponible y sea de otro usuario; comprueba que el comprador tenga saldo suficiente; crea el pedido a través de `PurchaseRepository` y pone el producto en estado `reservado`.
- **`confirmPurchase`**: busca el pedido pendiente del vendedor, lo marca como `completado`, pone el producto en `vendido` y dispara el evento `PurchaseConfirmed`.
- **`rejectPurchase`**: cancela el pedido y devuelve el producto a `disponible`.

---

### `backend/database/migrations/2026_04_27_000001_drop_unique_from_orders_product_id.php`

Elimina el índice `UNIQUE` sobre `orders.product_id`. Era necesario porque un mismo producto puede tener varios pedidos históricos (cancelados, completados) y el índice único lo impedía.

---

## 2. Archivos modificados

### `backend/app/Http/Controllers/AuthController.php`

**Cambio:** después de crear el usuario, se dispara `event(new UserRegistered($user))`.

Esto desencadena la creación automática de la wallet. Antes, el registro solo generaba el usuario y el token de acceso.

---

### `backend/app/Http/Controllers/ProductController.php`

**Cambio:** el método `index` ahora filtra por `available = 'disponible'` además de `visible = true`, de modo que los productos reservados o vendidos no aparecen en la búsqueda pública.

---

### `backend/app/Http/Controllers/PurchaseController.php`

Controlador parcialmente nuevo (el archivo existía con otra estructura) que expone cuatro acciones:

| Método HTTP | Ruta | Acción |
|---|---|---|
| `GET` | `/api/purchases` | Lista las compras completadas del usuario autenticado |
| `POST` | `/api/purchases` | Solicita comprar un producto (`product_id` en body) |
| `POST` | `/api/purchases/{id}/confirm` | El vendedor confirma la venta |
| `POST` | `/api/purchases/{id}/reject` | El vendedor rechaza la solicitud |

Toda la lógica se delega en `PurchaseService`; el controlador solo valida la entrada y traduce excepciones a respuestas HTTP `422`.

---

### `backend/app/Http/Controllers/SalesController.php`

**Cambio:** el método `index` ahora carga la relación `pendingOrder.buyer` junto con cada producto. Esto permite al frontend mostrar, en tiempo real, qué productos tienen una solicitud de compra pendiente y quién la hizo.

---

### `backend/app/Http/Controllers/WalletController.php`

**Cambio:** ahora recibe `WalletService` por inyección de dependencias. Los métodos `deposit` y `withdraw` delegan en el servicio en lugar de operar directamente sobre el modelo, de modo que las reglas de negocio (límites, validaciones) viven en un solo lugar.

---

### `backend/app/Models/Product.php`

**Cambio:** se añadieron dos relaciones:

- `order()` — devuelve el pedido más reciente asociado al producto (`latestOfMany`).
- `pendingOrder()` — devuelve el pedido en estado `pendiente`, si existe.

Estas relaciones son usadas por `SalesController` para cargar en una sola consulta si hay una solicitud activa.

---

### `backend/app/Providers/AppServiceProvider.php`

**Cambio:** se registran los bindings del sistema de eventos. Laravel 11 usa `AppServiceProvider` en lugar de un `EventServiceProvider` separado; los eventos y sus listeners se declaran aquí (ver sección 3).

> Nota: en el estado actual del código el `boot()` está vacío porque Laravel 11 descubre automáticamente los listeners por convención de nombres mediante `Event::discover()`. Si se prefiere el registro explícito, se añaden en `boot()` con `Event::listen(PurchaseConfirmed::class, DeductBuyerWallet::class)`.

---

### `backend/routes/api.php`

**Cambio:** se añadieron las rutas del sistema de pagos, todas dentro del grupo `auth:sanctum`:

```php
// Compras
Route::get('/purchases',               [PurchaseController::class, 'index']);
Route::post('/purchases',              [PurchaseController::class, 'store']);
Route::post('/purchases/{id}/confirm', [PurchaseController::class, 'confirm']);
Route::post('/purchases/{id}/reject',  [PurchaseController::class, 'reject']);

// Monedero
Route::get('/wallet',           [WalletController::class, 'show']);
Route::patch('/wallet/deposit', [WalletController::class, 'deposit']);
Route::patch('/wallet/withdraw',[WalletController::class, 'withdraw']);

// Ventas
Route::get('/sales', [SalesController::class, 'index']);
```

---

### `frontend/src/pages/ProductDetail.jsx`

**Cambio:** se añadió lógica de compra en la vista de detalle de producto.

Cuando el usuario autenticado no es el propietario del producto, la página carga su saldo de wallet (`GET /api/wallet`) y lo muestra junto al precio. El botón "Comprar" llama a `POST /api/purchases` con el `product_id`. Si el saldo es inferior al precio se muestra un error local antes de hacer la petición.

---

### `frontend/src/components/profile/Purchases.jsx`

**Cambio:** implementación completa del panel "Mis compras". Llama a `GET /api/purchases` y muestra la lista de pedidos completados con imagen, nombre del producto, vendedor, precio y fecha. Cada fila navega al detalle del producto mediante `CustomEvent('navigate:product')`.

---

### `frontend/src/components/profile/Sales.jsx`

**Cambio:** implementación completa del panel "Mis ventas" con polling cada 3 segundos (mismo patrón que el chat) para detectar nuevas solicitudes en tiempo real.

Cuando un producto tiene un pedido pendiente, la fila se resalta en amarillo y al hacer clic abre un popup modal que muestra los datos del comprador y permite al vendedor confirmar o rechazar la venta. Al confirmar se llama a `POST /api/purchases/{id}/confirm`; al rechazar, a `POST /api/purchases/{id}/reject`.

---

### `frontend/src/components/profile/Wallet.jsx`

**Cambio:** implementación completa del panel "Monedero". Muestra el saldo actual y las últimas 20 transacciones con tipo legible (`deposito` → "Ingreso", `pago_pedido` → "Pago de pedido", etc.). Incluye formularios inline para ingresar y retirar dinero con validaciones en cliente que replican las reglas del backend (máximo 99.999 €, saldo suficiente).

---

## 3. Eventos y Listeners

### `UserRegistered` → `CreateUserWallet`

**Quién lo dispara:** `AuthController::register` inmediatamente después de insertar el usuario en base de datos.

**Cuándo:** en cada registro exitoso de un nuevo usuario.

**Qué hace el listener:** crea una fila en la tabla `wallets` con `balance = 0` vinculada al `user_id` recién creado. Usa `firstOrCreate` para ser idempotente.

**Flujo:**

```
POST /api/register
  └── AuthController::register
        ├── User::create(...)
        ├── event(new UserRegistered($user))   ← disparo
        │     └── CreateUserWallet::handle()   ← listener
        │           └── Wallet::firstOrCreate(['user_id' => ...])
        └── $user->createToken(...)
```

---

### `PurchaseConfirmed` → `DeductBuyerWallet`

**Quién lo dispara:** `PurchaseService::confirmPurchase` después de actualizar el pedido a `completado` y el producto a `vendido`.

**Cuándo:** cuando el vendedor acepta una solicitud de compra pendiente.

**Qué hace el listener:** en una sola llamada a `DeductBuyerWallet::handle`:

1. Resta el `purchase_price` de la wallet del comprador y registra la transacción `pago_pedido`.
2. Suma el mismo importe a la wallet del vendedor y registra la transacción `cobro_pedido`.

**Flujo:**

```
POST /api/purchases/{id}/confirm
  └── PurchaseController::confirm
        └── PurchaseService::confirmPurchase
              ├── $order->update(['status' => 'completado', ...])
              ├── $order->product->update(['available' => 'vendido'])
              └── event(new PurchaseConfirmed($order))   ← disparo
                    └── DeductBuyerWallet::handle()      ← listener
                          ├── WalletRepository::subtractBalance(buyer, price, 'pago_pedido')
                          └── WalletRepository::addBalance(seller, price, 'cobro_pedido')
```

---

### Registro en el proveedor de servicios

Laravel 11 descubre los listeners automáticamente si el nombre sigue la convención `{EventName}` → `{ListenerName}` y ambas clases implementan los métodos `handle`. Para forzar el registro explícito o añadir listeners de cola, edita `AppServiceProvider::boot`:

```php
use Illuminate\Support\Facades\Event;
use App\Events\UserRegistered;
use App\Events\PurchaseConfirmed;
use App\Listeners\CreateUserWallet;
use App\Listeners\DeductBuyerWallet;

public function boot(): void
{
    Event::listen(UserRegistered::class,    CreateUserWallet::class);
    Event::listen(PurchaseConfirmed::class, DeductBuyerWallet::class);
}
```

Si los listeners necesitan ejecutarse en segundo plano (cola de trabajos), implementa `ShouldQueue` en la clase del listener y asegúrate de tener un worker activo (`php artisan queue:work`).

---

## 4. Despliegue en local (cualquier sistema operativo)

### Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| PHP | 8.2 |
| Composer | 2.x |
| Node.js | 18.x |
| npm | 9.x |
| MySQL | 8.0 (o MariaDB 10.6) |
| Git | cualquier versión reciente |

Opcionalmente, Docker Desktop (Mac/Windows) o Docker Engine + Compose (Linux) permite levantar todo con un solo comando y evita instalar PHP o MySQL manualmente.

---

### Opción A — con Docker (recomendada)

```bash
# 1. Clonar el repositorio
git clone https://github.com/Ivan-del3/TradeBall.git
cd TradeBall

# 2. Copiar los archivos de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Construir e iniciar los contenedores
docker compose up -d --build

# 4. Permisos de escritura para Laravel
docker compose exec api chown -R www-data:www-data storage bootstrap/cache

# 5. Instalar dependencias PHP
docker compose exec api composer install --no-interaction

# 6. Generar la clave de la aplicación
docker compose exec api php artisan key:generate

# 7. Ejecutar las migraciones
docker compose exec api php artisan migrate --force

# 8. Insertar datos de ejemplo (categorías y productos)
docker compose exec api php artisan db:seed

# 9. Crear el enlace simbólico para imágenes
docker compose exec api php artisan storage:link
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- API: http://localhost:8000/api
- WebSocket (Reverb): ws://localhost:8080

---

### Opción B — sin Docker

```bash
# 1. Clonar el repositorio
git clone https://github.com/Ivan-del3/TradeBall.git
cd TradeBall

# 2. Backend
cd backend
cp .env.example .env
composer install

# Editar .env con los datos de conexión a tu MySQL local:
#   DB_HOST=127.0.0.1
#   DB_DATABASE=tradeball
#   DB_USERNAME=root
#   DB_PASSWORD=tu_contraseña

php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link

# Arrancar servidor de desarrollo (API + cola + logs en paralelo)
composer dev        # ejecuta: serve + queue:listen + pail

# 3. Frontend (en otra terminal)
cd ../frontend
cp .env.example .env
# Comprobar que VITE_API_URL=http://localhost:8000/api
npm install
npm run dev
```

---

## 5. Despliegue en Ubuntu Server

### Requisitos del servidor

```bash
# Actualizar índice de paquetes
sudo apt update && sudo apt upgrade -y

# PHP 8.2 y extensiones necesarias para Laravel
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-mbstring \
    php8.2-xml php8.2-bcmath php8.2-curl php8.2-zip php8.2-intl \
    php8.2-tokenizer php8.2-fileinfo

# Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Node.js 18 (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# MySQL 8
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Nginx
sudo apt install -y nginx

# Supervisor (para colas y Reverb en segundo plano)
sudo apt install -y supervisor
```

---

### Pasos de despliegue

#### 1. Clonar el repositorio

```bash
cd /var/www
sudo git clone https://github.com/Ivan-del3/TradeBall.git
sudo chown -R www-data:www-data /var/www/TradeBall
cd /var/www/TradeBall
```

#### 2. Instalar dependencias y configurar el backend

```bash
cd backend
sudo -u www-data composer install --no-dev --optimize-autoloader

cp .env.example .env
```

Editar `/var/www/TradeBall/backend/.env` con los valores de producción:

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.com

DB_HOST=127.0.0.1
DB_DATABASE=tradeball
DB_USERNAME=tradeball_user
DB_PASSWORD=contraseña_segura

BROADCAST_CONNECTION=reverb
REVERB_APP_ID=tu_reverb_app_id
REVERB_APP_KEY=tu_reverb_app_key
REVERB_APP_SECRET=tu_reverb_app_secret
REVERB_HOST=tu-dominio.com
REVERB_PORT=8080
REVERB_SCHEME=https

FRONTEND_URL=https://tu-dominio.com
SANCTUM_STATEFUL_DOMAINS=tu-dominio.com
```

```bash
# Crear la base de datos y el usuario MySQL
sudo mysql -u root -p <<'SQL'
CREATE DATABASE tradeball CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'tradeball_user'@'localhost' IDENTIFIED BY 'contraseña_segura';
GRANT ALL PRIVILEGES ON tradeball.* TO 'tradeball_user'@'localhost';
FLUSH PRIVILEGES;
SQL

sudo -u www-data php artisan key:generate
sudo -u www-data php artisan migrate --force
sudo -u www-data php artisan db:seed
sudo -u www-data php artisan storage:link
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:cache
sudo -u www-data php artisan view:cache
```

#### 3. Construir el frontend

```bash
cd /var/www/TradeBall/frontend
cp .env.example .env
```

Editar `/var/www/TradeBall/frontend/.env`:

```dotenv
VITE_API_URL=https://tu-dominio.com/api
VITE_REVERB_APP_KEY=tu_reverb_app_key
VITE_REVERB_HOST=tu-dominio.com
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

```bash
npm install
npm run build
```

Los archivos estáticos quedarán en `frontend/dist/`.

#### 4. Configurar Nginx

Crear `/etc/nginx/sites-available/tradeball`:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name tu-dominio.com;

    ssl_certificate     /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    # Frontend (archivos estáticos de Vite)
    root /var/www/TradeBall/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Laravel
    location /api {
        alias /var/www/TradeBall/backend/public;
        try_files $uri $uri/ @laravel;

        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_param SCRIPT_FILENAME /var/www/TradeBall/backend/public/index.php;
            include fastcgi_params;
        }
    }

    location @laravel {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME /var/www/TradeBall/backend/public/index.php;
        include fastcgi_params;
    }

    # Reverb WebSocket (proxy inverso)
    location /app {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/tradeball /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. Certificado SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

#### 6. Configurar Supervisor para colas y Reverb

Crear `/etc/supervisor/conf.d/tradeball.conf`:

```ini
[program:tradeball-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/TradeBall/backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600
directory=/var/www/TradeBall/backend
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/log/tradeball-queue.log

[program:tradeball-reverb]
process_name=%(program_name)s
command=php /var/www/TradeBall/backend/artisan reverb:start --host=0.0.0.0 --port=8080
directory=/var/www/TradeBall/backend
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/tradeball-reverb.log
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start tradeball-queue:*
sudo supervisorctl start tradeball-reverb
```

#### 7. Permisos finales

```bash
sudo chown -R www-data:www-data /var/www/TradeBall/backend/storage
sudo chown -R www-data:www-data /var/www/TradeBall/backend/bootstrap/cache
sudo chmod -R 775 /var/www/TradeBall/backend/storage
sudo chmod -R 775 /var/www/TradeBall/backend/bootstrap/cache
```

#### 8. Verificar que todo funciona

```bash
# Comprobar el estado de los servicios
sudo supervisorctl status
sudo systemctl status nginx
sudo systemctl status php8.2-fpm

# Ver logs en tiempo real
tail -f /var/log/tradeball-queue.log
tail -f /var/log/tradeball-reverb.log
tail -f /var/www/TradeBall/backend/storage/logs/laravel.log
```
