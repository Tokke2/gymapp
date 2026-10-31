'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
class Element {
  constructor(id) { this.id = id; this.value = ''; this.textContent = ''; this.disabled = false; this.handlers = {}; this.children = []; this.files = []; }
  addEventListener(type, fn) { this.handlers[type] = fn; }
  append(el) { this.children.push(el); }
  replaceChildren(...items) { this.children = items; this.value = ''; }
  click() { return this.handlers.click?.({target:this}); }
}
const ids = ['backup-status','backup-connect','backup-drive-panel','backup-save-client','backup-upload','backup-list','backup-restore','backup-disconnect','backup-export','backup-import','backup-files','backup-client','backup-import-file'];
const nodes = Object.fromEntries(ids.map(id => [id, new Element(id)]));
const data = new Map();
const store = { getItem:k => data.has(k) ? data.get(k) : null, setItem:(k,v) => data.set(k,String(v)), removeItem:k => data.delete(k) };
const doc = {getElementById:id => nodes[id], createElement:tag => new Element(tag), head:{appendChild(){ throw Error('unexpected script injection'); }}};
let config, lastUpload, confirmResult = true, reloaded = false, failedRequest = false, savedBlob, restoredRaw, driveCopies = [];
const oauth = {initTokenClient: opts => {config=opts; return {requestAccessToken: () => opts.callback({access_token:'not-a-real-token', expires_in:3600})};}, revoke:()=>{}};
const window = {google:{accounts:{oauth2:oauth}}, GymBackupHost:{flush(){}, restored(raw){restoredRaw=raw;}}};
const context = {window, google:window.google, document:doc, localStorage:store, navigator:{onLine:true}, location:{reload(){reloaded=true;}},
  Blob, URLSearchParams, URL:{createObjectURL(blob){savedBlob=blob; return 'blob:mock';}, revokeObjectURL(){}},
  Option: class extends Element { constructor(text,value) {super('option');this.textContent=text;this.value=value;} },
  confirm:()=>confirmResult, setTimeout:()=>1, clearTimeout(){}, Date, Math,
  fetch:async (url, opts) => {
    assert.equal(opts.headers.Authorization, 'Bearer not-a-real-token');
    if (failedRequest) return {ok:false,status:500};
    if (url.includes('/upload/')) { lastUpload = await opts.body.text(); assert.match(opts.body.type, /multipart\/related/); return {ok:true}; }
    if (url.includes('?alt=media')) return {ok:true,headers:{get:()=>null},text:async()=>driveCopies[0].text};
    return {ok:true,json:async()=>({files:driveCopies.map(({id,name,createdTime})=>({id,name,createdTime}))})};
  }
};
vm.runInNewContext(fs.readFileSync('gymapp/backup.js','utf8'), context);
async function main() {
  const baseline = JSON.stringify({mySched:[{name:'Mitt pass',days:[{n:'Måndag',t:'home',ex:[{n:'Squat'}]}]}],wLog:[{ex:'Squat',d:'2026-10-31',w:10}],balDays:[],weights:{},grips:{},setsOk:{}});
  store.setItem('ga_data',baseline); store.setItem('gymapp_balance',JSON.stringify({exerciseDone:{},weekDone:{}})); store.setItem('gym_100reps',JSON.stringify({d:'2026-10-31',n:20}));
  store.setItem('ga-notif','false');
  assert.equal(nodes['backup-connect'].disabled,true);
  nodes['backup-drive-panel'].open=true; nodes['backup-drive-panel'].handlers.toggle();
  assert.match(nodes['backup-status'].textContent,/inte konfigurerat/);
  nodes['backup-client'].value='123456-abc.apps.googleusercontent.com';
  nodes['backup-save-client'].click(); await Promise.resolve(); await Promise.resolve();
  assert.equal(nodes['backup-connect'].disabled,false); assert.equal(store.getItem('gymapp-drive-client-id'),'123456-abc.apps.googleusercontent.com');
  nodes['backup-connect'].click(); assert.equal(nodes['backup-upload'].disabled,false);
  await nodes['backup-upload'].click(); assert.match(lastUpload,/gymapp-backup-v1/); assert.match(lastUpload,/Mitt pass/); assert.doesNotMatch(lastUpload,/not-a-real-token/); assert.doesNotMatch(lastUpload,/ga-notif/);
  await nodes['backup-export'].click(); const copy=await savedBlob.text(); assert.equal(JSON.parse(copy).storage.ga_data,baseline);
  driveCopies=[{id:'file-id',name:'gymapp.json',createdTime:'2026-10-31T15:00:00Z',text:copy}];
  await nodes['backup-list'].click(); assert.match(nodes['backup-status'].textContent,/Hittade 1/);
  nodes['backup-files'].value='file-id'; nodes['backup-files'].handlers.change();
  store.setItem('ga_data',JSON.stringify({mySched:[],wLog:[]}));
  confirmResult=false; await nodes['backup-restore'].click(); assert.equal(reloaded,false); assert.notEqual(store.getItem('ga_data'),baseline);
  confirmResult=true; await nodes['backup-restore'].click(); assert.equal(reloaded,true); assert.equal(store.getItem('ga_data'),baseline); assert.equal(restoredRaw,baseline); assert.equal(store.getItem('ga-notif'),'false');
  reloaded=false; driveCopies[0].text='{"app":"bad"}'; await nodes['backup-restore'].click(); assert.equal(reloaded,false); assert.equal(store.getItem('ga_data'),baseline); assert.match(nodes['backup-status'].textContent,/inte en säkerhetskopia/);
  failedRequest=true; await nodes['backup-upload'].click(); assert.match(nodes['backup-status'].textContent,/500/);
  nodes['backup-disconnect'].click(); assert.equal(nodes['backup-upload'].disabled,true);
  // Ny telefon: appens publicerade klient-ID används utan att användaren fyller i något.
  for (const id of ids) nodes[id] = new Element(id);
  data.clear(); window.GYMAPP_GOOGLE_CLIENT_ID = '123456-abc.apps.googleusercontent.com';
  vm.runInNewContext(fs.readFileSync('gymapp/backup.js','utf8'), context);
  nodes['backup-drive-panel'].open=true; nodes['backup-drive-panel'].handlers.toggle();
  await Promise.resolve(); await Promise.resolve();
  assert.equal(nodes['backup-connect'].disabled,false);
  nodes['backup-connect'].click(); assert.equal(nodes['backup-upload'].disabled,false);
  assert.equal(store.getItem('gymapp-drive-client-id'),null);
  console.log('OK: saknat klient-ID, konfiguration och enknappsanslutning på ny enhet, Drive-uppladdning, lokal export, lista, avbryt/återställ, korrupt fil, serverfel, frånkoppling; inga notiser/tokens i kopian');
}
main().catch(e => { console.error(e); process.exitCode=1; });
