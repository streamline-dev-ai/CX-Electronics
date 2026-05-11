import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

const ICON_192 = 'https://res.cloudinary.com/dzhwylkfr/image/upload/c_pad,w_192,h_192,b_white/v1778137000/CW-Logo-black_mbfsn7.png'
const ICON_512 = 'https://res.cloudinary.com/dzhwylkfr/image/upload/c_pad,w_512,h_512,b_white/v1778137000/CW-Logo-black_mbfsn7.png'
const ICON_MASK = 'https://res.cloudinary.com/dzhwylkfr/image/upload/c_pad,w_512,h_512,b_white/v1778137000/CW-Logo-black_mbfsn7.png'

export default defineConfig({
  // Expose both VITE_* (legacy) and NEXT_PUBLIC_* (set by Vercel Supabase integration) env vars
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  plugins: [
    react(),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      includeAssets: ['robots.txt'],
      manifest: {
        name: 'CW Electronics',
        short_name: 'CW Electronics',
        description: 'Wholesale & Retail Electronics in Johannesburg — CCTV, solar, chargers, routers & more.',
        theme_color: '#0a3d8a',
        background_color: '#0f1117',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        // Installed PWA opens directly into the admin dashboard.
        // If not signed in, ProtectedRoute bounces to /admin/login.
        start_url: '/admin/dashboard',
        lang: 'en-ZA',
        categories: ['shopping', 'business'],
        icons: [
          { src: ICON_192, sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: ICON_512, sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: ICON_MASK, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Shop',
            short_name: 'Shop',
            description: 'Browse products',
            url: '/shop',
            icons: [{ src: ICON_192, sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'My Account',
            short_name: 'Account',
            description: 'View orders and account',
            url: '/account',
            icons: [{ src: ICON_192, sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'Admin Panel',
            short_name: 'Admin',
            description: 'Open the admin dashboard',
            url: '/admin/dashboard',
            icons: [{ src: ICON_192, sizes: '192x192', type: 'image/png' }],
          },
        ],
      },
      workbox: {
        // Aggressive caching for assets, network-first for APIs / Supabase
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/admin/, /^\/account/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // Cloudinary images — long cache, stale-while-revalidate
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts CSS
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            // Google Fonts files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Supabase REST — always go to network, never serve stale data
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Admin bundle — never loaded on store pages
          'admin-vendor': ['react-router-dom'],
        },
      },
    },
  },
})
