const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const screenshotDir = process.env.SCREENSHOT_DIR || path.join(root, 'test-output');
let swVariant = 'a';

const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8'
};

function serveFile(request, response) {
  const url = new URL(request.url, 'http://127.0.0.1');
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.resolve(root, '.' + pathname);
  if (!filePath.startsWith(root + path.sep)) {
    response.writeHead(403).end();
    return;
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    response.writeHead(404).end('Not found');
    return;
  }
  let body = fs.readFileSync(filePath);
  if (pathname === '/sw.js') {
    body = Buffer.from(body.toString('utf8').replace("'seoul-trip-v1.9.1'", "'seoul-trip-v1.9.1-" + swVariant + "'"));
  }
  response.writeHead(200, {
    'Content-Type': mime[path.extname(filePath)] || 'application/octet-stream',
    'Cache-Control': 'no-store'
  });
  response.end(body);
}

async function main() {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const server = http.createServer(serveFile);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const origin = 'http://127.0.0.1:' + port;
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    colorScheme: 'dark',
    serviceWorkers: 'allow'
  });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push('page: ' + error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push('console: ' + message.text());
  });
  page.on('response', response => {
    if (response.status() >= 400) errors.push('HTTP ' + response.status() + ': ' + response.url());
  });

  try {
    const response = await page.goto(origin + '/', { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    await page.waitForFunction(() => navigator.serviceWorker.controller && window.SeoulTripV191);
    assert.equal(await page.getByText('功能 v1.9.1', { exact: true }).count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0);
    assert.deepEqual(await page.evaluate(() => ({
      theme: document.documentElement.dataset.theme,
      dark: document.documentElement.dataset.dark,
      stored: localStorage.getItem('seoul_2027_theme'),
      background: getComputedStyle(document.body).backgroundColor
    })), { theme: 'light', dark: 'false', stored: null, background: 'rgb(247, 247, 245)' });
    assert.ok((await page.getByRole('button', { name: '淺色', exact: true }).boundingBox()).height >= 44);
    const stateBeforeTheme = await page.evaluate(() => ({
      shopping: localStorage.getItem('seoul_2027_v18_checked'),
      trip: localStorage.getItem('seoul_2027_v18_trip_progress')
    }));
    await page.getByRole('button', { name: '深色', exact: true }).click();
    assert.deepEqual(await page.evaluate(() => [document.documentElement.dataset.dark, localStorage.getItem('seoul_2027_theme')]), ['true', 'dark']);
    await page.getByRole('button', { name: '跟隨系統', exact: true }).click();
    assert.equal(await page.evaluate(() => document.documentElement.dataset.dark), 'true');
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForFunction(() => document.documentElement.dataset.dark === 'false');
    await page.getByRole('button', { name: '淺色', exact: true }).click();
    await page.emulateMedia({ colorScheme: 'dark' });
    assert.equal(await page.evaluate(() => document.documentElement.dataset.dark), 'false');
    assert.deepEqual(await page.evaluate(() => ({
      shopping: localStorage.getItem('seoul_2027_v18_checked'),
      trip: localStorage.getItem('seoul_2027_v18_trip_progress')
    })), stateBeforeTheme);
    await page.screenshot({ path: path.join(screenshotDir, 'v1.9.1-mobile-home-light.png'), fullPage: true });

    await page.getByRole('button', { name: /行程/ }).click();
    assert.equal(await page.locator('.day-tabs .tab').count(), 5);
    assert.equal(await page.locator('.next-card h3').innerText(), 'BR160｜桃園出發');
    const firstTrip = page.getByRole('checkbox', { name: '標記 BR160｜桃園出發 完成' });
    await firstTrip.check();
    assert.equal(await page.locator('.next-card h3').innerText(), '抵達仁川 T1');
    await firstTrip.uncheck();
    await page.locator('#next-stop-select').selectOption('d1-hotel-checkin');
    assert.equal(await page.locator('.next-card h3').innerText(), 'New Blanc Central Myeongdong');

    await page.locator('.day-tabs .tab').nth(1).click();
    const beddingCard = page.locator('.stop-card').filter({ hasText: '美都棉被' });
    const beddingBackup = beddingCard.locator('.backup-details');
    assert.equal(await beddingBackup.getAttribute('open'), null);
    await beddingBackup.locator('summary').click();
    const beddingText = await beddingBackup.innerText();
    assert.match(beddingText, /10:15/);
    assert.match(beddingText, /이브자리 종로4점/);
    assert.match(beddingText, /Day 4 備案時間（不同於一般版）/);
    assert.match(beddingText, /09:40–10:45/);
    assert.match(beddingText, /21:30/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0);
    await page.screenshot({ path: path.join(screenshotDir, 'v1.9.1-mobile-day2-bedding-backup.png'), fullPage: true });

    await page.locator('.day-tabs .tab').nth(3).click();
    await page.getByRole('heading', { name: 'The Hyundai Seoul（現代百貨）', exact: true }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0);
    assert.equal(await page.getByText('10:40–14:15', { exact: true }).count(), 1);

    await page.locator('.day-tabs .tab').nth(4).click();
    const luggageCard = page.locator('.stop-card').filter({ hasText: '退房並寄放行李' });
    await luggageCard.locator('.backup-details summary').click();
    const luggageText = await luggageCard.locator('.backup-details').innerText();
    assert.match(luggageText, /首爾站可預約的付費寄物服務/);
    assert.match(luggageText, /不可假設大型置物櫃一定有空位/);
    const arexCard = page.locator('.stop-card').filter({ hasText: '搭 AREX 前往仁川 T1' });
    assert.match(await arexCard.innerText(), /14:10–14:40｜預計搭車時段/);
    assert.match(await arexCard.innerText(), /非已確認的 2027 班次/);
    assert.match(await arexCard.innerText(), /14:40 不是已訂票車次/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0);
    await page.screenshot({ path: path.join(screenshotDir, 'v1.9.1-mobile-day5-backups.png'), fullPage: true });

    await page.getByRole('button', { name: /總覽/ }).click();
    await page.getByRole('button', { name: /複製飯店韓文地址/ }).click();
    await page.getByText('已複製韓文地址', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), '서울 중구 창경궁로 20');

    await page.getByRole('button', { name: /店家/ }).click();
    const shopping = page.getByRole('checkbox', { name: '大創 12 層樓' });
    await shopping.check();
    await page.getByRole('button', { name: /行程/ }).click();
    await page.locator('.day-tabs .tab').first().click();
    const firstTripAgain = page.getByRole('checkbox', { name: '標記 BR160｜桃園出發 完成' });
    await firstTripAgain.check();
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /行程/ }).click();
    assert.equal(await page.getByRole('checkbox', { name: '標記 BR160｜桃園出發 完成' }).isChecked(), true);

    let dialogCount = 0;
    page.on('dialog', async dialog => {
      dialogCount += 1;
      await dialog.accept();
    });
    await page.getByRole('button', { name: '重設行程進度' }).first().click();
    assert.equal(dialogCount, 2);
    assert.equal(await page.getByRole('checkbox', { name: '標記 BR160｜桃園出發 完成' }).isChecked(), false);
    await page.getByRole('button', { name: /店家/ }).click();
    assert.equal(await page.getByRole('checkbox', { name: '大創 12 層樓' }).isChecked(), true);

    await page.getByRole('button', { name: /行前/ }).click();
    const flightCard = page.locator('.important-item').filter({ hasText: 'BR160 桃園起飛' });
    await flightCard.locator('input[type="time"]').fill('15:25');
    const downloadPromise = page.waitForEvent('download');
    await flightCard.getByRole('button', { name: '加入行事曆' }).click();
    const download = await downloadPromise;
    const ics = fs.readFileSync(await download.path(), 'utf8');
    assert.match(ics, /TZID:Asia\/Taipei/);
    assert.match(ics, /DTSTART;TZID=Asia\/Taipei:20270118T152500/);
    assert.match(ics, /DTEND;TZID=Asia\/Taipei:20270118T155500/);
    assert.doesNotMatch(await page.locator('.important-item').filter({ hasText: 'SEOUL SKY' }).innerText(), /加入行事曆/);

    await page.getByRole('button', { name: /行程/ }).click();
    await page.getByRole('checkbox', { name: '標記 BR160｜桃園出發 完成' }).check();
    const storageBeforeUpdate = await page.evaluate(() => ({
      shopping: localStorage.getItem('seoul_2027_v18_checked'),
      trip: localStorage.getItem('seoul_2027_v18_trip_progress')
    }));
    const cachesBefore = await page.evaluate(() => caches.keys());
    assert.ok(cachesBefore.includes('seoul-trip-v1.9.1-a'));

    swVariant = 'b';
    await page.evaluate(() => new Promise(async (resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('service worker update timed out')), 10000);
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        clearTimeout(timer);
        resolve();
      }, { once: true });
      const registration = await navigator.serviceWorker.getRegistration();
      await registration.update();
    }));
    let cachesAfter = [];
    for (let attempt = 0; attempt < 50; attempt += 1) {
      cachesAfter = await page.evaluate(() => caches.keys());
      if (cachesAfter.includes('seoul-trip-v1.9.1-b') && !cachesAfter.includes('seoul-trip-v1.9.1-a')) break;
      await page.waitForTimeout(100);
    }
    if (cachesAfter.includes('seoul-trip-v1.9.1-a')) {
      const cacheDebug = await page.evaluate(async () => {
        const result = {};
        for (const name of await caches.keys()) {
          result[name] = (await (await caches.open(name)).keys()).map(request => request.url);
        }
        return result;
      });
      console.log('CACHE_DEBUG ' + JSON.stringify(cacheDebug));
    }
    assert.ok(cachesAfter.includes('seoul-trip-v1.9.1-b'));
    assert.equal(cachesAfter.includes('seoul-trip-v1.9.1-a'), false);
    assert.deepEqual(await page.evaluate(() => ({
      shopping: localStorage.getItem('seoul_2027_v18_checked'),
      trip: localStorage.getItem('seoul_2027_v18_trip_progress')
    })), storageBeforeUpdate);

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: '🇰🇷 首爾五天四夜', exact: true }).waitFor();
    await page.getByRole('button', { name: /行程/ }).click();
    assert.equal(await page.locator('.day-tabs .tab').count(), 5);
    await page.getByRole('button', { name: /超市/ }).click();
    await page.waitForFunction(() => {
      const images = [...document.querySelectorAll('.product img')];
      return images.length === 13 && images.every(image => image.complete && image.naturalWidth > 0);
    });
    assert.equal(await page.locator('.product img').evaluateAll(images => images.filter(image => !image.complete || image.naturalWidth === 0).length), 0);
    await page.screenshot({ path: path.join(screenshotDir, 'v1.9.1-mobile-offline.png'), fullPage: true });

    await context.setOffline(false);
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: '深色', exact: true }).click();
    const colors = await page.evaluate(() => {
      const style = getComputedStyle(document.body);
      return { background: style.backgroundColor, color: style.color, theme: localStorage.getItem('seoul_2027_theme') };
    });
    assert.notEqual(colors.background, colors.color);
    assert.equal(colors.theme, 'dark');
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.evaluate(() => document.documentElement.dataset.dark), 'true');
    assert.deepEqual(await page.evaluate(() => ({
      shopping: localStorage.getItem('seoul_2027_v18_checked'),
      trip: localStorage.getItem('seoul_2027_v18_trip_progress')
    })), storageBeforeUpdate);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0);
    await page.screenshot({ path: path.join(screenshotDir, 'v1.9.1-mobile-home-dark.png'), fullPage: true });

    assert.deepEqual(errors, []);
    console.log('E2E PASS: v1.9.1 fallbacks, light/dark/system themes, Day 1-5, next stop, stable progress, shopping preservation, address copy, ICS, SW update, offline images, 390x844');
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
