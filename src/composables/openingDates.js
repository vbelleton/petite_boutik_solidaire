// Calcul des dates d'ouverture, partagé par le site et l'admin.
// Règles récurrentes (ex. 1ers et 3èmes mercredis) + fermetures + ouvertures exceptionnelles.

export const DEFAULT_REGLES = [
  { jour: 3, semaines: [1, 3], label: 'mercredi' },
  { jour: 6, semaines: [1, 3], label: 'samedi' },
]

// Couleur d'un jour d'ouverture : celle choisie dans l'admin, sinon mercredi turquoise,
// samedi corail (comme les cartes horaires), autres jours turquoise.
export const EXTRA_COLOR = '#7B5CC4'
export const DEFAULT_EXTRA_LABEL = 'Ouverture exceptionnelle'
export function regleColor(r) {
  if (r?.color) return r.color
  const jour = typeof r?.jour === 'number' ? r.jour : parseInt(r?.jour)
  return jour === 6 ? '#E95E5E' : '#1BA9A8'
}

// Version de la couleur assez foncée pour du texte sur fond clair (contraste 4,5:1, RGAA 3.2).
// La couleur choisie dans l'admin reste telle quelle pour les bordures et pastilles.
function luminance(rgb) {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
export function readableColor(hex, bg = '#FFFFFF', min = 4.5) {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex || '').trim())
  if (!m) return hex
  const rgb = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16))
  const bgL = luminance([1, 3, 5].map((i) => parseInt(bg.slice(i, i + 2), 16)))
  for (let k = 1; k > 0; k -= 0.02) {
    const c = rgb.map((v) => Math.round(v * k))
    const l = luminance(c)
    if ((Math.max(l, bgL) + 0.05) / (Math.min(l, bgL) + 0.05) >= min) {
      return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('')
    }
  }
  return '#000000'
}

// Motif d'une ouverture exceptionnelle, sans répéter « Ouverture exceptionnelle »
export function extraMotif(label) {
  const t = (label || '').trim()
  return t.toLowerCase() === DEFAULT_EXTRA_LABEL.toLowerCase() ? '' : t
}

export const isoDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function parseIso(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function nthWeekday(year, month, weekday, n) {
  const first = new Date(year, month, 1)
  return new Date(year, month, 1 + ((weekday - first.getDay() + 7) % 7) + (n - 1) * 7)
}

// Dates issues des règles récurrentes, sans tenir compte des fermetures.
export function recurringDates(regles, monthsAhead = 3, today = new Date()) {
  const start = new Date(today); start.setHours(0, 0, 0, 0)
  const end = new Date(start); end.setMonth(end.getMonth() + monthsAhead)
  const out = []
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1)
  while (cursor <= end) {
    for (const r of regles) {
      const jour = typeof r.jour === 'number' ? r.jour : parseInt(r.jour)
      if (isNaN(jour)) continue
      for (const occ of (r.semaines || [1, 3])) {
        const date = nthWeekday(cursor.getFullYear(), cursor.getMonth(), jour, occ)
        if (date >= start && date <= end) {
          out.push({ date, iso: isoDate(date), label_jour: r.label || 'ouverture', color: regleColor(r) })
        }
      }
    }
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return out
}

// Toutes les dates à afficher, triées. Chaque entrée :
// { date, iso, label_jour, color, closed, closedLabel, exceptional, motif, horaires }
// - closures : [{ date: 'YYYY-MM-DD', label }]
// - extras   : [{ date: 'YYYY-MM-DD', label, horaires }]  (ouvertures exceptionnelles)
// Une fermeture l'emporte sur tout. Une ouverture exceptionnelle posée sur une date
// déjà ouverte par les règles ne crée pas de doublon.
export function buildOpeningDates({ regles, closures = [], extras = [], monthsAhead = 3, today = new Date() }) {
  const closedMap = new Map(closures.map(c => [c.date, c.label || 'Fermé exceptionnellement']))
  const start = new Date(today); start.setHours(0, 0, 0, 0)
  const end = new Date(start); end.setMonth(end.getMonth() + monthsAhead)
  const byIso = new Map()

  for (const r of recurringDates(regles, monthsAhead, today)) {
    byIso.set(r.iso, { ...r, exceptional: false, motif: '', horaires: '' })
  }
  for (const e of extras) {
    if (!e.date) continue
    const date = parseIso(e.date)
    if (date < start || date > end) continue
    const existing = byIso.get(e.date)
    if (existing) {
      existing.motif = extraMotif(e.label)
      existing.horaires = e.horaires || ''
      continue
    }
    byIso.set(e.date, {
      date, iso: e.date, label_jour: 'exceptionnel', color: EXTRA_COLOR,
      exceptional: true, motif: extraMotif(e.label), horaires: e.horaires || '',
    })
  }
  return [...byIso.values()]
    .map(d => ({ ...d, closed: closedMap.has(d.iso), closedLabel: closedMap.get(d.iso) || '' }))
    .sort((a, b) => a.date - b.date)
}
