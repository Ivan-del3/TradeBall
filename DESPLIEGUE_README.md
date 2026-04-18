# TradeBall — Guía Completa de Despliegue en Producción

> Guía paso a paso para desplegar TradeBall en un Ubuntu Server con Docker, dominio DuckDNS y HTTPS automático.

---

## Requisitos previos

- Máquina virtual o servidor físico con **Ubuntu Server 24.04**
- Acceso al router para configurar port forwarding
- Cuenta en [duckdns.org](https://duckdns.org)
- Repositorio de Git con el proyecto

---

## 1. Instalar Docker en Ubuntu Server

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y ca-certificates curl gnupg git

# Añadir clave GPG de Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Añadir repositorio oficial de Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker y Docker Compose
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Añadir el usuario al grupo docker (para no usar sudo siempre)
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalación
docker --version
docker compose version
```

>  Si después de `newgrp docker` sigue dando error de permisos, cierra la sesión SSH y vuelve a conectarte.

---

## 2. Liberar puertos 80 y 443 (si hay Apache instalado)

```bash
# Comprobar si hay algo usando los puertos
sudo ss -tlnp | grep ':80'
sudo ss -tlnp | grep ':443'

# Si aparece Apache, pararlo y deshabilitarlo
sudo systemctl stop apache2
sudo systemctl disable apache2

# Verificar que los puertos están libres
sudo ss -tlnp | grep ':80'
```

---

## 3. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/TradeBall.git
cd TradeBall
```

---

## 4. Configurar los archivos .env

### Backend (`backend/.env`)
```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Valores importantes para producción:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api-app.duckdns.org

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=laravel_db
DB_USERNAME=root
DB_PASSWORD=tu_password_segura

FRONTEND_URL=https://app.duckdns.org
```

### Frontend (`frontend/.env`)
```bash
cp frontend/.env.example frontend/.env
nano frontend/.env
```

```env
VITE_API_URL=https://api-app.duckdns.org/api
```

### Raíz del proyecto (`.env`)
```bash
nano .env
```

```env
DB_DATABASE=laravel_db
DB_PASSWORD=tu_password_segura
```

> La password de `DB_PASSWORD` debe ser **exactamente la misma** en los tres archivos.

---

## 5. Levantar los contenedores

```bash
docker compose up -d --build
```

Espera a que todos los contenedores estén en estado `Up`:

```bash
docker compose ps
```

---

## 6. Configurar Laravel

```bash
# Instalar dependencias de Composer
docker compose exec api composer install --no-interaction

# Generar APP_KEY
docker compose exec api php artisan key:generate

# Limpiar caché de configuración
docker compose exec api php artisan config:clear

# Ejecutar migraciones
docker compose exec api php artisan migrate --force

# Permisos de storage
docker compose exec api chown -R www-data:www-data storage bootstrap/cache
docker compose exec api chmod -R 775 storage bootstrap/cache
```

---

## 7. Configurar DuckDNS (dominio gratuito)

### 7.1 Crear subdominios
1. Ve a [duckdns.org](https://duckdns.org) e inicia sesión
2. Crea dos subdominios:
   - `app.duckdns.org`
   - `api-app.duckdns.org`
3. Apunta ambos a tu IP pública:
```bash
curl https://api.ipify.org
```

### 7.2 Instalar actualizador automático de IP
```bash
mkdir -p ~/duckdns
nano ~/duckdns/duck.sh
```

Contenido (sustituye `TU_TOKEN` con el token de tu cuenta DuckDNS):
```bash
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=tradeball,api-tradeball&token=TU_TOKEN&ip=" | curl -k -o ~/duckdns/duck.log -K -
```

```bash
# Dar permisos de ejecución
chmod +x ~/duckdns/duck.sh

# Probar que funciona (debe devolver OK)
~/duckdns/duck.sh
cat ~/duckdns/duck.log

# Añadir al cron para actualizar cada 5 minutos
crontab -e
```

Añade esta línea al cron:
```
*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1
```

---

## 8. Abrir puertos en el router

Entra en tu router (normalmente `192.168.1.1`) y añade estas reglas de **Port Forwarding** apuntando a la IP local del servidor:

```bash
# Ver IP local del servidor
hostname -I
# Ejemplo: TU_IP_LOCAL
```

| Nombre | IP destino | Puerto externo | Puerto interno | Protocolo |
|---|---|---|---|---|
| TradeBall HTTP | TU_IP_LOCAL | 80 | 80 | TCP |
| TradeBall HTTPS | TU_IP_LOCAL | 443 | 443 | TCP |

---

## 9. Configurar Nginx Proxy Manager (HTTPS automático)

### 9.1 Acceder al panel
```
http://TU_IP_LOCAL:81
```

Credenciales por defecto:
```
Email:    admin@example.com
Password: changeme
```
**Cámbialas inmediatamente.**

### 9.2 Crear Proxy Host — Frontend

**Pestaña Details:**
| Campo | Valor |
|---|---|
| Domain Names | `app.duckdns.org` |
| Scheme | `http` |
| Forward Hostname | `frontend` |
| Forward Port | `80` |
| Block Common Exploits | ✅ |

**Pestaña SSL:**
- SSL Certificate → **Request a new SSL Certificate**
- ✅ Force SSL
- ✅ HTTP/2 Support
- Introduce tu email
- ✅ I Agree to the Let's Encrypt Terms of Service
- Click **Save**

### 9.3 Crear Proxy Host — API

**Pestaña Details:**
| Campo | Valor |
|---|---|
| Domain Names | `api-app.duckdns.org` |
| Scheme | `http` |
| Forward Hostname | `api_web` |
| Forward Port | `80` |
| Block Common Exploits | ✅ |

**Pestaña SSL** → igual que el frontend.

---

## 10. Verificar que todo funciona

```bash
# Ver estado de todos los contenedores
docker compose ps

# Probar la API
curl https://api-app.duckdns.org/api/ping

# Ver logs en tiempo real
docker compose logs -f
```

Desde el navegador:
```
https://app.duckdns.org        → Frontend React
https://api-app.duckdns.org    → API Laravel
```

---

## Actualizar la aplicación

### Solo código PHP (Laravel)
```bash
git pull
docker compose restart api
```

### Solo código React (frontend)
```bash
git pull
docker compose up -d --build frontend
```

### Nuevas migraciones de base de datos
```bash
git pull
docker compose exec api php artisan migrate --force
```

### Todo a la vez
```bash
git pull
docker compose up -d --build
docker compose exec api php artisan migrate --force
```

---

## Apagar la aplicación

### Dejar de exponer en internet (recomendado mientras está en desarrollo)
1. Elimina las reglas de port forwarding del router (puertos 80 y 443)
2. Apaga la máquina virtual:
```bash
sudo shutdown now
```

### Volver a publicar
1. Arranca la VM
2. Los contenedores arrancan solos (`restart: always`)
3. Abre los puertos del router

---

## Arquitectura del sistema

```
Usuario
  ↓ HTTPS
DuckDNS (DNS)
  ↓
IP pública
  ↓ Puerto 80/443
Router (port forwarding)
  ↓
Ubuntu Server (TU_IP_LOCAL)
  ↓
Nginx Proxy Manager (puerto 80/443)
  ↓                        ↓
frontend:80            api_web:80
(React + nginx)        (nginx)
                           ↓
                       api:9000
                       (Laravel PHP-FPM)
                           ↓
                       db:3306
                       (MySQL 8.0)
```

---

## Solución de problemas comunes

| Error | Causa | Solución |
|---|---|---|
| `502 Bad Gateway` | Contenedor caído o sin permisos | `docker compose logs api` + `chown storage` |
| `CORS error` | `FRONTEND_URL` mal configurado | Verificar `backend/.env` + `config:clear` |
| `Mixed Content` | `VITE_API_URL` con `http://` en vez de `https://` | Corregir `frontend/.env` + rebuild |
| `Access denied MySQL` | Password no coincide entre `.env` y `docker-compose.yml` | Igualar passwords + borrar volumen |
| `Class not found` | `vendor/` incompleto | `composer install --no-interaction` |
| Puerto 80 ocupado | Apache instalado en el sistema | `sudo systemctl stop apache2 && disable` |
| DuckDNS devuelve `KO` | Token incorrecto en el script | Copiar token correcto de duckdns.org |

---

## Contenedores del proyecto

| Contenedor | Imagen | Descripción | Puerto |
|---|---|---|---|
| `app_db` | mysql:8.0 | Base de datos MySQL | 3306 (interno) |
| `app_api` | tradeball-api | Laravel PHP-FPM | 9000 (interno) |
| `app_api_web` | nginx:alpine | Nginx para Laravel | 8000 (dev) |
| `app_frontend` | tradeball-frontend | React compilado con nginx | 80 (interno) |
| `app_proxy` | nginx-proxy-manager | Proxy inverso + SSL | 80, 443, 81 |
