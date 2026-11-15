#!/usr/bin/env node
// Après le build : les pages publiques ne doivent charger ni l'outil de détourage (vendor-admin, ~880 Ko)
// ni l'admin. Rollup y rangeait de petits utilitaires communs, et toutes les pages (galerie comprise)
// téléchargeaient alors vendor-admin. Voir manualChunks dans vite.config.js.
import fs from 'node:fs'
const html = fs.readFileSync('dist/boutik/index.html', 'utf8')
const entree = html.match(/<script type="module"[^>]*src="[^"]*\/assets\/([^"]+)"/)?.[1]
if (!entree) { console.error('check-chunks : script principal introuvable dans index.html'); process.exit(1) }
const fautifs = []
if (/vendor-admin|AdminPanel/.test(html.replace(/<script>[\s\S]*?<\/script>/g, ''))) fautifs.push('index.html (modulepreload)')
const code = fs.readFileSync(`dist/boutik/assets/${entree}`, 'utf8')
// Imports statiques du script principal (les import() dynamiques de l'admin sont permis)
for (const m of code.matchAll(/(?:^|[;}\s])import\s*\{?[^"'()]*?\}?\s*from\s*["']\.\/([^"']+)["']/g)) {
  if (/vendor-admin|AdminPanel/.test(m[1])) fautifs.push(`${entree} importe ${m[1]}`)
}
if (fautifs.length) { console.error('❌ Les pages publiques chargent du code réservé à l’admin :\n  ' + fautifs.join('\n  ')); process.exit(1) }
console.log('Découpage OK : pages publiques sans vendor-admin')
