'use strict';
// Kör appens riktiga timerkod i en liten simulerad miljö; ingen webbläsare krävs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const start = html.indexOf('let _lastShown = -1;');
const end = html.indexOf('function updTimer()', start);
assert(start >= 0 && end > start);
let now = 0, next = 1, calls = 0, done = 0;
const tasks = new Map(), listeners = [];
const ctx = {
  T: { sec: 20, left: 20, timeout: 0, running: false, startTime: 0, startLeft: 0 },
  document: { hidden: false, addEventListener: (event, fn) => { if (event === 'visibilitychange') listeners.push(fn); } },
  Date: { now: () => now }, Math,
  setTimeout: (fn, delay) => { const id = next++; tasks.set(id, { fn, delay }); return id; },
  clearTimeout: id => tasks.delete(id),
  updTimer: () => calls++, setBtSt: () => {}, wakeOn: () => {}, wakeOff: () => {},
  vib: () => {}, toast: () => done++, $$: () => [],
};
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(html.slice(start, end), ctx);
ctx.bStart();
assert.equal(calls, 1); assert.equal(tasks.size, 1); assert.equal([...tasks.values()][0].delay, 1000);
now = 450; ctx.bStop();
assert.equal(ctx.T.left, 19.55); assert.equal(tasks.size, 0);
ctx.bStart(); assert(Math.abs([...tasks.values()][0].delay - 550) <= 1);
ctx.document.hidden = true; listeners.forEach(fn => fn()); assert.equal(tasks.size, 0);
now = 2500; ctx.document.hidden = false; listeners.forEach(fn => fn());
assert.equal(Math.ceil(ctx.T.left), 18); assert.equal(tasks.size, 1);
now = 21000; ctx.document.hidden = true; listeners.forEach(fn => fn());
ctx.document.hidden = false; listeners.forEach(fn => fn());
assert.equal(ctx.T.running, false); assert.equal(ctx.T.left, 0); assert.equal(done, 1); assert.equal(tasks.size, 0);
ctx.bReset(); assert.equal(ctx.T.left, 20); assert.equal(ctx.T.running, false);
console.log('OK: timer start, exakt paus, återstart, dold/synlig flik, slut och återställning.');
