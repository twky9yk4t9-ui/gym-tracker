import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './theme.css'
import App from './App'

// autoUpdate applies a new build and reloads once the browser notices one —
// but an installed iOS PWA almost never checks on its own. Force a check
// every time the app is opened or brought back to the foreground (plus a
// slow hourly poll while it stays open) so a fresh deploy lands on the next
// launch instead of days later.
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return
    const check = () => {
      if (document.visibilityState === 'visible') registration.update().catch(() => {})
    }
    document.addEventListener('visibilitychange', check)
    window.addEventListener('focus', check)
    setInterval(check, 60 * 60 * 1000)
    check()
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
