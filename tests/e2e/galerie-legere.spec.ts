import { test, expect } from '@playwright/test'

// Galerie de la boutique : légère à charger, et sans demandes inutiles au Worker des photos
// (chaque demande compte dans le quota Cloudflare du compte, partagé avec les autres sites).

// Le chargement de vendor-admin par les pages publiques est vérifié au build (scripts/check-chunks.js) :
// en mode dev, Vite ne découpe pas en fichiers.

test('la première photo du diaporama n’attend pas le chargement différé', async ({ page }) => {
  await page.goto('/boutik/galerie')
  const imgs = page.locator('.gallery-container .swiper-slide img')
  await imgs.first().waitFor({ state: 'attached', timeout: 15000 }).catch(() => {})
  test.skip((await imgs.count()) === 0, 'aucune photo')
  expect(await imgs.first().getAttribute('loading')).toBe('eager')
})

test('allegerImage réduit une grande photo et garde la transparence', async ({ page }) => {
  await page.goto('/boutik/')
  const r = await page.evaluate(async () => {
    const { allegerImage, COTE_MAX } = await import('/boutik/src/allegerImage.js')
    async function fabrique(l: number, h: number, type: string, transparent: boolean) {
      const c = document.createElement('canvas'); c.width = l; c.height = h
      const x = c.getContext('2d')!
      for (let i = 0; i < 1500; i++) { x.fillStyle = `hsl(${(i * 37) % 360},70%,50%)`; x.fillRect((i * 97) % l, (i * 61) % h, 80, 80) }
      if (transparent) x.clearRect(0, 0, l / 3, h)
      const b: Blob = await new Promise((ok) => c.toBlob((v) => ok(v!), type, 0.98))
      return new File([b], 'photo.' + (type === 'image/png' ? 'png' : 'jpg'), { type })
    }
    const mesure = async (f: File) => { const b = await createImageBitmap(f); return { l: b.width, h: b.height, type: f.type } }
    const grande = await fabrique(4000, 3000, 'image/jpeg', false)
    const detouree = await fabrique(3000, 4000, 'image/png', true)
    const petite = await fabrique(800, 600, 'image/jpeg', false)
    const g = await allegerImage(grande), d = await allegerImage(detouree), p = await allegerImage(petite)
    return { COTE_MAX, g: await mesure(g), d: await mesure(d), petiteIntacte: p === petite }
  })
  expect(Math.max(r.g.l, r.g.h)).toBe(r.COTE_MAX)
  expect(r.g.type).toBe('image/jpeg')
  expect(Math.max(r.d.l, r.d.h)).toBe(r.COTE_MAX)
  expect(['image/webp', 'image/png']).toContain(r.d.type)
  expect(r.petiteIntacte).toBe(true)
})
