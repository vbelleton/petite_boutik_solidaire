#!/usr/bin/env node
// Après `vite build` (sortie dans dist/boutik) : pose à la racine de dist/ les fichiers que
// Cloudflare Pages lit à la racine (_redirects, _headers) et l'ancien service worker qui se désinstalle.
import fs from 'node:fs'
for (const f of fs.readdirSync('racine')) fs.copyFileSync(`racine/${f}`, `dist/${f}`)
for (const f of ['robots.txt', 'favicon.png']) if (fs.existsSync(`dist/boutik/${f}`)) fs.copyFileSync(`dist/boutik/${f}`, `dist/${f}`)

// Pages de l'application sans fichier propre (/boutik/admin, /boutik/galerie…) : Cloudflare Pages
// répondait 404 malgré la règle de réécriture de _redirects. On pose donc une vraie copie de
// index.html dans chaque dossier (les chemins des scripts sont absolus, /boutik/assets/…).
const PAGES = ['admin', 'galerie', 'mentions']
const index = fs.readFileSync('dist/boutik/index.html')
for (const p of PAGES) {
  fs.mkdirSync(`dist/boutik/${p}`, { recursive: true })
  fs.writeFileSync(`dist/boutik/${p}/index.html`, index)
}
console.log(`Racine du déploiement prête : dist/_redirects, dist/_headers, dist/sw.js, pages ${PAGES.join(', ')}`)
