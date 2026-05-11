import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'
import { cartStore, type CartState, type CartItem } from '../lib/cart'

export interface LastAddedItem {
  name: string
  price: number
  image: string
  categorySlug: string | undefined
}

interface CartContextValue extends CartState {
  addItem: (item: Omit<CartItem, 'id'> & { categorySlug?: string }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  lastAdded: LastAddedItem | null
  clearLastAdded: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(cartStore.getState())
  const [isOpen, setIsOpen] = useState(false)
  const [lastAdded, setLastAdded] = useState<LastAddedItem | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => cartStore.subscribe(setState), [])

  function clearLastAdded() {
    setLastAdded(null)
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem: (item) => {
          const { categorySlug, ...cartItem } = item
          cartStore.addItem(cartItem)
          setIsOpen(true)
          setLastAdded({
            name: item.name,
            price: item.price,
            image: item.image,
            categorySlug,
          })
          if (timerRef.current) clearTimeout(timerRef.current)
          timerRef.current = setTimeout(() => setLastAdded(null), 8000)
        },
        removeItem: (id) => cartStore.removeItem(id),
        updateQuantity: (id, qty) => cartStore.updateQuantity(id, qty),
        clearCart: () => cartStore.clearCart(),
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        lastAdded,
        clearLastAdded,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
