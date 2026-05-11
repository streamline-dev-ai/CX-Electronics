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
  shippingFee: number
  vat: number
  total: number
  itemCount: number
}

const STORAGE_KEY = 'cxx_cart'
const SHIPPING_FLAT_RATE = 99     // R99 flat rate — applied to every order
const VAT_RATE = 0.15             // 15% VAT (included in price — for display only)

function calcState(items: CartItem[]): CartState {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee = items.length > 0 ? SHIPPING_FLAT_RATE : 0
  const vat = Math.round(subtotal * VAT_RATE * 100) / 100
  const total = subtotal + shippingFee
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  return { items, subtotal, shippingFee, vat, total, itemCount }
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
