const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const enhancements = fs.readFileSync(path.join(root, 'enhancements.js'), 'utf8');
const enhancementStyles = fs.readFileSync(path.join(root, 'enhancements.css'), 'utf8');
const serviceWorker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
const baseline = execFileSync('git', ['show', '80206d02710207ee18ab6f233786fb98dc0db0b8:index.html'], {
  cwd: root,
  encoding: 'utf8'
});

function extractJson(html, start, end) {
  const from = html.indexOf(start);
  assert.notEqual(from, -1, 'missing ' + start);
  const valueStart = from + start.length;
  const to = html.indexOf(end, valueStart);
  assert.notEqual(to, -1, 'missing end marker for ' + start);
  return JSON.parse(html.slice(valueStart, to));
}

function contentData(html) {
  return {
    DATA: extractJson(html, 'const DATA=', ', PRODUCTS='),
    PRODUCTS: extractJson(html, 'PRODUCTS=', ', SHOPGROUPS='),
    SHOPGROUPS: extractJson(html, 'SHOPGROUPS=', ', TODOS='),
    TODOS: extractJson(html, 'TODOS=', ';\nconst storeKey=')
  };
}

test('v1.8 itinerary, products, shops and todos remain byte-for-byte equivalent as data', () => {
  assert.deepEqual(contentData(index), contentData(baseline));
});

test('v1.9.1 resources are linked without replacing the v1.8 data script', () => {
  assert.match(index, /manifest\.webmanifest/);
  assert.match(index, /enhancements\.css/);
  assert.match(index, /enhancements\.js/);
  assert.match(index, /apple-touch-icon\.png/);
});

test('all 54 itinerary events receive unique stable IDs independent of array order', () => {
  const matches = [...enhancements.matchAll(/'Day [1-5]\|[^']+': \{ id: '([^']+)'/g)].map(match => match[1]);
  assert.equal(matches.length, 54);
  assert.equal(new Set(matches).size, 54);
});

test('The Hyundai display alias is the only requested name adjustment', () => {
  assert.match(enhancements, /The Hyundai Seoul（現代百貨）/);
  assert.equal((baseline.match(/The Hyundai Seoul/g) || []).length, 1);
  assert.equal((index.match(/The Hyundai Seoul/g) || []).length, 1);
});

test('shopping and itinerary progress use separate storage keys', () => {
  assert.match(index, /seoul_2027_v18_checked/);
  assert.match(enhancements, /seoul_2027_v18_trip_progress/);
  assert.doesNotMatch(enhancements, /removeItem\(storeKey\)/);
});

test('v1.9.1 fallbacks are supplemental and do not alter the v1.8 schedule data', () => {
  assert.match(enhancements, /棉被購物失敗備案/);
  assert.match(enhancements, /09:40–10:45/);
  assert.match(enhancements, /12:00–15:10/);
  assert.match(enhancements, /寄物失敗備案/);
  assert.match(enhancements, /預計搭車時段，非已確認的 2027 班次/);
  assert.match(enhancements, /14:40 不是已訂票車次/);
});

test('theme preference defaults to light and uses its own storage key', () => {
  assert.match(enhancements, /const THEME_KEY = 'seoul_2027_theme'/);
  assert.match(enhancements, /themeChoice = 'light'/);
  assert.match(enhancements, /\['light', 'dark', 'system'\]/);
  assert.doesNotMatch(enhancements, /removeItem\(THEME_KEY\)/);
  assert.match(enhancementStyles, /:root\[data-dark="true"\]/);
  assert.doesNotMatch(enhancementStyles, /@media \(prefers-color-scheme: dark\)/);
});

test('manifest supports standalone iPhone-first installation', () => {
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.orientation, 'portrait-primary');
  assert.deepEqual(manifest.icons.map(icon => icon.sizes), ['192x192', '512x512']);
});

test('service worker precaches every local runtime asset and removes old versioned caches', () => {
  for (const asset of [
    './index.html',
    './enhancements.css',
    './enhancements.js',
    './manifest.webmanifest',
    './icons/apple-touch-icon.png',
    './icons/icon-192.png',
    './icons/icon-512.png'
  ]) {
    assert.match(serviceWorker, new RegExp(asset.replace(/[.*+?^$\{\}()|[\]\\]/g, '\\$&')));
  }
  assert.match(serviceWorker, /seoul-trip-v1\.9\.1/);
  assert.match(serviceWorker, /key !== CACHE_NAME/);
  assert.doesNotMatch(serviceWorker, /localStorage/);
});
