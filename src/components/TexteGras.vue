<template><template v-for="(m, i) in morceaux" :key="i"><strong v-if="m.gras" class="po">{{ m.t }}</strong><template v-else>{{ m.t }}</template></template></template>

<script setup>
// Affiche un texte en mettant « Journée portes ouvertes » (ou « portes ouvertes ») en gras, sans v-html.
import { computed } from 'vue'
import { decouperPortesOuvertes } from '../portesOuvertes.js'

const props = defineProps({ texte: { type: String, default: '' } })
const morceaux = computed(() => decouperPortesOuvertes(props.texte))
</script>
