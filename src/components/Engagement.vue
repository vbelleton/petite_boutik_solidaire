<template>
  <section class="engagement">
    <h2>{{ titre }}</h2>
    <p class="quote">{{ quote }}</p>
    <ul class="values">
      <li class="value" v-for="(item, i) in values" :key="item.label" :class="i % 2 ? 'coral' : 'teal'">
        <span class="value-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="item.icon"></svg>
        </span>
        <h3 class="value-label">{{ item.label }}</h3>
        <p class="value-desc">{{ item.desc }}</p>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useTextes } from '../composables/useTextes.js'

const textes = useTextes()
const titre = computed(() => textes.value.engagement_titre || 'Notre engagement')
const quote = computed(() => textes.value.engagement_quote || 'Nous voulons que chaque visiteur se sente attendu et bienvenu. Ici, on recycle, on partage, on crée du lien.')

// Icônes au trait (même style que le reste du site), descriptions toujours visibles
const values = [
  { label: 'Recycler', desc: 'Une seconde vie pour les vêtements de vos enfants',
    icon: '<path d="M7 19H4.8a1.8 1.8 0 0 1-1.6-2.7L5.4 12"/><path d="m8.6 7.6 1.8-3.1a1.8 1.8 0 0 1 3.1 0l2.2 3.8"/><path d="M15 19h4.2a1.8 1.8 0 0 0 1.6-2.7l-1.2-2"/><path d="m11 16-3 3 3 3"/><path d="m4 9 1.4 3 3.2-.8"/><path d="m18.6 6.6-.9 3.3-3.2-.9"/>' },
  { label: 'Solidarité', desc: 'Des prix accessibles à toutes les familles',
    icon: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>' },
  { label: 'Écologie', desc: 'Moins de déchets, plus de sens',
    icon: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6 2.4-.5 4.9-2 5.9-4"/>' },
  { label: 'Se rencontrer', desc: "Un lieu de convivialité et d'échange",
    icon: '<path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>' },
]
</script>

<style scoped>
.quote {
  font-family: var(--display);
  font-style: italic;
  font-size: clamp(1.2rem, 2.6vw, 1.5rem);
  line-height: 1.45;
  color: var(--ink);
  max-width: 40ch;
  margin: 0 0 32px;
}
.values {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
@media (min-width: 760px) {
  .values { grid-template-columns: repeat(4, 1fr); }
}
.value {
  display: grid;
  gap: 8px;
  align-content: start;
  padding: 22px 20px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r);
}
.value-icon { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 14px; margin-bottom: 4px; }
.value-icon svg { width: 24px; height: 24px; }
.teal .value-icon { background: var(--lagon-doux); color: var(--accent); }
.coral .value-icon { background: var(--corail-doux); color: var(--corail); }
.value-label { font-size: 1.2rem; margin: 0; color: var(--ink); }
.value-desc { font-size: 0.95rem; line-height: 1.45; color: var(--muted); margin: 0; }
</style>
