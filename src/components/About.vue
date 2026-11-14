<template>
  <section class="about">
    <div class="about-grid">
      <div class="about-texte">
        <h2>{{ titre }}</h2>
        <p>{{ texte }}</p>
      </div>
      <dl class="about-infos">
        <div><dt>Adresse</dt><dd>{{ adresse }}</dd></div>
        <div><dt>Ouverture</dt><dd>{{ horaires }}</dd></div>
        <div><dt>Pour qui</dt><dd>Toutes les familles, à prix mini</dd></div>
      </dl>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useTextes } from '../composables/useTextes.js'

const textes = useTextes()
const titre = computed(() => textes.value.about_titre || 'À propos')
const adresse = computed(() => textes.value.contact_address || '2 rue Jean-Monnet, 29600 Morlaix')
const horaires = computed(() => textes.value.sticky_hours || '1ers et 3es mercredis et samedis, 10h – 17h30')
const texte = computed(() => textes.value.about_texte || "La P'tite Boutik Solidaire ouvre ses portes au 2, rue Jean-Monnet à Morlaix. Portée par l'Association Bras Ouverts de Morlaix, l'objectif de ce nouveau lieu est d'encourager le recyclage, de favoriser la convivialité à travers la mode enfantine responsable et d'aider les familles.")
</script>

<style scoped>
.about-grid { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: 32px; align-items: start; }
@media (max-width: 800px) { .about-grid { grid-template-columns: minmax(0, 1fr); } }
.about-infos { display: grid; gap: 14px; margin: 0; padding: 22px 24px; border-radius: calc(var(--r) + 4px); background: linear-gradient(150deg, var(--corail-doux), var(--surface) 75%); border: 1px solid var(--line); }
.about-infos div { display: grid; gap: 2px; }
.about-infos dt { font-size: 0.76rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); font-weight: 700; }
.about-infos dd { margin: 0; font-weight: 700; color: var(--ink); }
.about p {
  max-width: 68ch;
  font-size: 1.15rem;
  line-height: 1.7;
  color: var(--muted);
}
</style>
