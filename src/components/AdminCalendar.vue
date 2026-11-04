<template>
  <div class="acal">
    <div class="acal-head">
      <button class="acal-nav" @click="shift(-1)" :disabled="offset === 0" aria-label="Mois précédent">‹</button>
      <h3 class="acal-month">{{ monthLabel }}</h3>
      <button class="acal-nav" @click="shift(1)" :disabled="offset >= 12" aria-label="Mois suivant">›</button>
    </div>

    <div class="acal-legend">
      <span v-for="r in legendRegles" :key="r.key"><i class="dot" :style="{ background: r.color }"></i> {{ r.label }}</span>
      <span><i class="dot extra"></i> Ouverture exceptionnelle</span>
      <span><i class="dot closed"></i> Fermeture exceptionnelle</span>
    </div>

    <div class="acal-grid" role="grid">
      <div class="acal-wd" v-for="w in weekdays" :key="w">{{ w }}</div>
      <div v-for="n in leadingBlanks" :key="'b' + n" class="acal-cell blank"></div>
      <button
        v-for="d in days"
        :key="d.iso"
        class="acal-cell"
        :class="[d.state, { past: d.past, selected: selected === d.iso, today: d.isToday }]"
        :style="d.state === 'open' ? { background: d.color } : null"
        :disabled="d.past"
        @click="select(d)"
        :title="d.title"
      >
        <span class="acal-num">{{ d.num }}</span>
        <span class="acal-tag" v-if="d.state === 'closed'">fermé</span>
        <span class="acal-tag" v-else-if="d.state === 'extra'">✨</span>
      </button>
    </div>

    <!-- Panneau du jour sélectionné -->
    <div class="acal-panel" v-if="current">
      <div class="acal-panel-head">
        <strong class="acal-panel-date">{{ current.longLabel }}</strong>
        <span class="acal-status" :class="current.state">{{ statusLabel(current.state) }}</span>
        <button class="acal-x" @click="selected = null" aria-label="Fermer">✕</button>
      </div>

      <template v-if="current.state === 'open'">
        <p class="acal-help">La boutique est ouverte ce jour-là (jour habituel). Vous pouvez la fermer exceptionnellement.</p>
        <label class="acal-label">Motif affiché sur le site</label>
        <input class="acal-input" v-model="form.label" placeholder="Ex : Jour férié, congés…" @keyup.enter="closeDay" />
        <div class="acal-actions">
          <button class="acal-btn danger" @click="closeDay" :disabled="busy">Fermer ce jour</button>
        </div>
      </template>

      <template v-else-if="current.state === 'closed'">
        <p class="acal-help">Ce jour est marqué fermé sur le site.</p>
        <label class="acal-label">Motif affiché sur le site</label>
        <input class="acal-input" v-model="form.label" @keyup.enter="saveClosure" />
        <div class="acal-actions">
          <button class="acal-btn" @click="saveClosure" :disabled="busy || form.label === (current.closure?.label || '')">Enregistrer le motif</button>
          <button class="acal-btn primary" @click="reopenDay" :disabled="busy">Rouvrir ce jour</button>
        </div>
      </template>

      <template v-else-if="current.state === 'extra'">
        <p class="acal-help">Ouverture exceptionnelle, affichée sur le site avec la mention ✨.</p>
        <label class="acal-label">Motif</label>
        <input class="acal-input" v-model="form.label" placeholder="Ex : Vente de Noël" />
        <label class="acal-label">Horaires (laisser vide = horaires habituels)</label>
        <input class="acal-input" v-model="form.horaires" placeholder="Ex : 14h – 18h" />
        <div class="acal-actions">
          <button class="acal-btn" @click="saveExtra" :disabled="busy || !extraChanged">Enregistrer</button>
          <button class="acal-btn danger" @click="removeExtra" :disabled="busy">Annuler cette ouverture</button>
        </div>
      </template>

      <template v-else>
        <p class="acal-help">La boutique est habituellement fermée ce jour-là. Vous pouvez l'ouvrir exceptionnellement.</p>
        <label class="acal-label">Motif</label>
        <input class="acal-input" v-model="form.label" placeholder="Ex : Vente de Noël, portes ouvertes…" />
        <label class="acal-label">Horaires (laisser vide = horaires habituels)</label>
        <input class="acal-input" v-model="form.horaires" placeholder="Ex : 14h – 18h" />
        <div class="acal-actions">
          <button class="acal-btn primary" @click="openDay" :disabled="busy">Ouvrir exceptionnellement</button>
        </div>
      </template>

      <p class="acal-error" v-if="error">{{ error }}</p>
    </div>
    <p class="acal-hint" v-else>Cliquez sur un jour pour le fermer, le rouvrir ou ajouter une ouverture exceptionnelle.</p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { collection, addDoc, deleteDoc, setDoc, doc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { buildOpeningDates, isoDate, regleColor, extraMotif } from '../composables/openingDates.js'

const props = defineProps({
  regles:   { type: Array, required: true },
  closures: { type: Array, default: () => [] }, // [{ id, date, label }]
  extras:   { type: Array, default: () => [] }, // [{ id, date, label, horaires }]
})

// Légende : une pastille par jour d'ouverture habituel, avec sa couleur
const legendRegles = computed(() => {
  const seen = new Map()
  for (const r of props.regles) {
    const color = regleColor(r)
    const label = (r.label || 'ouvert')
    const key = label + color
    if (!seen.has(key)) seen.set(key, { key, color, label: 'Ouvert le ' + label })
  }
  return [...seen.values()]
})

const weekdays = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim']
const offset = ref(0)
const selected = ref(null)
const busy = ref(false)
const error = ref('')
const form = ref({ label: '', horaires: '' })

const monthStart = computed(() => {
  const t = new Date()
  return new Date(t.getFullYear(), t.getMonth() + offset.value, 1)
})
const monthLabel = computed(() =>
  monthStart.value.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
)
// Lundi = 0
const leadingBlanks = computed(() => (monthStart.value.getDay() + 6) % 7)

const days = computed(() => {
  const start = monthStart.value
  const y = start.getFullYear(), m = start.getMonth()
  const opening = buildOpeningDates({
    regles: props.regles, closures: props.closures, extras: props.extras,
    today: start, monthsAhead: 1,
  })
  const byIso = new Map(opening.map(o => [o.iso, o]))
  const todayIso = isoDate(new Date())
  const count = new Date(y, m + 1, 0).getDate()
  const out = []
  for (let n = 1; n <= count; n++) {
    const date = new Date(y, m, n)
    const iso = isoDate(date)
    const o = byIso.get(iso)
    let state = 'none'
    if (o) state = o.closed ? 'closed' : (o.exceptional ? 'extra' : 'open')
    out.push({
      iso, num: n, date, state, color: o?.color,
      past: iso < todayIso,
      isToday: iso === todayIso,
      title: statusLabel(state),
      longLabel: date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      closure: props.closures.find(c => c.date === iso) || null,
      extra: props.extras.find(e => e.date === iso) || null,
    })
  }
  return out
})

const current = computed(() => days.value.find(d => d.iso === selected.value) || null)

function statusLabel(state) {
  return {
    open: 'Ouvert',
    closed: 'Fermeture exceptionnelle',
    extra: 'Ouverture exceptionnelle',
    none: 'Fermé (habituel)',
  }[state]
}

function shift(n) {
  offset.value = Math.min(12, Math.max(0, offset.value + n))
  selected.value = null
}

function select(d) {
  if (d.past) return
  selected.value = selected.value === d.iso ? null : d.iso
}

// Remplit le formulaire quand on change de jour ou que l'état du jour change
watch(() => current.value && `${current.value.iso}|${current.value.state}`, () => {
  const d = current.value
  error.value = ''
  if (!d) return
  if (d.state === 'closed') form.value = { label: d.closure?.label || '', horaires: '' }
  else if (d.state === 'extra') form.value = { label: extraMotif(d.extra?.label), horaires: d.extra?.horaires || '' }
  else form.value = { label: '', horaires: '' }
})

const extraChanged = computed(() => {
  const e = current.value?.extra
  return !!e && (form.value.label !== extraMotif(e.label) || form.value.horaires !== (e.horaires || ''))
})

async function run(fn) {
  busy.value = true
  error.value = ''
  try { await fn() }
  catch (e) { error.value = "L'enregistrement a échoué. Vérifiez votre connexion et réessayez." ; console.error(e) }
  finally { busy.value = false }
}

const closeDay = () => run(() => addDoc(collection(db, 'fermetures'), {
  date: current.value.iso,
  label: form.value.label.trim() || 'Fermeture exceptionnelle',
}))

const saveClosure = () => run(() => setDoc(doc(db, 'fermetures', current.value.closure.id), {
  date: current.value.iso,
  label: form.value.label.trim() || 'Fermeture exceptionnelle',
}))

const reopenDay = () => run(() => deleteDoc(doc(db, 'fermetures', current.value.closure.id)))

const openDay = () => run(() => addDoc(collection(db, 'ouvertures_exceptionnelles'), {
  date: current.value.iso,
  label: form.value.label.trim(),
  horaires: form.value.horaires.trim(),
}))

const saveExtra = () => run(() => setDoc(doc(db, 'ouvertures_exceptionnelles', current.value.extra.id), {
  date: current.value.iso,
  label: form.value.label.trim(),
  horaires: form.value.horaires.trim(),
}))

const removeExtra = () => run(() => deleteDoc(doc(db, 'ouvertures_exceptionnelles', current.value.extra.id)))
</script>

<style scoped>
.acal { background: #fff; border: 1px solid #e3e8e8; border-radius: 14px; padding: 16px; max-width: 560px; }
.acal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.acal-month { margin: 0; text-transform: capitalize; color: var(--primary-teal); font-size: 1.15em; }
.acal-nav { width: 40px; height: 40px; border-radius: 50%; border: 1px solid #d5dede; background: #fff; font-size: 1.4em; cursor: pointer; line-height: 1; }
.acal-nav:disabled { opacity: .3; cursor: default; }
.acal-legend { display: flex; flex-wrap: wrap; gap: 12px; font-size: .82em; color: #555; margin-bottom: 10px; }
.dot { display: inline-block; width: 10px; height: 10px; border-radius: 3px; vertical-align: middle; margin-right: 3px; }
.dot.open { background: var(--primary-teal); }
.dot.extra { background: #7B5CC4; }
.dot.closed { background: #bbb; }

.acal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.acal-wd { text-align: center; font-size: .75em; color: #888; text-transform: uppercase; padding: 4px 0; }
.acal-cell {
  aspect-ratio: 1; min-height: 40px; border-radius: 10px; border: 1px solid transparent;
  background: #f6f8f8; color: #333; font: inherit; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; padding: 0;
}
.acal-cell.blank { background: transparent; cursor: default; }
.acal-cell:hover:not(:disabled) { border-color: var(--primary-teal); }
.acal-cell.open { background: var(--primary-teal); /* remplacée par la couleur du jour */ color: #fff; font-weight: 700; }
.acal-cell.extra { background: #7B5CC4; color: #fff; font-weight: 700; }
.acal-cell.closed { background: #eee; color: #888; text-decoration: line-through; }
.acal-cell.past { opacity: .35; cursor: default; }
.acal-cell.today { box-shadow: inset 0 0 0 2px #333; }
.acal-cell.selected { outline: 3px solid #333; outline-offset: 1px; }
.acal-num { font-size: 1em; }
.acal-tag { font-size: .6em; text-decoration: none; }

.acal-panel { margin-top: 14px; padding: 14px; border-radius: 12px; background: #f7fafa; border: 1px solid #e0eaea; }
.acal-panel-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
.acal-panel-date { text-transform: capitalize; }
.acal-status { font-size: .78em; padding: 2px 8px; border-radius: 99px; background: #e6e6e6; }
.acal-status.open { background: #d9f1f1; color: #0f6f6e; }
.acal-status.extra { background: #ece6f8; color: #5a3fa3; }
.acal-status.closed { background: #eee; color: #666; }
.acal-x { margin-left: auto; border: none; background: none; font-size: 1.1em; cursor: pointer; color: #666; }
.acal-input { width: 100%; box-sizing: border-box; min-height: 44px; padding: 8px 12px; border: 1px solid #cfd8d8; border-radius: 10px; font: inherit; font-size: 16px; background: #fff; }
.acal-input:focus { outline: 2px solid var(--primary-teal); outline-offset: 1px; border-color: var(--primary-teal); }
.acal-help { font-size: .88em; color: #555; margin: 4px 0 10px; }
.acal-label { display: block; font-size: .82em; font-weight: 700; margin: 8px 0 4px; }
.acal-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
.acal-btn { min-height: 44px; padding: 0 16px; border-radius: 10px; border: 1px solid #ccd; background: #fff; font: inherit; font-weight: 700; cursor: pointer; }
.acal-btn.primary { background: var(--primary-teal); border-color: var(--primary-teal); color: #fff; }
.acal-btn.danger { background: #fff; border-color: var(--primary-coral); color: var(--primary-coral); }
.acal-btn:disabled { opacity: .5; cursor: default; }
.acal-error { color: var(--primary-coral); font-size: .88em; margin-top: 8px; }
.acal-hint { font-size: .88em; color: #777; margin: 12px 0 0; }
</style>
