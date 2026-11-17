<template>
  <section class="dons">
    <h2>{{ titre }}</h2>
    <div class="dons-texte" v-html="texteRiche(texte)"></div>
    <div class="dons-texte" v-html="texteRiche(texte2)"></div>
    <div class="dons-colonnes">
      <div class="dons-col">
        <h3>Ce que nous acceptons</h3>
        <div v-html="texteRiche(acceptes)"></div>
      </div>
      <div class="dons-col">
        <h3>Ce que nous ne pouvons pas prendre</h3>
        <div v-html="texteRiche(refuses)"></div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Rubrique « Dons » (ancienne partie « Vous souhaitez donner ? » du bloc Association), en texte simple.
import { computed } from 'vue'
import { useTextes } from '../composables/useTextes.js'
import { texteRiche } from '../texteRiche.js'

const textes = useTextes()
const titre = computed(() => textes.value.dons_titre || 'Vous souhaitez donner ?')
const texte = computed(() => textes.value.dons_texte || 'Nous acceptons avec gratitude vos dons de vêtements enfants (0-10 ans) en bon état, chaussures, matériel de puériculture et vêtements pour futures mamans.')
const texte2 = computed(() => textes.value.dons_texte2 || "Apportez vos dons directement à la boutique aux horaires d'ouverture.")
const acceptes = computed(() => textes.value.dons_acceptes || 'Vêtements enfants (0-10 ans) en bon état, chaussures propres, matériel de puériculture propre et non endommagé, vêtements de maternité.')
const refuses = computed(() => textes.value.dons_refuses || "Vêtements très usés ou tachés, sièges auto anciens ou non contrôlés, articles cassés ou dangereux, produits d'hygiène entamés.")
</script>

<style scoped>
.dons-texte { font-size: 1.1rem; line-height: 1.7; color: var(--muted); margin-bottom: 12px; }
.dons-colonnes { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); gap: 16px; margin-top: 24px; }
.dons-col { padding: 20px 22px; border: 1px solid var(--line); border-radius: var(--r); background: var(--surface); line-height: 1.6; }
.dons-col h3 { font-size: 1.15rem; margin-bottom: 8px; color: var(--ink); }
.dons :deep(ul) { padding-left: 1.3em; margin: 6px 0; }
.dons :deep(a) { color: var(--accent); }
</style>
