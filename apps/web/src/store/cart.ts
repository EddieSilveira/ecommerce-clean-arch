import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  productId: string
  name: string
  price: number
  quantity: number
}

type CartStore = {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clear: () => void
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            }
          }
          return { items: [...state.items, item] }
        }),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQty: (productId, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity: qty } : i,
                ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: 'cart-storage' },
  ),
)

export const useCartTotal = () =>
  useCart((s) => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0))

export const useCartCount = () =>
  useCart((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))