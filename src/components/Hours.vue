<template>
  <div class="hours" id="horaires" style="scroll-margin-top:64px">
    <h2>{{ titre }}</h2>
    <div class="hours-card">
      <ul class="hours-list">
        <li class="hours-row" v-for="regle in regles" :key="regle.label">
          <span class="row-icon" aria-hidden="true" :style="{ color: readableColor(regleColor(regle)), background: tint(regleColor(regle)) }">
            <svg v-if="!regle.emoji || regle.emoji === '📅'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            <template v-else>{{ regle.emoji }}</template>
          </span>
          <span class="row-text">{{ regle.texte_jours }}</span>
        </li>
      </ul>
      <div class="hours-time">
        <span class="row-icon time-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
        </span>
        <span class="time-text">
          <strong>{{ plageParts.main }}</strong>
          <span v-if="plageParts.sub" class="time-sub">{{ plageParts.sub }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { regleColor, readableColor } from '../composables/openingDates.js'

const DEFAULT_REGLES = [
  { label: 'mercredi', texte_jours: '1ers et 3èmes mercredis' },
  { label: 'samedi',  texte_jours: '1ers et 3èmes samedis' },
]

const titre    = ref("Horaires d'ouverture")
const regles   = ref(DEFAULT_REGLES)
const plage    = ref('10h00 – 17h30 sans interruption')
const benevoles = ref('Accueil par une équipe de bénévoles (mamans, amies et mamies)')

// « 10h00 – 17h30 sans interruption » → heure en gros, précision en dessous
const plageParts = computed(() => {
  const m = /^(.*\d)\s+(\D.*)$/.exec((plage.value || '').trim())
  return m ? { main: m[1], sub: m[2] } : { main: plage.value, sub: '' }
})

// Fond pâle de la couleur d'une règle (pastille de l'icône)
function tint(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '')
  if (!m) return '#eef6f6'
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16))
  return `rgba(${r}, ${g}, ${b}, 0.12)`
}

let unsubHoraires = null

onMounted(() => {
  unsubHoraires = onSnapshot(doc(db, 'config', 'horaires'), snap => {
    if (!snap.exists()) return
    const d = snap.data()
    if (d.horaires_titre) titre.value    = d.horaires_titre
    if (d.regles && d.regles.length) regles.value = d.regles
    if (d.plage)     plage.value = d.plage
    if (d.benevoles) benevoles.value = d.benevoles
  }, () => {})
})

onUnmounted(() => { if (unsubHoraires) unsubHoraires() })
</script>

<style scoped>
.hours-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: calc(var(--r) + 4px);
  overflow: hidden;
}
.hours-list { list-style: none; margin: 0; padding: 6px 20px; }
.hours-row { display: flex; align-items: center; gap: 14px; padding: 14px 0; }
.hours-row + .hours-row { border-top: 1px solid var(--line); }
.row-icon {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3em;
}
.row-icon svg { width: 22px; height: 22px; }
.row-text { font-size: 1.05rem; font-weight: 700; color: var(--ink); }
.hours-time {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: var(--ink);
  color: #fff;
}
.time-icon { background: rgba(255, 255, 255, 0.14); color: #fff; }
.time-text { display: flex; flex-direction: column; line-height: 1.3; }
.time-text strong { font-family: var(--display); font-size: 1.4rem; font-weight: 700; }
.time-sub { font-size: 0.92rem; opacity: 0.9; }
</style>
