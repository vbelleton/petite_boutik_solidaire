<template>
  <div class="products">
    <h2>{{ titreSection }}</h2>
    <p>{{ sousTitre }}</p>
    <div class="products-list">
      <div class="product-item" v-for="item in products" :key="item.texte">
        <span class="product-icon">{{ item.emoji || '👕' }}</span>
        <span>{{ item.texte }}</span>
      </div>
    </div>

    <div class="brands">
      <h3>{{ titreMarques }}</h3>
      <div class="brands-list">
        <span class="brand-tag" v-for="brand in brands" :key="brand">{{ brand }}</span>
      </div>
    </div>

    <div class="prices">
      <h3>{{ titreTarifs }}</h3>
      <div class="prices-grid">
        <div class="price-item" v-for="p in prices" :key="p.label">
          <span class="price-label">{{ p.label }}</span>
          <span class="price-value">{{ p.price }}</span>
        </div>
      </div>
    </div>

    <p class="welcome"><strong>{{ bienvenue }}</strong></p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from '../firebase.js'

const titreSection = ref('Ce que nous proposons')
const sousTitre    = ref('Vêtements de seconde main en excellent état :')
const titreMarques = ref('Des marques de qualité')
const titreTarifs  = ref('Exemples de tarifs')
const bienvenue    = ref('Soyez les bienvenu(e)s !')

const DEFAULT_PRODUCTS = [
  { emoji: '👕', texte: 'Vêtements pour les enfants de 0 à 10 ans' },
  { emoji: '👟', texte: 'Chaussures' },
  { emoji: '🧸', texte: "Jouets, tapis d'éveil, livres" },
  { emoji: '🛒', texte: 'Matériel de puériculture (poussettes, siège auto, écharpe de portage, chaise haute…)' },
  { emoji: '🤱', texte: 'Vêtements pour futures mamans' },
]
const DEFAULT_BRANDS = ['Sergent Major','Okaidi','Jacadi','Vert Baudet','IKKS','Du Pareil au Même','Petit Bateau','Terre de Marins','Nike','…']
const DEFAULT_PRICES = [
  { label: 'Hauts', price: '1,00 €' },
  { label: 'Bas',   price: '1,50 €' },
  { label: 'Chaussures', price: '2,00 €' },
]

const products = ref([...DEFAULT_PRODUCTS])
const brands   = ref([...DEFAULT_BRANDS])
const prices   = ref([...DEFAULT_PRICES])

let unsub = null
onMounted(() => {
  unsub = onSnapshot(doc(db, 'config', 'textes'), snap => {
    if (!snap.exists()) return
    const d = snap.data()
    if (d.products_titre)   titreSection.value = d.products_titre
    if (d.products_sous)    sousTitre.value    = d.products_sous
    if (d.products_marques_titre) titreMarques.value = d.products_marques_titre
    if (d.products_tarifs_titre)  titreTarifs.value  = d.products_tarifs_titre
    if (d.products_bienvenue)     bienvenue.value    = d.products_bienvenue
    if (d.products_items && d.products_items.length)   products.value = d.products_items
    if (d.products_brands && d.products_brands.length) brands.value   = d.products_brands
    if (d.products_prices && d.products_prices.length) prices.value   = d.products_prices
  }, () => {})
})
onUnmounted(() => { if (unsub) unsub() })
</script>

<style scoped>
.products > p { margin-bottom: 18px; color: var(--muted); font-size: 1.05rem; }
.products-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  margin: 0 0 36px;
}
.product-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r);
  font-weight: 600;
}
.product-icon { display: grid; place-items: center; flex: none; width: 44px; height: 44px; border-radius: 12px; background: var(--corail-doux); font-size: 1.3em; }
.product-item:nth-child(2n) .product-icon { background: var(--lagon-doux); }
.brands { margin-bottom: 36px; }
.brands h3, .prices h3 { font-size: 1.3rem; margin-bottom: 14px; color: var(--ink); }
.brands-list { display: flex; flex-wrap: wrap; gap: 8px; }
.brand-tag {
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--line);
  font-family: var(--display);
  font-style: italic;
  color: var(--ink);
}
.prices-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; margin-bottom: 28px; }
.price-item {
  display: grid;
  gap: 4px;
  padding: 20px;
  border-radius: calc(var(--r) + 4px);
  background: linear-gradient(150deg, var(--corail-doux), var(--surface) 75%);
  border: 1px solid var(--line);
}
.price-label { font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700; color: var(--muted); }
.price-value { font-family: var(--display); font-size: 2rem; font-weight: 700; line-height: 1.1; color: var(--corail); }
.welcome { font-family: var(--display); font-size: 1.4rem; color: var(--accent); }
.welcome strong { font-weight: 700; }
</style>
