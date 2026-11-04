<template>
  <aside class="actu-banner" v-if="actu.visible && actu.titre" :class="actu.type" aria-label="Actualité">
    <span class="actu-icon" aria-hidden="true">{{ icons[actu.type] }}</span>
    <div class="actu-content">
      <strong>{{ actu.titre }}</strong>
      <p v-if="actu.message">{{ actu.message }}</p>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase.js'

const actu = ref({ visible: false, titre: '', message: '', type: 'info' })
const icons = { info: 'ℹ️', warning: '⚠️', success: '✅' }

let unsubscribe = null
onMounted(() => {
  unsubscribe = onSnapshot(doc(db, 'config', 'actualite'), snap => {
    if (snap.exists()) Object.assign(actu.value, snap.data())
  }, () => {})
})
onUnmounted(() => { if (unsubscribe) unsubscribe() })
</script>

<style scoped>
.actu-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 10px;
  margin-bottom: 16px;
  border: 2px solid;
}

/* Fond sable comme les autres blocs, liseré de couleur selon le type */
.actu-banner.info,
.actu-banner.success {
  background: linear-gradient(135deg, #FFF9F0 0%, #F5E6D3 100%);
  border: none;
  border-left: 5px solid var(--primary-teal);
}
.actu-banner.warning {
  background: #FFF6E0;
  border: none;
  border-left: 5px solid #E0A100;
}

.actu-icon { font-size: 1.3em; flex-shrink: 0; }

.actu-content strong {
  display: block;
  font-size: 0.95em;
  margin-bottom: 3px;
  color: #333;
}
.actu-content p {
  font-size: 0.88em;
  color: #555;
  margin: 0;
}
</style>
