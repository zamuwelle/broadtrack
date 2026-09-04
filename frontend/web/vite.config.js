import { URL, fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, lazyPlugins } from 'vite-plus'
import { errorLogPlugin } from './plugins/vite-error-logger.js'
import { sharedDepsPlugin } from './plugins/vite-shared-deps.js'

export default defineConfig({
    plugins: lazyPlugins(() => [react(), tailwindcss(), errorLogPlugin(), sharedDepsPlugin()]),
    server: {
        forwardConsole: {
            unhandledErrors: true,
            logLevels: ['error', 'warn', 'info', 'log']
        },
        fs: {
            allow: ['..']
        }
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('src', import.meta.url)),
            '@shared': fileURLToPath(new URL('../shared', import.meta.url))
        }
    }
})
