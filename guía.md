# TradeBall — Guía de Despliegue

---

## Índice

1. [Clonar el repositorio por primera vez](#1-clonar-el-repositorio-por-primera-vez)
2. [Configuración en desarrollo (WSL/local)](#2-configuración-en-desarrollo-wsllocal)
3. [Configuración en producción (Ubuntu Server)](#3-configuración-en-producción-ubuntu-server)
4. [Hacer git pull y actualizar](#4-hacer-git-pull-y-actualizar)
5. [Comandos útiles](#5-comandos-útiles)
6. [Variables de entorno por entorno](#6-variables-de-entorno-por-entorno)
7. [Recordatorios importantes](#7-recordatorios-importantes)

---

## 1. Clonar el repositorio por primera vez

```bash
git clone https://github.com/Ivan-del3/TradeBall.git
cd TradeBall
sudo chown -R $USER:$USER .
```

---

## 2. Configuración en desarrollo (WSL/local)

### 2.1 Crear los archivos .env

```bash
# Raíz del proyecto
cp .env.example .env
nano .env
```

```env
DB_DATABASE=laravel_db
DB_PASSWORD=password
```

```bash
# Backend
cp backend/.env.example backend/.env
nano backend/.env
```

```env
APP_NAME=TradeBall
APP_ENV=local
APP_KEY=                            # se genera en el paso 3
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=laravel_db
DB_USERNAME=root
DB_PASSWORD=password

FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

```bash
# Frontend
cp frontend/.env.example frontend/.env
nano frontend/.env
```

```env
VITE_API_URL=http://localhost:8000/api
```

### 2.2 Crear docker-compose.override.yml

Este archivo **no está en git** — créalo manualmente cada vez que clones:

```yaml
services:
  api:
    env_file:
      - ./backend/.env
    volumes:
      - ./backend:/var/www/html
      - /var/www/html/vendor

  frontend:
    build:
      context: ./frontend
      target: development
    restart: "no"
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules

  api_web:
    ports:
      - "8000:80"
```

### 2.3 Levantar contenedores

```bash
docker compose up -d --build
```

### 2.4 Configurar Laravel

```bash
docker compose exec api composer install --no-interaction
docker compose exec api php artisan key:generate
docker compose exec api php artisan config:clear
docker compose exec api php artisan migrate --force
docker compose exec api php artisan db:seed
docker compose exec api php artisan storage:link
docker compose exec api chown -R www-data:www-data storage bootstrap/cache
docker compose exec api chmod -R 775 storage bootstrap/cache
```

### 2.5 Verificar que todo funciona

- Frontend: `http://localhost:5173`
- API: `http://localhost:8000/api/products`

---

## 3. Configuración en producción (Ubuntu Server)

### 3.1 Instalar Docker

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg git

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker $USER
newgrp docker
```

### 3.2 Liberar puertos si hay Apache

```bash
sudo systemctl stop apache2
sudo systemctl disable apache2
```

### 3.3 Clonar y configurar

```bash
git clone https://github.com/Ivan-del3/TradeBall.git
cd TradeBall
sudo chown -R $USER:$USER .
```

Crear los `.env` de producción:

```bash
cp .env.example .env
nano .env
```

```env
DB_DATABASE=laravel_db
DB_PASSWORD=password_segura
```

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

```env
APP_NAME=TradeBall
APP_ENV=production
APP_KEY=                            # se genera en el paso siguiente
APP_DEBUG=false
APP_URL=https://api-tradeball.duckdns.org

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=laravel_db
DB_USERNAME=root
DB_PASSWORD=password_segura

FRONTEND_URL=https://tradeball.duckdns.org
SANCTUM_STATEFUL_DOMAINS=tradeball.duckdns.org
```

```bash
cp frontend/.env.example frontend/.env
nano frontend/.env
```

```env
VITE_API_URL=https://api-tradeball.duckdns.org/api
```

### 3.4 Levantar contenedores

```bash
docker compose up -d --build
```

### 3.5 Configurar Laravel

```bash
docker compose exec api composer install --no-interaction
docker compose exec api php artisan key:generate
docker compose exec api php artisan config:clear
docker compose exec api php artisan migrate --force
docker compose exec api php artisan db:seed
docker compose exec api php artisan storage:link
docker compose exec api chown -R www-data:www-data storage bootstrap/cache
docker compose exec api chmod -R 775 storage bootstrap/cache
```

### 3.6 Configurar DuckDNS

```bash
mkdir -p ~/duckdns
nano ~/duckdns/duck.sh
```

```bash
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=tradeball,api-tradeball&token=TU_TOKEN&ip=" | curl -k -o ~/duckdns/duck.log -K -
```

```bash
chmod +x ~/duckdns/duck.sh
~/duckdns/duck.sh  # probar que devuelve OK

crontab -e
# Añadir:
*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1
```

### 3.7 Port forwarding en el router

| Puerto externo | Puerto interno | IP destino |
|---|---|---|
| 80 | 80 | IP_LOCAL_SERVIDOR |
| 443 | 443 | IP_LOCAL_SERVIDOR |

### 3.8 Configurar Nginx Proxy Manager

Accede a `http://IP_SERVIDOR:81` (credenciales por defecto: `admin@example.com` / `changeme`).

**Proxy host — Frontend:**

| Campo | Valor |
|---|---|
| Domain | `tradeball.duckdns.org` |
| Forward Hostname | `frontend` |
| Forward Port | `80` |
| SSL | Let's Encrypt + Force SSL |

**Proxy host — API:**

| Campo | Valor |
|---|---|
| Domain | `api-tradeball.duckdns.org` |
| Forward Hostname | `api_web` |
| Forward Port | `80` |
| SSL | Let's Encrypt + Force SSL |

En el proxy de la API → pestaña **Advanced**:

```nginx
client_max_body_size 20M;
proxy_read_timeout 120s;
proxy_connect_timeout 120s;
proxy_send_timeout 120s;
```

---

## 4. Hacer git pull y actualizar

### Pull normal

```bash
git pull origin main
```

### Si hay conflictos por cambios locales en el servidor

```bash
git reset --hard HEAD
git clean -f
git pull origin main
```

### Qué hacer según los archivos que cambiaron

| Qué cambió | Comando necesario |
|---|---|
| Archivos PHP | `docker compose restart api` |
| Rutas Laravel | `docker compose exec api php artisan route:clear` |
| `bootstrap/app.php` | `docker compose exec api php artisan config:clear` + `restart api` |
| Nuevas migraciones | `docker compose exec api php artisan migrate --force` |
| Variables `.env` backend | `docker compose exec api php artisan config:clear` + `restart api` |
| Archivos React (`.jsx`, `.js`, `.css`) | `docker compose up -d --build frontend` |
| `default.conf` (Nginx backend) | `docker compose up -d --force-recreate api_web` |
| `docker-compose.yml` | `docker compose up -d --force-recreate` |
| Todo a la vez | Ver bloque abajo |

### Actualización completa

```bash
git pull origin main
docker compose up -d --build --force-recreate
docker compose exec api php artisan migrate --force
docker compose exec api php artisan route:clear
docker compose exec api php artisan config:clear
docker compose exec api chown -R www-data:www-data storage bootstrap/cache
docker compose exec api chmod -R 775 storage bootstrap/cache
```

---

## 5. Comandos útiles

```bash
# Ver estado de los contenedores
docker compose ps

# Ver logs en tiempo real
docker compose logs -f api
docker compose logs -f api_web

# Entrar al contenedor de Laravel
docker compose exec api sh

# Artisan shortcuts
docker compose exec api php artisan <comando>
docker compose exec api php artisan route:list
docker compose exec api php artisan optimize:clear
docker compose exec api php artisan migrate:fresh --seed

# Recrear contenedor específico
docker compose up -d --force-recreate api_web

# Limpiar Docker (imágenes/volúmenes no usados)
docker image prune -a
docker volume prune
docker system prune -a
```

---

## 6. Variables de entorno por entorno

| Variable | Desarrollo | Producción |
|---|---|---|
| `APP_ENV` | `local` | `production` |
| `APP_DEBUG` | `true` | `false`  |
| `APP_URL` | `http://localhost:8000` | `https://api-tradeball.duckdns.org` |
| `FRONTEND_URL` | `http://localhost:5173` | `https://tradeball.duckdns.org` |
| `VITE_API_URL` | `http://localhost:8000/api` | `https://api-tradeball.duckdns.org/api` |
| `DB_PASSWORD` | `password` | contraseña segura |

---

## 7. Recordatorios importantes

| Recordatorio |
|---|---|
| `APP_DEBUG=false` siempre en producción — expone código interno |
| Los `.env` nunca van en git |
| `docker-compose.override.yml` nunca va en git — créalo manualmente en desarrollo |
| `php artisan storage:link` ejecutar tras clonar o si las imágenes no se ven |
| `--force-recreate` necesario cuando cambias `default.conf` o `docker-compose.yml` |
| Puerto 81 de NPM — cerrado en producción, abrir solo temporalmente via SSH tunnel |
| `APP_KEY` se genera automáticamente con `php artisan key:generate` |
| Los permisos de storage hay que darlos tras clonar y tras `migrate:fresh` |