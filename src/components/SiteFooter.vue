<template>
  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h2 class="footer-title">{{ name }}</h2>
        <p>{{ address }}</p>
        <p>{{ association }}</p>
      </div>
      <div class="footer-section">
        <h2 class="footer-title">Contact</h2>
        <p>
          <a :href="'tel:' + phoneRaw" class="footer-link"><span aria-hidden="true">📞 </span>{{ phone }}</a>
        </p>
        <p class="handle"><span aria-hidden="true">📸 </span>{{ handle }}</p>
        <p><a :href="lienAsso + '#contact'" class="footer-link"><span aria-hidden="true">✉️ </span>Nous écrire</a></p>
      </div>
      <div class="footer-section">
        <h2 class="footer-title">L'association</h2>
        <p>La P'tite Boutik est portée par Bras Ouverts, qui organise aussi des maraudes à Morlaix.</p>
        <p><a :href="lienAsso" class="footer-link">Découvrir Bras Ouverts →</a></p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; {{ currentYear }} La P'tite Boutik Solidaire — Association Bras Ouverts de Morlaix — <button class="footer-mentions" @click="openMentions">Mentions légales</button></p>
    </div>
  </footer>
</template>

<script setup>
const name = "La P'tite Boutik Solidaire"
const address = '2 rue Jean-Monnet, 29600 Morlaix'
const association = 'Association Bras Ouverts de Morlaix'
const phone = '06 20 70 54 96'
const phoneRaw = '0620705496'
const handle = '@la_ptite_boutik_morlaix'
const currentYear = new Date().getFullYear()
// Sur la propre adresse de la boutique (ou en local), le site de l'association est ailleurs.
const lienAsso = /(^|\.)petite-boutik-solidaire\.pages\.dev$|^localhost$|^127\./.test(window.location.hostname)
  ? 'https://bras-ouverts.pages.dev/'
  : "/"
</script>

<script>
export default {
  methods: {
    openMentions() {
      // dispatch a global event that the Mentions component listens to
      window.dispatchEvent(new Event('open-mentions'))
    }
  }
}
</script>

<style scoped>
.site-footer {
  background: var(--ink);
  color: #fff;
  margin-top: 0;
}
.footer-content {
  max-width: var(--site-max-width, 1120px);
  margin: 0 auto;
  padding: 44px 20px 32px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 28px;
}
.footer-section .footer-title { font-size: 1.3rem; color: #fff; margin-bottom: 10px; }
.footer-section p { color: rgba(255, 255, 255, 0.82); font-size: 0.97rem; margin-bottom: 6px; line-height: 1.5; }
.footer-link { color: #fff; text-decoration: none; font-weight: 700; }
.footer-link:hover { text-decoration: underline; }
.handle { color: rgba(255, 255, 255, 0.82); }
.footer-mentions { background: transparent; border: none; color: #fff; text-decoration: underline; cursor: pointer; font: inherit; padding: 0; }
.footer-mentions:hover { opacity: 0.9; }
.footer-bottom {
  max-width: var(--site-max-width, 1120px);
  margin: 0 auto;
  padding: 18px 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}
.footer-bottom p { margin: 0; }
</style>
