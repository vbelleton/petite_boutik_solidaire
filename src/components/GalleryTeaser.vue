<template>
  <section class="teaser">
    <div class="teaser-head">
      <div>
        <h2>Galerie photos</h2>
        <p class="teaser-sub">La boutique et quelques articles arrivés récemment.</p>
      </div>
      <a :href="lienGalerie" class="btn">Voir toute la galerie<span v-if="total"> ({{ total }} photos)</span> →</a>
    </div>
    <ul class="mosaic" v-if="apercu.length">
      <li v-for="(p, i) in apercu" :key="p.id" :class="{ grande: i === 0 }">
        <a :href="lienGalerie" :aria-label="p.alt ? `Voir dans la galerie : ${p.alt}` : 'Voir la galerie photos'">
          <img :src="p.url" :alt="p.alt || ''" loading="lazy" decoding="async" @error="($event.target).src = chemin('/placeholder.jpg')" />
        </a>
      </li>
    </ul>
    <p v-else class="teaser-vide">Les photos arrivent…</p>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { usePhotos } from '../composables/usePhotos.js'
import { isBoutique, isArticles } from '../composables/photoGallery.js'
import { BASE, chemin } from '../chemin.js'

// Aperçu de la galerie sur l'accueil : quelques photos, la galerie complète a sa propre page (/boutik/galerie).
const photos = usePhotos()
const lienGalerie = BASE + 'galerie'
const actives = computed(() => photos.value.filter(p => p.active && p.url))
const total = computed(() => actives.value.filter(p => isBoutique(p) || isArticles(p)).length)
// Photos de la boutique d'abord (les plus récentes), puis des articles : 5 en tout.
const apercu = computed(() => {
  const recent = (l) => [...l].reverse()
  return [...recent(actives.value.filter(isBoutique)), ...recent(actives.value.filter(isArticles))].slice(0, 5)
})
</script>

<style scoped>
.teaser-head { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 12px 24px; margin-bottom: 24px; }
.teaser-head h2 { margin-bottom: 6px !important; }
.teaser-sub { color: var(--muted); font-size: 1.05rem; }
.mosaic {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: clamp(120px, 16vw, 200px);
  gap: 12px;
}
.mosaic li { min-width: 0; }
.mosaic .grande { grid-column: span 2; grid-row: span 2; }
.mosaic a { display: block; height: 100%; border-radius: var(--r); overflow: hidden; background: var(--surface); border: 1px solid var(--line); }
.mosaic img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s ease; }
.mosaic a:hover img { transform: scale(1.04); }
.teaser-vide { color: var(--muted); font-style: italic; }
@media (max-width: 700px) {
  .mosaic { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 130px; }
  .mosaic li:nth-child(n + 4) { display: none; }
  .teaser-head .btn { width: 100%; justify-content: center; }
}
@media (prefers-reduced-motion: reduce) { .mosaic img { transition: none; } }
</style>
