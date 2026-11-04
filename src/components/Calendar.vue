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
.calendar {
  margin: 40px 0;
  text-align: center;
}

.calendar h2 {
  color: var(--primary-teal);
  margin-bottom: 20px;
}

.next-dates {
  background: linear-gradient(135deg, #FFF9F0 0%, #F5E6D3 100%);
  padding: 25px;
  border-radius: 12px;
  border: 2px solid var(--secondary-beige);
}

.next-dates h3 {
  color: var(--primary-teal);
  margin-bottom: 15px;
  font-size: 1.1em;
}

.dates-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.date-item {
  background: white;
  border-radius: 10px;
  padding: 12px 16px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-left: 4px solid var(--primary-teal);
}

.date-day {
  font-size: 0.8em;
  text-transform: capitalize;
  font-weight: 700;
  color: var(--primary-teal);
}

/* Couleurs par label de jour — mercredi = teal, samedi = coral, autres = teal par défaut */
.date-item.mercredi { border-left-color: var(--primary-teal); }
.date-item.mercredi .date-day { color: var(--primary-teal); }
.date-item.samedi { border-left-color: var(--primary-coral); }
.date-item.samedi .date-day { color: var(--primary-coral); }

.date-full {
  font-size: 0.95em;
  color: var(--text-dark);
  font-weight: 500;
}

.date-item.closed {
  opacity: 0.6;
  background: #fff5f5;
  border-left-color: #ccc !important;
}

.date-item.closed .date-day,
.date-item.closed .date-full {
  text-decoration: line-through;
  color: var(--text-gray);
}

.date-exceptional {
  font-size: 0.8em;
  font-weight: 700;
  color: #7B5CC4;
  margin-top: 2px;
}

.date-horaires {
  font-size: 0.8em;
  color: var(--text-gray);
}

.date-closed-label {
  font-size: 0.75em;
  color: var(--primary-coral);
  font-style: italic;
  margin-top: 2px;
}
</style>
