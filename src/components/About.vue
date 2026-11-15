<template>
  <section class="about">
    <div class="about-grid">
      <div class="about-texte">
        <h2>{{ titre }}</h2>
        <div class="about-corps" v-html="texteRiche(texte)"></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useTextes } from '../composables/useTextes.js'
import { texteRiche } from '../texteRiche.js'

const textes = useTextes()
const titre = computed(() => textes.value.about_titre || 'À propos')
const texte = computed(() => textes.value.about_texte || "La P'tite Boutik Solidaire ouvre ses portes au 2, rue Jean-Monnet à Morlaix. Portée par l'Association Bras Ouverts de Morlaix, l'objectif de ce nouveau lieu est d'encourager le recyclage, de favoriser la convivialité à travers la mode enfantine responsable et d'aider les familles.")
</script>

<style scoped>
.about-corps {
  font-size: 1.15rem;
  line-height: 1.7;
  color: var(--muted);
}
</style>
