<script setup>
import { ref, computed, onMounted } from 'vue'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from './firebase.js'
import SiteHeader from './components/SiteHeader.vue'
import About from './components/About.vue'
import Products from './components/Products.vue'
import Gallery from './components/ProductCarousel.vue'
import GalleryTeaser from './components/GalleryTeaser.vue'
import { BASE } from './chemin.js'
import BoutiqueGallery from './components/BoutiqueGallery.vue'
import Calendar from './components/Calendar.vue'
import Hours from './components/Hours.vue'
import Contact from './components/Contact.vue'
import SocialMedia from './components/SocialMedia.vue'
import ActuBanner from './components/ActuBanner.vue'
import SiteMenu from './components/SiteMenu.vue'
import { useOpeningStatus } from './composables/useOpeningStatus.js'
import { useLocalBusinessJsonLd } from './composables/useLocalBusinessJsonLd.js'

// Fiche Google : prochaines dates d'ouverture (habituelles et exceptionnelles)
const { dates: openingDates, plage: openingPlage } = useOpeningStatus()
useLocalBusinessJsonLd({ dates: openingDates, plage: openingPlage })
import MentionsLegales from './components/MentionsLegales.vue'
import Dons from './components/Dons.vue'

const blocs = ref({})

// Page « Galerie photos » à part (/boutik/galerie) ; l'accueil n'en montre qu'un aperçu.
const pageGalerie = window.location.pathname.replace(BASE, '/').replace(/\/+$/, '') === '/galerie'
const ouvrirMentions = () => window.dispatchEvent(new Event('open-mentions'))
if (pageGalerie) document.title = "La P'tite Boutik Solidaire — Galerie photos"

// Bandeau d'accueil, Association et Engagement retirés (novembre 2026) ; « Dons » ajouté après les produits.
const DEFAULT_ORDER = ['about', 'boutique-gallery', 'carousel', 'collection', 'dons', 'calendrier', 'contact', 'social']

const SECTION_LABELS = {
  about: 'À propos',
  'boutique-gallery': 'Boutique',
  carousel: 'Photos',
  collection: 'Produits',
  dons: 'Dons',
  calendrier: 'Horaires',
  contact: 'Contact',
  social: 'Réseaux'
}
// Rubriques secondaires : dans le menu du téléphone, mais pas dans la ligne des rubriques (pour qu'elle tienne sur une ligne)
const SECONDAIRES = new Set(['social'])

// Surtitres des rubriques (petites capitales au-dessus du titre, comme sur le site Bras Ouverts)
const KICKERS = {
  about: 'La boutique',
  'boutique-gallery': 'La boutique',
  carousel: 'En images',
  collection: 'Nos produits',
  dons: 'Donner',
  calendrier: 'Horaires',
  contact: 'Nous trouver · Nous écrire',
  social: 'Réseaux',
}

const isVisible = (id) => {
  if (blocs.value[id] === undefined) return true
  return blocs.value[id].visible !== false
}

// La galerie de la boutique se place à côté de « À propos » quand les deux sont visibles.
const galerieAcote = computed(() => isVisible('about') && isVisible('boutique-gallery') && blocOrder.value.includes('about'))

const isInNav = (id) => {
  if (blocs.value[id] === undefined) return true
  return blocs.value[id].showInNav !== false
}

const blocOrder = computed(() => {
  const enregistre = blocs.value._order
  if (!Array.isArray(enregistre) || !enregistre.length) return DEFAULT_ORDER
  // Ordre choisi dans l'admin ; une rubrique nouvelle (absente de cet ordre) se glisse après sa voisine habituelle.
  const ordre = enregistre.filter((id) => DEFAULT_ORDER.includes(id) || id === 'fouille')
  DEFAULT_ORDER.forEach((id, i) => {
    if (ordre.includes(id)) return
    const avant = DEFAULT_ORDER.slice(0, i).reverse().find((v) => ordre.includes(v))
    ordre.splice(avant ? ordre.indexOf(avant) + 1 : 0, 0, id)
  })
  return ordre
})

const sectionLinks = computed(() =>
  blocOrder.value
    .filter(id => SECTION_LABELS[id] && isVisible(id) && isInNav(id))
    .map(id => ({ id, label: SECTION_LABELS[id], secondaire: SECONDAIRES.has(id) }))
)

// Affichage sans « trous » : le contenu apparaît d'un coup (fondu) quand la liste des rubriques et les textes
// (et l'actualité) sont arrivés, au lieu de montrer des rubriques qui sautent ou des textes qui changent. Au plus 1,5 s d'attente ;
// aux visites suivantes, le cache du navigateur répond tout de suite.
const pret = ref(false)
let attendus = 3
const unPret = () => { if (--attendus <= 0) pret.value = true }
setTimeout(() => { pret.value = true }, 1500)

onMounted(() => {
  let blocsVus = false
  onSnapshot(doc(db, 'config', 'blocs'), snap => {
    if (snap.exists()) blocs.value = snap.data()
    if (!blocsVus) { blocsVus = true; unPret() }
  }, () => { if (!blocsVus) { blocsVus = true; unPret() } })
  let textesVus = false
  const finTextes = () => { if (!textesVus) { textesVus = true; unPret() } }
  onSnapshot(doc(db, 'config', 'textes'), finTextes, finTextes)
  let actuVue = false
  const finActu = () => { if (!actuVue) { actuVue = true; unPret() } }
  onSnapshot(doc(db, 'config', 'actualite'), finActu, finActu)

  // Intercepte tous les clics sur ancres # (au cas où l'élément cible
  // ne serait pas trouvé par la navigation native du navigateur)
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented) return
    const a = e.target.closest('a[href^="#"]')
    if (!a) return
    const id = a.getAttribute('href').slice(1)
    if (!id) return
    const el = document.getElementById(id)
    if (!el) return
    e.preventDefault()
    el.scrollIntoView({ behavior: 'instant', block: 'start' })
  })
})
</script>

<template>
  <div class="container" :class="{ pret }">
    <a href="#contenu" class="skip-link">Aller au contenu</a>
    <SiteMenu :rubriques="sectionLinks" :prefix="pageGalerie ? BASE : ''" />

    <main v-if="pageGalerie" id="contenu" tabindex="-1" class="page-galerie">
      <div class="galerie-titre">
        <a :href="BASE" class="retour">← Retour à l'accueil</a>
        <h1>Galerie <em>photos</em></h1>
        <p>La boutique et les articles : cliquez sur une photo pour la voir en grand, ou ouvrez la grille pour tout voir d'un coup.</p>
      </div>
      <Gallery id="carousel" />
    </main>

    <template v-else>
    <SiteHeader />
    <ActuBanner />

    <main id="contenu" tabindex="-1">
    <template v-for="id in blocOrder" :key="id">
      <!-- « À propos » et la galerie de la boutique côte à côte (l'une sous l'autre sur téléphone) -->
      <div           v-if="id === 'about'            && isVisible('about')"             id="about" class="duo" :data-lab="KICKERS['about']">
        <div class="duo-grille" :class="{ seul: !galerieAcote }">
          <About />
          <BoutiqueGallery v-if="galerieAcote" id="boutique-gallery" class="duo-galerie" />
        </div>
      </div>
      <BoutiqueGallery v-if="id === 'boutique-gallery' && isVisible('boutique-gallery') && !galerieAcote" id="boutique-gallery" :data-lab="KICKERS['boutique-gallery']" />
      <Products      v-if="id === 'collection'       && isVisible('collection')"        id="collection" :data-lab="KICKERS['collection']" />
      <GalleryTeaser v-if="id === 'carousel'         && isVisible('carousel')"          id="carousel" :data-lab="KICKERS['carousel']" />
      <FouilleGallery v-if="id === 'fouille'          && isVisible('fouille')"           id="fouille" />
      <Dons          v-if="id === 'dons'             && isVisible('dons')"              id="dons" :data-lab="KICKERS['dons']" />
      <div         v-if="id === 'calendrier'       && isVisible('calendrier')"        id="calendrier" class="calendrier-section" :data-lab="KICKERS.calendrier">
        <Calendar />
        <Hours />
      </div>
      <Contact       v-if="id === 'contact'          && isVisible('contact')"           id="contact" :data-lab="KICKERS['contact']" />
      <SocialMedia   v-if="id === 'social'           && isVisible('social')"            id="social" :data-lab="KICKERS['social']" />
    </template>
    </main>
    </template>

    <!-- Plus de pied de page ni de barre du bas : seulement l'accès discret aux mentions légales. -->
    <p class="pied-mentions"><button type="button" @click="ouvrirMentions">Mentions légales</button></p>
    <MentionsLegales />
  </div>
</template>

<style>
:root {
  --site-max-width: 1520px; /* toute la largeur possible, comme le site Bras Ouverts */
}
/* Page publique seulement (classe posée par main.js) : l'admin n'a ni menu ni barre du bas. */
body.site {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* Contenu révélé d'un coup quand les données sont là (voir « pret » plus haut) */
.container > main, .container > .site-header, .container > .actu-banner { transition: opacity .35s ease; }
.container:not(.pret) > main, .container:not(.pret) > .site-header { opacity: 0; }
@media (prefers-reduced-motion: reduce) { .container > main, .container > .site-header { transition: none; } }

/* Accès aux mentions légales, en bas de page (remplace le pied de page) */
.pied-mentions { margin: 0; padding: 18px 20px 28px; text-align: center; border-top: 1px solid var(--line); }
.pied-mentions button { background: none; border: 0; padding: 4px 8px; font: inherit; font-size: 0.88rem; color: var(--muted); text-decoration: underline; cursor: pointer; }
.pied-mentions button:hover { color: var(--ink); }

/* À propos + galerie côte à côte */
.duo-grille { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: clamp(24px, 4vw, 56px); align-items: start; }
.duo-grille.seul { grid-template-columns: minmax(0, 1fr); }
@media (max-width: 860px) { .duo-grille { grid-template-columns: minmax(0, 1fr); } }
.duo-grille .duo-galerie.carousel-container { margin: 0; scroll-margin-top: 110px; }
.duo-grille .duo-galerie .slide-image { height: min(52vh, 420px); }

/* ensure container expands so footer sticks to bottom reliably */
.container { flex: 1 0 auto }

/* Rubriques en bandes pleine largeur séparées d'un filet, contenu centré (comme Bras Ouverts) */
#contenu > * {
  margin: 0 !important;
  padding: clamp(44px, 7vw, 80px) max(20px, calc((100% - var(--site-max-width)) / 2)) !important;
  border: 0 !important;
  border-top: 1px solid var(--line) !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  text-align: left;
}
#contenu > #hero { border-top: 0 !important; padding-top: 8px !important; }
#contenu > #calendrier { background: linear-gradient(180deg, transparent, var(--soft)) !important; }
#contenu > #engagement { background: linear-gradient(180deg, transparent, var(--corail-doux) 160%) !important; }
#contenu h2 { text-align: left; color: var(--ink); margin-bottom: 18px; }
#calendrier h2 { font-size: clamp(1.5rem, 3vw, 2rem); }

/* Page Galerie */
.page-galerie { padding: clamp(32px, 6vw, 64px) max(20px, calc((100% - var(--site-max-width)) / 2)); }
.galerie-titre { display: grid; gap: 10px; justify-items: center; text-align: center; margin: 0 auto 28px; max-width: 760px; }
.galerie-titre h1 { font-size: clamp(2.2rem, 6vw, 3.6rem); letter-spacing: -0.02em; }
.galerie-titre h1 em { font-style: italic; color: var(--corail); }
.galerie-titre p { color: var(--muted); max-width: 60ch; font-size: 1.05rem; }
.retour { font-weight: 700; color: var(--accent); }
#contenu.page-galerie > * { padding: 0 !important; border-top: 0 !important; }
.page-galerie .gallery-container > h2, .page-galerie .gallery-container > .subtitle { display: none; }
</style>

<style scoped>
.container {
  margin: 0 auto;
  width: 100%;
  /* Halo turquoise et corail du haut de page, comme l'accueil du site Bras Ouverts */
  background:
    radial-gradient(70% 520px at 100% 0%, var(--lagon-doux), transparent 70%),
    radial-gradient(60% 520px at 0% 620px, var(--corail-doux), transparent 70%);
  background-repeat: no-repeat;
}

.calendrier-section {
  scroll-margin-top: 100px;
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: 32px;
  align-items: start;
}
.calendrier-section::before { grid-column: 1 / -1; }
@media (max-width: 900px) {
  .calendrier-section { grid-template-columns: minmax(0, 1fr); }
}
</style>
