<template>
  <div class="recadre" role="dialog" aria-label="Recadrer l'image">
    <p class="recadre-aide">Glissez l'image pour la placer, réglez le zoom : le carré est ce qui apparaîtra dans l'onglet.</p>
    <canvas
      ref="cadre"
      :width="TAILLE"
      :height="TAILLE"
      class="recadre-zone"
      @pointerdown="debut"
      @pointermove="deplace"
      @pointerup="fin"
      @pointercancel="fin"
    ></canvas>
    <label class="recadre-zoom">Zoom
      <input type="range" min="1" max="4" step="0.01" v-model.number="zoom" @input="dessiner" />
    </label>
    <div class="recadre-apercu">
      <span>Aperçu :</span>
      <canvas ref="petit" width="32" height="32"></canvas>
      <canvas ref="moyen" width="64" height="64"></canvas>
    </div>
    <div class="recadre-actions">
      <button type="button" class="btn-save" @click="valider" :disabled="!pret">Utiliser ce cadrage</button>
      <button type="button" class="btn-add-regle" @click="$emit('annule')">Annuler</button>
    </div>
  </div>
</template>

<script setup>
// Recadrage carré d'une image choisie (favicon) : on la déplace sous un cadre fixe, on règle le zoom,
// puis on exporte un PNG 256 × 256 (la transparence est conservée).
import { ref, onMounted } from 'vue'

const props = defineProps({ fichier: { type: File, required: true } })
const emit = defineEmits(['valide', 'annule'])

const TAILLE = 280
const SORTIE = 256
const cadre = ref(null)
const petit = ref(null)
const moyen = ref(null)
const zoom = ref(1)
const pret = ref(false)
let img = null
let x = 0, y = 0            // décalage du centre de l'image par rapport au centre du cadre (px écran)
let glisse = null

// Échelle de base : l'image entière tient dans le carré (zoom 1) ; le zoom la rapproche.
const echelle = () => (TAILLE / Math.max(img.width, img.height)) * zoom.value
function borner() {
  const l = img.width * echelle(), h = img.height * echelle()
  x = Math.min(Math.max(x, -Math.max(0, (l - TAILLE) / 2)), Math.max(0, (l - TAILLE) / 2))
  y = Math.min(Math.max(y, -Math.max(0, (h - TAILLE) / 2)), Math.max(0, (h - TAILLE) / 2))
}
function peindre(canvas, taille) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, taille, taille)
  const k = taille / TAILLE
  const l = img.width * echelle() * k, h = img.height * echelle() * k
  ctx.drawImage(img, taille / 2 + x * k - l / 2, taille / 2 + y * k - h / 2, l, h)
}
function dessiner() {
  if (!img) return
  borner()
  const c = cadre.value
  const ctx = c.getContext('2d')
  // Damier léger : on voit les zones transparentes
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, TAILLE, TAILLE)
  ctx.fillStyle = '#eee'
  for (let i = 0; i < TAILLE; i += 20) for (let j = 0; j < TAILLE; j += 20) if ((i / 20 + j / 20) % 2 === 0) ctx.fillRect(i, j, 20, 20)
  const l = img.width * echelle(), h = img.height * echelle()
  ctx.drawImage(img, TAILLE / 2 + x - l / 2, TAILLE / 2 + y - h / 2, l, h)
  peindre(petit.value, 32)
  peindre(moyen.value, 64)
}
function debut(e) { glisse = { px: e.clientX, py: e.clientY, x, y }; e.target.setPointerCapture?.(e.pointerId) }
function deplace(e) {
  if (!glisse) return
  const r = cadre.value.getBoundingClientRect(), k = TAILLE / r.width
  x = glisse.x + (e.clientX - glisse.px) * k
  y = glisse.y + (e.clientY - glisse.py) * k
  dessiner()
}
function fin() { glisse = null }

function valider() {
  const sortie = document.createElement('canvas')
  sortie.width = sortie.height = SORTIE
  peindre(sortie, SORTIE)
  sortie.toBlob((b) => { if (b) emit('valide', new File([b], 'favicon.png', { type: 'image/png' })) }, 'image/png')
}

onMounted(async () => {
  const url = URL.createObjectURL(props.fichier)
  try {
    const i = new Image()
    i.src = url
    await i.decode()
    img = i
    pret.value = true
    dessiner()
  } catch (e) {
    emit('annule')
  } finally {
    URL.revokeObjectURL(url)
  }
})
</script>

<style scoped>
.recadre { display: grid; gap: 10px; max-width: 320px; padding: 12px; border: 1px solid #ddd; border-radius: 10px; background: #fff; }
.recadre-aide { font-size: 0.85em; color: #666; margin: 0; }
.recadre-zone { width: 100%; max-width: 280px; aspect-ratio: 1; border: 1px solid #ccc; border-radius: 8px; cursor: grab; touch-action: none; }
.recadre-zone:active { cursor: grabbing; }
.recadre-zoom { display: flex; align-items: center; gap: 10px; font-size: 0.9em; }
.recadre-zoom input { flex: 1; }
.recadre-apercu { display: flex; align-items: center; gap: 10px; font-size: 0.85em; color: #666; }
.recadre-apercu canvas { border: 1px solid #ddd; border-radius: 4px; background: #f5f5f5; }
.recadre-actions { display: flex; gap: 8px; flex-wrap: wrap; }
</style>
