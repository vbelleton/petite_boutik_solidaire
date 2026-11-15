<template>
  <header class="site-header">
    <div class="header-content">
      <div class="header-text">
        <p class="kicker">{{ tagline }}</p>
        <h1>
          <template v-if="titreParts.fin">{{ titreParts.debut }} <em>{{ titreParts.fin }}</em></template>
          <template v-else>{{ titre }}</template>
        </h1>
        <a class="statut" :class="{ ouvert: openToday }" href="#calendrier">
          <span class="point" aria-hidden="true"></span>
          <template v-if="openToday"><strong>Ouvert aujourd'hui</strong> · {{ todayHoraires || plage }}</template>
          <template v-else-if="nextOpening">Prochaine ouverture : <strong>{{ nextOpening }}</strong> · {{ plage }}</template>
          <template v-else>Voir les horaires d'ouverture</template>
        </a>
      </div>
      <img src="@/assets/logo.jpg" alt="Logo La P'tite Boutik Solidaire" class="logo" width="260" height="260" />
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useTextes } from '../composables/useTextes.js'
import { useOpeningStatus } from '../composables/useOpeningStatus.js'

const { openToday, todayHoraires, nextOpening, plage } = useOpeningStatus()

const textes = useTextes()
const titre = computed(() => textes.value.header_titre || "La P'tite Boutik Solidaire")
const tagline = computed(() => textes.value.header_tagline || 'Association Bras Ouverts · Morlaix')
// Dernier mot du titre en italique coloré, comme les titres du site Bras Ouverts
const titreParts = computed(() => {
  const m = /^(.+)\s(\S+)$/.exec(titre.value.trim())
  return m ? { debut: m[1], fin: m[2] } : { debut: titre.value, fin: '' }
})
</script>

<style scoped>
.site-header {
  padding: clamp(28px, 5vw, 56px) max(20px, calc((100% - var(--site-max-width, 1120px)) / 2)) clamp(24px, 4vw, 40px);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  max-width: var(--site-max-width, 1120px);
  margin: 0 auto;
}

.kicker {
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 16px;
}

.header-text h1 {
  font-size: clamp(2.3rem, 7vw, 4.4rem);
  letter-spacing: -0.02em;
  max-width: 16ch;
  color: var(--ink);
}
.header-text h1 em {
  /* « Solidaire » comme sur le logo : mot blanc dans une pastille turquoise */
  display: inline-block;
  font-style: italic;
  color: var(--accent-ink);
  background: var(--accent);
  padding: 0.02em 0.32em 0.1em;
  border-radius: 0.28em;
  transform: rotate(-2deg);
  margin-left: 0.04em;
}

.statut {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  margin-top: 22px;
  padding: 8px 16px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--ink);
  font-size: 0.97rem;
  text-decoration: none;
}
.statut:hover { border-color: var(--accent); text-decoration: none; }
.statut .point { width: 10px; height: 10px; border-radius: 50%; background: #c3bdb0; flex: none; }
.statut.ouvert { background: var(--accent); border-color: var(--accent); color: #fff; }
.statut.ouvert .point { background: #fff; box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.25); }

/* Logo intégré au bandeau du haut : son fond blanc se fond dans la page (multiply), sans cadre.
   Taille mesurée : grand sur ordinateur, raisonnable sur téléphone. */
.logo {
  flex: none;
  width: clamp(170px, 30vw, 440px); /* le logo prend la place laissée par le titre */
  height: auto;
  object-fit: contain;
  mix-blend-mode: multiply;
}
/* Thème sombre : multiply ferait disparaître le logo, on le pose sur une pastille claire. */
:global(:root[data-theme="dark"] .site-header .logo) { mix-blend-mode: normal; background: #fff; border-radius: 28px; padding: 8px; }
@media (prefers-color-scheme: dark) {
  :global(:root:not([data-theme="light"]) .site-header .logo) { mix-blend-mode: normal; background: #fff; border-radius: 28px; padding: 8px; }
}

@media (max-width: 600px) {
  .header-content { align-items: flex-start; }
  .statut { border-radius: 14px; font-size: 0.9rem; padding: 8px 12px; }
  /* Prochaine ouverture : toute la largeur, sous le titre et le logo */
  .header-content { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0 16px; align-items: center; }
  .header-text { display: contents; }
  .kicker { grid-column: 1 / -1; }
  .header-text h1 { grid-column: 1; grid-row: 2; }
  .logo { grid-column: 2; grid-row: 2; }
  .statut { grid-column: 1 / -1; grid-row: 3; display: flex; width: 100%; }
  .logo { width: 150px; }
}
</style>
