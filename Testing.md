# Testing

## Backend — Laravel (PHPUnit)

**Requisito:** SQLite in-memory habilitado en `phpunit.xml`.

Cada test levanta una BD limpia (`RefreshDatabase`), crea los datos necesarios directamente con los modelos y lanza peticiones HTTP reales contra el endpoint.

### `backend/tests/Feature/ProductControllerTest.php`

Cubre `GET /api/products`:

- Sin filtros devuelve productos paginados
- Cada filtro individual (`search`, `category_id`, `condition`, `min_price`, `max_price`) filtra correctamente
- Productos con `visible=false` o `available != 'disponible'` no aparecen
- Combinación de varios filtros simultáneos
- Validación rechaza valores inválidos (422), incluido `sort_price` fuera de `asc|desc`
- `sort_price=asc` devuelve productos de menor a mayor precio
- `sort_price=desc` devuelve productos de mayor a menor precio
- Sin `sort_price` el orden es por `created_at` descendente
- Respuesta JSON contiene `{ data, current_page, last_page }`
- Paginación: página 2 devuelve el bloque correcto sin solapamiento con página 1

---

## Frontend — React (Vitest + Testing Library)

**Requisitos:** `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`. Configurado en `vite.config.js` (`test.environment: jsdom`) y `src/test/setup.ts`.

`client.js` se mockea con `vi.mock` para aislar las llamadas reales a la API.

### `frontend/src/__tests__/Filters.test.tsx`

Cubre el componente `Filters.jsx` en aislamiento:

- `onChange` se llama con el valor correcto al cambiar `category_id`, `condition`, `min_price`, `max_price` y `sort_price`
- `onChange` se llama inmediatamente (sin debounce)
- El contador badge muestra el número correcto de filtros activos
- `search` no cuenta para el badge
- "Limpiar todo" resetea todos los campos a vacío, incluido `sort_price`

### `frontend/src/__tests__/Home.integration.test.tsx`

Cubre la integración entre `Home.jsx`, `Filters.jsx` y `client.js`:

- La carga inicial llama a `client` con `/products?page=1`
- Cambiar categoría, condition o `sort_price` provoca una nueva llamada con los query params correctos
- El campo `search` tiene debounce: `client` no se llama inmediatamente al escribir, pero sí tras los 400 ms
- "Cargar más" concatena los productos al array en lugar de reemplazarlos
- Cambiar un filtro después de "Cargar más" vuelve a página 1 y reemplaza los resultados
