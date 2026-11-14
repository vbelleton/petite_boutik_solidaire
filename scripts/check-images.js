#!/usr/bin/env node
// Garde-fou : chaque image de dist/ doit vraiment être du format que son extension annonce.
// Le 14/11/2026, placeholder.jpg était un SVG : indécodable, l'image de secours était redemandée
// sans fin par le navigateur et a épuisé le quota Cloudflare du compte. Le build échoue désormais.
import fs from 'node:fs'
import path from 'node:path'

const SIGNATURES = {
  '.jpg': (b) => b[0] === 0xff && b[1] === 0xd8,
  '.jpeg': (b) => b[0] === 0xff && b[1] === 0xd8,
  '.png': (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  '.gif': (b) => b.subarray(0, 4).toString('latin1') === 'GIF8',
  '.webp': (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP',
  '.svg': (b) => /<svg[\s>]/i.test(b.subarray(0, 2000).toString('utf8')),
}

function walk(dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

const fautifs = walk('dist').filter((f) => {
  const ok = SIGNATURES[path.extname(f).toLowerCase()]
  return ok && !ok(fs.readFileSync(f))
})
if (fautifs.length) {
  console.error('❌ Images dont le contenu ne correspond pas à l’extension (le navigateur ne pourra pas les afficher) :')
  for (const f of fautifs) console.error('   - ' + f)
  process.exit(1)
}
console.log('Images OK : contenu conforme à l’extension')
