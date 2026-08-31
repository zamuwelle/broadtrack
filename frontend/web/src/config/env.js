export const env = Object.freeze({
    API_URL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
    SITE_URL: import.meta.env.VITE_SITE_URL ?? 'http://localhost:5173',
    REVERB_APP_KEY: import.meta.env.VITE_REVERB_APP_KEY ?? '',
    REVERB_HOST: import.meta.env.VITE_REVERB_HOST ?? '',
    REVERB_PORT: import.meta.env.VITE_REVERB_PORT ?? '8080',
    REVERB_SCHEME: import.meta.env.VITE_REVERB_SCHEME ?? 'http'
})
