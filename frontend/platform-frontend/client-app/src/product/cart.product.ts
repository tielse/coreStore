import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCart = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1) => {
        const items = get().items
        const existed = items.find(i => i.id === product.id)

        if (existed) {
          existed.qty += qty
          set({ items: [...items] })
        } else {
          set({ items: [...items, { ...product, qty }] })
        }
      },

      removeItem: (id) =>
        set({ items: get().items.filter(i => i.id !== id) }),

      clear: () => set({ items: [] }),
    }),
    { name: 'cart-storage' }
  )
)
