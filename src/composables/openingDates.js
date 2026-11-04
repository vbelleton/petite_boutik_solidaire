// Calcul des dates d'ouverture, partagé par le site et l'admin.
// Règles récurrentes (ex. 1ers et 3èmes mercredis) + fermetures + ouvertures exceptionnelles.

export const DEFAULT_REGLES = [
  { jour: 3, semaines: [1, 3], label: 'mercredi' },
  { jour: 6, semaines: [1, 3], label: 'samedi' },
]

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
          out.push({ date, iso: isoDate(date), label_jour: r.label || 'ouverture', color: r.color || '#1BA9A8' })
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
      existing.motif = e.label || ''
      existing.horaires = e.horaires || ''
      continue
    }
    byIso.set(e.date, {
      date, iso: e.date, label_jour: 'exceptionnel', color: '#E8734A',
      exceptional: true, motif: e.label || '', horaires: e.horaires || '',
    })
  }
  return [...byIso.values()]
    .map(d => ({ ...d, closed: closedMap.has(d.iso), closedLabel: closedMap.get(d.iso) || '' }))
    .sort((a, b) => a.date - b.date)
}
