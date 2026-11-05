import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Routage simple sans vue-router : /admin → AdminPanel (lazy), reste → App
const isAdmin = window.location.pathname.startsWith('/admin')

if (isAdmin) {
  import('./components/AdminPanel.vue').then(m => {
    createApp(m.default).mount('#app')
  })
} else {
  createApp(App).mount('#app')
}

// PWA : site installable sur l'écran d'accueil, avec un secours hors connexion (public/sw.js).
// Seulement en production et hors admin.
if (import.meta.env.PROD && !isAdmin && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
