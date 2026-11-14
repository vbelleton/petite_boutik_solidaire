<template>
  <section class="social-media">
    <h2>{{ titre }}</h2>
    <p class="social-subtitle">Retrouvez nos actualités et derniers arrivages sur nos réseaux</p>
    <div class="social-cards">
      <a :href="facebookUrl" target="_blank" rel="noopener noreferrer" class="social-card facebook">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="social-icon" aria-hidden="true" focusable="false">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        <div class="social-card-text">
          <span class="social-name">Facebook</span>
          <span class="social-handle">{{ facebookHandle }}</span>
          <span class="sr-only">(nouvel onglet)</span>
        </div>
      </a>
      <a :href="instagramUrl" target="_blank" rel="noopener noreferrer" class="social-card instagram">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="social-icon" aria-hidden="true" focusable="false">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
        <div class="social-card-text">
          <span class="social-name">Instagram</span>
          <span class="social-handle">{{ instagramHandle }}</span>
          <span class="sr-only">(nouvel onglet)</span>
        </div>
      </a>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from '../firebase.js'

const titre = ref('Suivez-nous !')
const facebookUrl = ref('https://www.facebook.com/people/La-Ptite-Boutik-Solidaire-Morlaix/61581840912607/')
const facebookHandle = ref('La P\'tite Boutik Solidaire')
const instagramUrl = ref('https://www.instagram.com/la_ptite_boutik_morlaix/')
const instagramHandle = ref('@la_ptite_boutik_morlaix')

onMounted(() => {
  onSnapshot(doc(db, 'config', 'textes'), snap => {
    if (!snap.exists()) return
    const d = snap.data()
    if (d.social_titre)        titre.value        = d.social_titre
    if (d.social_facebook_url) facebookUrl.value  = d.social_facebook_url
    if (d.social_facebook_handle) facebookHandle.value = d.social_facebook_handle
    if (d.social_instagram_url) instagramUrl.value = d.social_instagram_url
    if (d.social_instagram_handle) instagramHandle.value = d.social_instagram_handle
  })
})
</script>

<style scoped>
.social-subtitle { color: var(--muted); font-size: 1.05rem; margin-bottom: 22px; }
.social-cards { display: flex; gap: 14px; flex-wrap: wrap; }
.social-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 24px 16px 18px;
  border-radius: 999px;
  text-decoration: none;
  color: #fff;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-width: 240px;
}
.social-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(31, 42, 58, 0.18); text-decoration: none; }
.social-card.facebook { background: #1464D2; }
.social-card.instagram { background: linear-gradient(45deg, #c8541d, #dc2743, #bc1888); }
.social-icon { width: 34px; height: 34px; flex-shrink: 0; }
.social-card-text { display: flex; flex-direction: column; text-align: left; line-height: 1.3; }
.social-name { font-size: 1.1em; font-weight: 800; }
.social-handle { font-size: 0.88em; font-weight: 400; }
</style>
