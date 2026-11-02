import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const logFilePath = path.resolve(import.meta.dirname, '../web/.vite-errors.log')

try {
    const content = await fs.readFile(logFilePath, 'utf8')
    const errorContent = content.trim()
    if (errorContent) {
        console.error(errorContent)
        process.exitCode = 1
    }
} catch {
    // ignore error if log file does not exist
}
