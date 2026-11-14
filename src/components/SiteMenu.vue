<template>
  <header ref="hautEl" class="top" :style="{ '--haut': haut + 'px' }">
    <div class="wrap">
      <div class="marque">
        <a class="logo" :href="ASSO + '/'" title="Accueil du site Bras Ouverts">
          <img :src="BASE + 'logo-bras-ouverts.png'" alt="Bras Ouverts" width="178" height="34" />
        </a>
        <a class="sous-site" :href="BASE">La P'tite Boutik Solidaire</a>
      </div>
      <button class="menu-toggle" type="button" :aria-expanded="String(ouvert)" aria-controls="menu-principal"
        :aria-label="ouvert ? 'Fermer le menu' : 'Ouvrir le menu'" @click="ouvert = !ouvert">
        <span class="menu-ico" aria-hidden="true"><span></span><span></span><span></span></span><span class="menu-txt">Menu</span>
      </button>
      <nav id="menu-principal" aria-label="Navigation principale" @click="fermerSiLien">
        <a v-for="l in liens" :key="l.url" :href="lien(l.url)" :aria-current="estBoutik(l.url) ? 'page' : null">{{ l.label }}</a>
      </nav>
      <button class="theme-toggle" type="button" :aria-pressed="String(sombre)" :aria-label="sombre ? 'Passer au thème clair' : 'Passer au thème sombre'"
        :title="sombre ? 'Passer au thème clair' : 'Passer au thème sombre'" @click="basculerTheme">
        <svg v-if="!sombre" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" fill="currentColor"/></svg>
        <svg v-else viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 1.5v2.5M12 20v2.5M1.5 12H4M20 12h2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"/></g></svg>
      </button>
    </div>
  </header>
  <!-- Colonne des rubriques de la boutique, à gauche, qui suit la page. Grand écran : icônes et libellés.
       Écran plus étroit : icônes seules, que le bouton du haut déplie par-dessus la page. -->
  <template v-if="rubriques.length">
    <div v-if="railOuvert" class="rail-voile" aria-hidden="true" @click="railOuvert = false"></div>
    <nav ref="railEl" class="rail" :class="{ deplie: railOuvert }" :style="{ '--haut': haut + 'px' }" aria-label="Sur cette page">
      <button class="rail-bouton" type="button" :aria-expanded="String(railOuvert)" :aria-label="railOuvert ? 'Replier les rubriques' : 'Déplier les rubriques'" @click="railOuvert = !railOuvert">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="railOuvert ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'"/></svg>
      </button>
      <p class="rail-titre">Sur cette page</p>
      <a v-for="r in rubriques" :key="r.id" :href="lienRubrique(r.id)" :title="r.label" :aria-current="actif === r.id ? 'location' : null" @click="allerA($event, r.id)">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path :d="ICONES[r.id] || ICONES.defaut"/></svg>
        <span class="rail-txt">{{ r.label }}</span>
      </a>
    </nav>
  </template>
</template>

<script setup>
// En-tête commun avec le site Bras Ouverts : même logo, même menu (lu dans /menu.json, publié par
// le site de l'association), même bouton de thème (même mémoire : « bras-ouverts-theme »).
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { BASE, ASSO } from '../chemin.js'

const props = defineProps({
  rubriques: { type: Array, default: () => [] },
  // Sur une autre page que l'accueil de la boutique (la galerie), les rubriques ramènent à l'accueil.
  prefix: { type: String, default: '' },
})

// Menu par défaut (si /menu.json ne répond pas) : le même que sur le site Bras Ouverts.
const liens = ref([
  { label: 'Découvrir l’association', url: '/#deux-cotes' },
  { label: 'Petite boutik', url: '/boutik/' },
  { label: 'Maraude', url: '/#maraudes' },
  { label: 'Agenda', url: '/#agenda' },
  { label: 'Contact', url: '/#contact' },
])
const lien = (url) => (url.startsWith('/') && !url.startsWith('//') ? ASSO + url : url)
const estBoutik = (url) => url.replace(/\/+$/, '') === BASE.replace(/\/+$/, '')

// Rubrique affichée à l'écran, soulignée dans la ligne des rubriques ; « Accueil » = tout en haut de la page.
const actif = ref('')
const lienRubrique = (id) => (id === 'hero' ? (props.prefix || '#') : `${props.prefix}#${id}`)
function allerA(e, id) {
  ouvert.value = false
  railOuvert.value = false
  if (props.prefix) return // autre page (galerie) : on laisse le lien ramener à l'accueil
  e.preventDefault()
  const cible = id === 'hero' ? null : document.getElementById(id)
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (cible) cible.scrollIntoView({ behavior: calme ? 'auto' : 'smooth', block: 'start' })
  else window.scrollTo({ top: 0, behavior: calme ? 'auto' : 'smooth' })
  history.replaceState(null, '', id === 'hero' ? location.pathname : `#${id}`)
  actif.value = id
}
let tic = null
function suivre() {
  if (tic) return
  tic = requestAnimationFrame(() => {
    tic = null
    if (props.prefix) return
    // Une rubrique atteinte par un lien s’arrête à 100 px du haut (scroll-margin-top) : seuil un peu en dessous.
    const seuil = Math.max((hautEl.value?.getBoundingClientRect().height || 100) + 24, 112)
    let courant = props.rubriques[0]?.id || ''
    for (const r of props.rubriques) {
      const el = document.getElementById(r.id)
      if (el && el.getBoundingClientRect().top <= seuil) courant = r.id
    }
    // Tout en bas de la page : la dernière rubrique, même si elle est trop courte pour atteindre le haut.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      const der = [...props.rubriques].reverse().find((r) => document.getElementById(r.id))
      if (der) courant = der.id
    }
    if (window.scrollY < 40) courant = props.rubriques.find((r) => r.id === 'hero') ? 'hero' : courant
    actif.value = courant
  })
}
// Colonne repliée (écrans étroits) : dépliée par le bouton, refermée après un choix, Échap ou clic à côté.
const railOuvert = ref(false)
const railEl = ref(null)
// Icônes des rubriques (traits 24 × 24)
const ICONES = {
  hero: 'M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10',
  about: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5v.5',
  'boutique-gallery': 'M4 9l1.5-5h13L20 9M4 9h16M4 9v11h16V9M9 20v-6h6v6',
  carousel: 'M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M15.5 9.5h.01',
  collection: 'M8 3l-5 3 2 4 2-1v12h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0z',
  association: 'M7 11V6.8a1.4 1.4 0 0 1 2.8 0V11M9.8 10V5.4a1.4 1.4 0 0 1 2.8 0V10M12.6 10V6.2a1.4 1.4 0 0 1 2.8 0v6.3l1.4-1.6a1.4 1.4 0 0 1 2.1 1.9L15.6 17a5 5 0 0 1-3.8 2H11a5 5 0 0 1-5-5v-2.5a1.4 1.4 0 0 1 2.8 0',
  calendrier: 'M4 5.5h16V20H4zM4 10h16M8.5 3.5v4M15.5 3.5v4',
  engagement: 'M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10C19.5 15.4 12 20 12 20z',
  contact: 'M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11zM12 12.3a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6z',
  social: 'M17 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM7 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM9.6 13.5l4.8 3M14.4 6.5l-4.8 3',
  defaut: 'M5 12h14',
}

const ouvert = ref(false)
const hautEl = ref(null)
const haut = ref(61)
const mesurer = () => { if (hautEl.value) haut.value = Math.round(hautEl.value.getBoundingClientRect().height) }
watch(ouvert, (oui) => {
  if (oui) mesurer()
  document.documentElement.classList.toggle('menu-ouvert', oui)
})
const fermerSiLien = (e) => { if (e.target.closest('a')) ouvert.value = false }

// Thème clair / sombre : suit le système, le choix du visiteur est mémorisé (posé avant l'affichage par index.html).
const KEY = 'bras-ouverts-theme'
const root = document.documentElement
const systeme = matchMedia('(prefers-color-scheme: dark)')
const courant = () => root.dataset.theme || (systeme.matches ? 'dark' : 'light')
const sombre = ref(courant() === 'dark')
function basculerTheme() {
  const suivant = courant() === 'dark' ? 'light' : 'dark'
  root.dataset.theme = suivant
  try { localStorage.setItem(KEY, suivant) } catch {}
  sombre.value = suivant === 'dark'
}
const surSysteme = () => { sombre.value = courant() === 'dark' }

const onKey = (e) => {
  if (e.key !== 'Escape') return
  if (ouvert.value) { ouvert.value = false; hautEl.value?.querySelector('.menu-toggle')?.focus() }
  if (railOuvert.value) { railOuvert.value = false; railEl.value?.querySelector('.rail-bouton')?.focus() }
}
const onClic = (e) => { if (ouvert.value && !e.target.closest('.top')) ouvert.value = false }
const large = matchMedia('(min-width: 701px)')
const onLarge = (m) => { if (m.matches) ouvert.value = false }

onMounted(async () => {
  mesurer()
  window.addEventListener('scroll', suivre, { passive: true })
  window.addEventListener('resize', suivre)
  setTimeout(suivre, 300)
  document.addEventListener('keydown', onKey)
  document.addEventListener('click', onClic)
  window.addEventListener('resize', mesurer)
  systeme.addEventListener('change', surSysteme)
  large.addEventListener('change', onLarge)
  try {
    const res = await fetch(ASSO + '/menu.json', { signal: AbortSignal.timeout(5000) })
    if (res.ok) {
      const { liens: l } = await res.json()
      if (Array.isArray(l) && l.length && l.every((x) => x && typeof x.label === 'string' && typeof x.url === 'string' && /^(\/|https:)/.test(x.url))) liens.value = l
    }
  } catch { /* menu par défaut */ }
})
onUnmounted(() => {
  window.removeEventListener('scroll', suivre)
  window.removeEventListener('resize', suivre)
  if (tic) cancelAnimationFrame(tic)
  document.removeEventListener('keydown', onKey)
  document.removeEventListener('click', onClic)
  window.removeEventListener('resize', mesurer)
  systeme.removeEventListener('change', surSysteme)
  large.removeEventListener('change', onLarge)
  root.classList.remove('menu-ouvert')
})
</script>

<style scoped>
/* Repris de l'en-tête du site Bras Ouverts (src/style.css de bras-ouverts-site) */
.top { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 800; background: color-mix(in srgb, var(--bg) 92%, transparent); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }
.wrap { max-width: 1120px; margin: 0 auto; padding-inline: 20px; }
.top > .wrap { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 24px; padding-block: 10px; position: relative; }
.marque { display: flex; align-items: center; gap: 12px; min-width: 0; }
.logo { display: flex; align-items: center; flex: none; }
.logo img { display: block; height: 34px; width: auto; }
.sous-site { padding-left: 12px; border-left: 1px solid var(--line); font-family: var(--display); font-weight: 700; font-size: 1.02rem; line-height: 1.15; color: var(--corail); text-decoration: none; white-space: nowrap; }
.sous-site:hover { text-decoration: underline; }
:root[data-theme="dark"] .logo img { filter: brightness(0) invert(0.94); }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .logo img { filter: brightness(0) invert(0.94); } }

#menu-principal { display: flex; flex-wrap: wrap; gap: 4px 20px; margin-left: auto; }
#menu-principal a { color: var(--muted); text-decoration: none; font-weight: 700; font-size: 0.95rem; }
#menu-principal a:hover { color: var(--accent); }
#menu-principal a[aria-current="page"] { color: var(--ink); box-shadow: inset 0 -2px 0 var(--corail); }

.theme-toggle { display: grid; place-items: center; width: 40px; height: 40px; padding: 0; border: 1px solid var(--line); border-radius: 999px; background: var(--surface); color: var(--ink); cursor: pointer; flex: none; }
.theme-toggle:hover { color: var(--accent); border-color: var(--accent); }

.menu-toggle { display: none; align-items: center; gap: 8px; height: 40px; padding: 0 14px; border: 1px solid var(--line); border-radius: 999px; background: var(--surface); color: var(--ink); font: inherit; font-weight: 700; font-size: 0.95rem; cursor: pointer; }
.menu-toggle:hover { color: var(--accent); border-color: var(--accent); }
.menu-ico { display: grid; gap: 4px; width: 18px; }
.menu-ico span { display: block; height: 2px; border-radius: 2px; background: currentColor; transition: transform .2s, opacity .2s; }
.menu-toggle[aria-expanded="true"] .menu-ico span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.menu-toggle[aria-expanded="true"] .menu-ico span:nth-child(2) { opacity: 0; }
.menu-toggle[aria-expanded="true"] .menu-ico span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
@media (prefers-reduced-motion: reduce) { .menu-ico span { transition: none; } }


/* Colonne des rubriques : icônes seules (56 px) sur écran étroit, icônes + libellés sur grand écran */
.rail { position: fixed; z-index: 700; left: 0; top: var(--haut, 62px); bottom: 84px; width: var(--rail); display: flex; flex-direction: column; gap: 2px;
  padding: 10px 8px; overflow-x: hidden; overflow-y: auto; scrollbar-width: none; border-right: 1px solid var(--line);
  background: color-mix(in srgb, var(--bg) 92%, transparent); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); transition: width .2s ease, box-shadow .2s ease; }
.rail::-webkit-scrollbar { display: none; }
.rail a { position: relative; display: flex; align-items: center; gap: 12px; min-height: 40px; padding: 8px 9px; border-radius: 10px; font-weight: 700; font-size: 0.95rem; color: var(--muted); text-decoration: none; white-space: nowrap; transition: color .2s, background .2s; }
.rail a svg { flex: none; }
.rail a:hover { color: var(--ink); background: var(--surface); }
.rail a[aria-current="location"] { color: var(--corail); background: var(--corail-doux); }
.rail-txt, .rail-titre { opacity: 0; transition: opacity .15s; }
.rail-titre { margin: 4px 0 6px 10px; font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 700; color: var(--corail); white-space: nowrap; height: 0; overflow: hidden; }
.rail-bouton { display: grid; place-items: center; width: 40px; height: 36px; margin: 0 0 6px 0; padding: 0; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); color: var(--ink); cursor: pointer; }
.rail-bouton:hover { color: var(--accent); border-color: var(--accent); }
/* Dépliée par le bouton : par-dessus la page, avec un voile derrière */
.rail.deplie { width: 230px; box-shadow: 8px 0 30px rgba(31, 42, 58, 0.14); }
.rail.deplie .rail-txt, .rail.deplie .rail-titre { opacity: 1; }
.rail.deplie .rail-titre { height: auto; }
.rail-voile { position: fixed; inset: 0; z-index: 690; background: rgba(15, 20, 28, 0.25); }
@media (min-width: 1100px) {
  .rail { padding: 24px 14px 20px 18px; }
  .rail-bouton, .rail-voile { display: none; }
  .rail-txt, .rail-titre { opacity: 1; }
  .rail-titre { height: auto; margin-bottom: 10px; }
  .rail a[aria-current="location"]::before { content: ""; position: absolute; left: -10px; top: 9px; bottom: 9px; width: 3px; border-radius: 3px; background: var(--corail); }
}
@media (max-width: 700px) { .rail { bottom: 92px; } }
@media (prefers-reduced-motion: reduce) { .rail, .rail-txt, .rail-titre { transition: none; } }

@media (max-width: 1000px) and (min-width: 701px) {
  .sous-site { font-size: 0.92rem; white-space: normal; max-width: 9.5em; }
  #menu-principal { gap: 4px 14px; }
  #menu-principal a { font-size: 0.9rem; }
}

@media (max-width: 700px) {
  .top > .wrap { flex-wrap: nowrap; gap: 8px; }
  .marque { gap: 8px; flex: 1 1 auto; }
  .logo img { height: 24px; }
  .sous-site { padding-left: 8px; font-size: 0.82rem; white-space: normal; max-width: 7.5em; }
  .menu-toggle { display: inline-flex; margin-left: auto; }
  .menu-txt { display: none; }
  .menu-toggle { padding: 0; width: 40px; justify-content: center; }
  /* Menu plein écran sous l'en-tête, comme sur le site Bras Ouverts */
  #menu-principal { display: none; position: absolute; top: 100%; left: 0; right: 0; height: calc(100vh - var(--haut)); height: calc(100dvh - var(--haut));
    flex-direction: column; flex-wrap: nowrap; gap: 0; margin: 0; padding: 8px max(20px, env(safe-area-inset-left)) calc(96px + env(safe-area-inset-bottom)); overflow-y: auto; overscroll-behavior: contain;
    background: var(--bg); border-top: 1px solid var(--line); }
  .menu-toggle[aria-expanded="true"] ~ #menu-principal { display: flex; }
  #menu-principal a { flex: none; padding: 16px 4px; font-family: var(--display); font-size: 1.45rem; color: var(--ink); border-bottom: 1px solid var(--line); }
  #menu-principal a[aria-current="page"] { box-shadow: none; color: var(--corail); }
}
</style>

<style>
/* La page laisse la place à la colonne des rubriques ; l'en-tête reste pleine largeur. */
:root { --rail: 56px; }
@media (min-width: 1100px) { :root { --rail: 210px; } }
.container:has(> .rail) { padding-left: var(--rail); }
.container:has(> .rail) > header.top { margin-left: calc(-1 * var(--rail)); }
/* Page figée derrière le menu plein écran. Seulement sur <html> : avec aussi « body », le body devenait
   le conteneur de défilement et l'en-tête collant (donc le menu) remontait tout en haut de la page. */
html.menu-ouvert { overflow: hidden; }
</style>
