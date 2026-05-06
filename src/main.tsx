import { StrictMode, useState, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { LoadingScreen } from './components/LoadingScreen'

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
    <Root />
  </StrictMode>,
)
