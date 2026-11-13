#!/usr/bin/env node
// Après `vite build` (sortie dans dist/boutik) : pose à la racine de dist/ les fichiers que
// Cloudflare Pages lit à la racine (_redirects, _headers) et l'ancien service worker qui se désinstalle.
import fs from 'node:fs'
for (const f of fs.readdirSync('racine')) fs.copyFileSync(`racine/${f}`, `dist/${f}`)
for (const f of ['robots.txt', 'favicon.png']) if (fs.existsSync(`dist/boutik/${f}`)) fs.copyFileSync(`dist/boutik/${f}`, `dist/${f}`)
console.log('Racine du déploiement prête : dist/_redirects, dist/_headers, dist/sw.js')
