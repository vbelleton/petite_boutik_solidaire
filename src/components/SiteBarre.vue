<template>
  <nav ref="barreEl" class="barre" aria-label="Accès rapide">
    <a v-for="b in boutons" :key="b.label" :href="lien(b.url)" :aria-current="estBoutik(b.url) ? 'true' : null" :data-ico="ICONES[b.icon] ? b.icon : 'coeur'">
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path v-for="(d, i) in (ICONES[b.icon] || ICONES.coeur)" :key="i" :d="d" /></svg>
      <span>{{ b.label }}</span>
    </a>
  </nav>
</template>

<script setup>
// Barre de boutons en bas de l'écran sur téléphone, la même que sur le site Bras Ouverts : lue dans
// /menu.json (champ « barre », publié par le site de l'association), avec le même contenu par défaut.
import { ref, onMounted, onUnmounted } from 'vue'
import { BASE, ASSO } from '../chemin.js'

const ICONES = {
  accueil: ['M3 11.5 12 4l9 7.5', 'M5.5 10v9.5h13V10', 'M10 19.5v-5h4v5'],
  boutique: ['M5 8h14l-1.2 11.5H6.2z', 'M9 8V6.5a3 3 0 0 1 6 0V8'],
  coeur: ['M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10C19.5 15.4 12 20 12 20z'],
  agenda: ['M4 5.5h16V20H4z', 'M4 10h16M8.5 3.5v4M15.5 3.5v4'],
  carte: ['M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z', 'M12 12.3a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6z'],
  contact: ['M3.5 5.5h17v13h-17z', 'm4 7 8 6 8-6'],
  soutenir: ['M12 11.2s-3.9-2.3-3.9-5.1A2.2 2.2 0 0 1 12 4.9a2.2 2.2 0 0 1 3.9 1.2c0 2.8-3.9 5.1-3.9 5.1z', 'M3 14h2.8l3.4 2.2h3.6a1.3 1.3 0 0 0 0-2.6H9.6', 'M12.9 15.4l4.6-2.3a1.4 1.4 0 0 1 1.5 2.3l-5.4 3.9H3'],
  mains: ['M7 11.5V6.8a1.4 1.4 0 0 1 2.8 0v4.2M9.8 10V5.4a1.4 1.4 0 0 1 2.8 0V10M12.6 10V6.2a1.4 1.4 0 0 1 2.8 0v6.3l1.4-1.6a1.4 1.4 0 0 1 2.1 1.9L15.6 17a5 5 0 0 1-3.8 2H11a5 5 0 0 1-5-5v-2.5a1.4 1.4 0 0 1 2.8 0'],
}
const boutons = ref([
  { label: 'Accueil', url: '/#accueil', icon: 'accueil' },
  { label: 'La P’tite Boutik', url: '/boutik/', icon: 'boutique' },
  { label: 'Maraude', url: '/#maraudes', icon: 'mains' },
  { label: 'Agenda', url: '/#agenda', icon: 'agenda' },
  { label: 'Contact', url: '/#contact', icon: 'contact' },
  { label: 'Soutenir', url: '/soutenir/', icon: 'soutenir' },
])
const lien = (url) => (url.startsWith('/') && !url.startsWith('//') ? ASSO + url : url)
const estBoutik = (url) => url.replace(/\/+$/, '') === BASE.replace(/\/+$/, '')

// La barre s'efface pendant la saisie (clavier) ; le menu déplié la masque aussi (voir le style global).
const champ = (t) => t instanceof Element && t.matches('input:not([type=checkbox]):not([type=radio]), textarea, select')
const root = document.documentElement
// Hauteur réelle de la barre (encoche de l'iPhone, texte agrandi, libellé sur deux lignes) publiée dans --barre-h :
// la colonne des rubriques (SiteMenu.vue) s'arrête au-dessus, sans jamais la chevaucher.
const barreEl = ref(null)
let observe = null
const mesurer = () => {
  const h = barreEl.value && getComputedStyle(barreEl.value).display !== 'none' ? Math.ceil(barreEl.value.getBoundingClientRect().height) : 0
  root.style.setProperty('--barre-h', h + 'px')
}
const dedans = (e) => { if (champ(e.target)) root.classList.add('clavier') }
const dehors = (e) => { if (champ(e.target)) root.classList.remove('clavier') }
onMounted(async () => {
  document.body.classList.add('avec-barre')
  mesurer()
  if ('ResizeObserver' in window) { observe = new ResizeObserver(mesurer); observe.observe(barreEl.value, { box: 'border-box' }) }
  window.addEventListener('resize', mesurer)
  document.addEventListener('focusin', dedans)
  document.addEventListener('focusout', dehors)
  try {
    const res = await fetch(ASSO + '/menu.json', { signal: AbortSignal.timeout(5000) })
    if (res.ok) {
      const { barre } = await res.json()
      if (Array.isArray(barre) && barre.length && barre.length <= 6 && barre.every((x) => x && typeof x.label === 'string' && typeof x.url === 'string' && /^(\/|https:)/.test(x.url))) boutons.value = barre
    }
  } catch { /* barre par défaut */ }
})
onUnmounted(() => {
  document.body.classList.remove('avec-barre')
  observe?.disconnect()
  window.removeEventListener('resize', mesurer)
  root.style.removeProperty('--barre-h')
  document.removeEventListener('focusin', dedans)
  document.removeEventListener('focusout', dehors)
  root.classList.remove('clavier')
})
</script>

<style>
/* Repris du site Bras Ouverts (src/style.css de bras-ouverts-site) */
.barre { display: none; }
@media (max-width: 700px) {
  body.avec-barre { padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px)); overscroll-behavior-y: none; }
  .barre { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; position: fixed; z-index: 9; left: 0; right: 0; bottom: 0;
    padding: 4px max(4px, env(safe-area-inset-left)) env(safe-area-inset-bottom, 0px); background: color-mix(in srgb, var(--surface) 94%, transparent);
    -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); border-top: 1px solid var(--line); box-shadow: 0 -4px 18px rgb(0 0 0 / 0.06); }
  .barre a { display: grid; justify-items: center; align-content: start; gap: 3px; min-height: 56px; padding: 6px 2px 6px; color: var(--ink); text-decoration: none; font-size: 0.72rem; font-weight: 700; line-height: 1.15; border-radius: 12px; text-align: center; text-wrap: balance; }
  .barre a:hover { text-decoration: none; }
  /* Chaque icône sur une pastille vive (turquoise, corail, bleu), texte bleu nuit dessus : contraste ≥ 7:1 dans les deux thèmes */
  .barre svg { box-sizing: content-box; width: 22px; height: 22px; padding: 4px 13px; border-radius: 999px; background: var(--vif); color: var(--vif-ink); transition: transform .15s; }
  .barre a[data-ico="boutique"] svg, .barre a[data-ico="contact"] svg { background: var(--vif-corail); }
  .barre a[data-ico="agenda"] svg, .barre a[data-ico="soutenir"] svg { background: var(--vif-bleu); }
  /* 6 boutons sur un téléphone étroit : pastilles un peu moins larges */
  .barre:has(> a:nth-child(6)) svg { padding-inline: 9px; }
  .barre a[aria-current="true"] svg { transform: translateY(-1px); stroke-width: 2.2; box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--ink); }
  .barre a:active { background: var(--soft); }
  .barre a:active svg { transform: scale(.94); }
  .clavier .barre, .menu-ouvert .barre { display: none; }
}
</style>
