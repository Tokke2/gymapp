/* ═══════════════════════════════════════════════════════════════
   GymApp – Firebase Integration Layer  v2
   ───────────────────────────────────────────────────────────────
   STATUS : ⏸  INAKTIVERAD
   ───────────────────────────────────────────────────────────────

   SNABB AKTIVERING (3 steg):
   ──────────────────────────
   1. Fyll i FB_CONFIG-objektet nedan med dina värden
      från console.firebase.google.com → Projektinställningar

   2. Sätt  FIREBASE_ENABLED = true  (rad ~50)

   3. I index.html, lägg till ÖVERST i <script>-blocket:
        import { FBDB, fbErr, firebaseReady } from './firebase.js';
        // Ersätt LS-objektet:
        const LS = FBDB;

   KRÄVER I FIREBASE-KONSOLEN:
   ────────────────────────────
   ✅ Authentication  → E-post/lösenord  (aktiverat)
   ✅ Authentication  → Google           (aktiverat + supportmail vald)
   ✅ Firestore       → Produktionsläge  (EJ testläge!)
   ✅ Authorized domains → din GitHub Pages-domän + localhost
   ✅ Firestore-regler (se nedan och SETUP_GUIDE.md)

   FIRESTORE-REGLER (klistra in i Firebase-konsolen):
   ────────────────────────────────────────────────────
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid} {
         allow read, write: if request.auth != null
                            && request.auth.uid == uid;
       }
     }
   }

   MIGRATION: Lokalt → Firebase:
   ─────────────────────────────
   import { migrateLocalToFirebase } from './firebase.js';
   const result = await migrateLocalToFirebase();
   console.log(result); // { ok: [...], failed: [...] }
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   ①  KONFIGURATION  ←  Fyll i dina värden här
═══════════════════════════════════════════════════════════════ */

/** ← STEG 2: Byt till true när Firebase är konfigurerat */
export const FIREBASE_ENABLED = false;

/** ← STEG 1: Klistra in din Firebase-config här */
const FB_CONFIG = {
  apiKey:            'REPLACE_WITH_YOUR_API_KEY',
  authDomain:        'REPLACE.firebaseapp.com',
  projectId:         'REPLACE_WITH_PROJECT_ID',
  storageBucket:     'REPLACE.appspot.com',
  messagingSenderId: 'REPLACE_WITH_SENDER_ID',
  appId:             'REPLACE_WITH_APP_ID',
};

/* ── SDK-version – uppdatera vid behov ── */
const FB_VER  = '11.0.2';
const FB_BASE = `https://www.gstatic.com/firebasejs/${FB_VER}`;

/* ── Retry-inställningar ── */
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;

/* ── Offline-stöd ──
   Firestore cachar data lokalt så appen fungerar utan nät.
   multi-tab = flera flikar delar samma cache utan konflikt. */
const OFFLINE_CACHE = true;

/* ═══════════════════════════════════════════════════════════════
   LOG · tyst diagnostik – samma mönster som index.html
   Ingen konsolutskrift i normalläge. Hämtas med ?debug=1
   eller  debugStatus().log
═══════════════════════════════════════════════════════════════ */
const _LOGBUF = [];
const _DEV = typeof location !== 'undefined' && /[?&]debug=1/.test(location.search);
function _log(lvl, msg, extra) {
  _LOGBUF.push({ t: Date.now(), lvl, msg: String(msg).slice(0, 200) });
  if (_LOGBUF.length > 40) _LOGBUF.shift();
  if (_DEV) (console[lvl] || console.log)(`[Firebase] ${msg}`, extra ?? '');
}

/* ═══════════════════════════════════════════════════════════════
   ②  INTERNA INSTANSER  (fylls automatiskt vid init)
═══════════════════════════════════════════════════════════════ */

let _auth      = null;
let _db        = null;
let _gProvider = null;
let _fn        = {};         // Firebase-funktioner
let _initDone  = false;      // Förhindrar dubbel-init
let _online    = true;       // Nätverksstatus

/* ── Behövs redirect istället för popup? ──
   iOS i standalone-läge, inbäddade webbvyer och miljöer utan
   egen fönsteröppning klarar inte signInWithPopup. */
function _needsRedirect() {
  if (typeof navigator === 'undefined') return false;
  const ua  = navigator.userAgent || '';
  const ios = /iPhone|iPad|iPod/.test(ua)
           || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const standalone = (typeof matchMedia !== 'undefined'
      && matchMedia('(display-mode: standalone)').matches)
    || navigator.standalone === true;
  const inApp = /FBAN|FBAV|Instagram|Line\/|wv\)/.test(ua);   // in-app-browser
  return (ios && standalone) || inApp;
}

/* Gemensam efterbehandling för Google-inloggning */
async function _afterGoogle(u) {
  const ref  = _userRef(u.uid);
  const snap = await _fn.getDoc(ref);
  if (!snap.exists()) {
    await _fn.setDoc(ref, _newUserDoc(u.uid, u.displayName, u.email, u.photoURL));
  } else {
    await _fn.updateDoc(ref, {
      photo:    u.photoURL || snap.data().photo || '',
      lastSeen: Date.now(),
    });
  }
  return _toSession(u);
}

/* ═══════════════════════════════════════════════════════════════
   ③  INIT  –  Laddar Firebase SDK asynkront
═══════════════════════════════════════════════════════════════ */

async function _init() {
  if (!FIREBASE_ENABLED) {
    _log('info', 'Inaktiverad – kör lokalt läge');
    return false;
  }

  if (_initDone) return true; // Förhindra dubbel-init

  // Validera att config är ifylld
  const missingKeys = Object.entries(FB_CONFIG)
    .filter(([, v]) => v.startsWith('REPLACE'))
    .map(([k]) => k);

  if (missingKeys.length > 0) {
    _log('error', `Ofullständig config – saknar: ${missingKeys.join(', ')}. Fyll i FB_CONFIG i firebase.js`);
    return false;
  }

  // Ladda SDK med retry
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      const [appMod, authMod, storeMod] = await Promise.all([
        import(`${FB_BASE}/firebase-app.js`),
        import(`${FB_BASE}/firebase-auth.js`),
        import(`${FB_BASE}/firebase-firestore.js`),
      ]);

      const app = appMod.initializeApp(FB_CONFIG);
      _auth = authMod.getAuth(app);
      /* Firestore med lokal cache – appen fungerar offline och
         flera flikar delar samma cache utan att krocka. */
      if (OFFLINE_CACHE && storeMod.initializeFirestore && storeMod.persistentLocalCache) {
        try {
          _db = storeMod.initializeFirestore(app, {
            localCache: storeMod.persistentLocalCache({
              tabManager: storeMod.persistentMultipleTabManager?.(),
            }),
          });
          _log('info', 'Offline-cache aktiv (multi-tab)');
        } catch (e) {
          _db = storeMod.getFirestore(app);
          _log('warn', `Offline-cache ej tillgänglig: ${e.message}`);
        }
      } else {
        _db = storeMod.getFirestore(app);
      }

      // Auth-funktioner
      _fn = {
        createUser:   authMod.createUserWithEmailAndPassword,
        signIn:       authMod.signInWithEmailAndPassword,
        signInPopup:  authMod.signInWithPopup,
        signInRedirect:   authMod.signInWithRedirect,      // iOS-PWA-fallback
        getRedirectResult:authMod.getRedirectResult,
        signOut:      authMod.signOut,
        onAuthChange: authMod.onAuthStateChanged,
        updateProfile:authMod.updateProfile,
        updateEmail:  authMod.updateEmail,
        updatePass:   authMod.updatePassword,
        deleteUser:   authMod.deleteUser,
        sendReset:    authMod.sendPasswordResetEmail,
        GoogleProv:   authMod.GoogleAuthProvider,

        // Firestore
        initializeFirestore:        storeMod.initializeFirestore,
        persistentLocalCache:       storeMod.persistentLocalCache,
        persistentMultipleTabManager: storeMod.persistentMultipleTabManager,
        doc:             storeMod.doc,
        getDoc:          storeMod.getDoc,
        getDocs:         storeMod.getDocs,
        setDoc:          storeMod.setDoc,
        updateDoc:       storeMod.updateDoc,
        deleteDoc:       storeMod.deleteDoc,
        query:           storeMod.query,
        where:           storeMod.where,
        orderBy:         storeMod.orderBy,
        limit:           storeMod.limit,
        arrayUnion:      storeMod.arrayUnion,
        arrayRemove:     storeMod.arrayRemove,
        serverTimestamp: storeMod.serverTimestamp,
        increment:       storeMod.increment,
        onSnapshot:      storeMod.onSnapshot,
        enableNetwork:   storeMod.enableNetwork,
        disableNetwork:  storeMod.disableNetwork,
      };

      _gProvider = new _fn.GoogleProv();
      _gProvider.setCustomParameters({ prompt: 'select_account' });
      _gProvider.addScope('profile');
      _gProvider.addScope('email');

      _initDone = true;
      _monitorNetwork();

      _log('info', `v${FB_VER} ansluten – projekt: ${FB_CONFIG.projectId}`);
      return true;

    } catch (err) {
      const isLast = attempt === RETRY_ATTEMPTS;
      _log('warn', `Init försök ${attempt}/${RETRY_ATTEMPTS}: ${err.message}`);
      if (isLast) {
        _log('error', `Init misslyckades efter ${RETRY_ATTEMPTS} försök`);
        return false;
      }
      await _sleep(RETRY_DELAY_MS * attempt); // exponential backoff
    }
  }
  return false;
}

/** Exporterad promise – awaitas i index.html vid behov */
export const firebaseReady = _init();

/* ═══════════════════════════════════════════════════════════════
   ④  NÄTVERKSÖVERVAKNING  –  hanterar offline/online
═══════════════════════════════════════════════════════════════ */

function _monitorNetwork() {
  window.addEventListener('online', async () => {
    _online = true;
    if (_db) {
      try {
        await _fn.enableNetwork(_db);
        _log('info', 'Nätverket återkopplat – Firestore synkar');
      } catch { /* ignorera */ }
    }
  });

  window.addEventListener('offline', async () => {
    _online = false;
    if (_db) {
      try {
        await _fn.disableNetwork(_db);
        _log('info', 'Offline – Firestore pausad');
      } catch { /* ignorera */ }
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   ⑤  INTERNA HELPERS
═══════════════════════════════════════════════════════════════ */

/** Vänta X millisekunder */
const _sleep = ms => new Promise(r => setTimeout(r, ms));

/** Guard – kastar tydligt fel om Firebase ej är redo */
function _guard(method) {
  if (!FIREBASE_ENABLED)
    throw new Error(`[FBDB.${method}] Firebase är inte aktiverat. Sätt FIREBASE_ENABLED = true.`);
  if (!_initDone || !_auth || !_db)
    throw new Error(`[FBDB.${method}] Firebase är inte initierat ännu. Avvakta firebaseReady.`);
}

/** Retry-wrapper för Firestore-anrop */
async function _retry(fn, attempts = RETRY_ATTEMPTS) {
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      const retryable = [
        'unavailable', 'deadline-exceeded', 'resource-exhausted', 'internal'
      ].some(c => err.code?.includes(c));

      if (!retryable || i === attempts) throw err;
      _log('warn', `Retry ${i}/${attempts} – ${err.code}`);
      await _sleep(RETRY_DELAY_MS * i);
    }
  }
}

/** Referens till ett user-dokument */
const _userRef = uid => _fn.doc(_db, 'users', uid);

/** Standardiserat användar-dokument */
function _newUserDoc(uid, name, email, photo = '') {
  return {
    uid,
    name:         (name  || 'Kämpe').trim(),
    email:        (email || '').toLowerCase().trim(),
    photo:        photo  || '',

    // App-data (samma struktur som lokalt LS)
    sch:          0,
    weights:      {},
    wLog:         [],
    balDays:      [],

    // Notiser
    notifEnabled: false,
    notifBalTime: '08:00',
    notifWoTime:  '17:00',

    // Meta
    created:      Date.now(),
    lastSeen:     Date.now(),
    version:      2,          // schema-version för framtida migreringar
    platform:     _detectPlatform(),
  };
}

/** Mapper Firebase User → GymApp session-objekt */
function _toSession(fbUser) {
  if (!fbUser) return null;
  return {
    uid:   fbUser.uid,
    user:  (fbUser.displayName?.split(' ')[0] || fbUser.email?.split('@')[0] || 'kämpe')
             .toLowerCase().replace(/[^a-z0-9_]/g, ''),
    name:  fbUser.displayName || 'Kämpe',
    email: fbUser.email || '',
    photo: fbUser.photoURL || '',
  };
}

/** Detekterar plattform för statistik */
function _detectPlatform() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad/.test(ua)) return 'ios';
  if (/Android/.test(ua))     return 'android';
  if (/Win/.test(ua))         return 'windows';
  if (/Mac/.test(ua))         return 'mac';
  return 'other';
}

/** Uppdatera lastSeen utan att blockera */
function _touchLastSeen(uid) {
  if (!_initDone) return;
  _fn.updateDoc(_userRef(uid), { lastSeen: Date.now() }).catch(() => {});
}

/* ═══════════════════════════════════════════════════════════════
   ⑥  FBDB  –  Drop-in replacement för LS i index.html
   ─────────────────────────────────────────────────────────────
   Exakt samma API-metoder som lokala LS-objektet:
     data() / save() / get() / set() / del()
   PLUS auth-metoder och Firebase-specifika helpers.
═══════════════════════════════════════════════════════════════ */
export const FBDB = {

  /* ── ENKEL DATA-API  (matchar LS i index.html) ── */

  /**
   * Hämta användardata. Returnerar {} om ej hittad.
   * @param {string} [uid] – om ej anges används inloggad users uid
   */
  async data(uid) {
    _guard('data');
    const u = uid || _auth.currentUser?.uid;
    if (!u) throw new Error('[FBDB.data] Ingen användare inloggad.');
    const snap = await _retry(() => _fn.getDoc(_userRef(u)));
    return snap.exists() ? snap.data() : {};
  },

  /**
   * Spara/slå samman användardata.
   * Använder merge:true – befintliga fält skrivs ej över.
   */
  async save(data, uid) {
    _guard('save');
    const u = uid || _auth.currentUser?.uid;
    if (!u) throw new Error('[FBDB.save] Ingen användare inloggad.');
    await _retry(() => _fn.setDoc(_userRef(u), {
      ...data,
      lastSeen: Date.now(),
    }, { merge: true }));
  },

  /**
   * Hämta ett enskilt fält direkt från Firestore.
   */
  async get(key, uid) {
    _guard('get');
    const u = uid || _auth.currentUser?.uid;
    if (!u) throw new Error('[FBDB.get] Ingen användare inloggad.');
    const snap = await _retry(() => _fn.getDoc(_userRef(u)));
    return snap.exists() ? snap.data()?.[key] : undefined;
  },

  /**
   * Uppdatera ett eller flera specifika fält (ingen merge av hela doc).
   * @param {Object} fields  – { fieldName: value, ... }
   */
  async set(fields, uid) {
    _guard('set');
    const u = uid || _auth.currentUser?.uid;
    if (!u) throw new Error('[FBDB.set] Ingen användare inloggad.');
    await _retry(() => _fn.updateDoc(_userRef(u), {
      ...fields,
      lastSeen: Date.now(),
    }));
  },

  /**
   * Radera ett fält (sätt till deleteField sentinel).
   * Ej implementerat – placeholder för framtiden.
   */
  del() {
    throw new Error('[FBDB.del] Använd set({ field: null }) för att rensa ett fält.');
  },

  /* ── AUTH ── */

  /**
   * Skapa konto med användarnamn + lösenord.
   * Användarnamnet omvandlas till en pseudo-email internt.
   * @returns {Promise<session>}
   */
  async createAccount(username, password, name) {
    _guard('createAccount');

    // Validera innan API-anrop
    if (!username || username.length < 3)
      throw new Error('auth/invalid-username');
    if (!password || password.length < 6)
      throw new Error('auth/weak-password');

    const email = `${username.toLowerCase()}@gymapp.local`;
    const cred  = await _fn.createUser(_auth, email, password);

    await Promise.all([
      _fn.updateProfile(cred.user, { displayName: name }),
      _fn.setDoc(_userRef(cred.user.uid), _newUserDoc(cred.user.uid, name, username)),
    ]);

    return _toSession(cred.user);
  },

  /**
   * Logga in med användarnamn + lösenord.
   * @returns {Promise<session>}
   */
  async signInUser(username, password) {
    _guard('signInUser');
    if (!username || !password)
      throw new Error('auth/missing-credentials');
    const email = `${username.toLowerCase()}@gymapp.local`;
    const cred  = await _fn.signIn(_auth, email, password);
    _touchLastSeen(cred.user.uid);
    return _toSession(cred.user);
  },

  /**
   * Logga in med Google (popup).
   * Skapar automatiskt user-dokument för nya användare.
   * @returns {Promise<session>}
   */
  /* Google-inloggning.
     VIKTIGT: popup blockeras i iOS-PWA (standalone) och i vissa
     inbäddade webbvyer. Där används redirect istället – sidan
     laddas om och resultatet plockas upp av completeGoogleRedirect(). */
  async signInGoogle() {
    _guard('signInGoogle');

    if (_needsRedirect()) {
      _log('info', 'Google-inloggning via redirect (popup stöds ej här)');
      await _fn.signInRedirect(_auth, _gProvider);
      return null;                       // sidan navigerar bort
    }

    let result;
    try {
      result = await _fn.signInPopup(_auth, _gProvider);
    } catch (err) {
      /* Popup blockerad trots allt → fall tillbaka på redirect */
      const code = err?.code || '';
      if (code.includes('popup-blocked') || code.includes('popup-closed')
       || code.includes('operation-not-supported')) {
        _log('warn', `Popup misslyckades (${code}) – byter till redirect`);
        await _fn.signInRedirect(_auth, _gProvider);
        return null;
      }
      throw err;
    }

    return _afterGoogle(result.user);
  },

  /* Anropas vid appstart för att fånga upp en pågående redirect-inloggning */
  async completeGoogleRedirect() {
    if (!FIREBASE_ENABLED || !_initDone) return null;
    try {
      const result = await _fn.getRedirectResult(_auth);
      if (!result?.user) return null;
      _log('info', 'Redirect-inloggning slutförd');
      return await _afterGoogle(result.user);
    } catch (err) {
      _log('warn', `Redirect-resultat: ${err?.code || err?.message}`);
      return null;
    }
  },

  /**
   * Logga ut
   */
  async logout() {
    _guard('logout');
    await _fn.signOut(_auth);
  },

  /**
   * Lyssna på auth-state-ändringar.
   * @param {(session|null) => void} cb
   * @returns {() => void}  unsubscribe
   */
  onAuthChange(cb) {
    if (!FIREBASE_ENABLED || !_auth) return () => {};
    return _fn.onAuthChange(_auth, fbUser => cb(_toSession(fbUser)));
  },

  /**
   * Aktuell inloggad användare (synkront).
   * @returns {session|null}
   */
  currentUser() {
    if (!_auth) return null;
    return _toSession(_auth.currentUser);
  },

  /* ── VIKTLOGG ── */

  /**
   * Lägg till en ny logg-post med arrayUnion (dubblettfri).
   * @param {{ ex, w, d, ts }} entry
   */
  async appendLog(entry, uid) {
    _guard('appendLog');
    const u = uid || _auth.currentUser?.uid;
    if (!u) throw new Error('[FBDB.appendLog] Ingen användare inloggad.');
    if (!entry?.ex || !entry?.w || !entry?.d)
      throw new Error('[FBDB.appendLog] Ogiltig logg-post – kräver: ex, w, d.');
    await _retry(() => _fn.updateDoc(_userRef(u), {
      wLog:     _fn.arrayUnion({ ...entry, ts: entry.ts ?? Date.now() }),
      lastSeen: Date.now(),
    }));
  },

  /**
   * Hämta senaste N logg-poster (läsoptimerat).
   * @param {number} [n=20]
   */
  async getLog(n = 20, uid) {
    _guard('getLog');
    const u = uid || _auth.currentUser?.uid;
    if (!u) throw new Error('[FBDB.getLog] Ingen användare inloggad.');
    const snap = await _retry(() => _fn.getDoc(_userRef(u)));
    if (!snap.exists()) return [];
    const log = snap.data().wLog ?? [];
    return [...log].sort((a, b) => b.ts - a.ts).slice(0, n);
  },

  /* ── BALANS ── */

  /**
   * Toggla en balansövning som gjord/ej gjord.
   * @param {string} key  – t.ex. "Thu Sep 02 2026_3"
   */
  async toggleBal(key, uid) {
    _guard('toggleBal');
    const u = uid || _auth.currentUser?.uid;
    if (!u) throw new Error('[FBDB.toggleBal] Ingen användare inloggad.');
    const snap = await _fn.getDoc(_userRef(u));
    const balDays = snap.exists() ? (snap.data().balDays ?? []) : [];
    const exists  = balDays.includes(key);
    await _fn.updateDoc(_userRef(u), {
      balDays: exists ? _fn.arrayRemove(key) : _fn.arrayUnion(key),
    });
    return !exists; // returnerar nytt state (true = nu gjord)
  },

  /* ── NOTISER ── */

  /**
   * Spara påminnelsetider för en användare.
   */
  async saveNotifTimes(balTime, woTime, uid) {
    _guard('saveNotifTimes');
    const u = uid || _auth.currentUser?.uid;
    if (!u) throw new Error('[FBDB.saveNotifTimes] Ingen användare inloggad.');
    await _fn.updateDoc(_userRef(u), {
      notifBalTime: balTime || '08:00',
      notifWoTime:  woTime  || '17:00',
    });
  },

  /* ── REALTIDSLYSSNING ── */

  /**
   * Lyssna på förändringar i användar-dokumentet i realtid.
   * Returnerar unsubscribe-funktion.
   * @param {(data: Object) => void} cb
   */
  listenUser(cb, uid) {
    _guard('listenUser');
    const u = uid || _auth.currentUser?.uid;
    if (!u) throw new Error('[FBDB.listenUser] Ingen användare inloggad.');
    return _fn.onSnapshot(_userRef(u), snap => {
      if (snap.exists()) cb(snap.data());
    }, err => {
      _log('warn', `listenUser snapshot-fel: ${err.code}`);
    });
  },

  /* ── NÄTVERKSSTATUS ── */

  /** Är appen online just nu? */
  isOnline() { return _online; },

  /** Är Firebase klar? */
  isReady()  { return _initDone; },
};

/* ═══════════════════════════════════════════════════════════════
   ⑦  FELKODER  →  Svenska meddelanden
═══════════════════════════════════════════════════════════════ */

const _ERR = {
  // Auth
  'auth/email-already-in-use':    '❌ Användarnamnet är redan taget.',
  'auth/wrong-password':          '❌ Fel lösenord. Försök igen.',
  'auth/user-not-found':          '❌ Inget konto med det användarnamnet.',
  'auth/invalid-email':           '❌ Ogiltigt format på användarnamnet.',
  'auth/weak-password':           '❌ Lösenordet är för svagt – minst 6 tecken.',
  'auth/invalid-credential':      '❌ Fel användarnamn eller lösenord.',
  'auth/too-many-requests':       '❌ För många försök – vänta en stund.',
  'auth/network-request-failed':  '❌ Nätverksfel – kontrollera anslutningen.',
  'auth/user-disabled':           '❌ Kontot är inaktiverat.',
  'auth/requires-recent-login':   '❌ Logga in igen för att utföra detta.',
  'auth/popup-closed-by-user':    '',   // tyst
  'auth/popup-blocked':           '❌ Popup blockerades – tillåt popups i webbläsaren.',
  'auth/cancelled-popup-request': '',   // tyst
  'auth/missing-credentials':     '❌ Ange användarnamn och lösenord.',
  'auth/invalid-username':        '❌ Användarnamnet måste vara minst 3 tecken.',

  // Firestore
  'permission-denied':            '❌ Åtkomst nekad – kontrollera Firestore-reglerna.',
  'unavailable':                  '❌ Firestore ej tillgänglig – du verkar vara offline.',
  'deadline-exceeded':            '❌ Tidsgräns överskreds – försök igen.',
  'resource-exhausted':           '❌ För många förfrågningar – vänta en stund.',
  'not-found':                    '❌ Dokumentet hittades inte.',
  'already-exists':               '❌ Dokumentet finns redan.',
  'internal':                     '❌ Internt Firebase-fel – försök igen.',
};

/**
 * Omvandla ett Firebase-fel till ett läsbart svenskt meddelande.
 * @param {Error|string} errOrCode
 * @returns {string}  – tom sträng = tyst (visa inget)
 */
export const fbErr = errOrCode => {
  const code = typeof errOrCode === 'string'
    ? errOrCode
    : (errOrCode?.code || errOrCode?.message || '');

  // Exakt matchning
  if (code in _ERR) {
    return _ERR[code]; // kan vara '' (tyst)
  }

  // Partiell matchning (t.ex. "FirebaseError: auth/...")
  for (const [key, msg] of Object.entries(_ERR)) {
    if (code.includes(key)) return msg;
  }

  // Fallback
  _log('warn', `Okänd felkod: ${code}`);
  return `❌ Något gick fel. Försök igen. (${code || 'okänt'})`;
};

/* ═══════════════════════════════════════════════════════════════
   ⑧  KONFIG-VALIDATOR  –  Hjälper vid setup
═══════════════════════════════════════════════════════════════ */

/**
 * Validera att FB_CONFIG är ifylld.
 * Kör i konsolen: import { validateConfig } from './firebase.js';
 *                 validateConfig();
 */
export function validateConfig() {
  const missing = Object.entries(FB_CONFIG)
    .filter(([, v]) => !v || v.startsWith('REPLACE'))
    .map(([k]) => k);

  if (missing.length === 0) {
    console.info('✅ FB_CONFIG ser komplett ut!');
    console.table(Object.fromEntries(
      Object.entries(FB_CONFIG).map(([k, v]) => [k, v.slice(0, 12) + '…'])
    ));
    return true;
  }

  console.error('❌ FB_CONFIG saknar:', missing);
  console.info('👉 Gå till console.firebase.google.com → Projektinställningar → Dina appar');
  return false;
}

/* ═══════════════════════════════════════════════════════════════
   ⑨  MIGRATION  –  Lokalt localStorage → Firestore
   ─────────────────────────────────────────────────────────────
   Kör EN gång i webbläsarens konsol EFTER Firebase-aktivering:

     import { migrateLocalToFirebase } from './firebase.js';
     const result = await migrateLocalToFirebase();
     console.log(result); // { ok: [...], failed: [...] }
═══════════════════════════════════════════════════════════════ */

/**
 * Migrerar lokal GymApp-data (en enda ga_data-nyckel) till Firestore.
 * Säkert att köra flera gånger – hoppar över om data redan finns.
 *
 * @param {string} [targetUid]  – uid att migrera till (default: inloggad user)
 * @returns {Promise<{ ok: boolean, skipped: boolean, error?: string }>}
 */
export async function migrateLocalToFirebase(targetUid) {
  if (!FIREBASE_ENABLED) {
    console.warn('[Migration] Firebase inte aktiverat.');
    return { ok: false, skipped: true, error: 'Firebase ej aktiverat' };
  }

  await firebaseReady;

  const uid = targetUid || _auth?.currentUser?.uid;
  if (!uid) {
    console.error('[Migration] Ingen användare inloggad.');
    return { ok: false, skipped: false, error: 'Ingen användare inloggad' };
  }

  try {
    // Läs lokal data
    const localRaw = localStorage.getItem('ga_data');
    if (!localRaw) {
      console.info('[Migration] Ingen lokal data att migrera.');
      return { ok: true, skipped: true };
    }
    const localData = JSON.parse(localRaw);

    // Kontrollera om Firestore-dokument redan finns
    const ref  = _userRef(uid);
    const snap = await _fn.getDoc(ref);

    if (snap.exists()) {
      const existing = snap.data();
      const localLog = localData.wLog?.length ?? 0;
      const remLog   = existing.wLog?.length   ?? 0;

      if (remLog >= localLog) {
        console.info(`[Migration] ⏭ Firestore har ${remLog} logg-poster (lokal: ${localLog}) – hoppar över.`);
        return { ok: true, skipped: true };
      }
      console.info(`[Migration] Firestore har färre poster (${remLog} vs ${localLog}) – uppdaterar.`);
    }

    // Bygg merged dokument
    const existing  = snap.exists() ? snap.data() : {};
    const mergedDoc = {
      ...(_newUserDoc(uid, existing.name || 'Kämpe', existing.email || '')),
      ...existing,
      ...localData,
      migratedAt: Date.now(),
      version:    2,
    };

    await _fn.setDoc(ref, mergedDoc, { merge: true });

    console.info('[Migration] ✅ Lokal data migrerad till Firestore!');
    console.info(`[Migration] Logg-poster: ${mergedDoc.wLog?.length ?? 0}`);
    return { ok: true, skipped: false };

  } catch (err) {
    console.error('[Migration] ❌ Misslyckades:', err);
    return { ok: false, skipped: false, error: err.message };
  }
}

/* ═══════════════════════════════════════════════════════════════
   ⑩  DEV-HELPERS  –  Används EJ i produktion
═══════════════════════════════════════════════════════════════ */

/**
 * Skriv ut status i konsolen.
 * Kör: import { debugStatus } from './firebase.js'; debugStatus();
 */
export function debugStatus() {
  console.group('🔥 GymApp Firebase Status');
  console.log('Aktiverad:   ', FIREBASE_ENABLED);
  console.log('Init klar:   ', _initDone);
  console.log('Online:      ', _online);
  console.log('Auth:        ', _auth?.currentUser?.email ?? 'ej inloggad');
  console.log('Projekt:     ', FB_CONFIG.projectId);
  console.log('SDK-version: ', FB_VER);
  console.groupEnd();
}

/**
 * Rensa ALL lokal GymApp-data (farlig – bara för dev).
 * Kör: import { devClearLocal } from './firebase.js'; devClearLocal();
 */
export function devClearLocal() {
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    ['ga_data'].forEach(k => localStorage.removeItem(k));
    console.warn('[Dev] ⚠️ Lokal data rensad – ladda om sidan.');
  } else {
    console.error('[Dev] devClearLocal() körs EJ i produktion!');
  }
}
