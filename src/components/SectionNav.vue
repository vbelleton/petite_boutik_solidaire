<template>
  <nav ref="navEl" class="section-nav" :style="{ '--nav-h': navH + 'px' }">
    <div class="nav-inner">
      <div class="nav-brand">
        <img src="@/assets/logo.jpg" alt="Logo" class="nav-logo" />
        <div class="nav-title">{{ siteName }}</div>
      </div>

      <div class="nav-links">
        <a
          v-for="sec in sections.filter(x => !x.secondaire)"
          :key="sec.id"
          :href="`${prefix}#${sec.id}`"
          class="nav-link"
          :class="{ active: activeId === sec.id }"
          @click="onClick(sec.id)"
        >{{ sec.label }}</a>
        <a v-if="lienAsso" href="/" class="nav-link nav-asso" title="Site de l'association Bras Ouverts">Bras Ouverts</a>
      </div>

      <button class="nav-burger" type="button" @click="toggleMenu" :aria-label="open ? 'Fermer le menu' : 'Ouvrir le menu'" :aria-expanded="String(open)" aria-controls="menu-mobile">
        <span class="burger-line"></span>
        <span class="burger-line"></span>
        <span class="burger-line"></span>
      </button>
    </div>

    <div id="menu-mobile" class="nav-dropdown" :class="{ open }">
      <a
        v-for="sec in sections"
        :key="sec.id"
        :href="`${prefix}#${sec.id}`"
        class="dropdown-link"
        :class="{ active: activeId === sec.id, 'touch-active': touchedId === sec.id }"
        @click="onClick(sec.id)"
        @touchstart="onTouchStart(sec.id)"
        @touchend="onTouchEnd"
        @touchcancel="onTouchEnd"
      >{{ sec.label }}</a>
      <a v-if="lienAsso" href="/" class="dropdown-link dropdown-asso">← Site Bras Ouverts</a>
    </div>

    <!-- Bandeau défilant intégré au menu : ouverture + annonce -->
    <a class="nav-ticker" :class="{ 'is-open': openToday }" :href="`${prefix}#horaires`" @click="onClick('calendrier')">
      <span class="ticker-mask">
        <span class="ticker-track">
          <span class="ticker-seg" v-for="n in 3" :key="n">
            <template v-if="openToday">
              <span class="ticker-dot" aria-hidden="true"></span>
              <b>Ouvert aujourd'hui</b> · {{ todayHoraires || plage }}
            </template>
            <template v-else-if="nextOpening">
              <span class="ticker-dot" aria-hidden="true"></span>
              Prochaine ouverture : <b>{{ nextOpening }}</b> · {{ plage }}
            </template>
            <template v-if="annonce"><span class="ticker-sep">✦</span>{{ annonce }}</template>
            <span class="ticker-sep">✦</span>
          </span>
        </span>
      </span>
    </a>
  </nav>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase.js'
import { useOpeningStatus } from '../composables/useOpeningStatus.js'

const props = defineProps({
  sections: {
    type: Array,
    required: true
  },
  // Sur une autre page que l'accueil (ex. la galerie), les liens ramènent à l'accueil : prefix = '/boutik/'
  prefix: {
    type: String,
    default: ''
  }
})

const { openToday, todayHoraires, nextOpening, plage } = useOpeningStatus()

// Annonce optionnelle (actualité) ajoutée au défilé
const actu = ref({ visible: false, titre: '', message: '', defilant: true })
let unsubActu = null
const annonce = computed(() => {
  if (!actu.value.visible || actu.value.defilant === false) return ''
  return [actu.value.titre, actu.value.message].filter(Boolean).join(' — ').trim()
})

const open = ref(false)
const activeId = ref('')
const touchedId = ref(null)

// derive a short site name from the document title (fallback to default)
const siteName = ref((typeof document !== 'undefined' && document.title ? document.title.split('—')[0].trim() : "La P'tite Boutik Solidaire"))

let lastClickedId = null
let clickTimeout = null
let scrollTick = null

const navEl = ref(null)
const navH = ref(90)

// Menu plein écran (mobile) : il commence juste sous l'en-tête + bandeau défilant, dont on mesure la hauteur,
// et la page derrière ne défile plus tant qu'il est ouvert.
function mesurer() {
  if (navEl.value) navH.value = Math.round(navEl.value.getBoundingClientRect().height)
}
watch(open, (oui) => {
  if (oui) mesurer()
  document.documentElement.classList.toggle('menu-ouvert', oui)
})

function toggleMenu() {
  open.value = !open.value
}

// Sur brasouverts.bzh, la boutique est sous /boutik/ et la racine est le site de l'association :
// lien de retour. Sur petite-boutik-solidaire.pages.dev, la racine renvoie ici : pas de lien.
const lienAsso = typeof window !== 'undefined' && !/(^|\.)petite-boutik-solidaire\.pages\.dev$|^localhost$|^127\./.test(window.location.hostname)

function onKeydown(e) {
  if (e.key === 'Escape' && open.value) {
    open.value = false
    document.querySelector('.nav-burger')?.focus()
  }
}

function onClick(id) {
  lastClickedId = id
  activeId.value = id
  open.value = false
  if (clickTimeout) clearTimeout(clickTimeout)
  clickTimeout = setTimeout(() => { lastClickedId = null }, 1200)
}

function onTouchStart(id) {
  touchedId.value = id
}

function onTouchEnd() {
  touchedId.value = null
}

function refreshActive() {
  if (lastClickedId) return

  let best = null
  let bestDist = Infinity
  for (const sec of props.sections) {
    const el = document.getElementById(sec.id)
    if (!el) continue
    const rect = el.getBoundingClientRect()
    if (rect.bottom <= 0) continue
    const dist = Math.abs(rect.top - 56)
    if (dist < bestDist) {
      bestDist = dist
      best = sec.id
    }
  }
  if (best) activeId.value = best
}

function onScroll() {
  if (scrollTick) return
  scrollTick = requestAnimationFrame(() => {
    refreshActive()
    scrollTick = null
  })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', mesurer)
  refreshActive()
  unsubActu = onSnapshot(doc(db, 'config', 'actualite'), snap => {
    if (snap.exists()) Object.assign(actu.value, snap.data())
  }, () => {})
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', mesurer)
  document.documentElement.classList.remove('menu-ouvert')
  if (scrollTick) cancelAnimationFrame(scrollTick)
  if (clickTimeout) clearTimeout(clickTimeout)
  if (unsubActu) unsubActu()
})
</script>

<style scoped>
.section-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 800;
  background: color-mix(in srgb, var(--bg) 94%, transparent);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--line);
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

.nav-inner {
  display: flex;
  align-items: center;
  max-width: var(--site-max-width, 800px);
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  min-height: 56px;
  gap: 12px;
}

/* ==================== Brand ==================== */
.nav-brand {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.nav-logo {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
}

.nav-title {
  margin-left: 10px;
  font-family: var(--display);
  font-weight: 700;
  color: var(--ink);
  font-size: 1.1rem;
  white-space: nowrap;
}

/* ==================== Desktop links ==================== */
.nav-links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 2px 14px;
  margin-left: auto;
}

.nav-link {
  flex-shrink: 0;
  padding: 6px 0;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--muted);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}

.nav-link:hover,
.nav-link:focus-visible {
  color: var(--accent);
  text-decoration: none;
}

.nav-link.active {
  color: var(--ink);
  border-bottom-color: var(--corail);
}

/* ==================== Mobile burger ==================== */
.nav-burger {
  display: none;
  margin-left: auto;
  width: 44px;
  height: 40px;
  border: 1px solid var(--line);
  background: var(--surface);
  border-radius: 999px;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-shrink: 0;
}

.burger-line {
  display: block;
  width: 18px;
  height: 2px;
  background: var(--ink);
  border-radius: 2px;
}

.nav-burger:active {
  opacity: 0.8;
}

/* ==================== Mobile dropdown ==================== */
.nav-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg);
  border-bottom: 1px solid var(--line);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  padding: 6px 0;
  max-height: 60vh;
  overflow-y: auto;
}

.nav-dropdown.open {
  display: block;
}

.dropdown-link.dropdown-asso { border-top: 1px solid var(--line); font-weight: 700; color: var(--corail); }
.nav-asso { color: #a94631; }

.dropdown-link {
  display: block;
  padding: 12px 20px;
  font-size: 0.95em;
  color: var(--ink);
  text-decoration: none;
  cursor: pointer;
  -webkit-tap-highlight-color: var(--primary-teal);
}

.dropdown-link:hover,
.dropdown-link:focus-visible,
.dropdown-link:focus {
  background: var(--primary-teal) !important;
  color: white !important;
  text-decoration: none !important;
}

.dropdown-link:active {
  background: var(--primary-teal) !important;
  color: white !important;
}

.dropdown-link.active {
  background: var(--soft);
  color: var(--ink);
  font-weight: 700;
}

.dropdown-link.touch-active {
  background: var(--primary-teal) !important;
  color: white !important;
}

/* ==================== Bandeau défilant ==================== */
.nav-ticker {
  display: block;
  overflow: hidden;
  text-decoration: none;
  background: var(--lagon-doux);
  color: var(--ink);
  border-top: 1px solid var(--line);
  font-size: 0.85rem;
  font-weight: 600;
}
.nav-ticker.is-open {
  background: var(--accent);
  color: #fff;
}
.ticker-mask { display: block; overflow: hidden; white-space: nowrap; }
.ticker-track {
  display: inline-flex;
  align-items: center;
  padding: 5px 0;
  animation: tickerScroll 24s linear infinite;
  will-change: transform;
}
.nav-ticker:hover .ticker-track { animation-play-state: paused; }
.ticker-seg { display: inline-flex; align-items: center; }
.ticker-seg b { font-weight: 800; }
.ticker-sep { margin: 0 18px; opacity: 0.55; }
.ticker-dot {
  width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; flex-shrink: 0;
  background: currentColor;
}
.nav-ticker.is-open .ticker-dot {
  background: #fff;
  box-shadow: 0 0 0 0 rgba(255,255,255,0.7);
  animation: tickerPulse 1.7s infinite;
}
@keyframes tickerScroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-33.333%); }
}
@keyframes tickerPulse {
  0%   { box-shadow: 0 0 0 0 rgba(255,255,255,0.7); }
  70%  { box-shadow: 0 0 0 8px rgba(255,255,255,0); }
  100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
}
@media (prefers-reduced-motion: reduce) {
  .ticker-track { animation: none; padding-left: 12px; }
}

/* ==================== Responsive ==================== */
@media (max-width: 767px) {
  .nav-links { display: none; }
  .nav-burger { display: flex; }
  /* Menu plein écran : de sous le bandeau défilant jusqu'en bas de l'écran, avec de grandes rubriques */
  .nav-dropdown {
    /* .section-nav a un transform : « fixed » s'y rapporterait à lui, d'où une hauteur calculée */
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    height: calc(100vh - var(--nav-h, 94px));
    height: calc(100dvh - var(--nav-h, 94px));
    max-height: none;
    /* marge basse généreuse : la barre d'outils de Safari ne doit jamais masquer la dernière rubrique */
    padding: 4px 0 calc(88px + env(safe-area-inset-bottom, 0px));
    border-bottom: 0;
    box-shadow: none;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .dropdown-link {
    padding: 14px 24px;
    font-family: var(--display);
    font-size: 1.4rem;
    font-weight: 600;
    border-bottom: 1px solid var(--line);
  }
  .dropdown-link.dropdown-asso { margin-top: 10px; font-size: 1.05em; border-top: 2px solid var(--corail-doux); border-bottom: 0; background: var(--corail-doux); }
}
@media (max-width: 767px) and (max-height: 640px) {
  .dropdown-link { padding: 10px 24px; font-size: 1.1em; }
}
@media (max-width: 767px) and (prefers-reduced-motion: no-preference) {
  .nav-dropdown.open { animation: menu-apparait .18s ease-out; }
  @keyframes menu-apparait { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
}

@media (min-width: 768px) and (max-width: 1099px) {
  .nav-title { display: none; }
  .nav-links { gap: 2px 10px; }
  .nav-link { font-size: 0.85rem; }
}
</style>

<style>
/* Page figée derrière le menu plein écran */
html.menu-ouvert, html.menu-ouvert body { overflow: hidden; }
</style>
