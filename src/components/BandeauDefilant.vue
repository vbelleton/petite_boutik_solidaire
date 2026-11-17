<template>
  <!-- Bandeau défilant sous l'en-tête (masquable dans l'admin, onglet Actualités) : ouverture du jour ou prochaine ouverture, et l'actualité si l'admin
       a coché « Faire défiler le message en haut du site ». Il mène aux horaires. -->
  <a v-if="texte && actu.bandeau !== false" class="bandeau" :class="{ ouvert: openToday }" :href="`${prefix}#calendrier`" :aria-label="texte">
    <span class="masque" aria-hidden="true">
      <span class="piste">
        <span class="seg" v-for="n in 3" :key="n">
          <template v-if="openToday"><span class="point"></span><b>Ouvert aujourd'hui</b>&nbsp;· {{ todayHoraires || plage }}</template>
          <template v-else-if="nextOpening"><span class="point"></span>Prochaine ouverture :&nbsp;<b>{{ nextOpening }}</b>&nbsp;· {{ nextHoraires || plage }}<template v-if="nextMotif">&nbsp;· {{ nextMotif }}</template></template>
          <template v-if="annonce"><span class="sep">✦</span>{{ annonce }}</template>
          <span class="sep">✦</span>
        </span>
      </span>
    </span>
  </a>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase.js'
import { useOpeningStatus } from '../composables/useOpeningStatus.js'

defineProps({ prefix: { type: String, default: '' } })

const { openToday, todayHoraires, nextOpening, nextHoraires, nextMotif, plage } = useOpeningStatus()

// actu.bandeau === false (admin, onglet Actualités) : pas de bandeau du tout.
const actu = ref({ visible: false, titre: '', message: '', defilant: true, bandeau: true })
const annonce = computed(() => {
  if (!actu.value.visible || actu.value.defilant === false) return ''
  return [actu.value.titre, actu.value.message].filter(Boolean).join(' — ').trim()
})
const ouverture = computed(() => openToday.value
  ? `Ouvert aujourd'hui · ${todayHoraires.value || plage.value}`
  : nextOpening.value ? `Prochaine ouverture : ${nextOpening.value} · ${nextHoraires.value || plage.value}${nextMotif.value ? ` · ${nextMotif.value}` : ''}` : '')
const texte = computed(() => [ouverture.value, annonce.value].filter(Boolean).join(' — '))

let stop = null
onMounted(() => {
  stop = onSnapshot(doc(db, 'config', 'actualite'), (snap) => {
    if (snap.exists()) actu.value = { ...actu.value, ...snap.data() }
  }, () => {})
})
onUnmounted(() => { if (stop) stop() })
</script>

<style scoped>
.bandeau { display: block; overflow: hidden; text-decoration: none; background: var(--bandeau, var(--vif)); color: var(--bandeau-ink, var(--vif-ink)); border-top: 1px solid var(--line); font-size: 1.12rem; font-weight: 600; }
/* Par défaut : la couleur de la pastille « Solidaire » du titre (--accent) ; --bandeau : couleur choisie dans l'admin (couleursPerso.js). */
.bandeau.ouvert { background: var(--bandeau, var(--vif)); color: var(--bandeau-ink, var(--vif-ink)); }
.masque { display: block; overflow: hidden; white-space: nowrap; }
.piste { display: inline-flex; align-items: center; padding: 14px 0; animation: defile 30s linear infinite; will-change: transform; }
.bandeau:hover .piste, .bandeau:focus-visible .piste { animation-play-state: paused; }
.seg { display: inline-flex; align-items: center; }
.seg b { font-weight: 800; }
.sep { margin: 0 18px; opacity: 0.55; }
.point { width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; flex-shrink: 0; background: currentColor; }
.bandeau.ouvert .point { animation: pouls 1.7s infinite; }
@keyframes defile { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
@keyframes pouls { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 70%, transparent); } 70%, 100% { box-shadow: 0 0 0 9px transparent; } }
@media (prefers-reduced-motion: reduce) {
  .piste { animation: none; padding-left: 20px; }
  .bandeau.ouvert .point { animation: none; }
}
</style>
