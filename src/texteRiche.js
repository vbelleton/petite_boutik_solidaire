// Texte mis en forme dans l'admin (gras, italique, listes, liens) : stocké en HTML dans config/textes.
// Les anciens textes sont du texte brut : on les échappe et on garde leurs retours à la ligne.
// À l'affichage, tout passe par DOMPurify avec une liste courte de balises : rien d'autre ne sort.
import DOMPurify from 'dompurify'

const BALISES = ['b', 'strong', 'i', 'em', 'u', 'br', 'p', 'div', 'ul', 'ol', 'li', 'a']
const ATTRIBUTS = ['href', 'target', 'rel']

const echapper = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

export const estHtml = (s) => /<\/?[a-z][^>]*>/i.test(String(s || ''))

// Texte brut ou HTML → HTML (non nettoyé : passer ensuite par texteRiche).
export const versHtml = (s) => {
  if (s === undefined || s === null) return ''
  const t = String(s)
  return estHtml(t) ? t : echapper(t).replace(/\r?\n/g, '<br>')
}

// HTML sûr, prêt pour v-html.
export function texteRiche(s) {
  const html = versHtml(s)
  if (!html) return ''
  const propre = DOMPurify.sanitize(html, { ALLOWED_TAGS: BALISES, ALLOWED_ATTR: ATTRIBUTS, ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/|#)/i })
  // Les liens externes s'ouvrent à part, sans donner la main à la page ouverte.
  return propre.replace(/<a (?![^>]*rel=)/g, '<a rel="noopener" ')
}
