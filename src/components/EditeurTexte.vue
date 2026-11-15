<template>
  <div class="editeur">
    <div class="editeur-outils" role="toolbar" aria-label="Mise en forme">
      <button type="button" title="Gras (Ctrl+B)" @mousedown.prevent @click="cmd('bold')"><b>G</b></button>
      <button type="button" title="Italique (Ctrl+I)" @mousedown.prevent @click="cmd('italic')"><i>I</i></button>
      <button type="button" title="Souligné (Ctrl+U)" @mousedown.prevent @click="cmd('underline')"><u>S</u></button>
      <button type="button" title="Liste à puces" @mousedown.prevent @click="cmd('insertUnorderedList')">• Liste</button>
      <button type="button" title="Ajouter un lien" @mousedown.prevent @click="lien">🔗 Lien</button>
      <button type="button" title="Enlever la mise en forme" @mousedown.prevent @click="cmd('removeFormat')">✕ Effacer</button>
    </div>
    <div
      ref="zone"
      class="editeur-zone"
      contenteditable="true"
      role="textbox"
      aria-multiline="true"
      :data-vide="vide ? placeholder : null"
      @input="envoyer"
      @blur="envoyer"
    ></div>
  </div>
</template>

<script setup>
// Éditeur simple pour les bénévoles : on sélectionne un mot, on clique sur G ou I.
// Le contenu est envoyé en HTML ; le site le nettoie avant de l'afficher (texteRiche.js).
import { ref, onMounted, watch } from 'vue'
import { versHtml } from '../texteRiche.js'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])
const zone = ref(null)
const vide = ref(true)
let dernier = null

const majVide = () => { vide.value = !(zone.value && zone.value.textContent.trim()) }

// On ne réécrit la zone que si la valeur vient d'ailleurs (chargement) : sinon le curseur sauterait.
const remplir = (v) => {
  if (!zone.value || v === dernier) return
  zone.value.innerHTML = versHtml(v || '')
  dernier = v
  majVide()
}
onMounted(() => remplir(props.modelValue))
watch(() => props.modelValue, remplir)

function envoyer() {
  if (!zone.value) return
  majVide()
  const html = vide.value ? '' : zone.value.innerHTML
  if (html === dernier) return
  dernier = html
  emit('update:modelValue', html)
}
function cmd(nom, valeur) {
  zone.value?.focus()
  document.execCommand(nom, false, valeur)
  envoyer()
}
function lien() {
  const url = window.prompt('Adresse du lien (https://…)')
  if (url && /^(https?:|mailto:|tel:|\/|#)/i.test(url.trim())) cmd('createLink', url.trim())
}
</script>

<style scoped>
.editeur { width: 100%; border: 1px solid #ddd; border-radius: 6px; background: #fff; }
.editeur:focus-within { border-color: #1BA9A8; }
.editeur-outils { display: flex; flex-wrap: wrap; gap: 4px; padding: 6px; border-bottom: 1px solid #eee; background: #f7f7f7; border-radius: 6px 6px 0 0; }
.editeur-outils button { min-width: 34px; padding: 4px 10px; border: 1px solid #ddd; border-radius: 5px; background: #fff; cursor: pointer; font-size: 0.9em; color: #333; }
.editeur-outils button:hover { border-color: #1BA9A8; color: #1BA9A8; }
.editeur-zone { min-height: 110px; padding: 10px 12px; outline: none; font-size: 0.95em; line-height: 1.5; color: #222; }
.editeur-zone[data-vide]::before { content: attr(data-vide); color: #999; pointer-events: none; display: block; height: 0; }
.editeur-zone :deep(ul) { padding-left: 1.4em; margin: 4px 0; }
.editeur-zone :deep(a) { color: #1BA9A8; }
</style>
