import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import { App } from '@/app/index.jsx'
import { initDevLogger } from '@/lib/dev-logger'

initDevLogger()

createRoot(globalThis.document.querySelector('#root')).render(
    <StrictMode>
        <App />
    </StrictMode>
)
