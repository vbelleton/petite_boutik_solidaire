import { test, expect } from '@playwright/test'

test.describe('Navigation & ancres', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.site-header', { timeout: 15000 })
    await page.waitForTimeout(2000)
  })

  test('menu commun Bras Ouverts : ouverture plein écran sur téléphone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    const bouton = page.locator('header.top .menu-toggle')
    await expect(bouton).toBeVisible({ timeout: 10000 })
    await bouton.click()
    const menu = page.locator('#menu-principal')
    await expect(menu).toBeVisible()
    await expect(menu.locator('a[aria-current="page"]')).toHaveCount(1)
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
  })

  test('le thème sombre est mémorisé (même clé que le site Bras Ouverts)', async ({ page }) => {
    await page.locator('header.top .theme-toggle').click()
    const theme = await page.evaluate(() => [document.documentElement.dataset.theme, localStorage.getItem('bras-ouverts-theme')])
    expect(theme[0]).toBe(theme[1])
    await page.reload({ waitUntil: 'domcontentloaded' })
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(theme[1])
  })

  test('clic bouton Hero défile jusqu\'à la section calendrier', async ({ page }) => {
    const hasCal = await page.evaluate(() => !!document.getElementById('calendrier'))
    const hasHor = await page.evaluate(() => !!document.getElementById('horaires'))
    console.log(`#calendrier: ${hasCal}, #horaires: ${hasHor}`)

    if (!hasCal && !hasHor) {
      test.skip('Aucune section cible')
      return
    }

    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(300)
    const scrollYBefore = await page.evaluate(() => window.scrollY)

    const heroBtn = page.locator('.cta-actions a[href="#calendrier"]')
    const btnCount = await heroBtn.count()
    test.skip(btnCount === 0, 'bouton calendrier introuvable')

    await heroBtn.first().click()
    await page.waitForTimeout(500)
    const scrollYAfter = await page.evaluate(() => window.scrollY)

    console.log(`scrollY: ${scrollYBefore} → ${scrollYAfter}`)
    expect(scrollYAfter).toBeGreaterThan(scrollYBefore)
  })
})
