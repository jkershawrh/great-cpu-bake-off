import { expect, test, type Page } from '@playwright/test'

// Visual baselines must never invoke live model endpoints or capture cluster data.
test.beforeEach(async ({ page }) => {
  await page.route('**/proof/**', (route) => route.abort())
})

async function settle(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1200)
}

test('cinematic opening fits the presentation viewport', async ({ page }) => {
  await page.goto('/')
  await settle(page)
  await expect(page).toHaveScreenshot('opening-v2.png')
})

test('guided architecture stays on one screen', async ({ page }) => {
  await page.goto('/?act=2')
  await settle(page)
  await expect(page).toHaveScreenshot('guided-architecture-v2.png')
})

test('editorial brief and tasting menu carry the campaign system', async ({ page }) => {
  await page.goto('/?act=0')
  await settle(page)
  await page.getByRole('button', { name: /THE CPU OPPORTUNITY/i }).click()
  await page.getByRole('button', { name: /THE EXPENSIVE QUESTION/i }).click()
  await settle(page)
  await expect(page).toHaveScreenshot('brief-reframe-v2.png')
  await page.getByRole('button', { name: /THE BUSINESS OUTCOME/i }).click()
  await settle(page)
  await expect(page).toHaveScreenshot('tasting-menu-v2.png')
})

test('live proof presents three visible lanes', async ({ page }) => {
  await page.goto('/?act=3')
  await settle(page)
  await expect(page).toHaveScreenshot('live-bake-v2.png')
})

test('completed rehearsal evidence flows through judging, resolution, and verdict', async ({ page }) => {
  await page.goto('/?act=3')
  await settle(page)
  await page.getByRole('button', { name: /Run all three/i }).click()
  await expect(page.getByRole('button', { name: 'Run again' })).toBeVisible()
  await page.getByRole('button', { name: /Take it to judging/i }).click()
  await settle(page)
  await expect(page).toHaveScreenshot('judging-v2.png')
  await page.getByRole('button', { name: /Resolve the placement/i }).click()
  await settle(page)
  await expect(page).toHaveScreenshot('resolution-v2.png')
  await page.getByRole('button', { name: /Deliver the verdict/i }).click()
  await settle(page)
  await expect(page).toHaveScreenshot('verdict-v2.png')
})

test('core controls are keyboard reachable', async ({ page }) => {
  await page.goto('/?act=0')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Restart presentation' })).toBeFocused()
})
