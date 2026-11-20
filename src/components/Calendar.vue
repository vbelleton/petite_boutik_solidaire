<template>
  <section class="calendar">
    <h2>{{ titre }}</h2>
    <div class="next-dates">
      <h3>Prochaines ouvertures</h3>
      <div class="dates-list">
          <div
            class="date-item"
            :class="{ 'closed': date.closed }"
            v-for="date in nextDates"
            :key="date.iso"
            :style="{ borderLeftColor: date.color || '#1BA9A8' }"
          >
          <span class="date-day" :style="{ color: readableColor(date.color || '#1BA9A8') }">{{ date.day }}</span>
          <span class="date-full">{{ date.label }}</span>
          <span class="date-closed-label" v-if="date.closed">{{ date.closedLabel || 'Fermé exceptionnellement' }}</span>
          <span class="date-exceptional" v-else-if="date.exceptional">✨ Ouverture exceptionnelle<template v-if="date.motif"> · <TexteGras :texte="date.motif" /></template></span>
          <span class="date-exceptional" v-else-if="date.motif">✨ <TexteGras :texte="date.motif" /></span>
          <span class="date-horaires" v-if="!date.closed && date.horaires">{{ date.horaires }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import TexteGras from './TexteGras.vue'
import { computed } from 'vue'
import { useOpeningStatus } from '../composables/useOpeningStatus.js'
import { readableColor } from '../composables/openingDates.js'

const { dates, titre } = useOpeningStatus()

const nextDates = computed(() =>
  dates.value
    .slice(0, 12)
    .map(d => ({
      ...d,
      day: d.date.toLocaleDateString('fr-FR', { weekday: 'long' }),
      label: d.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    }))
    .filter((_, idx, arr) => arr.slice(0, idx + 1).filter(d => !d.closed).length <= 8)
)
</script>

<style scoped>
.next-dates h3 { font-size: 1.15rem; color: var(--muted); margin-bottom: 14px; }
.dates-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* toute la largeur, même avec peu de dates */
  gap: 12px;
}
.date-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 14px 16px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-left: 5px solid var(--accent);
  border-radius: 12px;
  text-align: left;
}
.date-day { font-size: 0.76rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700; color: var(--accent); }
.date-full { font-family: var(--display); font-size: 1.15rem; font-weight: 600; color: var(--ink); }
.date-item.closed { opacity: 0.65; background: color-mix(in srgb, var(--corail-doux) 45%, var(--surface)); border-left-color: var(--line) !important; }
.date-item.closed .date-day,
.date-item.closed .date-full { text-decoration: line-through; color: var(--muted) !important; }
/* Motif du jour (ex. Journée portes ouvertes) : pastille corail vive, bien lisible dans la carte blanche (texte bleu nuit, contraste ≥ 7:1) */
.date-exceptional { display: block; width: fit-content; max-width: 100%; margin: 6px 0 2px; padding: 5px 10px; border-radius: 10px; background: var(--vif-corail); color: var(--vif-ink); font-size: 1rem; font-weight: 800; line-height: 1.2; }
.date-horaires { font-size: 0.85rem; color: var(--muted); }
.date-closed-label { font-size: 0.8rem; color: var(--corail); font-style: italic; margin-top: 2px; }
@media (max-width: 600px) {
  .dates-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .date-full { font-size: 1.05rem; }
}
</style>
