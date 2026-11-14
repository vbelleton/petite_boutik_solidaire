<template>
  <section class="contact">
    <h2>{{ titre }}</h2>
    <div class="contact-grid">
      <div class="contact-info">
        <dl class="info-list">
          <div class="info-group">
            <dt><span aria-hidden="true">📍</span> Adresse</dt>
            <dd>{{ address }}</dd>
          </div>
          <div class="info-group">
            <dt><span aria-hidden="true">📞</span> Téléphone</dt>
            <dd><a :href="'tel:' + phoneRaw" class="phone-link">{{ phone }}</a></dd>
          </div>
          <div class="info-group">
            <dt><span aria-hidden="true">🅿️</span> Parking</dt>
            <dd>Disponible sur place</dd>
          </div>
        </dl>
        <!-- Nous écrire : le formulaire est celui du site Bras Ouverts (pas d'adresse e-mail affichée) -->
        <div class="ecrire">
          <h3>Nous écrire</h3>
          <p>{{ ecrireTexte }}</p>
          <a :href="lienContact" class="btn">Écrire un message</a>
        </div>
      </div>
      <div class="contact-map">
        <iframe
          :src="mapUrl"
          title="Carte Google Maps — La P'tite Boutik Solidaire"
          width="100%"
          height="360"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
        <a
          :href="'https://maps.google.com/?q=' + addressEncoded"
          target="_blank"
          rel="noopener noreferrer"
          class="maps-link"
          aria-label="Ouvrir l'itinéraire dans Google Maps (nouvel onglet)"
        >Ouvrir l’itinéraire →</a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useTextes } from '../composables/useTextes.js'

const textes = useTextes()
const titre = computed(() => textes.value.contact_titre || 'Nous trouver et nous écrire')
const ecrireTexte = computed(() => textes.value.contact_ecrire || 'Une question sur la boutique ou un don ? Laissez-nous un message : nous répondons à tous les messages.')
// Sur brasouverts.bzh (boutique sous /boutik/), le formulaire est sur la même adresse ;
// sur petite-boutik-solidaire.pages.dev ou en local, on renvoie vers le site Bras Ouverts.
const surBoutikSeule = typeof window !== 'undefined' && /(^|\.)petite-boutik-solidaire\.pages\.dev$|^localhost$|^127\./.test(window.location.hostname)
const lienContact = surBoutikSeule ? 'https://bras-ouverts.pages.dev/#contact' : '/#contact'
const address = computed(() => textes.value.contact_address || '2 rue Jean-Monnet, 29600 Morlaix')
const phone = computed(() => textes.value.contact_phone || '06 20 70 54 96')
const phoneRaw = computed(() => textes.value.contact_phone_raw || '0620705496')
const mapUrl = computed(() => textes.value.contact_map_url || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2688.5!2d-3.8275!3d48.5775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s2+Rue+Jean+Monnet%2C+29600+Morlaix!5e0!3m2!1sfr!2sfr!4v1700000000000')
const addressEncoded = computed(() => address.value.replace(/ /g, '+'))
</script>

<style scoped>
.contact-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
  gap: 28px;
  align-items: start;
}
.contact-info { display: grid; gap: 16px; }
.info-list { display: grid; gap: 12px; margin: 0; }
.info-group { padding: 16px 20px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--r); }
.info-group dt { font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); font-weight: 700; }
.info-group dd { margin: 4px 0 0; font-size: 1.1rem; font-weight: 700; color: var(--ink); }
.phone-link { color: var(--accent); text-decoration: none; }
.phone-link:hover { text-decoration: underline; }
.ecrire {
  display: grid;
  gap: 10px;
  padding: 22px;
  border-radius: calc(var(--r) + 4px);
  background: linear-gradient(150deg, var(--lagon-doux), var(--surface) 75%);
  border: 1px solid var(--line);
}
.ecrire h3 { font-size: 1.4rem; color: var(--ink); }
.ecrire p { color: var(--ink); }
.ecrire .btn { justify-self: start; }
.contact-map { display: grid; gap: 10px; }
.contact-map iframe { width: 100%; height: 360px; border: 1px solid var(--line); border-radius: var(--r); background: var(--soft); }
.maps-link { font-weight: 700; color: var(--accent); }
@media (max-width: 800px) {
  .contact-grid { grid-template-columns: minmax(0, 1fr); }
  .contact-map iframe { height: 280px; }
}
</style>
