// Couleurs choisies dans l'admin (config/textes : couleur_fond, couleur_texte, couleur_bandeau).
// Appliquées au thème clair seulement : le thème sombre garde ses couleurs, pensées pour rester lisibles.
import { watchEffect } from 'vue'

const HEX = /^#[0-9a-f]{6}$/i
const valide = (c) => (typeof c === 'string' && HEX.test(c.trim()) ? c.trim() : '')

// Texte blanc ou bleu nuit selon la clarté du fond (contraste lisible).
export function texteSur(hex) {
  const n = parseInt(hex.slice(1), 16)
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  const L = 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return L > 0.4 ? '#1f2a3a' : '#ffffff'
}

export function reglesCouleurs(t = {}) {
  const fond = valide(t.couleur_fond), texte = valide(t.couleur_texte), bandeau = valide(t.couleur_bandeau)
  const v = []
  if (fond) v.push(`--bg:${fond}`, `--bg-light:${fond}`)
  if (texte) v.push(`--ink:${texte}`, `--text-dark:${texte}`, `--muted:color-mix(in srgb, ${texte} 78%, transparent)`, `--text-gray:color-mix(in srgb, ${texte} 78%, transparent)`)
  if (bandeau) v.push(`--bandeau:${bandeau}`, `--bandeau-ink:${texteSur(bandeau)}`)
  if (!v.length) return ''
  const corps = `{${v.join(';')}}`
  return `html.site[data-theme="light"]${corps}@media (prefers-color-scheme: light){html.site:not([data-theme="dark"])${corps}}`
}

export function appliquerCouleurs(textes) {
  watchEffect(() => {
    const css = reglesCouleurs(textes.value || {})
    let el = document.getElementById('couleurs-perso')
    if (!css) { if (el) el.remove(); return }
    if (!el) { el = document.createElement('style'); el.id = 'couleurs-perso'; document.head.appendChild(el) }
    el.textContent = css
  })
}
