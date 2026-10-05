import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useBookingCartStore = create(
    persist(
        (set, get) => ({
            items: [],

            toggleItem: (equipment) =>
                set((state) => {
                    const exists = state.items.some((item) => item.id === equipment.id)
                    if (exists) {
                        return { items: state.items.filter((item) => item.id !== equipment.id) }
                    }
                    if (equipment.status !== 'maintenance') {
                        return { items: [...state.items, { ...equipment }] }
                    }
                    return state
                }),

            removeItem: (equipmentId) =>
                set((state) => ({
                    items: state.items.filter((item) => item.id !== equipmentId)
                })),

            removeSubmittedItems: (submittedItems) =>
                set((state) => ({ items: state.items.filter((item) => !submittedItems.includes(item)) })),

            clearCart: () => set({ items: [] }),

            isSelected: (equipmentId) => get().items.some((item) => item.id === equipmentId)
        }),
        {
            name: 'broadtrack-booking-cart'
        }
    )
)
