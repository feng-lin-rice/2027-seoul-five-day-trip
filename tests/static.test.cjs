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

test('only the approved Day 3 and Day 4 food itinerary changes differ from v1.8 data', () => {
  const current = contentData(index);
  const original = contentData(baseline);
  assert.deepEqual(current.PRODUCTS, original.PRODUCTS);
  assert.deepEqual(current.SHOPGROUPS, original.SHOPGROUPS);
  assert.deepEqual(current.TODOS, original.TODOS);
  assert.deepEqual(current.DATA[0], original.DATA[0]);
  assert.deepEqual(current.DATA[1], original.DATA[1]);
  assert.deepEqual(current.DATA[4], original.DATA[4]);
  assert.deepEqual(current.DATA[2].events.slice(0, 7), original.DATA[2].events.slice(0, 7));
  assert.deepEqual(current.DATA[3].events.slice(0, 5), original.DATA[3].events.slice(0, 5));

  assert.deepEqual(current.DATA[2].events.slice(7).map(event => [event.time, event.title]), [
    ['18:20–19:10', '蠶室自由活動・休息／簡單點心'],
    ['19:30–21:00', 'SEOUL SKY 夜景'],
    ['21:00 後', '前往東大門'],
    ['約 22:00–23:00', '陳玉華奶奶元祖一隻雞'],
    ['吃完後', '返回飯店']
  ]);
  assert.deepEqual(current.DATA[3].events.slice(5, 13).map(event => [event.time, event.title]), [
    ['16:45–18:00', '弘大品牌街自由逛'],
    ['18:00–19:10', '通大排骨・弘大店'],
    ['19:10–19:40', '雪冰・黃豆粉年糕口味'],
    ['19:40–20:20', '返回飯店'],
    ['20:20–20:50', '回房放戰利品'],
    ['20:50–21:10', '前往 SPAREX'],
    ['21:10–23:50', 'SPAREX 汗蒸幕'],
    ['23:50–00:05', '回飯店休息']
  ]);
});

test('v1.9.2 resources are linked', () => {
  assert.match(index, /manifest\.webmanifest/);
  assert.match(index, /enhancements\.css/);
  assert.match(index, /enhancements\.js/);
  assert.match(index, /apple-touch-icon\.png/);
});

test('all 56 itinerary events receive unique stable IDs independent of array order', () => {
  const matches = [...enhancements.matchAll(/'Day [1-5]\|[^']+': \{ id: '([^']+)'/g)].map(match => match[1]);
  assert.equal(matches.length, 56);
  assert.equal(new Set(matches).size, 56);
  assert.match(enhancements, /'Day 3\|蠶室自由活動・休息／簡單點心': \{ id: 'd3-dinner' \}/);
  assert.match(enhancements, /'Day 4\|通大排骨・弘大店': \{ id: 'd4-dinner'/);
});

test('The Hyundai display alias remains present', () => {
  assert.match(enhancements, /The Hyundai Seoul（現代百貨）/);
  assert.equal((baseline.match(/The Hyundai Seoul/g) || []).length, 1);
  assert.equal((index.match(/The Hyundai Seoul/g) || []).length, 1);
});

test('shopping and itinerary progress use separate storage keys', () => {
  assert.match(index, /seoul_2027_v18_checked/);
  assert.match(enhancements, /seoul_2027_v18_trip_progress/);
  assert.doesNotMatch(enhancements, /removeItem\(storeKey\)/);
});

test('v1.9.1 fallbacks remain supplemental', () => {
  assert.match(enhancements, /棉被購物失敗備案/);
  assert.match(enhancements, /09:40–10:45/);
  assert.match(enhancements, /12:00–15:10/);
  assert.match(enhancements, /寄物失敗備案/);
  assert.match(enhancements, /預計搭車時段，非已確認的 2027 班次/);
  assert.match(enhancements, /14:40 不是已訂票車次/);
});

test('Day 3 alternatives are clearly separated from the fixed itinerary', () => {
  assert.match(enhancements, /美食候選｜無垢屋/);
  assert.match(enhancements, /不得壓縮原本馬場洞現代畜產韓牛午餐/);
  assert.match(enhancements, /晚餐備案｜蠶室熱湯/);
  assert.match(enhancements, /不是第二頓晚餐/);
  assert.match(enhancements, /전주설렁탕/);
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
  assert.match(serviceWorker, /seoul-trip-v1\.9\.2/);
  assert.match(serviceWorker, /key !== CACHE_NAME/);
  assert.doesNotMatch(serviceWorker, /localStorage/);
});
