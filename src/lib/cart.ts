export interface CartItem {
  id: string          // unique cart entry id (productId + orderType)
  productId: string
  name: string
  price: number       // retail_price or bulk_price depending on orderType
  quantity: number
  image: string
  orderType: 'retail' | 'bulk'
  bulkMinQty?: number
}

export interface CartState {
  items: CartItem[]
  subtotal: number
  shippingFee: number   // always 0 in cart — calculated at checkout based on chosen method
  total: number         // subtotal + shippingFee (0)
  itemCount: number
}

const STORAGE_KEY = 'cxx_cart'

function calcState(items: CartItem[]): CartState {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  return { items, subtotal, shippingFee: 0, total: subtotal, itemCount }
}

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

function saveToStorage(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

type Listener = (state: CartState) => void

class CartStore {
  private static instance: CartStore
  private items: CartItem[]
  private listeners: Set<Listener> = new Set()

  private constructor() {
    this.items = loadFromStorage()
  }

  static getInstance(): CartStore {
    if (!CartStore.instance) CartStore.instance = new CartStore()
    return CartStore.instance
  }

  getState(): CartState {
    return calcState(this.items)
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    const state = this.getState()
    this.listeners.forEach((fn) => fn(state))
  }

  addItem(item: Omit<CartItem, 'id'>) {
    const id = `${item.productId}-${item.orderType}`
    const existing = this.items.find((i) => i.id === id)
    if (existing) {
      this.items = this.items.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i,
      )
    } else {
      this.items = [...this.items, { ...item, id }]
    }
    saveToStorage(this.items)
    this.notify()
  }

  removeItem(id: string) {
    this.items = this.items.filter((i) => i.id !== id)
    saveToStorage(this.items)
    this.notify()
  }

  updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(id)
      return
    }
    this.items = this.items.map((i) => (i.id === id ? { ...i, quantity } : i))
    saveToStorage(this.items)
    this.notify()
  }

  clearCart() {
    this.items = []
    saveToStorage(this.items)
    this.notify()
  }
}

export const cartStore = CartStore.getInstance()
