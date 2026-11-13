// Le site est servi sous /boutik/ (brasouverts.bzh/boutik, le reste du domaine étant le site
// de l'association). BASE vaut '/boutik/' (vite.config.js → base). Toute adresse « /… »
// écrite en dur ou enregistrée en base (ex. /documents/…, /placeholder.jpg) passe par chemin().
export const BASE = import.meta.env.BASE_URL || '/'

export function chemin(p) {
  if (typeof p !== 'string' || !p.startsWith('/') || p.startsWith('//') || p.startsWith(BASE)) return p
  return BASE + p.slice(1)
}
