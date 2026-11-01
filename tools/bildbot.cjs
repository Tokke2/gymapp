#!/usr/bin/env node
'use strict';

/*
  Bildboten – kontrollerar att alla bilder finns, syns, är rätt och är med offline.

  Kör:
    node tools/bildbot.cjs         kontrollera
    node tools/bildbot.cjs --fix   rätta fel bild + lägg nya bilder i sw.js

  Kontrollerar:
   1. Alla bildreferenser i HTML pekar på filer som finns
   2. Alla bilder på disk finns med i sw.js (så de fungerar offline)
   3. sw.js och IMG_BANK pekar inte på bilder som saknas
   4. Alla övningsbilder har en post i IMG_BANK (namnmatchning)
   5. Alla övningar i standardpasset/mallarna har en bild
   6. Bilden stämmer med övningsnamnet – t.ex. ingen latsdrag-bild
      på en KB bent-over row. --fix byter till rätt bild automatiskt.
*/

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT   = path.resolve(__dirname, '..');
const IMGDIR = path.join(ROOT, 'gymapp', 'images');
const SW     = path.join(ROOT, 'gymapp', 'sw.js');
const APP    = path.join(ROOT, 'gymapp', 'index.html');
const PAGES  = ['gymapp/index.html', 'balansrutin.html', 'träningsschema.html'];

const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const uniq = a => [...new Set(a)].sort();

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
let appSrc = fs.readFileSync(APP, 'utf8');
const bankRe = /const IMG_BANK = \[([\s\S]*?)\n\];/;
const bankMatch = appSrc.match(bankRe);
let bankEntries = [];
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

  /* Samma nyckelordstabell som appen använder – ingen egen gissning */
  try {
    bankEntries = vm.runInNewContext(`${bankMatch[0]}\n;IMG_BANK;`, {});
  } catch (e) {
    errors.push(`Kunde inte läsa IMG_BANK: ${e.message}`);
  }
}

/* Samma normalisering som appen */
function norm(t) {
  return String(t || '').toLowerCase()
    .replace(/[×x]\s*\d+/g, ' ')
    .replace(/[^a-zà-ÿ0-9åäö\s-]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

/* Samma poängsättning som appens matchImage() */
function matchImage(name, extra) {
  const nameHay = norm(name);
  const hay = norm(`${name} ${extra || ''}`);
  if (!hay) return null;
  let best = null, bestScore = 0;
  for (const item of bankEntries) {
    for (const kw of item.kw) {
      if (!hay.includes(kw)) continue;
      const inName = nameHay.includes(kw);
      const score = (kw.length + (nameHay.startsWith(kw) ? 3 : 0)) * (inName ? 2 : 1);
      if (score > bestScore) { bestScore = score; best = item.f; }
    }
  }
  return best ? `images/${best}` : null;
}

/* ── 5. Övningarna i standardpasset/mallarna ───────────────────── */
const templatesRe = /const TEMPLATES = \[[\s\S]*?\n\];/;
const templatesMatch = appSrc.match(templatesRe);
if (templatesMatch) {
  let templates = null;
  try {
    templates = vm.runInNewContext(`${templatesMatch[0]}\n;TEMPLATES;`, {});
  } catch (e) {
    warnings.push(`Kunde inte läsa TEMPLATES: ${e.message}`);
  }

  if (templates) {
    const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const setTemplateImage = (src, name, img) => {
      const re = new RegExp(`(\\{ n:'${escRe(name)}'[^\\n]*?)img:'[^']*'`, 'g');
      return src.replace(re, `$1img:'${img}'`);
    };

    for (const t of templates) {
      for (const day of (t.days || [])) {
        if (day.t === 'rest' || !Array.isArray(day.ex)) continue;
        for (const ex of day.ex) {
          const name = ex.n || '?';
          if (!ex.img) {
            errors.push(`Övningen "${name}" i standardpasset/mallen saknar bild`);
            continue;
          }

          const expected = matchImage(name, ex.muscles);
          if (!expected || expected === ex.img) continue;

          if (fix) {
            appSrc = setTemplateImage(appSrc, name, expected);
            fixed.push(`"${name}": ${ex.img} → ${expected}`);
          } else {
            errors.push(`Fel bild: "${name}" använder ${ex.img} men namnet matchar ${expected} – kör --fix`);
          }
        }
      }
    }

    if (fix && fixed.some(f => f.includes('→'))) {
      fs.writeFileSync(APP, appSrc, 'utf8');
    }
  }
} else {
  warnings.push('Hittade inte TEMPLATES – hoppade över kontrollen av standardpasset');
}

/* ── Rapport ───────────────────────────────────────────────────── */
console.log('\n🖼  Bildboten');
console.log(`   ${onDisk.length} bilder på disk · ${refs.size} referenser i HTML · ${fix ? 'fix-läge' : 'kontroll'}\n`);

for (const f of fixed)    console.log(`   ✅ ${f}`);
for (const w of warnings) console.log(`   ⚠️  ${w}`);
for (const e of errors)   console.log(`   ❌ ${e}`);

if (!fixed.length && !warnings.length && !errors.length) {
  console.log('   ✅ Alla bilder finns, är rätt kopplade och fungerar offline.\n');
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
