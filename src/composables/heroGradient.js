// Dégradé de l'encart d'accueil, partagé par le site et l'aperçu de l'admin.
// L'ancien défaut turquoise → corail passait par un gris terne : il est remplacé
// par le nouveau défaut, tant qu'aucun autre dégradé n'a été choisi dans l'admin.
export const HERO_PRESETS = [
  { name: 'Turquoise et halo corail (défaut)', css: 'radial-gradient(120% 90% at 100% 100%, rgba(233,94,94,0.95) 0%, rgba(233,94,94,0) 60%), linear-gradient(135deg, #1A9897 0%, #0F6463 100%)' },
  { name: 'Turquoise dégradé', css: 'linear-gradient(135deg, #1BA9A8 0%, #147C7B 55%, #0F5F5E 100%)' },
  { name: 'Corail chaud', css: 'linear-gradient(135deg, #B5473F 0%, #D9774B 100%)' },
  { name: 'Crépuscule', css: 'linear-gradient(135deg, #147C7B 0%, #2F6A9A 35%, #6E4F94 65%, #BE4545 100%)' },
]
export const HERO_DEFAULT = HERO_PRESETS[0].css

// Valeur CSS du fond de l'encart, à partir des textes enregistrés
export function heroBackground(t = {}) {
  if (t.hero_gradient_css) return t.hero_gradient_css
  const start = (t.hero_gradient_start || '').toUpperCase()
  const end = (t.hero_gradient_end || '').toUpperCase()
  if (!start || (start === '#1BA9A8' && end === '#E95E5E')) return HERO_DEFAULT
  return `linear-gradient(${t.hero_gradient_angle ?? 135}deg, ${t.hero_gradient_start} 0%, ${t.hero_gradient_end || start} 100%)`
}
