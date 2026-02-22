// /tmp/playwright-test-visual.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const TARGET_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = '/tmp/hubso-screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const PAGES = [
  { path: '/', name: 'home', desc: 'Strona główna platformy' },
  { path: '/feed', name: 'feed', desc: 'Feed postów' },
  { path: '/groups', name: 'groups', desc: 'Grupy' },
  { path: '/courses', name: 'courses', desc: 'Kursy' },
  { path: '/events', name: 'events', desc: 'Wydarzenia' },
  { path: '/forums', name: 'forums', desc: 'Fora' },
  { path: '/members', name: 'members', desc: 'Członkowie' },
  { path: '/messages', name: 'messages', desc: 'Wiadomości' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  let passed = 0;
  let failed = 0;

  for (const p of PAGES) {
    try {
      console.log(`\n📸 Testuję: ${p.desc} (${p.path})`);
      await page.goto(`${TARGET_URL}${p.path}`, { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(1500);

      const title = await page.title();
      const h1Text = await page.locator('h1').first().textContent().catch(() => '(brak h1)');
      const statusCode = await page.evaluate(() => document.readyState);
      const hasError = await page.locator('[data-nextjs-error]').count();
      const bodyVisibility = await page.locator('body').isVisible();

      if (hasError > 0) {
        console.log(`  ❌ BŁĄD Next.js na stronie!`);
        failed++;
      } else {
        console.log(`  ✅ Status: ${statusCode} | Tytuł: "${title}" | H1: "${h1Text?.trim()}"`);
        console.log(`  ✅ Body widoczny: ${bodyVisibility}`);
        passed++;
      }

      await page.screenshot({ path: `${SCREENSHOT_DIR}/${p.name}.png`, fullPage: true });
      console.log(`  📷 Screenshot: ${SCREENSHOT_DIR}/${p.name}.png`);

    } catch (err) {
      console.log(`  ❌ WYJĄTEK: ${err.message}`);
      failed++;
    }
  }

  // Also test mobile viewport
  const mobilePage = await context.newPage();
  await mobilePage.setViewportSize({ width: 375, height: 812 });
  await mobilePage.goto(`${TARGET_URL}/`, { waitUntil: 'load', timeout: 20000 });
  await mobilePage.screenshot({ path: `${SCREENSHOT_DIR}/home-mobile.png`, fullPage: false });
  console.log(`\n📱 Mobile screenshot: ${SCREENSHOT_DIR}/home-mobile.png`);
  await mobilePage.close();

  await browser.close();

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Passed: ${passed}/${PAGES.length}`);
  console.log(`❌ Failed: ${failed}/${PAGES.length}`);
  console.log(`\nScreenshoty zapisane w: ${SCREENSHOT_DIR}/`);
  console.log(`Otwórz: open ${SCREENSHOT_DIR}`);
})();
