import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

export const createEcho = ({
    key,
    wsHost = '',
    wsPort = 80,
    forceTLS = false,
    enabledTransports = ['ws', 'wss']
} = {}) => {
    if (!key) {
        return null
    }

    globalThis.Pusher = Pusher

    const port = Number(wsPort || (forceTLS ? 443 : 80))

    return new Echo({
        broadcaster: 'reverb',
        key,
        wsHost,
        wsPort: port,
        wssPort: port,
        forceTLS,
        enabledTransports,
        Pusher
    })
}
