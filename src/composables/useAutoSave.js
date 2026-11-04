import { ref, watch } from 'vue'

// Enregistrement automatique : appelle save() 1 s après la dernière modification.
// - source : fonction qui renvoie les données à surveiller
// - save(current, previous) : écrit dans Firestore (previous = dernière version enregistrée)
// Appeler markSaved() après chaque chargement depuis Firestore, pour ne pas
// renvoyer au serveur ce qui vient d'en arriver.
export function useAutoSave(source, save, { delay = 1000 } = {}) {
  const status = ref('') // '', 'pending', 'saving', 'saved', 'error'
  let baseline = null    // null tant que rien n'est chargé : aucune écriture
  let timer = null
  let hideTimer = null
  const snapshot = () => JSON.stringify(source())

  const markSaved = () => { baseline = snapshot() }
  // Vrai quand l'admin a tapé quelque chose qui n'est pas encore enregistré :
  // dans ce cas, ne pas écraser sa saisie avec les données reçues de Firestore.
  const isDirty = () => baseline !== null && snapshot() !== baseline

  const flush = async () => {
    clearTimeout(timer)
    const json = snapshot()
    if (baseline === null || json === baseline) return
    const previous = JSON.parse(baseline)
    status.value = 'saving'
    try {
      await save(JSON.parse(json), previous)
      baseline = json
      status.value = 'saved'
      clearTimeout(hideTimer)
      hideTimer = setTimeout(() => { if (status.value === 'saved') status.value = '' }, 2500)
    } catch (e) {
      console.error(e)
      status.value = 'error'
    }
  }

  watch(source, () => {
    if (baseline === null || snapshot() === baseline) return
    status.value = 'pending'
    clearTimeout(timer)
    timer = setTimeout(flush, delay)
  }, { deep: true })

  // Ne pas perdre une modification si on ferme l'onglet juste après avoir tapé
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', (e) => {
      if (status.value === 'pending' || status.value === 'saving') { flush(); e.preventDefault() }
    })
  }

  return { status, markSaved, isDirty, flush }
}
