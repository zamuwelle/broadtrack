import { createEcho } from '@shared/lib/echo'

export const echo = createEcho({
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST ?? ('window' in globalThis ? globalThis.location.hostname : ''),
    wsPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https'
})
