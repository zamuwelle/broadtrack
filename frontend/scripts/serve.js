import { spawn } from 'node:child_process'
import process from 'node:process'

const isWindowsPlatform = process.platform === 'win32'
const artisanArguments = isWindowsPlatform
    ? ['../../backend/artisan', 'serve', '--port=8000']
    : ['../../backend/artisan', 'octane:start', '--server=frankenphp', '--watch', '--port=8000']

spawn('php', artisanArguments, { stdio: 'inherit', shell: true })
