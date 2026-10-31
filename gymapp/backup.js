/* Google Drive-backup: tillval, ingen GymApp-inloggning och inga sparade OAuth-token. */
(() => {
  'use strict';
  const KEY = 'gymapp-drive-client-id';
  const SCOPE = 'https://www.googleapis.com/auth/drive.file';
  const FILE_TAG = 'gymapp-backup-v1';
  const MAX_BYTES = 5 * 1024 * 1024;
  const KEYS = ['ga_data', 'gymapp_balance', 'gym_100reps'];
  const $ = id => document.getElementById(id);
  let client = null, accessToken = '', tokenExpiry = 0, busy = false;
  let googleState = 'unconfigured', loadPromise = null, generation = 0;
  const status = msg => { $('backup-status').textContent = msg; };
  const errorText = e => e && e.message ? e.message : 'Något gick fel.';
  function buttons() {
    const connected = !!accessToken && Date.now() < tokenExpiry;
    $('backup-connect').disabled = busy || googleState === 'loading' || googleState === 'unconfigured' || connected;
    $('backup-connect').textContent = googleState === 'loading' ? '⏳ Förbereder Google …' : googleState === 'failed' ? '🔄 Försök igen' : connected ? '✅ Google Drive ansluten' : '🔗 Anslut Google Drive';
    $('backup-save-client').disabled = busy;
    $('backup-upload').disabled = busy || !connected;
    $('backup-list').disabled = busy || !connected;
    $('backup-restore').disabled = busy || !connected || !$('backup-files').value;
    $('backup-disconnect').disabled = busy || !connected;
    $('backup-export').disabled = busy;
    $('backup-import').disabled = busy;
  }
  async function run(fn) {
    if (busy) return;
    busy = true; buttons();
    try { await fn(); } catch (e) { status('⚠️ ' + errorText(e)); }
    finally { busy = false; buttons(); }
  }
  function jsonObject(v) { return v && typeof v === 'object' && !Array.isArray(v); }
  function validate(data) {
    if (!jsonObject(data) || data.app !== 'GymApp' || data.format !== 'gymapp-backup' || data.version !== 1 || !jsonObject(data.storage))
      throw new Error('Filen är inte en säkerhetskopia från GymApp eller har en version som inte stöds.');
    if (KEYS.some(k => !Object.prototype.hasOwnProperty.call(data.storage, k))) throw new Error('Säkerhetskopian är ofullständig.');
    for (const k of KEYS) if (data.storage[k] !== null && typeof data.storage[k] !== 'string') throw new Error('Ogiltiga lagringsdata.');
    let main;
    try { main = data.storage.ga_data === null ? {} : JSON.parse(data.storage.ga_data); }
    catch { throw new Error('Träningsdata i kopian är skadade.'); }
    if (!jsonObject(main)) throw new Error('Ogiltiga träningsdata.');
    for (const k of ['mySched', 'wLog', 'balDays']) if (main[k] !== undefined && !Array.isArray(main[k])) throw new Error('Ogiltig träningshistorik.');
    for (const k of ['weights', 'grips', 'setsOk']) if (main[k] !== undefined && !jsonObject(main[k])) throw new Error('Ogiltiga träningsinställningar.');
    if ((main.mySched || []).some(s => !jsonObject(s) || !Array.isArray(s.days) || s.days.some(d =>
      !jsonObject(d) || typeof d.n !== 'string' || !['home','gym','rest'].includes(d.t) || !Array.isArray(d.ex) ||
      d.ex.some(ex => !jsonObject(ex) || typeof ex.n !== 'string' || ['r','s','muscles','breath','img'].some(k => ex[k] !== undefined && typeof ex[k] !== 'string') || (ex.steps !== undefined && (!Array.isArray(ex.steps) || ex.steps.some(step => typeof step !== 'string'))))))) throw new Error('Ett schema i kopian är ogiltigt.');
    if ((main.wLog || []).some(w => !jsonObject(w) || typeof w.ex !== 'string' || typeof w.d !== 'string' || (typeof w.w !== 'number' && typeof w.w !== 'string'))) throw new Error('Viktloggen i kopian är ogiltig.');
    if ((main.balDays || []).some(d => typeof d !== 'string')) throw new Error('Balansavbockningarna i kopian är ogiltiga.');
    if (data.storage.gymapp_balance !== null) {
      let bal; try { bal = JSON.parse(data.storage.gymapp_balance); } catch { throw new Error('Balanshistoriken är skadad.'); }
      if (!jsonObject(bal) || (bal.exerciseDone !== undefined && !jsonObject(bal.exerciseDone)) || (bal.weekDone !== undefined && !jsonObject(bal.weekDone))) throw new Error('Ogiltig balanshistorik.');
    }
    if (data.storage.gym_100reps !== null) {
      let reps; try { reps = JSON.parse(data.storage.gym_100reps); } catch { throw new Error('100-reps-historiken är skadad.'); }
      if (!(typeof reps === 'number' && Number.isFinite(reps)) && !(jsonObject(reps) && typeof reps.n === 'number' && typeof reps.d === 'string')) throw new Error('Ogiltig 100-reps-historik.');
    }
    return data;
  }
  function parse(text) {
    if (new Blob([text]).size > MAX_BYTES) throw new Error('Säkerhetskopian är för stor (max 5 MB).');
    let data; try { data = JSON.parse(text); } catch { throw new Error('Filen innehåller inte giltig JSON.'); }
    return validate(data);
  }
  function snapshot() {
    window.GymBackupHost.flush();
    const storage = Object.fromEntries(KEYS.map(k => [k, localStorage.getItem(k)]));
    const backup = {app:'GymApp', format:'gymapp-backup', version:1, createdAt:new Date().toISOString(), storage};
    validate(backup);
    const text = JSON.stringify(backup, null, 2);
    if (new Blob([text]).size > MAX_BYTES) throw new Error('Datan är för stor (max 5 MB).');
    return text;
  }
  function restore(data) {
    validate(data);
    const d = data.storage.ga_data ? JSON.parse(data.storage.ga_data) : {};
    const date = Number.isNaN(Date.parse(data.createdAt)) ? 'okänt datum' : new Date(data.createdAt).toLocaleString('sv-SE');
    if (!confirm(`Säkerhetskopia: ${date}\nScheman: ${(d.mySched || []).length}\nViktloggposter: ${(d.wLog || []).length}\n\nÅterställning ersätter träningsdata, balanshistorik och 100-reps på denna enhet. Stäng andra öppna GymApp-flikar först. Fortsätta?`)) { status('Återställning avbruten.'); return; }
    window.GymBackupHost.flush();
    const old = Object.fromEntries(KEYS.map(k => [k, localStorage.getItem(k)]));
    try {
      for (const k of KEYS) data.storage[k] === null ? localStorage.removeItem(k) : localStorage.setItem(k, data.storage[k]);
    } catch (e) {
      for (const k of KEYS) { try { old[k] === null ? localStorage.removeItem(k) : localStorage.setItem(k, old[k]); } catch {} }
      throw new Error('Återställningen misslyckades. Kontrollera lagringsutrymme; tidigare data försökte återställas.');
    }
    window.GymBackupHost.restored(data.storage.ga_data);
    status('✅ Återställt. Appen laddas om.');
    location.reload();
  }
  async function drive(url, options = {}) {
    if (!accessToken || Date.now() >= tokenExpiry) { accessToken = ''; throw new Error('Google-anslutningen har gått ut. Anslut igen.'); }
    const r = await fetch(url, {...options, headers: {...(options.headers || {}), Authorization:'Bearer ' + accessToken}});
    if (r.status === 401) { accessToken = ''; throw new Error('Google-anslutningen har gått ut. Anslut igen.'); }
    if (!r.ok) throw new Error(`Google Drive svarade ${r.status}. Kontrollera Drive API, behörighet och internet.`);
    return r;
  }
  const validClient = id => /^[\w-]+\.apps\.googleusercontent\.com$/.test(id);
  function loadGoogle() {
    if (window.google?.accounts?.oauth2) return Promise.resolve();
    if (loadPromise) return loadPromise;
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const timer = setTimeout(() => { script.remove(); reject(new Error('Google kunde inte laddas. Kontrollera internet och försök igen.')); }, 15000);
      script.src = 'https://accounts.google.com/gsi/client'; script.async = true;
      script.onload = () => { clearTimeout(timer); resolve(); };
      script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error('Google kunde inte laddas.')); };
      document.head.appendChild(script);
    }).catch(e => { loadPromise = null; throw e; });
    return loadPromise;
  }
  async function prepareGoogle() {
    const current = ++generation;
    const id = $('backup-client').value.trim();
    client = null;
    if (!validClient(id)) {
      googleState = 'unconfigured'; buttons();
      status('Google Drive är inte konfigurerat än. Öppna inställningarna för appens ägare.');
      return;
    }
    googleState = 'loading'; buttons(); status('Förbereder Google Drive …');
    try {
      if (!navigator.onLine) throw new Error('Anslut till internet för Google Drive.');
      await loadGoogle();
      if (current !== generation) return;
      client = window.google.accounts.oauth2.initTokenClient({ client_id:id, scope:SCOPE,
        callback: response => {
          if (current !== generation) return;
          if (response.error || !response.access_token) { accessToken = ''; status('⚠️ Google-anslutningen avbröts eller nekades.'); }
          else { accessToken = response.access_token; tokenExpiry = Date.now() + Math.max(0, Number(response.expires_in || 0) - 30) * 1000; status('✅ Google Drive ansluten tillfälligt. Välj säkerhetskopiera eller visa kopior.'); }
          buttons();
        },
        error_callback: () => { if (current !== generation) return; status('⚠️ Google-fönstret stängdes eller blockerades. Tillåt popup och försök igen.'); buttons(); }
      });
      googleState = 'ready'; status('Tryck på ”Anslut Google Drive” för att välja konto.');
    } catch (e) {
      if (current !== generation) return;
      googleState = 'failed'; status('⚠️ ' + errorText(e));
    }
    buttons();
  }
  $('backup-drive-panel').addEventListener('toggle', () => {
    if ($('backup-drive-panel').open && !accessToken && googleState !== 'ready' && googleState !== 'loading') prepareGoogle();
  });
  $('backup-save-client').addEventListener('click', () => {
    const id = $('backup-client').value.trim();
    if (!validClient(id)) { status('⚠️ Ange ett giltigt OAuth-klient-ID från Google Cloud.'); return; }
    try { localStorage.setItem(KEY, id); } catch { status('⚠️ Det gick inte att spara klient-ID:t på enheten.'); return; }
    accessToken = ''; tokenExpiry = 0; prepareGoogle();
  });
  $('backup-connect').addEventListener('click', () => {
    if (googleState === 'failed') { prepareGoogle(); return; }
    try {
      if (!client) throw new Error('Google Drive är inte konfigurerat än.');
      // Popup måste startas direkt från användarens tryck, utan await.
      client.requestAccessToken({prompt:'consent'});
    } catch (e) { status('⚠️ ' + errorText(e)); }
  });
  $('backup-client').addEventListener('input', () => {
    ++generation; client = null; googleState = 'unconfigured'; accessToken = ''; tokenExpiry = 0; buttons();
  });
  $('backup-upload').addEventListener('click', () => run(async () => {
    const text = snapshot();
    const metadata = {name:`GymApp-säkerhetskopia-${new Date().toISOString().slice(0,10)}.json`, mimeType:'application/json', appProperties:{gymapp:FILE_TAG}};
    const boundary = 'gymapp_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    const body = new Blob([`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`, JSON.stringify(metadata), `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`, text, `\r\n--${boundary}--\r\n`], {type:`multipart/related; boundary=${boundary}`});
    status('Laddar upp säkerhetskopian …');
    await drive('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name', {method:'POST', body});
    status('✅ Säkerhetskopian är sparad i din Google Drive.');
  }));
  $('backup-list').addEventListener('click', () => run(async () => {
    status('Hämtar säkerhetskopior …');
    const q = "trashed = false and appProperties has { key='gymapp' and value='" + FILE_TAG + "' }";
    const params = new URLSearchParams({q, fields:'nextPageToken,files(id,name,createdTime,size)', orderBy:'createdTime desc', pageSize:'100'});
    const result = await (await drive('https://www.googleapis.com/drive/v3/files?' + params)).json();
    const select = $('backup-files'); select.replaceChildren();
    const empty = document.createElement('option'); empty.value = ''; empty.textContent = 'Välj säkerhetskopia'; select.append(empty);
    for (const f of result.files || []) {
      const option = document.createElement('option'); option.value = f.id;
      option.textContent = `${f.name} – ${new Date(f.createdTime).toLocaleString('sv-SE')}`; select.append(option);
    }
    status(result.files?.length ? `Hittade ${result.files.length} kopior${result.nextPageToken ? ' (visar de 100 senaste)' : ''}.` : 'Inga säkerhetskopior hittades för denna app och detta Google-konto.');
  }));
  $('backup-files').addEventListener('change', buttons);
  $('backup-restore').addEventListener('click', () => run(async () => {
    const id = $('backup-files').value; if (!id) throw new Error('Välj en säkerhetskopia.');
    status('Hämtar säkerhetskopian …');
    const response = await drive('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(id) + '?alt=media');
    const length = Number(response.headers.get('content-length') || 0);
    if (length > MAX_BYTES) throw new Error('Säkerhetskopian är för stor (max 5 MB).');
    restore(parse(await response.text()));
  }));
  $('backup-disconnect').addEventListener('click', () => {
    const old = accessToken; accessToken = ''; tokenExpiry = 0; $('backup-files').replaceChildren(new Option('Välj säkerhetskopia',''));
    if (old && window.google?.accounts?.oauth2) google.accounts.oauth2.revoke(old, () => {});
    status('Google Drive är frånkopplat. Dina säkerhetskopior finns kvar i Drive.'); buttons();
  });
  $('backup-export').addEventListener('click', () => run(async () => {
    const url = URL.createObjectURL(new Blob([snapshot()], {type:'application/json'}));
    const a = document.createElement('a'); a.href = url; a.download = `gymapp-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000); status('✅ Säkerhetskopian har laddats ner.');
  }));
  $('backup-import').addEventListener('click', () => $('backup-import-file').click());
  $('backup-import-file').addEventListener('change', e => run(async () => {
    const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
    if (file.size > MAX_BYTES) throw new Error('Säkerhetskopian är för stor (max 5 MB).');
    restore(parse(await file.text()));
  }));
  try { $('backup-client').value = window.GYMAPP_GOOGLE_CLIENT_ID || localStorage.getItem(KEY) || ''; } catch { $('backup-client').value = window.GYMAPP_GOOGLE_CLIENT_ID || ''; }
  buttons();
})();
