import { StrictMode, useState, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App'
import { LoadingScreen } from './components/LoadingScreen'
import { isStandalone } from './lib/pwaInstall'

// Installed PWA must never land on a public route. If launched standalone
// outside /admin/*, replace history to /admin/login before React mounts.
if (isStandalone() && !window.location.pathname.startsWith('/admin')) {
  window.location.replace('/admin/login')
}

function Root() {
  const [ready, setReady] = useState(false)
  const handleDone = useCallback(() => setReady(true), [])

  return (
    <>
      {!ready && <LoadingScreen onDone={handleDone} />}
      {/* Render App immediately so it can pre-fetch data while loading screen is up */}
      <div style={{ visibility: ready ? 'visible' : 'hidden' }}>
        <App />
      </div>
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <Root />
    </HelmetProvider>
  </StrictMode>,
)
