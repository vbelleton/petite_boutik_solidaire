import { watch } from 'vue'

// Ajoute à la fiche Google (balise #ld-business de index.html) les prochaines
// dates d'ouverture réelles : jours habituels, ouvertures exceptionnelles, et
// fermetures exceptionnelles (00:00–00:00 = fermé, convention schema.org).
// Les règles « 1er et 3e mercredi » ne s'expriment pas en schema.org, d'où des dates précises.

// « 10h00 – 17h30 » → ['10:00', '17:30'] ; null si illisible
export function parsePlage(txt) {
  const m = [...String(txt || '').matchAll(/(\d{1,2})\s*[h:]\s*(\d{2})?/gi)]
  if (m.length < 2) return null
  const fmt = (x) => `${x[1].padStart(2, '0')}:${x[2] || '00'}`
  return [fmt(m[0]), fmt(m[1])]
}

export function openingSpecs(dates, plage) {
  const def = parsePlage(plage) || ['10:00', '17:30']
  return dates.slice(0, 12).map(d => {
    if (d.closed) return { '@type': 'OpeningHoursSpecification', validFrom: d.iso, validThrough: d.iso, opens: '00:00', closes: '00:00' }
    const [opens, closes] = parsePlage(d.horaires) || def
    return { '@type': 'OpeningHoursSpecification', validFrom: d.iso, validThrough: d.iso, opens, closes }
  })
}

export function useLocalBusinessJsonLd({ dates, plage }) {
  watch([dates, plage], () => {
    const el = typeof document !== 'undefined' && document.getElementById('ld-business')
    if (!el) return
    try {
      const data = JSON.parse(el.textContent)
      data.openingHoursSpecification = openingSpecs(dates.value, plage.value)
      el.textContent = JSON.stringify(data)
    } catch { /* fiche illisible : on la laisse telle quelle */ }
  }, { immediate: true, deep: true })
}
