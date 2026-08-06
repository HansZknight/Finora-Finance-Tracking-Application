import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/plus-jakarta-sans/400.css'
import '@fontsource/plus-jakarta-sans/500.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'
import '@fontsource/plus-jakarta-sans/800.css'
import App from './App.tsx'
import './index.css'
import './lib/i18n' // Import i18n configuration
import { registerSW } from 'virtual:pwa-register'

// Automatically check for updates every hour, and immediately on load
const updateSW = registerSW({
  onNeedRefresh() {
    // Force a reload when an update is available
    window.location.reload()
  },
  onOfflineReady() {
    console.log('App is ready to work offline.')
  },
})

// Ensures that the page reloads automatically if the service worker takes over 
// (which happens silently in the background with autoUpdate)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
