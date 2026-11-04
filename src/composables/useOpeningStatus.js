import { ref, computed, onMounted, onUnmounted } from 'vue'
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { DEFAULT_REGLES, buildOpeningDates, isoDate } from './openingDates.js'

// Composable partagé : données d'ouverture (règles, fermetures, ouvertures exceptionnelles)
// et statut du jour. Utilisé par le calendrier, la barre du bas et le menu.
export function useOpeningStatus() {
  const regles = ref(DEFAULT_REGLES)
  const closures = ref([])
  const extras = ref([])
  const plage = ref('10h00 – 17h30')
  const titre = ref("Calendrier d'ouverture")
  const unsubs = []

  onMounted(() => {
    unsubs.push(onSnapshot(
      query(collection(db, 'fermetures'), orderBy('date')),
      snap => { closures.value = snap.docs.map(d => ({ date: d.data().date, label: d.data().label || '' })) },
      () => {}
    ))
    unsubs.push(onSnapshot(
      query(collection(db, 'ouvertures_exceptionnelles'), orderBy('date')),
      snap => { extras.value = snap.docs.map(d => ({ date: d.data().date, label: d.data().label || '', horaires: d.data().horaires || '' })) },
      () => {}
    ))
    unsubs.push(onSnapshot(doc(db, 'config', 'horaires'), snap => {
      if (!snap.exists()) return
      const d = snap.data()
      regles.value = d.regles?.length ? d.regles : DEFAULT_REGLES
      if (d.plage) plage.value = d.plage
      if (d.titre_calendrier) titre.value = d.titre_calendrier
    }, () => {}))
  })

  onUnmounted(() => unsubs.forEach(u => u()))

  // Toutes les dates à venir (fermées comprises, pour pouvoir les barrer)
  const dates = computed(() =>
    buildOpeningDates({ regles: regles.value, closures: closures.value, extras: extras.value })
  )
  const openDates = computed(() => dates.value.filter(d => !d.closed))

  const todayIso = () => isoDate(new Date())
  const todayEntry = computed(() => openDates.value.find(d => d.iso === todayIso()) || null)
  const openToday = computed(() => !!todayEntry.value)
  const todayHoraires = computed(() => todayEntry.value?.horaires || '')

  const nextDate = computed(() => openDates.value.find(d => d.iso !== todayIso())?.date || null)
  const nextOpening = computed(() =>
    nextDate.value
      ? nextDate.value.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
      : ''
  )

  return { openToday, todayHoraires, nextOpening, nextDate, plage, titre, dates, regles, closures, extras }
}
