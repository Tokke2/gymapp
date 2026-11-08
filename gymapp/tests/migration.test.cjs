'use strict';
const assert=require('node:assert/strict'), vm=require('node:vm'), fs=require('node:fs');
const code=fs.readFileSync('gymapp/migration.js','utf8');
function setup(initial={}, options={}) {
  const data=new Map(Object.entries(initial)); let count=0;const handlers={};
  const localStorage={getItem(k){return data.has(k)?data.get(k):null;},setItem(k,v){count++;if(options.fail && options.fail(k,count))throw Error('quota');data.set(k,String(v));},removeItem(k){data.delete(k);}};
  const window={};const document={addEventListener(type,fn,capture){handlers[type+'_'+!!capture]=fn;}};
  vm.runInNewContext(code,{localStorage,window,document,Date,JSON,Number,Array,Object,Set,Blob,URL,setTimeout,alert(){}});
  return {m:window.GymMigration,data,handlers,getWrites:()=>count};
}
const original=JSON.stringify({mySched:[{name:'Befintligt',days:[]}],wLog:[{ex:'Rodd',w:4,d:'2026-06-07'}],balDays:[],weights:{},grips:{},setsOk:{},extra:'bevara'});
{
 const t=setup({ga_data:original,gym_100reps:'42',gymapp_balance:'{"exerciseDone":{},"weekDone":{}}'});
 assert.equal(t.m.canWrite(),true);assert.equal(t.data.get('ga_data'),original);assert.equal(t.data.get('gymapp_schema_version'),'1');
 const snapshot=JSON.parse(t.data.get('gymapp_migration_backup_v0'));assert.equal(snapshot.storage.gym_100reps,'42');assert.equal(snapshot.storage.ga_data,original);
 const reps=JSON.parse(t.data.get('gym_100reps'));assert.equal(reps.n,42);assert.match(reps.d,/^\d{4}-\d\d-\d\d$/);
 const prev=t.getWrites();t.m.init();assert.equal(t.getWrites(),prev);
}
{
 const t=setup({ga_data:original,gym_100reps:'8',gymapp_migration_backup_v0:'previous'});
 assert.equal(t.data.get('gymapp_migration_backup_v0'),'previous');
 const key=[...t.data.keys()].find(k=>k.startsWith('gymapp_migration_backup_v0_'));
 assert.ok(key);assert.equal(JSON.parse(t.data.get(key)).storage.gym_100reps,'8');
}
{
 const t=setup({ga_data:original});assert.equal(t.data.get('ga_data'),original);assert.equal(t.m.canWrite(),true);assert.equal(t.data.has('gymapp_migration_backup_v0'),false);
}
{
 const t=setup({ga_data:'{bad json'});assert.equal(t.m.canWrite(),false);assert.equal(t.data.get('ga_data'),'{bad json');assert.equal(t.getWrites(),0);
}
{
 const t=setup({ga_data:original,gymapp_schema_version:'99'});assert.equal(t.m.canWrite(),false);assert.equal(t.data.get('ga_data'),original);assert.equal(t.getWrites(),0);
 let blocked=false; const e={target:{closest:()=>({dataset:{act:'saveSchema'}})},preventDefault(){blocked=true;},stopImmediatePropagation(){}}; t.handlers['click_true'](e); assert.equal(blocked,true);
 blocked=false; e.target.closest=()=>({dataset:{act:'goTab'}}); t.handlers['click_true'](e); assert.equal(blocked,false);
}
{
 const t=setup({ga_data:original,gym_100reps:'12'}, {fail:k=>k==='gymapp_migration_backup_v0'});assert.equal(t.m.canWrite(),false);assert.equal(t.data.get('gym_100reps'),'12');assert.equal(t.data.get('ga_data'),original);assert.equal(t.data.has('gymapp_schema_version'),false);
}
{
 const t=setup({ga_data:original,gym_100reps:'12'}, {fail:k=>k==='gymapp_schema_version'});assert.equal(t.m.canWrite(),false);assert.equal(t.data.get('gym_100reps'),'12');assert.equal(t.data.get('ga_data'),original);assert.equal(JSON.parse(t.data.get('gymapp_migration_backup_v0')).storage.gym_100reps,'12');
}
{
 const t=setup({gymapp_schema_version:'1'});assert.equal(t.m.canWrite(),true);t.data.set('gymapp_schema_version','2');assert.equal(t.m.canWrite(),false);
}
{
 const t=setup({gymapp_schema_version:'bogus'});assert.equal(t.m.canWrite(),false);assert.equal(t.getWrites(),0);
}
console.log('OK: äldre räknare, kopia, oförändrade scheman, upprepad körning, trasig data, framtida version, kvotfel, rollback och versionsändring.');
