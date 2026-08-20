import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@/index.css'
import { App } from '@/App.jsx'

const URL_REGEX = /https?:\/\/[^/]+\//gu
const STACK_LINE_REGEX = /^(?:(?<func>.*?)@)?(?<loc>.*)$/u
const EXT_REGEX = /\.[jt]sx?$/u

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 60,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: (failureCount, error) => (error ? error.status !== 401 : true) && failureCount < 2
        }
    }
})

const reportErrorToServer = async (type, message) => {
    try {
        await fetch('/__log_error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, message })
        })
    } catch {
        // ignore network logging errors
    }
}

const formatStack = (stack) =>
    stack
        .split('\n')
        .map((line) => line.trim())
        .filter(
            (line) =>
                line &&
                !line.includes('node_modules') &&
                !line.includes('@vite') &&
                !line.includes('main.jsx') &&
                !line.includes('react-dom') &&
                !line.includes('unknown:0:0')
        )
        .map((line) => {
            const cleanLine = line.replaceAll(URL_REGEX, '')
            if (cleanLine.startsWith('at ')) {
                return `    ${cleanLine}`
            }
            const match = cleanLine.match(STACK_LINE_REGEX)
            if (!match) {
                return `    ${cleanLine}`
            }
            const functionName = match.groups?.func
            const location = match.groups?.loc || ''
            const segments = location.split(':')[0].split('/')
            const lastSegment = segments.at(-1) || ''
            const fileBase = lastSegment.replace(EXT_REGEX, '')
            const component = functionName && functionName !== 'default' ? functionName : fileBase
            return `    at ${component} (${location})`
        })
        .join('\n')

if (import.meta.env.DEV) {
    const originalError = console.error
    const originalWarn = console.warn
    const internals =
        React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE ||
        React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED

    console.error = (...args) => {
        const componentStack = internals && internals.getCurrentStack ? internals.getCurrentStack() : ''
        const errorStack = new Error('Stack trace capture').stack || ''
        const formatted = formatStack(componentStack || errorStack)
        const message = args
            .map((argument) => (typeof argument === 'string' ? argument : JSON.stringify(argument)))
            .join(' ')
        reportErrorToServer('Error', `${message}${formatted ? `\n${formatted}` : ''}`)

        if (formatted) {
            originalError(...args, `\n${formatted}`)
        } else {
            originalError(...args)
        }
    }

    console.warn = (...args) => {
        const message = args
            .map((argument) => (typeof argument === 'string' ? argument : JSON.stringify(argument)))
            .join(' ')
        if (
            message.includes('React does not recognize') ||
            message.includes('Unknown event handler') ||
            message.includes('Invalid DOM property')
        ) {
            reportErrorToServer('Warning', message)
        }
        originalWarn(...args)
    }

    globalThis.addEventListener('error', (event) => {
        reportErrorToServer('Uncaught Error', event.message || 'Unknown window error')
    })
}

createRoot(globalThis.document.querySelector('#root')).render(
    <QueryClientProvider client={queryClient}>
        <StrictMode>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </StrictMode>
    </QueryClientProvider>
)
