/* ═══════════════════════════════════════════════════════════════
   GymApp – Service Worker  v3
   ───────────────────────────────────────────────────────────────

   Cache-strategi per resurstyp:
   ┌─────────────────────┬──────────────────┬────────────────────┐
   │ Resurs              │ Strategi         │ Motivering         │
   ├─────────────────────┼──────────────────┼────────────────────┤
   │ index.html + nav    │ Stale-while-rev. │ Snabbt + alltid up │
   │ Bilder (images/)    │ Cache First      │ Aldrig ändras      │
   │ Ikoner (icons/)     │ Cache First      │ Aldrig ändras      │
   │ manifest.json       │ Network First    │ Uppdateras ibland  │
   │ sw.js               │ Network Only     │ Får ej cachas      │
   │ Firebase / CDN      │ Network Only     │ Externt, ej cachas │
   │ Allt annat          │ Network First    │ Alltid färskt      │
   └─────────────────────┴──────────────────┴────────────────────┘

   Meddelanden från appen (postMessage):
   • SKIP_WAITING   → Aktivera ny SW direkt
   • GET_VERSION    → Returnerar { type:'VERSION', version, built }
   • CLEAR_CACHE    → Raderar alla cacher → { type:'CACHE_CLEARED' }
   • PREFETCH_IMGS  → Förcachas bildsökvägar   → { type:'PREFETCH_DONE' }
   • CACHE_STATS    → Returnerar cachestorlek → { type:'CACHE_STATS', ... }
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   ①  VERSION & CACHE-NAMN
   ── Öka VERSION vid varje deploy för att rensa gamla cacher ──
═══════════════════════════════════════════════════════════════ */
const VERSION   = 'gymlig-v18';
const BUILT_AT  = '2026-11-01e';          // uppdateras vid deploy
const CACHE_APP = `${VERSION}-app`;      // HTML, manifest, ikoner
const CACHE_IMG = `${VERSION}-img`;      // Bilder (långa TTL)
const ALL_CACHES = [CACHE_APP, CACHE_IMG];

/* ═══════════════════════════════════════════════════════════════
   ②  APP-SKAL  –  Cachas direkt vid installation
   ── Allt appen behöver för att starta offline ──
═══════════════════════════════════════════════════════════════ */
const APP_SHELL = [
  './',
  './index.html',
  './backup.js',
  './google-drive-setup.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

/* Fristående sidor – ligger i rotmappen, en nivå upp */
const EXTRA_PAGES = [
  '../träningsschema.html',
  '../balansrutin.html',
  '../visitkort.html',
  '../tryck/visitkort-framsida.svg',
  '../tryck/visitkort-baksida.svg',
  '../tryck/flyer-a5.svg',
];

/* ═══════════════════════════════════════════════════════════════
   ③  BILDKATALOG  –  Förcachas i bakgrunden efter install
   ── Alla träningsbilder så de finns offline ──
═══════════════════════════════════════════════════════════════ */
const EXERCISE_IMAGES = [
  './images/ab-roller.png',
  './images/bal-calf-raise.png',
  './images/bal-head-rotation.png',
  './images/bal-heel-toe.png',
  './images/bal-leg-lift.png',
  './images/bal-one-leg.png',
  './images/bal-side-lean.png',
  './images/benchpress.png',
  './images/bicep-curl-machine.png',
  './images/bicycle-crunches.png',
  './images/cable-flyes.png',
  './images/cable-straight-arm.png',
  './images/counter-squat.png',
  './images/dumbbell-curl.png',
  './images/facepull.png',
  './images/glute-bridge.png',
  './images/goblet-squat.png',
  './images/grip-over.png',
  './images/grip-under.png',
  './images/hip-thrust.png',
  './images/kb-bent-over-row.png',
  './images/kb-chest-press.png',
  './images/kb-deadlift.png',
  './images/lat-pulldown.png',
  './images/lateral-raise.png',
  './images/leg-press.png',
  './images/machine-shoulder-press.png',
  './images/pullup.png',
  './images/pushup-knees.png',
  './images/seated-row.png',
  './images/shoulder-press.png',
  './images/skullcrusher.png',
  './images/smith-squat.png',
  './images/sumo-squat.png',
  './images/tricep-kickback.png',
  './images/tricep-press.png',
  './images/triceps-dips.png',
];

/* ═══════════════════════════════════════════════════════════════
   ④  NETWORK-ONLY MÖNSTER  –  Cachas aldrig
═══════════════════════════════════════════════════════════════ */
const NETWORK_ONLY_PATTERNS = [
  'stream.zeno.fm',          // Radioströmmar
  'gstatic.com/firebasejs',  // Firebase SDK
  'firebaseapp.com',         // Firebase Auth
  'googleapis.com',          // Google APIs
  'accounts.google.com',     // Google Identity Services – aldrig offline-cachad
  'supabase.co',             // Supabase (framtida)
  'analytics',               // Analytics-anrop
];

/* ═══════════════════════════════════════════════════════════════
   ⑤  HJÄLPFUNKTIONER
═══════════════════════════════════════════════════════════════ */

/** Är URL:en network-only? */
const isNetworkOnly = url =>
  NETWORK_ONLY_PATTERNS.some(p => url.includes(p)) ||
  url === self.location.href;    // sw.js sig själv cachas aldrig

/** Är requesten en bildresurs? */
const isImage = req =>
  req.destination === 'image' ||
  /\.(png|jpg|jpeg|gif|webp|svg|avif)(\?|$)/i.test(req.url);

/** Är requesten en navigation (HTML-sida)? */
const isNavigation = req => req.mode === 'navigate';

/** Är requesten ett app-skal-fil? */
const isAppShell = url =>
  APP_SHELL.some(f => url.endsWith(f.replace('./', '/'))) ||
  url.endsWith('/');

/** Skicka meddelande till alla öppna klient-fönster */
const broadcast = msg =>
  self.clients.matchAll({ includeUncontrolled: true })
    .then(cls => cls.forEach(c => c.postMessage(msg)));

/** Säker cache.put – ignorerar opaque responses */
function safePut(cache, request, response) {
  if (!response || response.status === 0) return; // opaque – skip
  if (!response.ok && response.status !== 0) return; // fel – skip
  try { cache.put(request, response.clone()); } catch { /* quota exceeded */ }
}

/* ═══════════════════════════════════════════════════════════════
   ⑥  INSTALL  –  Cacher app-skalet + bilder asynkront
═══════════════════════════════════════════════════════════════ */
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    // Öppna cache och lägg till app-skalet (blocking)
    const appCache = await caches.open(CACHE_APP);
    await appCache.addAll(APP_SHELL).catch(() => {
      /* Enstaka fil kan saknas – fortsätt ändå, hellre delvis cache än ingen */
    });

    /* Fristående sidor cachas en och en så ett fel inte fäller hela installationen */
    await Promise.all(EXTRA_PAGES.map(u =>
      fetch(u).then(r => r.ok && safePut(appCache, u, r)).catch(() => {})
    ));

    // Förcacha bilder i bakgrunden (non-blocking – felsäkert)
    const imgCache = await caches.open(CACHE_IMG);
    Promise.all(
      EXERCISE_IMAGES.map(url =>
        imgCache.match(url).then(hit => {
          if (!hit) return fetch(url).then(r => safePut(imgCache, url, r)).catch(() => {});
        })
      )
    );

    // Aktivera SW direkt utan att vänta på att gamla flikar stängs
    await self.skipWaiting();
  })());
});

/* ═══════════════════════════════════════════════════════════════
   ⑦  ACTIVATE  –  Rensa gamla cacher + ta kontroll
═══════════════════════════════════════════════════════════════ */
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Radera alla cacher som inte tillhör denna version
    const keys = await caches.keys();
    const stale = keys.filter(k => !ALL_CACHES.includes(k));
    await Promise.all(stale.map(k => caches.delete(k)));

    // Ta kontroll över alla öppna flikar direkt
    await self.clients.claim();

    // Meddela appen att ny version är aktiv
    broadcast({ type: 'SW_UPDATED', version: VERSION, built: BUILT_AT });
  })());
});

/* ═══════════════════════════════════════════════════════════════
   ⑧  FETCH  –  Smarta cache-strategier
═══════════════════════════════════════════════════════════════ */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = request.url;

  // ── Hoppa över: POST/PUT/DELETE, extensions, network-only ──
  if (request.method !== 'GET')     return;
  if (isNetworkOnly(url))           return;
  if (url.startsWith('chrome-extension://')) return;
  if (url.startsWith('moz-extension://'))    return;

  // ── Navigering (HTML) → Stale-While-Revalidate ────────────
  //    Returnera cache omedelbart, uppdatera i bakgrunden
  if (isNavigation(request)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_APP));
    return;
  }

  // ── Bilder → Cache First (lång TTL) ───────────────────────
  if (isImage(request)) {
    event.respondWith(cacheFirst(request, CACHE_IMG));
    return;
  }

  // ── App-skal (manifest.json, ikoner) → Cache First ────────
  if (isAppShell(url)) {
    event.respondWith(cacheFirst(request, CACHE_APP));
    return;
  }

  // ── Allt annat → Network First ────────────────────────────
  event.respondWith(networkFirst(request, CACHE_APP));
});

/* ═══════════════════════════════════════════════════════════════
   ⑨  CACHE-STRATEGIER
═══════════════════════════════════════════════════════════════ */

/**
 * Stale-While-Revalidate
 * → Returnera cache omedelbart (snabbast möjliga start)
 * → Hämta ny version i bakgrunden → uppdatera cache
 * → Perfekt för index.html – alltid snabb, alltid färsk
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Starta nätverkshämtning i bakgrunden (ej awaited)
  const networkPromise = fetch(request)
    .then(response => {
      safePut(cache, request, response);
      return response.clone();
    })
    .catch(() => null);

  // Returnera cache direkt om det finns
  if (cached) return cached;

  // Ingen cache – vänta på nätverket
  const network = await networkPromise;
  if (network) return network;

  // Helt offline – visa offline-sida
  return offlineFallback();
}

/**
 * Cache First
 * → Kolla cache → om träff returnera direkt (snabbast)
 * → Annars: nätverket → spara i cache
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      safePut(cache, request, response);
    }
    return response;
  } catch {
    // Offline och ingenting i cache
    if (isImage(request)) return placeholderImage();
    return offlineFallback();
  }
}

/**
 * Network First
 * → Försök nätverket → spara i cache
 * → Om nätverket failar → returnera cache
 */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      safePut(cache, request, response);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || offlineFallback();
  }
}

/**
 * Offline-sida som returneras vid navigation utan nätverket
 */
async function offlineFallback() {
  const cached = await caches.match('./index.html');
  if (cached) return cached;
  return new Response(
    `<!DOCTYPE html><html lang="sv"><head><meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>GymApp – Offline</title>
    <style>
      body{font-family:-apple-system,sans-serif;background:#06060d;color:#f8fafc;
           display:flex;flex-direction:column;align-items:center;justify-content:center;
           min-height:100vh;margin:0;text-align:center;padding:24px}
      h1{font-size:2rem;margin-bottom:8px}
      p{color:#94a3b8;font-size:.9rem;max-width:300px;line-height:1.6}
      button{margin-top:20px;padding:12px 28px;background:#7c3aed;color:#fff;
             border:none;border-radius:12px;font-size:1rem;cursor:pointer}
    </style></head><body>
    <div style="font-size:3rem;margin-bottom:16px">📴</div>
    <h1>Du är offline</h1>
    <p>GymApp behöver en anslutning för att starta första gången. Kontrollera ditt nätverk och försök igen.</p>
    <button onclick="location.reload()">🔄 Försök igen</button>
    </body></html>`,
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

/**
 * 1×1 px transparent PNG som platshållare för offline-bilder
 */
function placeholderImage() {
  const px = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  return new Response(
    Uint8Array.from(atob(px), c => c.charCodeAt(0)),
    { status: 200, headers: { 'Content-Type': 'image/png' } }
  );
}

/* ═══════════════════════════════════════════════════════════════
   ⑩  PUSH NOTIFICATIONS
═══════════════════════════════════════════════════════════════ */
self.addEventListener('push', event => {
  // Standardvärden om payload saknas eller är trasig
  const defaults = {
    title:    '💪 GymApp',
    body:     'Dags att träna!',
    tag:      'gymapp-general',
    url:      './',
    type:     'general',
  };

  let data = { ...defaults };
  try {
    if (event.data) Object.assign(data, event.data.json());
  } catch {
    // Payload var inte JSON – behåll defaults
  }

  // Anpassa ikon och badge per notis-typ
  const iconMap = {
    workout:  './icons/icon-192.png',
    balance:  './icons/icon-192.png',
    general:  './icons/icon-192.png',
  };

  const options = {
    body:               data.body,
    icon:               iconMap[data.type] || './icons/icon-192.png',
    badge:              './icons/icon-192.png',
    tag:                data.tag,
    vibrate:            [200, 100, 200],
    silent:             false,
    requireInteraction: false,
    timestamp:          Date.now(),
    data:               { url: data.url, type: data.type },
    actions: [
      { action: 'open',    title: '🏋️ Öppna appen' },
      { action: 'dismiss', title: '✖️ Stäng'         },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/* ═══════════════════════════════════════════════════════════════
   ⑪  NOTIFICATION CLICK
═══════════════════════════════════════════════════════════════ */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const notifData = event.notification.data || {};
  const targetUrl = notifData.url
    ? new URL(notifData.url, self.location.origin).href
    : self.location.origin + '/';

  event.waitUntil((async () => {
    const all = await clients.matchAll({ type: 'window', includeUncontrolled: true });

    // Hitta befintlig flik med rätt origin
    const existing = all.find(c =>
      new URL(c.url).origin === self.location.origin && 'focus' in c
    );

    if (existing) {
      await existing.focus();
      // Navigera till rätt tab via postMessage
      if (notifData.type === 'balance') existing.postMessage({ type: 'GOTO_TAB', tab: 'balance' });
      if (notifData.type === 'workout') existing.postMessage({ type: 'GOTO_TAB', tab: 'workout' });
      return;
    }

    // Ingen flik öppen – öppna ny
    return clients.openWindow(targetUrl);
  })());
});

/* ═══════════════════════════════════════════════════════════════
   ⑫  BACKGROUND SYNC  –  Klar för Firebase
═══════════════════════════════════════════════════════════════ */
self.addEventListener('sync', event => {
  switch (event.tag) {
    case 'sync-weights':
      // event.waitUntil(syncWeightsToFirebase());
      // Aktivera när Firebase är på:
      // import { FBDB } from './firebase.js'; await FBDB.save(localData);
      break;

    case 'sync-balance':
      // event.waitUntil(syncBalanceToFirebase());
      break;

    case 'sync-all':
      // event.waitUntil(syncAllToFirebase());
      break;
  }
});

/* ═══════════════════════════════════════════════════════════════
   ⑬  PERIODIC BACKGROUND SYNC  –  Dagliga uppdateringar
   (Kräver periodicsync permission + HTTPS)
═══════════════════════════════════════════════════════════════ */
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-check') {
    event.waitUntil((async () => {
      // Uppdatera app-skalet i bakgrunden varje dag
      const cache = await caches.open(CACHE_APP);
      await Promise.all(
        APP_SHELL.map(url =>
          fetch(url, { cache: 'no-store' })
            .then(r => { if (r.ok) safePut(cache, url, r); })
            .catch(() => {})
        )
      );
    })());
  }
});

/* ═══════════════════════════════════════════════════════════════
   ⑭  MESSAGE  –  Kommunikation med appen
═══════════════════════════════════════════════════════════════ */
self.addEventListener('message', event => {
  if (!event.data || typeof event.data !== 'object') return;
  const { type, payload } = event.data;
  const src = event.source;

  switch (type) {

    /* Aktivera ny SW direkt (utan att vänta på flik-stängning) */
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    /* Skicka tillbaka versionsinformation */
    case 'GET_VERSION':
      src?.postMessage({ type: 'VERSION', version: VERSION, built: BUILT_AT });
      break;

    /* Radera ALLA cacher */
    case 'CLEAR_CACHE':
      caches.keys()
        .then(keys => Promise.all(keys.map(k => caches.delete(k))))
        .then(() => src?.postMessage({ type: 'CACHE_CLEARED', version: VERSION }));
      break;

    /* Förcacha specifika bilder (skickas med lista av URLs) */
    case 'PREFETCH_IMGS': {
      const urls = Array.isArray(payload?.urls) ? payload.urls : EXERCISE_IMAGES;
      caches.open(CACHE_IMG).then(cache =>
        Promise.all(
          urls.map(url =>
            cache.match(url).then(hit => {
              if (!hit) return fetch(url).then(r => safePut(cache, url, r)).catch(() => {});
            })
          )
        )
      ).then(() => src?.postMessage({ type: 'PREFETCH_DONE', count: urls.length }));
      break;
    }

    /* Returnera cache-statistik */
    case 'CACHE_STATS':
      Promise.all([
        caches.open(CACHE_APP).then(c => c.keys()).then(k => k.length),
        caches.open(CACHE_IMG).then(c => c.keys()).then(k => k.length),
      ]).then(([app, img]) =>
        src?.postMessage({
          type:    'CACHE_STATS',
          version: VERSION,
          built:   BUILT_AT,
          app,
          img,
          total:   app + img,
        })
      );
      break;

    /* Navigera till en specifik tab (skickas från notis-klick) */
    case 'GOTO_TAB':
      // index.html lyssnar på detta och anropar goTab()
      // Inget att göra i SW – passeras direkt till klienten
      break;

    default:
      // Okänt meddelande – ignorera tyst
      break;
  }
});
