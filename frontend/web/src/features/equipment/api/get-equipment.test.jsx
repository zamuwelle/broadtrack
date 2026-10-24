import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vite-plus/test'
import { api } from '@/lib/api-client'
import { getEquipment, getEquipmentQueryOptions, useEquipment } from '@/features/equipment/api/get-equipment'

vi.mock('@/lib/api-client', () => ({
    api: { get: vi.fn() }
}))
vi.mock('@shared/util/image', () => ({
    preloadEquipmentImages: vi.fn()
}))

describe('equipment queries', () => {
    it('returns equipment data and uses the equipment query key', async () => {
        api.get.mockResolvedValue({ data: [{ id: 1, name: 'Camera' }] })

        await expect(getEquipment()).resolves.toEqual([{ id: 1, name: 'Camera' }])
        expect(getEquipmentQueryOptions().queryKey).toEqual(['equipment'])
    })

    it('exposes fetched equipment through the query hook', async () => {
        api.get.mockResolvedValue({ data: [{ id: 2, name: 'Tripod' }] })
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } }
        })
        const { result } = renderHook(() => useEquipment(), {
            wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        })

        await waitFor(() => expect(result.current.data).toEqual([{ id: 2, name: 'Tripod' }]))
    })
})
