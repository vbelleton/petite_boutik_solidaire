// Le site est servi sous /boutik/ (brasouverts.bzh/boutik, le reste du domaine étant le site
// de l'association). BASE vaut '/boutik/' (vite.config.js → base). Toute adresse « /… »
// écrite en dur ou enregistrée en base (ex. /documents/…, /placeholder.jpg) passe par chemin().
export const BASE = import.meta.env.BASE_URL || '/'

export function chemin(p) {
  if (typeof p !== 'string' || !p.startsWith('/') || p.startsWith('//') || p.startsWith(BASE)) return p
  return BASE + p.slice(1)
}

// Adresse du site de l'association Bras Ouverts. Sur son domaine (bras-ouverts.pages.dev, brasouverts.bzh),
// la boutique est servie sous /boutik/ : liens relatifs. Sur petite-boutik-solidaire.pages.dev ou en local,
// la racine renvoie à la boutique : on pointe vers le site de l'association en ligne.
export const ASSO = typeof window !== 'undefined' && /(^|\.)petite-boutik-solidaire\.pages\.dev$|^localhost$|^127\./.test(window.location.hostname)
  ? 'https://bras-ouverts.pages.dev'
  : ''
