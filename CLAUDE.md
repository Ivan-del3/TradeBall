# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TradeBall is a sports equipment marketplace with real-time chat, product listings, favorites, reviews, and a wallet/escrow system. It uses a decoupled architecture: a React frontend and a Laravel REST API backend.

## Development Commands

### Docker (primary workflow — run from repo root)

```bash
docker compose up -d --build                        # Start all services
docker compose exec api php artisan migrate         # Run migrations
docker compose exec api php artisan db:seed         # Seed categories & products
docker compose exec api php artisan storage:link    # Symlink public storage (required for images)
docker compose exec api php artisan route:list      # Inspect all API routes
docker compose exec api php artisan config:clear    # Clear config cache
```

### Without Docker

```bash
# Frontend (cd frontend/)
npm run dev       # Vite dev server on :5173
npm run build     # Production build
npm run lint      # ESLint

# Backend (cd backend/)
composer install
php artisan serve             # Dev server on :8000
php artisan migrate
php artisan db:seed
composer dev                  # Runs serve + queue:listen + pail concurrently
```

### Initial setup

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up -d --build
docker compose exec api chown -R www-data:www-data storage bootstrap/cache
docker compose exec api composer install --no-interaction
docker compose exec api php artisan key:generate
docker compose exec api php artisan migrate --force
docker compose exec api php artisan db:seed
docker compose exec api php artisan storage:link
```

## Architecture

### Frontend (`frontend/`)

- **React 19 + Vite** — no React Router; navigation is event-driven via `window.dispatchEvent(new CustomEvent('navigate:*', {...}))` caught in `App.jsx`
- **Tailwind CSS 4** for styling
- **Auth state** lives in `AuthContext` (user + Bearer token stored in `localStorage`); modal visibility in `AuthModalContext`
- **API calls** go through `src/api/client.js`, a fetch wrapper that auto-attaches the `Authorization: Bearer` header and handles FormData for file uploads
- **Real-time chat** uses `laravel-echo` + `pusher-js` connecting to Laravel Reverb (WebSocket). Echo setup is in `src/echo.js`; subscriptions are in `src/components/profile/Chat.jsx`

### Backend (`backend/`)

- **Laravel 11 + Sanctum** — token-based auth (no cookies/sessions for the API)
- **Laravel Reverb** (port 8080) is a standalone WebSocket server; the `MessageSent` event broadcasts to `PrivateChannel('order.{orderId}')` when a chat message is sent
- **Private channel authorization** is in `routes/channels.php` — a user must be buyer or seller on the order to join
- Images are stored in `storage/app/public/products/` and served via the `public/storage` symlink; URL pattern: `{APP_URL}/storage/{path}`

### Infrastructure (`docker-compose.yml`)

| Service | Role | Dev Port |
|---|---|---|
| `db` | MySQL 8.0 | — |
| `api` | Laravel PHP-FPM | — |
| `api_web` | Nginx for Laravel | 8000 |
| `reverb` | Laravel Reverb WebSocket | 8080 |
| `frontend` | Nginx (prod) / Vite (dev) | 5173 |
| `proxy` | Nginx Proxy Manager | 80, 443, 81 |

### Key environment variables

**Backend (`.env`):**
- `APP_URL`, `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS`
- `BROADCAST_CONNECTION=reverb` — enables WebSocket broadcasting
- `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET` — must match frontend

**Frontend (`.env`):**
- `VITE_API_URL` — base URL for all API calls (e.g. `http://localhost:8000/api`)
- `VITE_REVERB_APP_KEY`, `VITE_REVERB_HOST`, `VITE_REVERB_PORT`, `VITE_REVERB_SCHEME`

## API Structure

All endpoints are prefixed with `/api`. Public routes (no auth): `GET /products`, `GET /products/{id}`, `GET /categories`, `POST /register`, `POST /login`.

All other routes require `Authorization: Bearer {token}` and are in the `auth:sanctum` middleware group. Chat endpoints (`/chat/conversations/*`) also require a valid private channel subscription.

## Data Model

Core relationships:
- `User` → many `Product`s, many `Order`s (as buyer or seller), many `Wallet` (one), many `Review`s received
- `Order` → one `Product`, one buyer `User`, one seller `User`, many `Message`s
- `Product` → many `ProductImage`s, one `Category`
- `Message` broadcast on `order.{orderId}` private channel via `MessageSent` event

Orders contain an `escrow_active` flag for payment escrow logic; products have `visible` and `available` booleans.

Do not add Co-Authored-By or any Claude attribution to commit messages.
