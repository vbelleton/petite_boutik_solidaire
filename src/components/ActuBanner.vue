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
/* Actualité : carte posée sous le titre de la page, liseré de couleur selon le type */
.actu-banner {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  max-width: var(--site-max-width, 1120px);
  margin: 0 auto 24px;
  width: calc(100% - 40px);
  padding: 16px 20px;
  border-radius: var(--r);
  background: var(--surface);
  border: 1px solid var(--line);
  border-left: 6px solid var(--accent);
}
.actu-banner.warning { border-left-color: #c98a00; background: #fff8e6; }
.actu-icon { font-size: 1.3em; flex-shrink: 0; }
.actu-content strong { display: block; font-size: 1rem; font-weight: 800; line-height: 1.35; margin-bottom: 4px; color: var(--ink); }
.actu-content p { font-size: 0.95rem; color: var(--muted); margin: 0; }
</style>
