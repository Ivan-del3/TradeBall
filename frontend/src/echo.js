import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

const echo = new Echo({
  broadcaster:       'reverb',
  key:               import.meta.env.VITE_REVERB_APP_KEY,
  wsHost:            import.meta.env.VITE_REVERB_HOST,
  wsPort:            import.meta.env.VITE_REVERB_PORT,
  wssPort:           import.meta.env.VITE_REVERB_PORT,
  forceTLS:          import.meta.env.VITE_REVERB_SCHEME === 'https',
  enabledTransports: ['ws', 'wss'],
  // FIX Bug3: authorizer lee el token en el momento de cada suscripción,
  // no al cargar el módulo, por lo que funciona correctamente cuando el
  // usuario inicia sesión después de que la app ya está montada.
  authorizer: (channel) => ({
    authorize: (socketId, callback) => {
      fetch(`${import.meta.env.VITE_API_URL}/broadcasting/auth`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/x-www-form-urlencoded',
          Authorization:   `Bearer ${localStorage.getItem('token')}`,
        },
        body: new URLSearchParams({
          socket_id:    socketId,
          channel_name: channel.name,
        }),
      })
        .then(res => res.json())
        .then(data => callback(null, data))
        .catch(err  => callback(err, null))
    },
  }),
})

export default echo