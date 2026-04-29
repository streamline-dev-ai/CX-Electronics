import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { LangProvider } from './context/LangContext'
import { ProtectedRoute } from './components/admin/ProtectedRoute'

// Public store — eagerly loaded
import { Home } from './pages/store/Home'
import { Shop } from './pages/store/Shop'
import { ProductDetail } from './pages/store/ProductDetail'
import { BulkShop } from './pages/store/BulkShop'
import { BulkProductDetail } from './pages/store/BulkProductDetail'
import { Deals } from './pages/store/Deals'
import { About } from './pages/store/About'
import { CartPage } from './pages/store/CartPage'
import { Checkout } from './pages/store/Checkout'
import { OrderConfirmation } from './pages/store/OrderConfirmation'

// Admin — lazy loaded (never bundled with store)
const AdminLogin = lazy(() => import('./pages/admin/Login').then((m) => ({ default: m.AdminLogin })))
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard').then((m) => ({ default: m.AdminDashboard })))
const AdminProducts = lazy(() => import('./pages/admin/Products').then((m) => ({ default: m.AdminProducts })))
const ProductForm = lazy(() => import('./pages/admin/ProductForm').then((m) => ({ default: m.ProductForm })))
const AdminOrders = lazy(() => import('./pages/admin/Orders').then((m) => ({ default: m.AdminOrders })))
const AdminOrderDetail = lazy(() => import('./pages/admin/OrderDetail').then((m) => ({ default: m.AdminOrderDetail })))

function AdminFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-cxx-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <LangProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public store ─────────────────────────────────── */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:slug" element={<ProductDetail />} />
            <Route path="/bulk" element={<BulkShop />} />
            <Route path="/bulk/:slug" element={<BulkProductDetail />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<About />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:id" element={<OrderConfirmation />} />

            {/* ── Admin ─────────────────────────────────────────── */}
            <Route
              path="/admin/login"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <AdminLogin />
                </Suspense>
              }
            />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                </Suspense>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense>} />
              <Route path="products" element={<Suspense fallback={<AdminFallback />}><AdminProducts /></Suspense>} />
              <Route path="products/new" element={<Suspense fallback={<AdminFallback />}><ProductForm /></Suspense>} />
              <Route path="products/:id" element={<Suspense fallback={<AdminFallback />}><ProductForm /></Suspense>} />
              <Route path="orders" element={<Suspense fallback={<AdminFallback />}><AdminOrders /></Suspense>} />
              <Route path="orders/:id" element={<Suspense fallback={<AdminFallback />}><AdminOrderDetail /></Suspense>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </LangProvider>
  )
}
