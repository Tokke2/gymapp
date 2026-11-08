/* B1: lokal versionskontroll och försiktig migrering. Inga nätverksanrop. */
(() => {
  'use strict';
  const CURRENT = 1;
  const VERSION_KEY = 'gymapp_schema_version';
  const BACKUP_KEY = 'gymapp_migration_backup_v0';
  const DATA_KEYS = ['ga_data', 'gymapp_balance', 'gym_100reps'];
  let state = {ok:false, reason:'Datakontrollen har inte slutförts.'};
  const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  function parse(raw, label) {
    if (raw === null) return null;
    try { return JSON.parse(raw); }
    catch { throw new Error(`${label} kan inte läsas. Originaldata har inte ändrats.`); }
  }
  function validate(raw) {
    const main = parse(raw.ga_data, 'Träningsdata');
    if (main !== null && !isObject(main)) throw new Error('Träningsdata har ett okänt format.');
    if (main) {
      for (const k of ['mySched','wLog','balDays']) if (main[k] !== undefined && !Array.isArray(main[k])) throw new Error(`Träningsdata (${k}) har ett okänt format.`);
      for (const k of ['weights','grips','setsOk']) if (main[k] !== undefined && !isObject(main[k])) throw new Error(`Träningsdata (${k}) har ett okänt format.`);
      if ((main.mySched || []).some(s => !isObject(s) || !Array.isArray(s.days) || s.days.some(d => !isObject(d) || !Array.isArray(d.ex) || d.ex.some(e => !isObject(e) || typeof e.n !== 'string')))) throw new Error('Ett sparat schema har ett okänt format.');
      if ((main.wLog || []).some(x => !isObject(x))) throw new Error('Viktloggen har ett okänt format.');
    }
    const balance = parse(raw.gymapp_balance, 'Balanshistoriken');
    if (balance !== null && (!isObject(balance) || (balance.exerciseDone !== undefined && !isObject(balance.exerciseDone)) || (balance.weekDone !== undefined && !isObject(balance.weekDone)))) throw new Error('Balanshistoriken har ett okänt format.');
    const reps = parse(raw.gym_100reps, '100-reps-räknaren');
    if (reps !== null && !(typeof reps === 'number' && Number.isInteger(reps) && reps >= 0 && reps <= 100) && !(isObject(reps) && typeof reps.d === 'string' && typeof reps.n === 'number' && Number.isFinite(reps.n))) throw new Error('100-reps-räknaren har ett okänt format.');
    return reps;
  }
  function init() {
    try {
      const stored = localStorage.getItem(VERSION_KEY);
      if (stored !== null && !/^(0|[1-9]\d*)$/.test(stored)) throw new Error('Dataversionen kan inte läsas.');
      const version = stored === null ? 0 : Number(stored);
      if (!Number.isSafeInteger(version) || version > CURRENT) throw new Error('Datan kommer från en nyare appversion. Uppdatera appen innan du ändrar den.');
      const raw = Object.fromEntries(DATA_KEYS.map(k => [k, localStorage.getItem(k)]));
      const reps = validate(raw);
      if (version === 0) {
        /* Kopia före varje faktisk konvertering; kvotfel stoppar migreringen. */
        if (typeof reps === 'number') {
          const snapshot = JSON.stringify({sourceVersion:0, createdAt:new Date().toISOString(), storage:raw});
          const backupKey = localStorage.getItem(BACKUP_KEY) === null ? BACKUP_KEY : `${BACKUP_KEY}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
          localStorage.setItem(backupKey, snapshot);
          localStorage.setItem('gym_100reps', JSON.stringify({d:new Date().toLocaleDateString('sv-SE'),n:reps}));
        }
        try { localStorage.setItem(VERSION_KEY, String(CURRENT)); }
        catch (e) {
          /* Om versionsmarkeringen inte kunde sparas, försök återställa räknaren. */
          if (typeof reps === 'number') { try { localStorage.setItem('gym_100reps', raw.gym_100reps); } catch {} }
          throw e;
        }
      }
      state = {ok:true, version:CURRENT};
    } catch (e) { state = {ok:false, reason:e?.message || 'Lokal lagring kan inte användas.'}; }
    return state;
  }
  function canWrite() {
    if (!state.ok) return false;
    try { return localStorage.getItem(VERSION_KEY) === String(CURRENT); }
    catch { return false; }
  }
  function saveRaw() {
    try {
      const storage = {};
      for (const k of [...DATA_KEYS,VERSION_KEY,BACKUP_KEY]) storage[k] = localStorage.getItem(k);
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(BACKUP_KEY + '_')) storage[k] = localStorage.getItem(k);
      }
      const blob = new Blob([JSON.stringify({type:'GymApp-rådata', exportedAt:new Date().toISOString(), storage},null,2)],{type:'application/json'});
      const url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = 'gymapp-radata.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url),3000);
    } catch { alert('Kunde inte läsa lokal lagring. Ändra eller rensa inte datan innan du har fått hjälp.'); }
  }
  const MUTATING = new Set(['selSch','delMySched','saveSchema','saveW','adjW','setGrip','markSetsOk','acceptProg','dismissProg','togBal','togDone','togDay','addReps','resetReps']);
  function protect(e) {
    if (canWrite()) return;
    const el = e.target?.closest?.('[data-act]');
    if (el && MUTATING.has(el.dataset.act)) {
      e.preventDefault(); e.stopImmediatePropagation();
      alert('Ändringar är pausade för att skydda dina data. Läs varningen högst upp på sidan.');
    }
  }
  init();
  window.GymMigration = {current:CURRENT, versionKey:VERSION_KEY, backupKey:BACKUP_KEY, canWrite, status:() => ({...state}), init};
  document.addEventListener('click', protect, true);
  document.addEventListener('change', protect, true);
  document.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') protect(e); }, true);
  document.addEventListener('DOMContentLoaded', () => {
    if (canWrite()) return;
    const box = document.createElement('section');
    box.setAttribute('role','alert');
    box.style.cssText='position:relative;z-index:2000;margin:12px;padding:16px;border:2px solid #fbbf24;border-radius:12px;background:#211a0a;color:#fff;font:16px/1.5 system-ui,sans-serif';
    const title = document.createElement('strong'); title.textContent='⚠️ Datan är skyddad – ändringar pausade';
    const text = document.createElement('p'); text.textContent=(state.reason || 'Dataversionen har ändrats i en annan flik.') + ' Rensa inte webbläsarens data. Ladda ner rådata om det går och be om hjälp.';
    const b = document.createElement('button'); b.type='button'; b.textContent='⬇️ Ladda ner rådata'; b.style.cssText='padding:10px 14px;border:0;border-radius:8px;background:#fbbf24;color:#211a0a;font-weight:700;cursor:pointer'; b.addEventListener('click',saveRaw);
    box.append(title,text,b); document.body.prepend(box);
  });
})();
