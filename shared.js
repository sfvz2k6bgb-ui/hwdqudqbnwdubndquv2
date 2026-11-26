// Gemeinsame Funktionen für Bestell- und Rechenhilfe-Seite (benötigt articles.js).

const fmt = v => v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
const fmtP = v => v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Zahlenarray aus localStorage laden; bei falscher Länge oder Fehler: lauter Nullen.
function loadArr(key) {
  const empty = articles.map(() => 0);
  try {
    const v = JSON.parse(localStorage.getItem(key) || 'null');
    if (Array.isArray(v) && v.length === articles.length) {
      return v.map(x => Math.max(0, parseInt(x, 10) || 0));
    }
  } catch (e) {}
  return empty;
}

function saveArr(key, arr) {
  try { localStorage.setItem(key, JSON.stringify(arr)); } catch (e) {}
}

function clearOrder() {
  try {
    localStorage.removeItem('fwQty');
    localStorage.removeItem('fwDep');
  } catch (e) {}
}

// Gesamtsumme (Artikel + Pfand) in Euro, intern in Cent gerechnet.
function computeTotal(qty, dep) {
  let cents = 0;
  articles.forEach((a, i) => {
    if (a.separator) return;
    cents += Math.round((qty[i] || 0) * a.price * 100);
    if ((a.pfand || 0) > 0) cents += Math.round((dep[i] || 0) * a.pfand * 100);
  });
  return cents / 100;
}

// Zwischensummen in Euro (Cent-genau): Bestellung und Pfand getrennt.
function computeParts(qty, dep) {
  let orderC = 0, pfandC = 0;
  articles.forEach((a, i) => {
    if (a.separator) return;
    orderC += Math.round((qty[i] || 0) * a.price * 100);
    if ((a.pfand || 0) > 0) pfandC += Math.round((dep[i] || 0) * a.pfand * 100);
  });
  return { order: orderC / 100, pfand: pfandC / 100 };
}

// Pfandzeilen für die Zusammenfassung, gruppiert nach Einzelbetrag.
// Beispiel: 2x Pfand 2,00 €, 3x Pfand 5,00 €
function pfandLines(dep) {
  const groups = new Map(); // Cent-Betrag -> Anzahl
  articles.forEach((a, i) => {
    if (a.separator || !((a.pfand || 0) > 0)) return;
    const n = dep[i] || 0;
    if (n <= 0) return;
    const cents = Math.round(a.pfand * 100);
    groups.set(cents, (groups.get(cents) || 0) + n);
  });
  return [...groups.entries()]
    .sort((x, y) => x[0] - y[0])
    .map(([cents, count]) => ({ count, text: 'Pfand ' + fmt(cents / 100) }));
}

function addLine(target, count, text) {
  const line = document.createElement('div');
  line.className = 'line';
  const n = document.createElement('span');
  n.className = 'n';
  n.textContent = count + 'x';
  const t = document.createElement('span');
  t.textContent = text;
  line.append(n, t);
  target.appendChild(line);
}

// Zusammenfassung zeichnen: Artikel oben, Pfand unten, Summe. Gibt die Summe zurück.
function renderSummary(qty, dep) {
  const linesEl = document.getElementById('lines');
  const pfandEl = document.getElementById('pfandBox');
  linesEl.textContent = '';
  pfandEl.textContent = '';
  articles.forEach((a, i) => {
    if (!a.separator && qty[i] > 0) addLine(linesEl, qty[i], a.name);
  });
  pfandLines(dep).forEach(l => addLine(pfandEl, l.count, l.text));
  if (!linesEl.children.length && !pfandEl.children.length) {
    const e = document.createElement('div');
    e.className = 'empty';
    e.textContent = 'Keine Artikel';
    linesEl.appendChild(e);
  }
  const total = computeTotal(qty, dep);
  document.getElementById('sum').textContent = fmt(total);
  const parts = computeParts(qty, dep);
  const subOrder = document.getElementById('subOrder');
  const subPfand = document.getElementById('subPfand');
  if (subOrder) subOrder.textContent = parts.order > 0 ? fmt(parts.order) : '';
  if (subPfand) subPfand.textContent = parts.pfand > 0 ? fmt(parts.pfand) : '';
  return total;
}

// Zoomen verhindern, Scrollen nur in den angegebenen Bereichen erlauben
function lockGestures(scrollSelector) {
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('touchmove', e => {
    if (!e.target.closest(scrollSelector)) e.preventDefault();
  }, { passive: false });
}

// Bildschirm aktiv halten (Screen Wake Lock API)
let wakeLock = null;

async function requestWakeLock() {
  if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
  if (wakeLock) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => { wakeLock = null; });
  } catch (e) {
    wakeLock = null;
  }
}

function keepAwake() {
  requestWakeLock();
  // Beim Zurückkehren in die App erneut anfordern
  document.addEventListener('visibilitychange', requestWakeLock);
  // Nach der ersten Berührung erneut versuchen (Nutzeraktion erforderlich)
  ['touchend', 'click'].forEach(ev =>
    document.addEventListener(ev, requestWakeLock, { passive: true })
  );
}