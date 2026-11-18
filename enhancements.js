'use strict';

const SITE_VERSION = 'v1.9';
const ITINERARY_VERSION = 'v1.8';
const TRIP_PROGRESS_KEY = 'seoul_2027_v18_trip_progress';
const MANUAL_NEXT_KEY = 'seoul_2027_v18_manual_next';
const HOTEL_ADDRESS = '서울 중구 창경궁로 20';

const EVENT_METADATA = {
  'Day 1|BR160｜桃園出發': { id: 'd1-br160-depart' },
  'Day 1|抵達仁川 T1': { id: 'd1-incheon-arrival' },
  'Day 1|6015 機場巴士': { id: 'd1-airport-bus-6015' },
  'Day 1|New Blanc Central Myeongdong': { id: 'd1-hotel-checkin', koreanAddress: HOTEL_ADDRESS },
  'Day 1|元堂馬鈴薯排骨湯・忠武路店': { id: 'd1-gamjatang', koreanAddress: '마른내로 14' },
  'Day 1|便利商店／回飯店': { id: 'd1-convenience-return', koreanAddress: HOTEL_ADDRESS },
  'Day 2|Money Planet 換錢': { id: 'd2-money-planet' },
  'Day 2|廣藏市場早餐': { id: 'd2-gwangjang-breakfast' },
  'Day 2|美都棉被': { id: 'd2-mido-bedding' },
  'Day 2|東時藥局': { id: 'd2-dongsi-pharmacy', koreanAddress: '서울 종로구 종로 202-1' },
  'Day 2|回飯店放棉被': { id: 'd2-return-hotel-bedding', koreanAddress: HOTEL_ADDRESS },
  'Day 2|明洞餃子': { id: 'd2-myeongdong-kyoja', koreanAddress: '퇴계로 129' },
  'Day 2|樂天百貨本店': { id: 'd2-lotte-department' },
  'Day 2|坐下休息': { id: 'd2-rest' },
  'Day 2|明洞自由購物': { id: 'd2-myeongdong-shopping' },
  'Day 2|利庭園明洞店': { id: 'd2-lijeongwon' },
  'Day 2|明洞夜市・龍鬚糖': { id: 'd2-night-market' },
  'Day 2|前往首爾站': { id: 'd2-to-seoul-station' },
  'Day 2|樂天超市①': { id: 'd2-lotte-mart-1' },
  'Day 2|回飯店': { id: 'd2-return-hotel', koreanAddress: HOTEL_ADDRESS },
  'Day 3|飯店附近早餐': { id: 'd3-breakfast' },
  'Day 3|景福宮': { id: 'd3-gyeongbokgung' },
  'Day 3|前往馬場洞': { id: 'd3-to-majang' },
  'Day 3|現代畜產吃韓牛': { id: 'd3-hyundai-livestock', koreanAddress: '마장로37길 43' },
  'Day 3|Matin Kim 聖水旗艦店': { id: 'd3-matin-kim', koreanAddress: '연무장3길 9' },
  'Day 3|聖水品牌街': { id: 'd3-seongsu-street' },
  'Day 3|前往蠶室': { id: 'd3-to-jamsil' },
  'Day 3|樂天世界購物中心晚餐': { id: 'd3-dinner' },
  'Day 3|SEOUL SKY 夜景': { id: 'd3-seoul-sky' },
  'Day 3|返回飯店': { id: 'd3-return-hotel', koreanAddress: HOTEL_ADDRESS },
  'Day 4|飯店附近早餐': { id: 'd4-breakfast' },
  'Day 4|前往汝矣島': { id: 'd4-to-yeouido' },
  'Day 4|The Hyundai Seoul': { id: 'd4-hyundai-seoul', displayTitle: 'The Hyundai Seoul（現代百貨）' },
  'Day 4|前往弘大入口': { id: 'd4-to-hongdae' },
  'Day 4|延南洞特色小店': { id: 'd4-yeonnam' },
  'Day 4|弘大品牌街自由逛': { id: 'd4-hongdae-shopping' },
  'Day 4|雪冰・黃豆粉年糕口味': { id: 'd4-sulbing' },
  'Day 4|弘大晚餐': { id: 'd4-dinner' },
  'Day 4|返回飯店': { id: 'd4-return-hotel', koreanAddress: HOTEL_ADDRESS },
  'Day 4|回房放戰利品': { id: 'd4-drop-shopping', koreanAddress: HOTEL_ADDRESS },
  'Day 4|前往 SPAREX': { id: 'd4-to-sparex' },
  'Day 4|SPAREX 汗蒸幕': { id: 'd4-sparex' },
  'Day 4|回飯店休息': { id: 'd4-return-hotel-night', koreanAddress: HOTEL_ADDRESS },
  'Day 5|早餐＋整理行李': { id: 'd5-pack' },
  'Day 5|退房並寄放行李': { id: 'd5-checkout', koreanAddress: HOTEL_ADDRESS },
  'Day 5|前往首爾站': { id: 'd5-to-seoul-station' },
  'Day 5|樂天超市②': { id: 'd5-lotte-mart-2' },
  'Day 5|首爾站內快速午餐': { id: 'd5-lunch' },
  'Day 5|返回飯店': { id: 'd5-return-hotel', koreanAddress: HOTEL_ADDRESS },
  'Day 5|取行李・補裝購物': { id: 'd5-pickup-luggage', koreanAddress: HOTEL_ADDRESS },
  'Day 5|最晚離開飯店': { id: 'd5-leave-hotel', koreanAddress: HOTEL_ADDRESS },
  'Day 5|搭 AREX 前往仁川 T1': { id: 'd5-arex' },
  'Day 5|抵達仁川 T1': { id: 'd5-incheon-arrival' },
  'Day 5|BR159｜回台灣': { id: 'd5-br159-return' }
};

const IMPORTANT_TIMES = [
  { id: 'd1-br160-calendar', day: 'Day 1｜1/18（一）', title: 'BR160 桃園起飛', detail: '15:15｜硬性時間', kind: 'hard', date: '20270118', time: '15:15', timezone: 'Asia/Taipei', duration: 30, durationNote: '行事曆預設保留 30 分鐘，可調整開始時間。' },
  { id: 'd1-incheon-calendar', day: 'Day 1｜1/18（一）', title: '仁川 T1 抵達', detail: '18:45｜硬性時間', kind: 'hard', date: '20270118', time: '18:45', timezone: 'Asia/Seoul', duration: 30, durationNote: '行事曆預設保留 30 分鐘，可調整開始時間。' },
  { id: 'd1-6015-pending', day: 'Day 1｜1/18（一）', title: '6015 機場巴士班表', detail: '2027 班表待確認，不產生固定提醒', kind: 'pending' },
  { id: 'd2-bedding-calendar', day: 'Day 2｜1/19（二）', title: '廣藏市場棉被購物', detail: '建議最遲 10:50 結束', kind: 'suggested', date: '20270119', time: '10:00', timezone: 'Asia/Seoul', duration: 50, durationNote: '建議時段 10:00–10:50，可調整開始時間。' },
  { id: 'd2-dinner-calendar', day: 'Day 2｜1/19（二）', title: '利庭園明洞店用餐', detail: '建議 18:30', kind: 'suggested', date: '20270119', time: '18:30', timezone: 'Asia/Seoul', duration: 70, durationNote: '建議時段 18:30–19:40，可調整開始時間。' },
  { id: 'd3-seoul-sky-pending', day: 'Day 3｜1/20（三）', title: 'SEOUL SKY', detail: '尚未完成預約；依未來票面時間為準，不產生固定提醒', kind: 'pending' },
  { id: 'd4-hotel-calendar', day: 'Day 4｜1/21（四）', title: '回飯店放戰利品、拿換洗衣物', detail: '建議 20:20', kind: 'suggested', date: '20270121', time: '20:20', timezone: 'Asia/Seoul', duration: 30, durationNote: '建議時段 20:20–20:50，可調整開始時間。' },
  { id: 'd4-sparex-calendar', day: 'Day 4｜1/21（四）', title: 'SPAREX 夜間行程', detail: '建議 21:10', kind: 'suggested', date: '20270121', time: '21:10', timezone: 'Asia/Seoul', duration: 160, durationNote: '建議時段 21:10–23:50，可調整開始時間。' },
  { id: 'd5-leave-calendar', day: 'Day 5｜1/22（五）', title: '最晚離開飯店', detail: '13:20｜硬性時間', kind: 'hard', date: '20270122', time: '13:20', timezone: 'Asia/Seoul', duration: 20, durationNote: '行事曆預設保留 20 分鐘，可調整開始時間。' },
  { id: 'd5-arex-pending', day: 'Day 5｜1/22（五）', title: 'AREX 車次', detail: '2027 車次待確認，不產生固定提醒', kind: 'pending' },
  { id: 'd5-br159-calendar', day: 'Day 5｜1/22（五）', title: 'BR159 仁川 T1 起飛', detail: '19:45｜硬性時間', kind: 'hard', date: '20270122', time: '19:45', timezone: 'Asia/Seoul', duration: 30, durationNote: '行事曆預設保留 30 分鐘，可調整開始時間。' },
  { id: 'hours-pending', day: '出發前核對', title: '尚未確認的營業時間', detail: '依 2027 當期公告核對，不產生固定提醒', kind: 'pending' }
];

function readObject(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch (error) {
    return {};
  }
}

let tripProgress = readObject(TRIP_PROGRESS_KEY);
let manualNext = readObject(MANUAL_NEXT_KEY);

function saveObject(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('無法儲存旅遊網站狀態', error);
  }
}

function configureEvents() {
  DATA.forEach(function (day) {
    day.events.forEach(function (event) {
      const metadata = EVENT_METADATA[day.label + '|' + event.title];
      if (!metadata) throw new Error('缺少固定行程 ID：' + day.label + '｜' + event.title);
      Object.assign(event, metadata);
    });
  });
}

function allEvents() {
  return DATA.reduce(function (events, day) { return events.concat(day.events); }, []);
}

function eventTitle(event) {
  return event.displayTitle || event.title;
}

function tripIsDone(id) {
  return tripProgress[id] === true;
}

function toggleTrip(id) {
  if (tripIsDone(id)) delete tripProgress[id];
  else tripProgress[id] = true;
  saveObject(TRIP_PROGRESS_KEY, tripProgress);
  render();
}

function setManualNext(dayLabel, id) {
  if (id) manualNext[dayLabel] = id;
  else delete manualNext[dayLabel];
  saveObject(MANUAL_NEXT_KEY, manualNext);
  render();
}

function resetTripProgress() {
  if (!window.confirm('要重設 Day 1～5 的行程完成進度嗎？購物清單不會受到影響。')) return;
  if (!window.confirm('再次確認：只清除行程完成勾選，確定要繼續嗎？')) return;
  tripProgress = {};
  localStorage.removeItem(TRIP_PROGRESS_KEY);
  render();
}

function findEvent(id) {
  return allEvents().find(function (event) { return event.id === id; });
}

function copyStatusId(id) {
  return 'copy-status-' + id;
}

function copyAction(event, label) {
  if (!event || !event.koreanAddress) return '';
  return '<button class="copy-button" type="button" onclick="copyKoreanAddress(\'' + clean(event.id) + '\')">📋 ' + clean(label || '複製韓文地址') + '</button>' +
    '<span class="copy-status" id="' + copyStatusId(event.id) + '" aria-live="polite"></span>';
}

async function copyKoreanAddress(id) {
  const event = findEvent(id);
  if (!event || !event.koreanAddress) return;
  const status = document.getElementById(copyStatusId(id));
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(event.koreanAddress);
    if (status) status.textContent = '已複製韓文地址';
  } catch (error) {
    if (status) {
      status.innerHTML = '無法自動複製，請手動選取：<span class="manual-copy">' + clean(event.koreanAddress) + '</span>';
    }
  }
}

function nextStopCard(day) {
  let selectedId = manualNext[day.label] || '';
  if (selectedId && tripIsDone(selectedId)) {
    delete manualNext[day.label];
    saveObject(MANUAL_NEXT_KEY, manualNext);
    selectedId = '';
  }
  const incomplete = day.events.filter(function (event) { return !tripIsDone(event.id); });
  const next = incomplete.find(function (event) { return event.id === selectedId; }) || incomplete[0];
  const options = ['<option value="">自動：第一個尚未完成</option>'].concat(incomplete.map(function (event) {
    return '<option value="' + clean(event.id) + '"' + (event.id === selectedId ? ' selected' : '') + '>' +
      clean(event.time + '｜' + eventTitle(event)) + '</option>';
  })).join('');
  if (!next) {
    return '<section class="next-card complete-day" aria-label="下一站"><div class="next-kicker">下一站</div>' +
      '<h3>今天的行程已完成</h3><p>所有項目都已標記完成。</p>' +
      '<button class="reset-trip" type="button" onclick="resetTripProgress()">重設行程進度</button></section>';
  }
  return '<section class="next-card" aria-label="下一站">' +
    '<div class="next-kicker">下一站</div><div class="next-time">' + clean(next.time) + '</div>' +
    '<h3>' + clean(eventTitle(next)) + '</h3>' +
    (next.koreanAddress ? '<p class="next-address" lang="ko">' + clean(next.koreanAddress) + '</p>' : '') +
    '<p class="next-mode"><strong>建議交通：</strong>' + clean(next.mode || '行程未指定') + '</p>' +
    '<div class="actions">' + mapLink(next.url) + copyAction(next) + '</div>' +
    '<label class="next-select-label" for="next-stop-select">手動指定下一站</label>' +
    '<select id="next-stop-select" class="next-select" onchange="setManualNext(\'' + clean(day.label) + '\',this.value)">' + options + '</select>' +
    '<button class="reset-trip" type="button" onclick="resetTripProgress()">重設行程進度</button></section>';
}

function renderStopV19(event) {
  const critical = event.fixed ? ' critical' : '';
  const complete = tripIsDone(event.id);
  const status = event.fixed ? '<span class="status hot">⚠️ 重要</span>' :
    event.optional ? '<span class="status option">可選配</span>' :
      event.tag ? '<span class="status">' + clean(event.tag) + '</span>' : '';
  return '<article class="stop' + (complete ? ' trip-complete' : '') + '">' +
    '<div class="stop-card' + critical + '"><div class="stop-top"><div><span class="time">' + clean(event.time) + '</span>' +
    '<h3>' + clean(eventTitle(event)) + '</h3>' + (event.sub ? '<p class="sub">' + clean(event.sub) + '</p>' : '') +
    '</div><div class="stop-controls">' + status +
    '<label class="trip-check"><input type="checkbox" ' + (complete ? 'checked ' : '') +
    'onchange="toggleTrip(\'' + clean(event.id) + '\')" aria-label="標記 ' + clean(eventTitle(event)) + ' 完成"><span>完成</span></label></div></div>' +
    (event.mode ? '<div class="route"><b>' + clean(event.mode) + '</b><div>' + clean(event.route || '') + '</div>' +
      (event.duration ? '<div class="duration">⏱ ' + clean(event.duration) + '</div>' : '') + '</div>' : '') +
    (event.note ? '<div class="note">💡 ' + clean(event.note) + '</div>' : '') +
    ((event.url || event.koreanAddress) ? '<div class="actions">' + mapLink(event.url) + copyAction(event) + '</div>' : '') +
    '</div></article>';
}

function renderDayV19() {
  const day = DATA[state.day];
  return '<div class="day-tabs">' + DATA.map(function (item, index) {
    return '<button class="tab ' + (state.day === index ? 'selected' : '') + '" onclick="tabDay(' + index + ')">' +
      item.label + ' <small>' + item.date.split(' ')[0] + '</small></button>';
  }).join('') + '</div>' +
    nextStopCard(day) +
    '<div class="day-head"><div class="eyebrow">' + day.emoji + ' ' + clean(day.date) + ' · ' + clean(day.intensity) + '</div>' +
    '<h2>' + clean(day.name) + '</h2><p>' + clean(day.theme) + '</p><div class="day-badges">' +
    '<span class="pill">📍 點地點開 NAVER Map</span><span class="pill">⏱ 時間大多可彈性調整</span></div></div>' +
    '<div class="timeline">' + day.events.map(renderStopV19).join('') + '</div>' +
    '<div class="clear-note"><strong>出發前提示：</strong>此頁依 v1.8 正式行程製作。交通時間是規劃估計，2027 班表與營業資訊仍需依當期公告核對。</div>';
}

function offsetInfo(timezone) {
  return timezone === 'Asia/Taipei' ? { offset: '+0800', name: 'CST' } : { offset: '+0900', name: 'KST' };
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function addMinutes(date, time, minutes) {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(4, 6));
  const day = Number(date.slice(6, 8));
  const parts = time.split(':').map(Number);
  const result = new Date(Date.UTC(year, month - 1, day, parts[0], parts[1] + minutes));
  return String(result.getUTCFullYear()) + pad(result.getUTCMonth() + 1) + pad(result.getUTCDate()) + 'T' +
    pad(result.getUTCHours()) + pad(result.getUTCMinutes()) + '00';
}

function icsEscape(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function timezoneBlock(timezone) {
  const info = offsetInfo(timezone);
  return [
    'BEGIN:VTIMEZONE',
    'TZID:' + timezone,
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:' + info.offset,
    'TZOFFSETTO:' + info.offset,
    'TZNAME:' + info.name,
    'END:STANDARD',
    'END:VTIMEZONE'
  ];
}

function buildIcs(reminder, selectedTime) {
  const start = reminder.date + 'T' + selectedTime.replace(':', '') + '00';
  const end = addMinutes(reminder.date, selectedTime, reminder.duration);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//2027 Seoul Trip Website v1.9//ZH-HANT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ].concat(timezoneBlock(reminder.timezone), [
    'BEGIN:VEVENT',
    'UID:' + reminder.id + '@feng-lin-rice.github.io',
    'DTSTAMP:' + stamp,
    'DTSTART;TZID=' + reminder.timezone + ':' + start,
    'DTEND;TZID=' + reminder.timezone + ':' + end,
    'SUMMARY:' + icsEscape(reminder.title),
    'DESCRIPTION:' + icsEscape(reminder.detail + '。' + reminder.durationNote),
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:' + icsEscape(reminder.title),
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    ''
  ]).join('\r\n');
}

function downloadReminder(id) {
  const reminder = IMPORTANT_TIMES.find(function (item) { return item.id === id; });
  if (!reminder || !reminder.date) return;
  const input = document.getElementById('calendar-time-' + id);
  const selectedTime = input && input.value ? input.value : reminder.time;
  const blob = new Blob([buildIcs(reminder, selectedTime)], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = reminder.date + '-' + id + '.ics';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(function () { URL.revokeObjectURL(link.href); }, 0);
}

function reminderCard(reminder) {
  const label = reminder.kind === 'hard' ? '硬性時間' : reminder.kind === 'suggested' ? '建議時間' : '待確認時間';
  const calendar = reminder.date ?
    '<div class="calendar-row"><label for="calendar-time-' + clean(reminder.id) + '">開始時間</label>' +
    '<input id="calendar-time-' + clean(reminder.id) + '" type="time" value="' + clean(reminder.time) + '">' +
    '<button type="button" onclick="downloadReminder(\'' + clean(reminder.id) + '\')">加入行事曆</button></div>' +
    '<p class="calendar-note">' + clean(reminder.durationNote) + ' 時區：' + clean(reminder.timezone) + '</p>' : '';
  return '<article class="important-item ' + reminder.kind + '"><div class="important-meta">' +
    '<span>' + clean(reminder.day) + '</span><span class="time-kind">' + label + '</span></div>' +
    '<h3>' + clean(reminder.title) + '</h3><p>' + clean(reminder.detail) + '</p>' + calendar + '</article>';
}

function renderImportantTimes() {
  return '<div class="section-head important-heading"><h2>重要時間</h2><small>硬性／建議／待確認分開顯示</small></div>' +
    '<div class="important-legend"><span class="hard">硬性時間</span><span class="suggested">建議時間</span><span class="pending">待確認時間</span></div>' +
    '<div class="important-list">' + IMPORTANT_TIMES.map(reminderCard).join('') + '</div>' +
    '<div class="clear-note">行事曆事件會使用 2027/1/18～1/22 與正確的 Asia/Taipei／Asia/Seoul 時區。缺少官方結束時間時，使用上方明確標示的可調整預設值；未確認的 SEOUL SKY、AREX 與 6015 不產生固定事件。</div>';
}

configureEvents();

const homeV18 = home;
home = function () {
  return homeV18()
    .replace('<strong>v1.8</strong><span>正式行程</span>', '<strong>功能 v1.9</strong><span>行程仍為 v1.8</span>')
    .replace('<p>서울 중구 창경궁로 20</p><div class="actions">', '<p lang="ko">서울 중구 창경궁로 20</p><div class="actions">' + copyAction(findEvent('d1-hotel-checkin'), '複製飯店韓文地址'));
};

const prepV18 = prep;
prep = function () {
  return prepV18() + renderImportantTimes();
};

renderStop = renderStopV19;
renderDay = renderDayV19;

window.toggleTrip = toggleTrip;
window.setManualNext = setManualNext;
window.resetTripProgress = resetTripProgress;
window.copyKoreanAddress = copyKoreanAddress;
window.downloadReminder = downloadReminder;
window.SeoulTripV19 = {
  siteVersion: SITE_VERSION,
  itineraryVersion: ITINERARY_VERSION,
  tripProgressKey: TRIP_PROGRESS_KEY,
  shoppingKey: storeKey,
  buildIcs: buildIcs,
  metadataCount: Object.keys(EVENT_METADATA).length
};

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(function (error) {
      console.error('Service Worker 註冊失敗', error);
    });
  });
}

render();
