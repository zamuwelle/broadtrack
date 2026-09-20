import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { api } from '@/lib/api-client'
import { getUsers, getUsersQueryOptions, useUsers } from '@/features/users/api/get-users'

vi.mock('@/lib/api-client', () => ({
    api: { get: vi.fn() }
}))

describe('user queries', () => {
    it('returns users from the API and keeps the users query key', async () => {
        api.get.mockResolvedValue({ data: [{ id: 1, full_name: 'Maria Santos' }] })

        await expect(getUsers()).resolves.toEqual([{ id: 1, full_name: 'Maria Santos' }])
        expect(getUsersQueryOptions().queryKey).toEqual(['users'])
    })

    it('exposes fetched users through the query hook', async () => {
        api.get.mockResolvedValue({ data: [{ id: 2, full_name: 'Juan Cruz' }] })
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
        const { result } = renderHook(() => useUsers(), {
            wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        })

        await waitFor(() => expect(result.current.data).toEqual([{ id: 2, full_name: 'Juan Cruz' }]))
    })
})
