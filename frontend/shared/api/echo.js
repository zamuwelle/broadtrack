export const createEcho = ({
    Echo,
    Pusher,
    key,
    wsHost,
    wsPort,
    forceTLS = false,
    enabledTransports = ['ws', 'wss']
} = {}) =>
    !key || !Echo
        ? null
        : new Echo({
              broadcaster: 'reverb',
              key,
              wsHost,
              wsPort: Number(wsPort ?? (forceTLS ? 443 : 80)),
              wssPort: Number(wsPort ?? (forceTLS ? 443 : 80)),
              forceTLS,
              enabledTransports,
              Pusher
          })
