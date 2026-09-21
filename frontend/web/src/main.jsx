import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import { App } from '@/app/App'
import { initDevLogger } from '@/lib/dev-logger'
import { initAuthFromUrl } from '@/lib/auth'

initDevLogger()
initAuthFromUrl()

createRoot(globalThis.document.querySelector('#root')).render(
    <StrictMode>
        <App />
    </StrictMode>
)
