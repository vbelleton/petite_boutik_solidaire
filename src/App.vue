<script setup>
import { ref, computed, onMounted } from 'vue'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from './firebase.js'
import SiteHeader from './components/SiteHeader.vue'
import Hero from './components/Hero.vue'
import About from './components/About.vue'
import Products from './components/Products.vue'
import Gallery from './components/ProductCarousel.vue'
import GalleryTeaser from './components/GalleryTeaser.vue'
import { BASE } from './chemin.js'
import BoutiqueGallery from './components/BoutiqueGallery.vue'
import Association from './components/Association.vue'
import Calendar from './components/Calendar.vue'
import Hours from './components/Hours.vue'
import Engagement from './components/Engagement.vue'
import Contact from './components/Contact.vue'
import SocialMedia from './components/SocialMedia.vue'
import SiteFooter from './components/SiteFooter.vue'
import ActuBanner from './components/ActuBanner.vue'
import SectionNav from './components/SectionNav.vue'
import StickyBottomBar from './components/StickyBottomBar.vue'
import { useOpeningStatus } from './composables/useOpeningStatus.js'
import { useLocalBusinessJsonLd } from './composables/useLocalBusinessJsonLd.js'

// Fiche Google : prochaines dates d'ouverture (habituelles et exceptionnelles)
const { dates: openingDates, plage: openingPlage } = useOpeningStatus()
useLocalBusinessJsonLd({ dates: openingDates, plage: openingPlage })
import MentionsLegales from './components/MentionsLegales.vue'

const blocs = ref({})

// Page « Galerie photos » à part (/boutik/galerie) ; l'accueil n'en montre qu'un aperçu.
const pageGalerie = window.location.pathname.replace(BASE, '/').replace(/\/+$/, '') === '/galerie'
if (pageGalerie) document.title = "La P'tite Boutik Solidaire — Galerie photos"

const DEFAULT_ORDER = ['hero', 'about', 'boutique-gallery', 'carousel', 'collection', 'association', 'calendrier', 'engagement', 'contact', 'social']

const SECTION_LABELS = {
  hero: 'Accueil',
  about: 'À propos',
  'boutique-gallery': 'Boutique',
  carousel: 'Galerie photos',
  collection: 'Nos produits',
  association: 'Bénévoles',
  calendrier: 'Horaires',
  engagement: 'Engagement',
  contact: 'Contact',
  social: 'Réseaux'
}

// Surtitres des rubriques (petites capitales au-dessus du titre, comme sur le site Bras Ouverts)
const KICKERS = {
  about: 'La boutique',
  'boutique-gallery': 'La boutique',
  carousel: 'En images',
  collection: 'Nos produits',
  association: "L'association",
  calendrier: 'Horaires',
  engagement: 'Nos valeurs',
  contact: 'Nous trouver · Nous écrire',
  social: 'Réseaux',
}

const isVisible = (id) => {
  if (blocs.value[id] === undefined) return true
  return blocs.value[id].visible !== false
}

const isInNav = (id) => {
  if (blocs.value[id] === undefined) return true
  return blocs.value[id].showInNav !== false
}

const blocOrder = computed(() => {
  if (blocs.value._order && Array.isArray(blocs.value._order)) return blocs.value._order
  return DEFAULT_ORDER
})

const sectionLinks = computed(() =>
  blocOrder.value
    .filter(id => SECTION_LABELS[id] && isVisible(id) && isInNav(id))
    .map(id => ({ id, label: SECTION_LABELS[id] }))
)

onMounted(() => {
  onSnapshot(doc(db, 'config', 'blocs'), snap => {
    if (snap.exists()) blocs.value = snap.data()
  })

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
  <div class="container">
    <a href="#contenu" class="skip-link">Aller au contenu</a>
    <SectionNav v-if="sectionLinks.length" :sections="sectionLinks" :prefix="pageGalerie ? BASE : ''" />

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
      <Hero          v-if="id === 'hero'             && isVisible('hero')"              id="hero" />
      <About         v-if="id === 'about'            && isVisible('about')"             id="about" :data-lab="KICKERS['about']" />
      <BoutiqueGallery v-if="id === 'boutique-gallery' && isVisible('boutique-gallery')" id="boutique-gallery" :data-lab="KICKERS['boutique-gallery']" />
      <Products      v-if="id === 'collection'       && isVisible('collection')"        id="collection" :data-lab="KICKERS['collection']" />
      <GalleryTeaser v-if="id === 'carousel'         && isVisible('carousel')"          id="carousel" :data-lab="KICKERS['carousel']" />
      <FouilleGallery v-if="id === 'fouille'          && isVisible('fouille')"           id="fouille" />
      <Association   v-if="id === 'association'      && isVisible('association')"       id="association" :data-lab="KICKERS['association']" />
      <div         v-if="id === 'calendrier'       && isVisible('calendrier')"        id="calendrier" class="calendrier-section" :data-lab="KICKERS.calendrier">
        <Calendar />
        <Hours />
      </div>
      <Engagement    v-if="id === 'engagement'       && isVisible('engagement')"        id="engagement" :data-lab="KICKERS['engagement']" />
      <Contact       v-if="id === 'contact'          && isVisible('contact')"           id="contact" :data-lab="KICKERS['contact']" />
      <SocialMedia   v-if="id === 'social'           && isVisible('social')"            id="social" :data-lab="KICKERS['social']" />
    </template>
    </main>
    </template>

    <SiteFooter />
    <MentionsLegales />
    <StickyBottomBar />
  </div>
</template>

<style>
:root {
  --site-max-width: 1120px;
}
/* Page publique seulement (classe posée par main.js) : l'admin n'a ni menu fixe ni barre du bas. */
body.site {
  padding-top: 86px;
  padding-bottom: 84px;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

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
  scroll-margin-top: 80px;
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
