// Allège une photo dans le navigateur avant son envoi au Worker de la boutique.
// Les photos de téléphone (3 à 12 Mo, 4000 px et plus) étaient envoyées telles quelles, puis affichées
// en pleine résolution dans la galerie : chargement très lent, surtout sur téléphone. Ici :
// - côté le plus long ramené à COTE_MAX px ;
// - photo sans transparence → JPEG qualité 82 % ;
// - photo avec transparence (détourage, PNG) → WebP si le navigateur sait l'écrire, sinon PNG redimensionné ;
// - GIF et SVG laissés intacts (animation, vectoriel) ;
// - une image déjà légère et à la bonne taille n'est pas réencodée (pas de perte inutile).
// En cas d'échec (format illisible…), on renvoie le fichier d'origine : l'envoi ne doit jamais casser.

export const COTE_MAX = 2000
const DEJA_LEGER = 900 * 1024
const QUALITE = 0.82

const avecTransparencePossible = (type) => /png|webp|avif/i.test(type || '')

function versBlob(canvas, type, qualite) {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, qualite))
}

async function decoder(fichier) {
  if (typeof createImageBitmap === 'function') {
    try { return await createImageBitmap(fichier, { imageOrientation: 'from-image' }) } catch (e) { /* repli ci-dessous */ }
  }
  const url = URL.createObjectURL(fichier)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

function aDeLaTransparence(ctx, l, h) {
  // Échantillonnage : suffisant pour savoir si le fond a été retiré
  const data = ctx.getImageData(0, 0, l, h).data
  const pas = Math.max(4, Math.floor(data.length / 4 / 40000) * 4)
  for (let i = 3; i < data.length; i += pas) if (data[i] < 250) return true
  return false
}

export async function allegerImage(fichier) {
  try {
    const type = (fichier && fichier.type) || ''
    if (!/^image\/(jpeg|png|webp|avif)$/i.test(type)) return fichier
    const source = await decoder(fichier)
    const l0 = source.width || source.naturalWidth
    const h0 = source.height || source.naturalHeight
    if (!l0 || !h0) return fichier
    const echelle = Math.min(1, COTE_MAX / Math.max(l0, h0))
    if (echelle === 1 && fichier.size <= DEJA_LEGER) { source.close?.(); return fichier }

    const l = Math.max(1, Math.round(l0 * echelle))
    const h = Math.max(1, Math.round(h0 * echelle))
    const canvas = document.createElement('canvas')
    canvas.width = l
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(source, 0, 0, l, h)
    source.close?.()

    let blob = null
    if (avecTransparencePossible(type) && aDeLaTransparence(ctx, l, h)) {
      blob = await versBlob(canvas, 'image/webp', 0.85)
      // Safari ne sait pas toujours écrire du WebP : il renvoie alors du PNG, qui garde la transparence
      if (!blob || !/webp|png/.test(blob.type)) blob = await versBlob(canvas, 'image/png')
    } else {
      blob = await versBlob(canvas, 'image/jpeg', QUALITE)
    }
    if (!blob) return fichier
    // Pas de redimensionnement et pas de gain : on garde l'original
    if (echelle === 1 && blob.size >= fichier.size) return fichier

    const ext = { 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/png': 'png' }[blob.type] || 'jpg'
    const nom = ((fichier.name || 'photo').replace(/\.[^/.]+$/, '') || 'photo') + '.' + ext
    return new File([blob], nom, { type: blob.type })
  } catch (e) {
    console.warn('[allegerImage] photo envoyée telle quelle', e?.name || e)
    return fichier
  }
}
