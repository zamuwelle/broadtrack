import fs from 'node:fs/promises'
import path from 'node:path'
import { URL, fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const getManualChunk = (id) => {
    if (!id.includes('node_modules')) {
        return null
    }
    if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
        return 'vendor-react'
    }
    return 'vendor'
}

const errorLogPlugin = () => {
    const logFilePath = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '.vite-errors.log')
    return {
        name: 'vite-error-log-buffer',
        configureServer(server) {
            server.middlewares.use('/__log_error', (req, res) => {
                let body = ''
                req.on('data', (chunk) => {
                    body += chunk
                })
                req.on('end', async () => {
                    try {
                        const payload = JSON.parse(body)
                        const logEntry = `[${new Date().toLocaleTimeString()}] ${payload.type}: ${payload.message}\n`
                        let existing = ''
                        try {
                            existing = await fs.readFile(logFilePath, 'utf8')
                        } catch {
                            // file may not exist yet
                        }
                        const lines = existing.split('\n').filter(Boolean)
                        if (lines.length >= 5) {
                            lines.shift()
                        }
                        lines.push(logEntry.trim())
                        await fs.writeFile(logFilePath, `${lines.join('\n')}\n`)
                    } catch {
                        // ignore parse/write errors
                    }
                    res.statusCode = 204
                    res.end()
                })
            })
        }
    }
}

export default defineConfig({
    plugins: [react(), tailwindcss(), errorLogPlugin()],
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
            '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
            react: fileURLToPath(new URL('node_modules/react', import.meta.url))
        }
    },
    build: {
        rolldownOptions: {
            experimental: {
                lazyBarrel: true
            },
            output: {
                manualChunks: (id) => {
                    const chunk = getManualChunk(id)
                    if (chunk) {
                        return chunk
                    }
                }
            }
        },
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    const chunk = getManualChunk(id)
                    if (chunk) {
                        return chunk
                    }
                }
            }
        }
    }
})
