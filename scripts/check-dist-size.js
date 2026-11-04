#!/usr/bin/env node
// Après le build : Cloudflare Pages refuse tout fichier de plus de 25 Mio.
// Alerte à partir de 22 Mio, échec au-delà de 25 Mio (le site en ligne reste
// alors sur la version précédente au lieu d'un déploiement à moitié cassé).
import fs from 'node:fs'
import path from 'node:path'

const DIST = path.join(process.cwd(), 'dist')
const LIMIT = 25 * 1024 * 1024
const WARN = 22 * 1024 * 1024
const mib = (n) => (n / 1048576).toFixed(2) + ' Mio'

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const full = path.join(dir, e.name)
    return e.isDirectory() ? walk(full) : [full]
  })
}

const files = walk(DIST).map(f => ({ file: path.relative(process.cwd(), f), size: fs.statSync(f).size }))
const tooBig = files.filter(f => f.size > LIMIT)
const close = files.filter(f => f.size > WARN && f.size <= LIMIT)

for (const f of close) console.warn(`⚠️  ${f.file} pèse ${mib(f.size)} : proche de la limite Cloudflare de 25 Mio`)
if (tooBig.length) {
  for (const f of tooBig) console.error(`❌ ${f.file} pèse ${mib(f.size)} : au-delà de la limite Cloudflare de 25 Mio`)
  process.exit(1)
}
const biggest = files.sort((a, b) => b.size - a.size)[0]
console.log(`Taille du build OK (${files.length} fichiers, le plus lourd : ${biggest ? mib(biggest.size) : '0'})`)
