<template>
  <div class="products">
    <h2>{{ titreSection }}</h2>
    <p>{{ sousTitre }}</p>
    <ul class="products-list">
      <li v-for="item in products" :key="item.texte">{{ item.texte }}</li>
    </ul>

    <p v-if="phraseMarques" class="brands">{{ phraseMarques }}</p>

    <p class="welcome"><strong>{{ bienvenue }}</strong></p>
  </div>
</template>

<script setup>
// « Ce que nous proposons » en texte : une liste simple, et les marques en une phrase.
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from '../firebase.js'

const titreSection = ref('Ce que nous proposons')
const sousTitre    = ref('Vêtements de seconde main en excellent état :')
const debutMarques = ref('On y trouve de belles marques')
const bienvenue    = ref('Soyez les bienvenu(e)s !')

const DEFAULT_PRODUCTS = [
  { texte: 'Vêtements pour les enfants de 0 à 10 ans' },
  { texte: 'Chaussures' },
  { texte: "Jouets, tapis d'éveil, livres" },
  { texte: 'Matériel de puériculture (poussettes, siège auto, écharpe de portage, chaise haute…)' },
  { texte: 'Vêtements pour futures mamans' },
]
const DEFAULT_BRANDS = ['Sergent Major','Okaidi','Jacadi','Vert Baudet','IKKS','Du Pareil au Même','Petit Bateau','Terre de Marins','Nike']

const products = ref([...DEFAULT_PRODUCTS])
const brands   = ref([...DEFAULT_BRANDS])

// « On y trouve de belles marques : A, B, C et bien d'autres. »
const phraseMarques = computed(() => {
  const liste = brands.value.map((b) => String(b || '').trim()).filter((b) => b && !/^(…|\.\.\.)$/.test(b))
  if (!liste.length) return ''
  const debut = String(debutMarques.value || '').trim().replace(/\s*[:.]\s*$/, '')
  return `${debut} : ${liste.join(', ')} et bien d’autres.`
})

let unsub = null
onMounted(() => {
  unsub = onSnapshot(doc(db, 'config', 'textes'), snap => {
    if (!snap.exists()) return
    const d = snap.data()
    if (d.products_titre)   titreSection.value = d.products_titre
    if (d.products_sous)    sousTitre.value    = d.products_sous
    // L'ancien titre « Des marques de qualité » devient le début de la phrase.
    if (d.products_marques_titre) debutMarques.value = d.products_marques_titre
    if (d.products_bienvenue)     bienvenue.value    = d.products_bienvenue
    if (d.products_items && d.products_items.length)   products.value = d.products_items.filter((i) => i && i.texte)
    if (d.products_brands && d.products_brands.length) brands.value   = d.products_brands
  }, () => {})
})
onUnmounted(() => { if (unsub) unsub() })
</script>

<style scoped>
.products > p { margin-bottom: 14px; color: var(--muted); font-size: 1.1rem; line-height: 1.7; }
.products-list { margin: 0 0 22px; padding-left: 1.3em; font-size: 1.1rem; line-height: 1.8; color: var(--ink); }
.products-list li::marker { color: var(--accent); }
.products > p.brands { color: var(--ink); }
.welcome { font-family: var(--display); font-size: 1.4rem; color: var(--accent); }
.products > p.welcome { color: var(--accent); }
.welcome strong { font-weight: 700; }
</style>
