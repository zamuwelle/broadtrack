import { useToast } from '@/hooks/ui/useToast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { api } from '@/lib/api-client'
import { createEquipment, useCreateEquipment } from '@/features/equipment/api/create-equipment'
import { updateEquipment, useUpdateEquipment } from '@/features/equipment/api/update-equipment'
import { deleteEquipment, useDeleteEquipment } from '@/features/equipment/api/delete-equipment'
import { uploadEquipmentImage, useUploadEquipmentImage } from '@/features/equipment/api/upload-equipment'
import { EquipmentModalDialog } from '@/features/admin/inventory/components/EquipmentModalDialog'

vi.mock('@/lib/api-client', () => ({
    api: {
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}))

const TestWrapper = ({ client, children }) => {
    const { message, visible } = useToast()
    return (
        <QueryClientProvider client={client}>
            {children}
            {visible ? <div>{message}</div> : null}
        </QueryClientProvider>
    )
}

const categories = Object.freeze([
    { id: 'Camera', name: 'Camera' },
    { id: 'Audio', name: 'Audio' }
])

describe('equipment api request helpers', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('delegates to the underlying HTTP client methods', async () => {
        api.post.mockResolvedValueOnce({ data: { id: 1 } })
        await createEquipment({ name: 'Lens' })
        expect(api.post).toHaveBeenCalledWith('/equipment', { name: 'Lens' })

        api.put.mockResolvedValueOnce({ data: { id: 1 } })
        await updateEquipment({ id: 1, data: { name: 'Lens v2' } })
        expect(api.put).toHaveBeenCalledWith('/equipment/1', { name: 'Lens v2' })

        api.delete.mockResolvedValueOnce(null)
        await deleteEquipment(1)
        expect(api.delete).toHaveBeenCalledWith('/equipment/1')

        api.post.mockResolvedValueOnce({ data: { id: 1 } })
        await uploadEquipmentImage({ id: 1, file: new Blob() })
        expect(api.post).toHaveBeenCalledWith('/equipment/1/upload', expect.any(FormData))
    })
})

describe('equipment mutation hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('useCreateEquipment calls api.post and invalidates queries', async () => {
        const queryClient = new QueryClient({
            defaultOptions: { mutations: { retry: false } }
        })
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
        const onSuccess = vi.fn()
        api.post.mockResolvedValueOnce({ data: { id: 10 } })

        const { result } = renderHook(() => useCreateEquipment({ mutationConfig: { onSuccess } }), {
            wrapper: ({ children }) => <TestWrapper client={queryClient}>{children}</TestWrapper>
        })

        await result.current.mutateAsync({ name: 'Tripod' })
        expect(api.post).toHaveBeenCalledWith('/equipment', { name: 'Tripod' })
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['equipment'] })
        expect(onSuccess).toHaveBeenCalled()
    })

    it('useUpdateEquipment calls api.put and invalidates queries', async () => {
        const queryClient = new QueryClient({
            defaultOptions: { mutations: { retry: false } }
        })
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
        const onSuccess = vi.fn()
        api.put.mockResolvedValueOnce({ data: { id: 10 } })

        const { result } = renderHook(() => useUpdateEquipment({ mutationConfig: { onSuccess } }), {
            wrapper: ({ children }) => <TestWrapper client={queryClient}>{children}</TestWrapper>
        })

        await result.current.mutateAsync({ id: 10, data: { name: 'Updated' } })
        expect(api.put).toHaveBeenCalledWith('/equipment/10', { name: 'Updated' })
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['equipment'] })
        expect(onSuccess).toHaveBeenCalled()
    })

    it('useDeleteEquipment calls api.delete and invalidates queries', async () => {
        const queryClient = new QueryClient({
            defaultOptions: { mutations: { retry: false } }
        })
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
        const onSuccess = vi.fn()
        api.delete.mockResolvedValueOnce(null)

        const { result } = renderHook(() => useDeleteEquipment({ mutationConfig: { onSuccess } }), {
            wrapper: ({ children }) => <TestWrapper client={queryClient}>{children}</TestWrapper>
        })

        await result.current.mutateAsync(10)
        expect(api.delete).toHaveBeenCalledWith('/equipment/10')
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['equipment'] })
        expect(onSuccess).toHaveBeenCalled()
    })

    it('useUploadEquipmentImage calls api.post with formData and invalidates queries', async () => {
        const queryClient = new QueryClient({
            defaultOptions: { mutations: { retry: false } }
        })
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
        const onSuccess = vi.fn()
        api.post.mockResolvedValueOnce({ data: { id: 10 } })

        const { result } = renderHook(() => useUploadEquipmentImage({ mutationConfig: { onSuccess } }), {
            wrapper: ({ children }) => <TestWrapper client={queryClient}>{children}</TestWrapper>
        })

        const file = new File(['mock content'], 'gear.png', { type: 'image/png' })
        await result.current.mutateAsync({ id: 10, file })
        expect(api.post).toHaveBeenCalledWith('/equipment/10/upload', expect.any(FormData))
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['equipment'] })
        expect(onSuccess).toHaveBeenCalled()
    })
})

describe('EquipmentModalDialog validation and recovery', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-image')
        globalThis.URL.revokeObjectURL = vi.fn()
    })

    it('validates required fields with equipmentSchema and blocks invalid submission', () => {
        const queryClient = new QueryClient({
            defaultOptions: { mutations: { retry: false } }
        })
        const onClose = vi.fn()
        const onSuccess = vi.fn()

        const { container } = render(
            <TestWrapper client={queryClient}>
                <EquipmentModalDialog
                    equipment={null}
                    categories={categories}
                    onClose={onClose}
                    onSuccess={onSuccess}
                />
            </TestWrapper>
        )

        expect(screen.getByRole('button', { name: 'Add Equipment' })).toBeDisabled()
        fireEvent.submit(container.querySelector('form'))

        expect(api.post).not.toHaveBeenCalled()
        expect(screen.getByText('Equipment name is required')).toBeInTheDocument()
        expect(screen.getByText('Please select a category')).toBeInTheDocument()
        expect(screen.getByText('Description is required')).toBeInTheDocument()
    })

    it('maps server validation errors onto fields and error banner', async () => {
        const queryClient = new QueryClient({
            defaultOptions: { mutations: { retry: false } }
        })
        const onClose = vi.fn()
        const onSuccess = vi.fn()

        const error = new Error('The given data was invalid.')
        error.errors = {
            name: ['The name has already been taken.'],
            category: ['The selected category is invalid.'],
            description: ['Description is invalid.'],
            serial_no: ['The serial number has already been taken.']
        }
        error.status = 422
        api.post.mockRejectedValueOnce(error)

        const { container } = render(
            <TestWrapper client={queryClient}>
                <EquipmentModalDialog
                    equipment={null}
                    categories={categories}
                    onClose={onClose}
                    onSuccess={onSuccess}
                />
            </TestWrapper>
        )

        fireEvent.change(screen.getByLabelText(/Equipment Name/iu), {
            target: { value: 'Sony A7' }
        })
        fireEvent.change(screen.getByLabelText(/Model \/ Code/iu), { target: { value: 'A7' } })
        fireEvent.change(screen.getByLabelText(/Serial Number/iu), { target: { value: 'SN-A7-1' } })
        fireEvent.click(screen.getByRole('button', { name: /Select a category/iu }))
        fireEvent.click(screen.getByRole('button', { name: 'Camera' }))
        fireEvent.change(screen.getByLabelText(/Short Description/iu), {
            target: { value: 'Mirrorless camera' }
        })

        fireEvent.submit(container.querySelector('form'))

        await waitFor(() => {
            expect(screen.getByText('The name has already been taken.')).toBeInTheDocument()
            expect(screen.getByText('The selected category is invalid.')).toBeInTheDocument()
            expect(screen.getByText('Description is invalid.')).toBeInTheDocument()
            expect(screen.getByText('The serial number has already been taken.')).toBeInTheDocument()
        })
        expect(onClose).not.toHaveBeenCalled()
    })

    it('recovers from partial image upload failure without creating duplicates on retry', async () => {
        const queryClient = new QueryClient({
            defaultOptions: { mutations: { retry: false } }
        })
        const onClose = vi.fn()
        const onSuccess = vi.fn()

        api.post.mockImplementation((url) => {
            if (url === '/equipment') {
                return Promise.resolve({
                    data: { id: 77, name: 'Sony FX3', serial_no: 'SN-001' }
                })
            }
            if (url === '/equipment/77/upload') {
                return Promise.reject(new Error('Image upload timed out'))
            }
            return Promise.reject(new Error(`Unexpected URL ${url}`))
        })

        const { container } = render(
            <TestWrapper client={queryClient}>
                <EquipmentModalDialog
                    equipment={null}
                    categories={categories}
                    onClose={onClose}
                    onSuccess={onSuccess}
                />
            </TestWrapper>
        )

        fireEvent.change(screen.getByLabelText(/Equipment Name/iu), {
            target: { value: 'Sony FX3' }
        })
        fireEvent.change(screen.getByLabelText(/Model \/ Code/iu), { target: { value: 'FX3' } })
        fireEvent.change(screen.getByLabelText(/Serial Number/iu), { target: { value: 'SN-001' } })
        fireEvent.click(screen.getByRole('button', { name: /Select a category/iu }))
        fireEvent.click(screen.getByRole('button', { name: 'Camera' }))
        fireEvent.change(screen.getByLabelText(/Short Description/iu), {
            target: { value: 'Cinema camera' }
        })

        const fileInput = container.querySelector('input[type="file"]')
        const mockFile = new File(['content'], 'camera.jpg', {
            type: 'image/jpeg'
        })
        fireEvent.change(fileInput, { target: { files: [mockFile] } })

        fireEvent.submit(container.querySelector('form'))

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalledTimes(1)
            expect(
                screen.getByText('Equipment details saved, but the image couldn’t be uploaded. Please try again.')
            ).toBeInTheDocument()
        })
        expect(onClose).not.toHaveBeenCalled()

        api.put.mockResolvedValueOnce({
            data: { id: 77, name: 'Sony FX3', serial_no: 'SN-001' }
        })
        api.post.mockImplementation((url) => {
            if (url === '/equipment/77/upload') {
                return Promise.resolve({ data: { id: 77, image: 'uploaded.jpg' } })
            }
            return Promise.reject(new Error(`Unexpected URL ${url}`))
        })

        fireEvent.submit(container.querySelector('form'))

        await waitFor(() => {
            expect(api.put).toHaveBeenCalledWith('/equipment/77', expect.any(Object))
            expect(onClose).toHaveBeenCalledTimes(1)
        })

        const postCalls = api.post.mock.calls.filter(([url]) => url === '/equipment')
        expect(postCalls).toHaveLength(1)
    })
})

describe('equipment edit validation', () => {
    const equipment = Object.freeze({
        id: 3,
        name: 'Microphone',
        category: 'Audio',
        description: 'Microphone',
        model: 'MIC-1',
        serial_no: 'SN-3'
    })
    beforeEach(() => {
        vi.clearAllMocks()
        globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-image')
        globalThis.URL.revokeObjectURL = vi.fn()
    })

    it('blocks invalid images and requires a serial number before saving', async () => {
        const queryClient = new QueryClient({
            defaultOptions: { mutations: { retry: false } }
        })
        api.put.mockResolvedValueOnce({ data: { id: 3 } })
        api.post.mockResolvedValueOnce({ data: { id: 3 } })
        const { container } = render(
            <TestWrapper client={queryClient}>
                <EquipmentModalDialog equipment={equipment} categories={categories} />
            </TestWrapper>
        )
        fireEvent.change(screen.getByLabelText(/Serial Number/iu), {
            target: { value: '' }
        })
        const fileInput = container.querySelector('input[type="file"]')
        const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' })
        fireEvent.change(fileInput, { target: { files: [oversized] } })
        expect(screen.getByText('Image must not exceed 5MB.')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Update Equipment' })).toBeDisabled()
        fireEvent.submit(container.querySelector('form'))
        expect(api.put).not.toHaveBeenCalled()
        fireEvent.change(fileInput, {
            target: { files: [new File(['image'], 'ok.png', { type: 'image/png' })] }
        })
        fireEvent.submit(container.querySelector('form'))
        expect(api.put).not.toHaveBeenCalled()
        fireEvent.change(screen.getByLabelText(/Serial Number/iu), { target: { value: 'SN-3' } })
        fireEvent.submit(container.querySelector('form'))
        await waitFor(() =>
            expect(api.put).toHaveBeenCalledWith('/equipment/3', expect.objectContaining({ serial_no: 'SN-3' }))
        )
    })
})
