# Chat en tiempo real — Arquitectura WebSocket con Laravel Reverb

---

## Índice

1. [Qué es un WebSocket y por qué lo usamos](#1-qué-es-un-websocket-y-por-qué-lo-usamos)
2. [Arquitectura general](#2-arquitectura-general)
3. [echo.js — la conexión WebSocket](#3-echojs--la-conexión-websocket)
4. [channels.php — el portero de los canales](#4-channelsphp--el-portero-de-los-canales)
5. [MessageSent.php — el mensajero](#5-messagesentphp--el-mensajero)
6. [ChatController.php — la lógica](#6-chatcontrollerphp--la-lógica)
7. [Chat.jsx — la interfaz](#7-chatjsx--la-interfaz)
8. [El flujo completo de un mensaje](#8-el-flujo-completo-de-un-mensaje)

---

## 1. Qué es un WebSocket y por qué lo usamos

Sin WebSockets la única forma de saber si hay mensajes nuevos es preguntar al servidor cada X segundos:

```
Sin WebSockets (polling):
Navegador → "¿hay mensajes?" → Servidor  (cada 3 segundos)
Navegador → "¿hay mensajes?" → Servidor  (cada 3 segundos)
Navegador → "¿hay mensajes?" → Servidor  (cada 3 segundos)
```

Con WebSockets se abre una conexión permanente. El servidor empuja los mensajes al navegador en el momento que llegan:

```
Con WebSockets (Reverb):
Navegador ←→ Servidor  (conexión permanente abierta)
Servidor → "llegó un mensaje" → Navegador  (instantáneo)
```

**Laravel Reverb** es el servidor de WebSockets oficial de Laravel. **Laravel Echo** es la librería del frontend que gestiona la conexión con Reverb.

---

## 2. Arquitectura general

```
Usuario A envía un mensaje
        ↓
POST /api/chat/conversations/5/messages
        ↓
ChatController@sendMessage
        ↓
Message::create()  →  guarda en BD
        ↓
broadcast(new MessageSent($message))
        ↓
Reverb recibe el evento
        ↓
Reverb lo envía por WebSocket al canal "order.5"
        ↓
Usuario B está suscrito a "order.5" via Echo
        ↓
Echo dispara .listen('MessageSent', callback)
        ↓
setMessages() → React re-renderiza → mensaje en pantalla
```

Los canales son como habitaciones — cada conversación (Order) tiene su propio canal `order.{id}`. Solo las personas involucradas en esa order pueden entrar.

---

## 3. `echo.js` — la conexión WebSocket

Este archivo crea y exporta la instancia de Echo que se usa en toda la app.

```javascript
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher
```

`laravel-echo` gestiona la conexión. `pusher-js` es el cliente de bajo nivel — Reverb habla el mismo protocolo que Pusher. `window.Pusher = Pusher` es obligatorio porque Echo busca Pusher en el objeto global.

```javascript
const echo = new Echo({
  broadcaster:       'reverb',
  key:               import.meta.env.VITE_REVERB_APP_KEY,
  wsHost:            import.meta.env.VITE_REVERB_HOST,
  wsPort:            import.meta.env.VITE_REVERB_PORT,
  wssPort:           import.meta.env.VITE_REVERB_PORT,
  forceTLS:          import.meta.env.VITE_REVERB_SCHEME === 'https',
  enabledTransports: ['ws', 'wss'],
```

| Propiedad | Descripción |
|---|---|
| `broadcaster` | Tipo de servidor WebSocket — siempre `reverb` |
| `key` | Clave de la app Reverb — debe coincidir con `REVERB_APP_KEY` del backend |
| `wsHost` | Dirección del servidor Reverb |
| `wsPort` | Puerto para conexiones sin SSL (`ws://`) |
| `wssPort` | Puerto para conexiones con SSL (`wss://`) |
| `forceTLS` | En producción (`https`) fuerza `wss://`, en desarrollo usa `ws://` |
| `enabledTransports` | Solo WebSocket — evita que Echo use polling HTTP como alternativa |

```javascript
  authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  },
})
```

Cuando el frontend intenta suscribirse a un canal privado, Echo llama a `authEndpoint` con el token Bearer. Laravel verifica la identidad del usuario y si tiene permiso para ese canal.

```
Frontend quiere escuchar order.5
        ↓
Echo llama a POST /api/broadcasting/auth  (con token Bearer)
        ↓
Laravel identifica al usuario por el token
        ↓
Ejecuta channels.php → comprueba si es buyer o seller de esa order
        ↓
Si tiene permiso → devuelve token firmado → Echo se conecta al canal
Si no tiene permiso → 403 → Echo no puede escuchar el canal
```

### Variables de entorno

**Desarrollo:**
```env
VITE_REVERB_APP_KEY=tradeball-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

**Producción:**
```env
VITE_REVERB_APP_KEY=tradeball-key
VITE_REVERB_HOST=ws-tradeball.duckdns.org
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

---

## 4. `channels.php` — el portero de los canales

Define quién puede escuchar cada canal privado.

```php
Broadcast::channel('order.{orderId}', function ($user, $orderId) {
    $order = Order::find($orderId);
    if (!$order) return false;
    return $order->buyer_id === $user->id || $order->seller_id === $user->id;
});
```

El patrón `order.{orderId}` captura todos los canales que empiecen por `order.` — Laravel extrae el `orderId` automáticamente y lo pasa como parámetro junto al usuario autenticado.

La función devuelve:
- `false` → acceso denegado, la suscripción se rechaza
- `true` → acceso permitido, el usuario puede escuchar el canal

En este caso solo el comprador (`buyer_id`) y el vendedor (`seller_id`) de esa order pueden acceder. Cualquier otro usuario que intente suscribirse a `order.5` recibirá un error 403.

---

## 5. `MessageSent.php` — el mensajero

Es el evento que viaja por WebSocket cuando se envía un mensaje.

```php
class MessageSent implements ShouldBroadcast
```

`ShouldBroadcast` le dice a Laravel que este evento debe enviarse por Reverb. Sin esta interfaz el evento se dispararía internamente pero nunca llegaría al navegador.

```php
public function __construct(public Message $message) {}
```

Recibe el mensaje recién guardado en BD. La sintaxis `public Message $message` crea automáticamente la propiedad `$this->message`.

```php
public function broadcastOn(): array
{
    return [
        new PrivateChannel('order.' . $this->message->order_id),
    ];
}
```

Define en qué canal se emite el evento. `PrivateChannel` requiere que el usuario esté autorizado en `channels.php`. El canal es dinámico — si el mensaje es de la order 5, el canal es `order.5`.

Un evento puede emitirse en varios canales a la vez devolviendo más elementos en el array — útil si quisieras notificar a más partes.

```php
public function broadcastWith(): array
{
    return [
        'message' => [
            'id'         => $this->message->id,
            'order_id'   => $this->message->order_id,
            'sender_id'  => $this->message->sender_id,
            'message'    => $this->message->message,
            'read'       => $this->message->read,
            'created_at' => $this->message->created_at,
            'sender'     => $this->message->sender,  // relación cargada
        ]
    ];
}
```

Define exactamente qué datos llegan al frontend. Si no defines este método, Laravel enviaría todos los campos del modelo incluyendo campos internos innecesarios.

El campo `sender` incluye los datos del usuario que envió el mensaje — nombre, avatar — necesarios para mostrarlo en el chat del receptor.

En el frontend se recibe como `e.message`:

```javascript
echo.private(`order.${activeConv.id}`)
  .listen('MessageSent', (e) => {
    setMessages(prev => [...prev, e.message])
  })
```

---

## 6. `ChatController.php` — la lógica

Tiene 4 métodos:

### `conversations()` — GET /api/chat/conversations

Devuelve todas las conversaciones del usuario. Una conversación en TradeBall es una `Order`. Carga el producto, comprador, vendedor, el último mensaje y el número de mensajes no leídos.

### `createConversation()` — POST /api/chat/conversations

Cuando el comprador pulsa "Contactar" en ProductDetail. Crea la Order si no existía — si ya existía la devuelve. Así no se crean conversaciones duplicadas para el mismo producto.

### `messages()` — GET /api/chat/conversations/{orderId}/messages

Devuelve todos los mensajes de una conversación ordenados por fecha. Al cargarlos marca como leídos los mensajes del otro usuario.

### `sendMessage()` — POST /api/chat/conversations/{orderId}/messages

```php
$message = Message::create([...]);
$message->load('sender');
broadcast(new MessageSent($message))->toOthers();
return response()->json($message);
```

Guarda el mensaje en BD, carga la relación `sender` para tener los datos del usuario, y emite el evento por Reverb. `.toOthers()` significa "envía a todos excepto al remitente" — él ya tiene el mensaje en pantalla.

---

## 7. `Chat.jsx` — la interfaz

### Estados principales

```jsx
const [conversations, setConversations] = useState([])  // lista de chats
const [activeConv, setActiveConv]       = useState(null) // chat abierto
const [messages, setMessages]           = useState([])   // mensajes del chat activo
const [newMessage, setNewMessage]       = useState('')   // texto del textarea
const [pendingOrderId, setPendingOrderId] = useState(null) // conversación sin mensajes
```

### useEffect 1 — cargar conversaciones

```jsx
useEffect(() => {
  client('/chat/conversations').then(data => {
    setConversations(data)
    // Si venimos desde ProductDetail, abrir esa conversación directamente
    if (initialOrderId) {
      const conv = data.find(c => c.id === initialOrderId)
      if (conv) setActiveConv(conv)
    }
  })
}, [initialOrderId])
```

### useEffect 2 — cargar mensajes al cambiar de conversación

```jsx
useEffect(() => {
  if (!activeConv) return
  client(`/chat/conversations/${activeConv.id}/messages`).then(setMessages)
}, [activeConv])
```

Cada vez que el usuario cambia de conversación carga los mensajes de la nueva.

### useEffect 3 — scroll automático

```jsx
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}, [messages])
```

Cada vez que llega un mensaje nuevo hace scroll al final de la lista.

### useEffect 4 — limpiar conversaciones vacías

```jsx
useEffect(() => {
  if (pendingOrderId && activeConv?.id !== pendingOrderId) {
    setConversations(prev => prev.filter(c => c.id !== pendingOrderId))
    setPendingOrderId(null)
  }
}, [activeConv, pendingOrderId])
```

Si el usuario abre una conversación vacía (recién creada) y se va sin escribir nada, la elimina de la lista.

### handleSend — enviar mensaje

```jsx
const handleSend = async () => {
  // 1. Llamar a la API
  const data = await client(`/chat/conversations/${activeConv.id}/messages`, {
    method: 'POST',
    body: { message: newMessage.trim() },
  })
  // 2. Añadir a la lista local sin borrar los anteriores
  setMessages(prev => [...prev, data])
  // 3. Limpiar el textarea
  setNewMessage('')
  // 4. Actualizar último mensaje en la lista de conversaciones
  setConversations(prev => prev.map(c =>
    c.id === activeConv.id ? { ...c, last_message: data } : c
  ))
}
```

---

## 8. El flujo completo de un mensaje

```
Usuario A escribe "Hola" y pulsa Enter
        ↓
handleKeyDown detecta Enter → llama handleSend
        ↓
POST /api/chat/conversations/5/messages { message: "Hola" }
        ↓
ChatController@sendMessage:
  1. Message::create() → guarda en BD
  2. $message->load('sender') → carga datos del remitente
  3. broadcast(new MessageSent($message))->toOthers()
        ↓
Laravel Reverb recibe el evento MessageSent:
  - broadcastOn()   → canal "order.5"
  - broadcastWith() → { message: { id, sender_id, message, sender, ... } }
        ↓
Reverb envía por WebSocket a todos los suscritos a "order.5"
(excepto al remitente por .toOthers())
        ↓
handleSend recibe la respuesta del servidor
setMessages(prev => [...prev, data])  → mensaje aparece en pantalla de A
        ↓
(En el navegador de Usuario B)
Echo está conectado a Reverb via echo.js
Echo está autorizado en order.5 via channels.php
        ↓
Reverb entrega el evento al navegador de B
Echo dispara .listen('MessageSent', (e) => { ... })
setMessages(prev => [...prev, e.message])
        ↓
useEffect de scroll → messagesEndRef.scrollIntoView()
        ↓
El mensaje aparece en pantalla de B instantáneamente
```

---

## Resumen de responsabilidades

| Archivo | Responsabilidad |
|---|---|
| `echo.js` | Crea la conexión WebSocket con Reverb + autorización de canales |
| `channels.php` | Define quién puede escuchar cada canal privado |
| `MessageSent.php` | Evento que viaja por WebSocket con los datos del mensaje |
| `ChatController.php` | Lógica de negocio — CRUD de conversaciones y mensajes |
| `Chat.jsx` | UI + suscripción a canales + gestión de mensajes en tiempo real |
| `ProductDetail.jsx` | Crear conversación y navegar al chat |
| `Profile.jsx` | Contenedor que pasa el orderId inicial al Chat |
| `App.jsx` | Enrutamiento — escucha eventos y cambia la página |

---

## Variables de entorno completas

### `backend/.env`

```env
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=tradeball
REVERB_APP_KEY=tradeball-key
REVERB_APP_SECRET=tradeball-secret
REVERB_HOST=0.0.0.0
REVERB_PORT=8080
REVERB_SCHEME=http          # http en desarrollo, https en producción
```

### `frontend/.env` — desarrollo

```env
VITE_REVERB_APP_KEY=tradeball-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

### `frontend/.env` — producción

```env
VITE_REVERB_APP_KEY=tradeball-key
VITE_REVERB_HOST=ws-tradeball.duckdns.org
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

---

## Configuración de Nginx Proxy Manager para WebSockets

En producción el proxy host de WebSockets necesita headers especiales para que la conexión no se cierre:

```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "Upgrade";
proxy_read_timeout 3600s;
proxy_connect_timeout 3600s;
```

Sin `Upgrade` y `Connection`, NPM trataría la conexión WebSocket como una petición HTTP normal y la cerraría inmediatamente.
`proxy_read_timeout 3600s` evita que NPM cierre conexiones inactivas — los WebSockets pueden estar abiertos horas sin enviar datos.