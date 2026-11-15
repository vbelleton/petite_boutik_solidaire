// Favicon de la boutique, choisi dans l'admin (config/textes : favicon_choix, favicon_url) :
// « boutik » (logo de la boutique, par défaut), « brasouverts » (étoile du site Bras Ouverts) ou une image envoyée.
import { watchEffect } from 'vue'
import { chemin } from './chemin.js'

export function adresseFavicon(t = {}) {
  if (t.favicon_choix === 'brasouverts') return chemin('/favicon-bras-ouverts.png')
  if (t.favicon_choix === 'perso' && typeof t.favicon_url === 'string' && /^https:\/\//.test(t.favicon_url)) return t.favicon_url
  return ''
}

export function appliquerFavicon(textes) {
  watchEffect(() => {
    const url = adresseFavicon(textes.value || {})
    const lien = document.querySelector('link[rel="icon"]')
    if (!lien) return
    if (!lien.dataset.origine) lien.dataset.origine = lien.getAttribute('href') || ''
    lien.setAttribute('href', url || lien.dataset.origine)
  })
}
