import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { createEcho } from '@shared/api/echo'

globalThis.Pusher = Pusher

export const echo = createEcho({
    Echo,
    Pusher,
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST ?? ('window' in globalThis ? globalThis.location.hostname : ''),
    wsPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https'
})
