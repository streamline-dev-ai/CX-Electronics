import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { cartStore, type CartState, type CartItem } from '../lib/cart'

interface CartContextValue extends CartState {
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(cartStore.getState())
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => cartStore.subscribe(setState), [])

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem: (item) => {
          cartStore.addItem(item)
          setIsOpen(true)
        },
        removeItem: (id) => cartStore.removeItem(id),
        updateQuantity: (id, qty) => cartStore.updateQuantity(id, qty),
        clearCart: () => cartStore.clearCart(),
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
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
