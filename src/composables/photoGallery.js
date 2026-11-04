// Galerie réelle d'une photo, avec la même règle partout (site et admin).
// Les anciennes photos ont gallery === 'gallery' : elles vont dans Articles si leur
// fond a été retiré, dans Boutique si removeBg vaut false.
export function effectiveGallery(p) {
  if (!p) return null
  if (p.gallery === 'articles') return 'articles'
  if (p.gallery === 'boutique') return 'boutique'
  if (p.gallery === 'gallery' && p.removeBg === true) return 'articles'
  if (p.gallery === 'gallery' && p.removeBg === false) return 'boutique'
  return null // aucune galerie : la photo n'apparaît nulle part sur le site
}
export const isArticles = (p) => effectiveGallery(p) === 'articles'
export const isBoutique = (p) => effectiveGallery(p) === 'boutique'
