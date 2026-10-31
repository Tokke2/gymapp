#!/usr/bin/env node
'use strict';

/*
  Bildboten – kontrollerar att alla bilder finns, syns och är med offline.

  Kör:
    node tools/bildbot.cjs         kontrollera
    node tools/bildbot.cjs --fix   lägg till nya bilder i service workerns lista

  Kontrollerar:
   1. Alla bildreferenser i HTML pekar på filer som finns
   2. Alla bilder på disk finns med i sw.js (så de fungerar offline)
   3. sw.js och IMG_BANK pekar inte på bilder som saknas
   4. Alla övningsbilder har en post i IMG_BANK (namnmatchning)
   5. Alla övningar i standardpasset/mallarna har en bild
*/

const fs = require('node:fs');
const path = require('node:path');

const ROOT   = path.resolve(__dirname, '..');
const IMGDIR = path.join(ROOT, 'gymapp', 'images');
const SW     = path.join(ROOT, 'gymapp', 'sw.js');
const APP    = path.join(ROOT, 'gymapp', 'index.html');
const PAGES  = ['gymapp/index.html', 'balansrutin.html', 'träningsschema.html'];

const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const uniq = a => [...new Set(a)].sort();
const basename = f => path.basename(f);

const fix = process.argv.includes('--fix');
const errors = [];
const warnings = [];
const fixed = [];

/* ── 1. Bilder på disk ─────────────────────────────────────────── */
const onDisk = uniq(fs.readdirSync(IMGDIR).filter(f => f.endsWith('.png')));

/* ── 2. Referenser i HTML ──────────────────────────────────────── */
const refs = new Set();
for (const page of PAGES) {
  const html = read(page);
  for (const m of html.matchAll(/(?:gymapp\/)?images\/([\w-]+\.png)/g)) refs.add(m[1]);
}
for (const f of refs) {
  if (!onDisk.includes(f)) errors.push(`Saknad bildfil: images/${f} (refereras i HTML)`);
}

/* ── 3. Service worker-listan ──────────────────────────────────── */
const swSrc = fs.readFileSync(SW, 'utf8');
const listRe = /const EXERCISE_IMAGES = \[([\s\S]*?)\n\];/;
const listMatch = swSrc.match(listRe);
if (!listMatch) {
  errors.push('Hittade inte EXERCISE_IMAGES i sw.js');
} else {
  const inSw = uniq([...listMatch[1].matchAll(/\.\/images\/([\w-]+\.png)/g)].map(m => m[1]));

  for (const f of inSw) {
    if (!onDisk.includes(f)) errors.push(`sw.js cachar en bild som inte finns: images/${f}`);
  }

  const missingInSw = onDisk.filter(f => !inSw.includes(f));
  for (const f of missingInSw) {
    if (fix) {
      fixed.push(`sw.js: + images/${f}`);
    } else {
      warnings.push(`Bilden images/${f} är inte med i sw.js (fungerar inte offline)`);
    }
  }

  if (fix && missingInSw.length) {
    const all = uniq([...inSw, ...missingInSw]);
    const block = all.map(f => `  './images/${f}',`).join('\n');
    fs.writeFileSync(SW, swSrc.replace(listRe, `const EXERCISE_IMAGES = [\n${block}\n];`), 'utf8');
  }
}

/* ── 4. IMG_BANK (namnmatchning) ───────────────────────────────── */
const appSrc = fs.readFileSync(APP, 'utf8');
const bankRe = /const IMG_BANK = \[([\s\S]*?)\n\];/;
const bankMatch = appSrc.match(bankRe);
if (!bankMatch) {
  errors.push('Hittade inte IMG_BANK i gymapp/index.html');
} else {
  const bank = uniq([...bankMatch[1].matchAll(/\{ f:'([\w-]+\.png)'/g)].map(m => m[1]));

  for (const f of bank) {
    if (!onDisk.includes(f)) errors.push(`IMG_BANK pekar på en bild som inte finns: images/${f}`);
  }

  /* grip-*.png är UI-bilder (greppval), inte övningsbilder */
  const notExercises = new Set(['grip-over.png', 'grip-under.png']);
  for (const f of onDisk) {
    if (!bank.includes(f) && !notExercises.has(f)) {
      warnings.push(`images/${f} saknar post i IMG_BANK (matchas inte automatiskt)`);
    }
  }
}

/* ── 5. Alla övningar i mallarna har bild ──────────────────────── */
const templatesRe = /const TEMPLATES = \[([\s\S]*?)\n\];/;
const templatesMatch = appSrc.match(templatesRe);
if (templatesMatch) {
  const exBlocks = templatesMatch[1].match(/\n\s*\{ n:'[^']*',[^\n]*\}/g) || [];
  for (const block of exBlocks) {
    /* Vilodagar har inga övningar och behöver ingen bild */
    if (/t:'rest'|ex:\s*\[\]/.test(block)) continue;
    const name = block.match(/n:'([^']*)'/)?.[1] || '?';
    if (!/img:\s*'images\/[\w-]+\.png'/.test(block)) {
      errors.push(`Övningen "${name}" i standardpasset/mallen saknar bild`);
    }
  }
} else {
  warnings.push('Hittade inte TEMPLATES – hoppade över kontrollen av standardpasset');
}

/* ── Rapport ───────────────────────────────────────────────────── */
console.log('\n🖼  Bildboten');
console.log(`   ${onDisk.length} bilder på disk · ${refs.size} referenser i HTML · ${fix ? 'fix-läge' : 'kontroll'}\n`);

for (const f of fixed)   console.log(`   ✅ ${f}`);
for (const w of warnings) console.log(`   ⚠️  ${w}`);
for (const e of errors)   console.log(`   ❌ ${e}`);

if (!fixed.length && !warnings.length && !errors.length) {
  console.log('   ✅ Alla bilder finns, refereras korrekt och är med offline.\n');
} else {
  console.log('');
}

if (errors.length) {
  console.log(`   ${errors.length} fel måste åtgärdas.\n`);
  process.exitCode = 1;
} else if (warnings.length && !fix) {
  console.log('   Tips: kör med --fix för att lägga till nya bilder i sw.js.\n');
} else {
  console.log('   Klart.\n');
}
