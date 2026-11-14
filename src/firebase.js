import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDaNRFLH7axpTrv8Es16_3gJeWKmUMloIo",
  authDomain: "la-petite-boutik.firebaseapp.com",
  projectId: "la-petite-boutik",
  storageBucket: "la-petite-boutik.appspot.com",
  messagingSenderId: "502164719625",
  appId: "1:502164719625:web:8a2daf9222a3a3970e90d8"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
// Site public : les données Firestore sont gardées dans le navigateur (IndexedDB). À la visite suivante,
// textes, horaires et rubriques s'affichent tout de suite, puis se mettent à jour. L'admin lit toujours en direct.
const surAdmin = typeof window !== 'undefined' && /\/admin(\/|$)/.test(window.location.pathname)
function creerDb() {
  if (surAdmin) return getFirestore(app)
  try {
    return initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })
  } catch {
    return getFirestore(app)
  }
}
export const db = creerDb()
export const storage = getStorage(app)
