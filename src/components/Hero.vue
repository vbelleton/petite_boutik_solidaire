<template>
  <section class="hero">
    <div class="hero-card" :style="heroStyle">
      <div class="hero-overlay" aria-hidden="true"></div>
      <div class="cta-text">
        <h2 class="cta-title" v-if="contactTitle">{{ contactTitle }}</h2>
        <p class="cta-desc" v-if="contactDesc">{{ contactDesc }}</p>
      </div>
      <div class="cta-actions">
        <a href="#contact" class="full-btn primary" @click="scrollTo('contact')">
          <span class="btn-icon" aria-hidden="true" v-html="iconHtml"></span>
          <span class="btn-label">{{ btn2Label }}</span>
        </a>
        <a href="#calendrier" class="full-btn" @click="scrollTo('calendrier')">
          <span class="btn-icon" aria-hidden="true" v-html="btn1IconHtml"></span>
          <span class="btn-label">{{ btn1Label }}</span>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useTextes } from '../composables/useTextes.js'
import { heroBackground } from '../composables/heroGradient.js'

const textes = useTextes()

const mailSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6.5C3 5.67157 3.67157 5 4.5 5H19.5C20.3284 5 21 5.67157 21 6.5V17.5C21 18.3284 20.3284 19 19.5 19H4.5C3.67157 19 3 18.3284 3 17.5V6.5Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 6.5L12 12.5L3 6.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const clockSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.2"/><path d="M12 7v6l4 2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'

const btn1Label = computed(() => textes.value.hero_btn1_label || 'Horaires')
const btn2Label = computed(() => textes.value.hero_btn2_label || 'Nous contacter')
const contactTitle = computed(() => textes.value.hero_contact_title || "Besoin d'aide ?")
const contactDesc = computed(() => textes.value.hero_contact_desc || "Nous sommes là pour répondre à vos questions et vous accueillir à la boutique.")
const iconHtml = computed(() => textes.value.hero_btn2_icon || mailSvg)
const btn1IconHtml = computed(() => textes.value.hero_btn1_icon || clockSvg)

const heroStyle = computed(() => ({ background: heroBackground(textes.value) }))

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' })
}
</script>

<style scoped>
/* Encart d'accueil : carte arrondie au dégradé choisi dans l'admin, boutons « pilule » */
.hero-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 18px 32px;
  padding: clamp(22px, 4vw, 36px) clamp(22px, 4vw, 40px);
  border-radius: calc(var(--r) + 8px);
  color: #fff;
  box-shadow: 0 18px 40px rgba(15, 110, 103, 0.18);
}
.hero-card > * { position: relative; }

/* Voile sombre : garde le texte blanc lisible quelles que soient les couleurs choisies dans l'admin (RGAA 3.2) */
.hero-overlay { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.16); pointer-events: none; }

.cta-text { display: grid; gap: 6px; min-width: 0; flex: 1 1 320px; }
#contenu .cta-title { color: #fff; font-size: clamp(1.4rem, 3vw, 1.9rem); margin: 0; }
.cta-desc { color: #fff; font-size: 1.05rem; max-width: 46ch; }

.cta-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.full-btn {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 12px 22px; border-radius: 999px;
  text-decoration: none; font-weight: 700;
  border: 1.5px solid rgba(255, 255, 255, 0.75); color: #fff; background: transparent;
  transition: transform 140ms ease, background 140ms ease, color 140ms ease;
}
.full-btn.primary { background: #fff; color: var(--ink); border-color: #fff; }
.full-btn:hover { transform: translateY(-2px); text-decoration: none; background: #fff; color: var(--ink); }
.full-btn:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
.btn-icon { display: inline-flex; }
.btn-icon :deep(svg) { display: block; width: 18px; height: 18px; }

@media (max-width: 600px) {
  .cta-actions { width: 100%; }
  .full-btn { flex: 1 1 auto; justify-content: center; }
}
</style>
