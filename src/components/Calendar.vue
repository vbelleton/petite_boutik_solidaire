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
          <span class="date-exceptional" v-else-if="date.exceptional">✨ Ouverture exceptionnelle<template v-if="date.motif"> · {{ date.motif }}</template></span>
          <span class="date-horaires" v-if="!date.closed && date.horaires">{{ date.horaires }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
.date-item.closed { opacity: 0.65; background: #fbf4f1; border-left-color: #c9c1b6 !important; }
.date-item.closed .date-day,
.date-item.closed .date-full { text-decoration: line-through; color: var(--muted) !important; }
.date-exceptional { font-size: 0.82rem; font-weight: 700; color: #6247a8; margin-top: 2px; }
.date-horaires { font-size: 0.85rem; color: var(--muted); }
.date-closed-label { font-size: 0.8rem; color: var(--corail); font-style: italic; margin-top: 2px; }
@media (max-width: 600px) {
  .dates-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .date-full { font-size: 1.05rem; }
}
</style>
