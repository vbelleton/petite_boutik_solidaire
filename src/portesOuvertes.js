// « Journée portes ouvertes » / « portes ouvertes » : toujours en gras (calendrier, bandeau, en-tête).
const RE = /(?:journ[ée]es?\s+)?portes?[\s-]+ouvertes?/gi

export function decouperPortesOuvertes(texte) {
  const t = String(texte ?? '')
  const morceaux = []
  let fin = 0
  for (const m of t.matchAll(RE)) {
    if (m.index > fin) morceaux.push({ t: t.slice(fin, m.index), gras: false })
    morceaux.push({ t: m[0], gras: true })
    fin = m.index + m[0].length
  }
  if (fin < t.length) morceaux.push({ t: t.slice(fin), gras: false })
  return morceaux
}
