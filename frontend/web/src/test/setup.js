// eslint-disable-next-line import/no-unassigned-import
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll } from 'vite-plus/test'

const noop = () => null

afterEach(() => {
    cleanup()
})

beforeAll(() => {
    globalThis.matchMedia ||= () => ({
            matches: false,
            addEventListener: noop,
            removeEventListener: noop
        })
})
