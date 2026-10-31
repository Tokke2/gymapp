# 📓 Projektmanual – GymApp

> Intern arbetsmanual för underhåll av GymApp: kommandon, checklista,
> ändringslogg och förslagsbank. Användar-/utvecklardokumentationen
> finns i [README.md](../README.md).

---

**GymApp** – schema, vikter, balansrutin och framsteg. PWA med lokal datalagring och valfri Firebase-integration.

---

## 📋 Innehållsförteckning

1. [Funktioner](#-funktioner)
2. [Filstruktur](#-filstruktur)
3. [Teknikstack](#-teknikstack)
4. [Status – Nuläge vs Framtid](#-status--nuläge-vs-framtid)
5. [Publicera på GitHub Pages](#-publicera-på-github-pages)
6. [Aktivera Firebase](#-aktivera-firebase)
7. [Säkerhet](#-säkerhet)
8. [Kostnad](#-kostnad)
9. [Kommande funktioner](#-kommande-funktioner)
10. [Klart – tidigare kommande](#-klart--tidigare-kommande)
11. [Kommandon](#️-kommandon) – `kommande` · `filer` · `töm` · `förslag` · `checklista`
12. [Implementations-checklista](#️-implementations-checklista)
13. [Ändringslogg](#-ändringslogg)
14. [Förslagsbank](#-förslagsbank)
15. [Checklista](#-checklista)
16. [Spec & Designregler](#-spec--designregler)

---

## ✨ Funktioner

### ✅ Implementerade
| Funktion | Beskrivning |
|---|---|
| 📋 Egna scheman | Schemabyggare med mall; inga färdiga scheman ligger i appen |
| 💾 Viktloggning | Spara kg per övning, visas i framsteg |
| 💽 Säkerhetskopia | Lokal JSON-kopia och valfri manuell Google Drive-kopia. Kräver egen Google-konfiguration för Drive; [installationsguide](../GOOGLE-DRIVE-SETUP.md). |
| ⚖️ Balansrutin | 6 övningar med SVG-timer & avbockning |
| 📈 Framstegsöversikt | Viktlogg, streak, träningshistorik |
| 🔔 Påminnelser | Lokal timer när sidan körs; inte pålitliga push-notiser när appen är stängd. [Plan för Web Push](../PUSH-PLAN.md) |
| 📱 PWA | Installeras på hemskärmen, fungerar offline |
| 🌐 Genvägar | Manifest-shortcuts till schema/balans/framsteg |

### 🚧 Kommande

Se [Kommande funktioner](#-kommande-funktioner) för hela listan.
**Inget byggs utan användarens klarsignal.** Visas aldrig i appens UI.

---

## 📁 Filstruktur

```
gymapp/                     ← repots rot (publiceras av GitHub Pages)
│
├── index.html              ← startsida, skickar vidare till appen
│
├── gymapp/                 ← själva appen
│   ├── index.html          ← hela appen (HTML + CSS + JS i en fil)
│   ├── manifest.json       ← PWA-manifest (ikoner, genvägar, display)
│   ├── sw.js               ← Service Worker (cache, offline, notiser)
│   ├── backup.js           ← lokal/Drive-säkerhetskopia
│   ├── firebase.js         ← Firebase-integration (⏸ inaktiverad)
│   ├── google-drive-setup.html
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── images/             ← övningsbilder (PNG)
│
├── balansrutin.html        ← balansrutin, fristående sida
├── träningsschema.html     ← detaljerat veckoschema
├── tests/                  ← node-tester (backup.js)
├── README.md
├── GOOGLE-DRIVE-SETUP.md
└── PUSH-PLAN.md
```

---

## 🛠 Teknikstack

| Del | Teknologi |
|---|---|
| Frontend | Vanilla HTML5, CSS3, JavaScript (ES2022) |
| Design | Glassmorphism, CSS custom properties, SVG |
| PWA | Service Worker, Web App Manifest, Cache API |
| Lagring (nu) | `localStorage` per konto |
| Lagring (framtid) | Firebase Firestore |
| Auth (nu) | Lokal hash-baserad (användarnamn + lösenord) |
| Auth (framtid) | Firebase Auth (Google + e-post) |
| Hosting | GitHub Pages (gratis) |

### Design-principer
- **Glassmorphism** – `backdrop-filter: blur()` på alla kort
- **CSS tokens** – alla färger, radier och effekter i `:root`
- **Mobile-first** – bottom nav, safe-area, `100svh`
- **Tillgänglighet** – `aria-*`, semantisk HTML, `role`-attribut
- **Firebase-ready** – DB-lagret är utbytbart med 7 rader kod

---

## 📊 Status – Nuläge vs Framtid

```
NULÄGE (Fas 1)                FRAMTID (Fas 2)
──────────────────────        ──────────────────────
GitHub Pages hosting     →    GitHub Pages (kvar)
localStorage per konto   →    Firebase Firestore
Lokal hash-auth          →    Firebase Auth (Google)
Lokala notif-tider       →    Firestore-sparade tider
```

### Migrera till Firebase (när du är redo)

Endast **3 steg** krävs:

```js
// 1. Sätt i firebase.js:
export const FIREBASE_ENABLED = true;

// 2. Fyll i FB_CONFIG i firebase.js med dina värden

// 3. I index.html – lägg till överst i <script>:
import { FBDB } from './firebase.js';
const DB = FBDB;   // ← Ersätter det lokala DB-objektet
```

Resten av appen behöver **inte ändras**.

### Migrera befintliga lokala konton → Firebase

Kör detta **en gång** i webbläsarens konsol efter aktivering:

```js
import { migrateLocalToFirebase } from './firebase.js';
const result = await migrateLocalToFirebase();
console.log(result); // { ok: [...], failed: [...] }
```

---

## 🚀 Publicera på GitHub Pages

### Steg 1 – Skapa GitHub-konto & repo

1. Gå till 👉 [github.com](https://github.com) – skapa konto om du inte har ett
2. Klicka **"New repository"** (grön knapp)
3. Namn: `gymapp` · Sätt som **Public** · Klicka **Create**

### Steg 2 – Ladda upp filer

Ladda upp dessa filer till repot:

```
index.html
manifest.json
sw.js
firebase.js
icons/icon-192.png
icons/icon-512.png
```

### Steg 3 – Aktivera GitHub Pages

1. Repo → **Settings** → **Pages** (vänstermenyn)
2. Source → **Deploy from a branch**
3. Branch: **main** · Mapp: **/ (root)** · Klicka **Save**
4. Vänta 1–2 minuter

> ✅ Appen finns nu på: `https://DITTNAMN.github.io/gymapp`

---

## 🔥 Aktivera Firebase

> ⚠️ **Firebase är förberederat men INAKTIVERAT.**
> Appen fungerar fullt ut utan Firebase – aktivera när du vill.

### Steg 1 – Skapa Firebase-projekt

1. Gå till 👉 [console.firebase.google.com](https://console.firebase.google.com)
2. Klicka **"Skapa ett projekt"** → namn: `gymapp`
3. Stäng av Google Analytics → **Skapa projekt**

### Steg 2 – Aktivera inloggningsmetoder

| Metod | Var | Inställning |
|---|---|---|
| E-post/lösenord | Authentication → Sign-in method | Aktivera toggle |
| Google | Authentication → Sign-in method | Aktivera + välj supportmail |

### Steg 3 – Skapa Firestore-databas

1. **Firestore Database** → **Skapa databas**
2. Välj **"Starta i produktionsläge"** ← ⚠️ Inte testläge!
3. Region: **europe-west1 (Belgien)**

### Steg 4 – Sätt säkerhetsregler

Firestore → **Regler** → radera allt → klistra in:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

Klicka **Publicera**.

### Steg 5 – Hämta din config

1. ⚙️ **Projektinställningar** → **Dina appar** → **Webb (</>)**
2. Appnamn: `gymapp-web` → **Registrera**
3. Kopiera `firebaseConfig`-blocket:

```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "gymapp-xxxxx.firebaseapp.com",
  projectId:         "gymapp-xxxxx",
  storageBucket:     "gymapp-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123"
};
```

### Steg 6 – Klistra in config i firebase.js

Öppna `firebase.js` och ersätt `FB_CONFIG`:

```js
const FB_CONFIG = {
  apiKey:            "din-nyckel",
  authDomain:        "ditt-projekt.firebaseapp.com",
  projectId:         "ditt-projekt",
  storageBucket:     "ditt-projekt.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123"
};
```

Sätt sedan:

```js
export const FIREBASE_ENABLED = true;
```

### Steg 7 – Lägg till domän i Firebase

**Krävs för Google-inloggning på GitHub Pages!**

1. Authentication → **Settings** → **Authorized domains**
2. Klicka **"Add domain"**
3. Lägg till: `DITTNAMN.github.io`
4. Lägg till: `localhost` (för lokal testning)

---

## 🔒 Säkerhet

### Nuläge (lokalt)

| Skydd | Status | Notering |
|---|---|---|
| Lösenord hashade | ✅ | Enkel hash – tillräcklig för localStorage |
| Konton separerade | ✅ | Var sin `localStorage`-nyckel |
| HTTPS | ✅ | GitHub Pages kräver det |

### Med Firebase

| Skydd | Status | Notering |
|---|---|---|
| Lösenord hashade | ✅ | Firebase Auth – bcrypt |
| Varje kund ser bara sin data | ✅ | Firestore-regler |
| Google-login via Google | ✅ | OAuth 2.0 |
| HTTPS | ✅ | Automatiskt |
| Rate limiting | ✅ | Firebase Auth inbyggt |

---

## 💰 Kostnad

| Tjänst | Plan | Gräns | Kostnad |
|---|---|---|---|
| GitHub Pages | Free | 100 GB/mån bandbredd | **0 kr** |
| Firebase Auth | Spark (gratis) | Obegränsat antal konton | **0 kr** |
| Firestore | Spark (gratis) | 50 000 läsningar/dag | **0 kr** |
| Firestore | Spark (gratis) | 20 000 skrivningar/dag | **0 kr** |

### Vad 10 kunder faktiskt förbrukar per dag

```
Läsningar:   ~200 av 50 000  =  0.4%
Skrivningar:  ~50 av 20 000  =  0.3%
Lagring:      ~5MB av 1 GB   =  0.5%
```

> **Du kan ha appen gratis i många år med 10 kunder.** 💚

---

## 🚧 Kommande funktioner

> ⚠️ **REGEL 1 – Bygg inget utan klarsignal.**
> Listan är en meny att välja ur, inte en att-göra-lista att beta av.
>
> ⛔ **REGEL 2 – Inget får raderas från kommande-listan.**
> En punkt tas bort **endast** när den är färdigbyggd – och då **flyttas** den
> till *[✅ Klart – tidigare kommande](#-klart--tidigare-kommande)* med datum.
> Aldrig tyst borttagning, aldrig överskrivning av listan.
>
> 🙈 **REGEL 3 –** Inget av detta visas i appens UI (ingen synlig "Kommande"-lista på startsidan).

### 🎯 Godkända – väntar på klarsignal

| # | Funktion | Beskrivning | Krav / detaljer |
|---|---|---|---|
| K1 | 🔢 **Set-räknare** | Bocka av set 1/2/3 separat istället för hela övningen | Per övning, sparas i `ga_data`. Delvis avklarad övning ska synas i progress |
| K2 | 🔒 **Skärmen tänd + störningsfritt** | Wake Lock så mobilen inte slocknar mitt i ett set | **Låst läge:** ska blockera störningar (SMS, samtalsnotiser) så gott webben tillåter. Många har telefonen i fickan → oavsiktliga tryck måste förhindras. Kräver helskärm + låsknapp för att lämna läget |
| K3 | 📈 **Progressionsgrafer** | SVG-linjediagram per gymövning, vikt över tid | Rent SVG, **inget bibliotek**. Endast gymövningar (hemma har fasta vikter) |
| K4 | 🎒 **Utrustnings-inventering** | Ange dina hemvikter – appen anpassar etiketterna automatiskt | Ersätter hårdkodade `16kg KB` / `5kg×2`. Fält: kettlebell-vikt(er), hantelvikt(er), ryggsäcksvikt, ab roller ja/nej. Hemmaträning förblir **fasta vikter utan manuell kg-inmatning** |
| K6 | ⚖️ **Balansprogression** | Ökar tiderna automatiskt vecka för vecka, med historik | **Villkor: 7 lyckade pass** (full vecka). Ökar EJ efter en vecka med bara 1 avklarat pass |
| K7 | 🎲 **Schema-generator (3 mån)** | Slumpar nytt schema efter 3 månaders lyckad närvaro | Behåller alla regler: 3 hemma / 2 gym, inga hopp, ingen fri balans, inget marklyft/leg curl, lägenhetsanpassat. **Återanvänder befintliga bilder**, genererar bara nytt vid behov |
| K8 | 🔽 **Deload-vecka** | Föreslår lättare vecka efter 6–8 veckors träning | Sänkt volym/vikt, behåller rörelsemönster. Endast förslag |
| K9 | 🖨️ **Skriv ut / PDF** | A4-vy av schemat att ta med till gymmet | Egen `@media print`-stil, svartvit-vänlig, plats för handskrivna vikter |
| K10 | 🌙 **Mörkt / ljust läge** | Toggle mellan dark glassmorphism och light mode | Sparas lokalt i `ga_data`. Alla tokens måste ha ljus-variant. *(Fanns i tidigare kommande-lista)* |
| K11 | ⏱️ **Vilo-timer mellan set** | Popup-nedräkning 30/60/90/120 sek med vibration | Auto-start när set bockas av. Hänger ihop med K1. *(Fanns i tidigare kommande-lista)* |
| K12 | 🏠💪 **Programgenerator från hemmautrustning** | Kryssa i vad du har hemma → appen bygger ett färdigt veckoschema (100 % offline) | **Upplägg:** Både *"Bara hemma"* (3–5 pass/v) och *"Hemma + Gym"* (t.ex. 3 hemma + 2 gym). **Utökad utrustning:** Kettlebell, Hantlar, Ryggsäck med vikt, Magrulle (Ab-roller), Gummiband, Pull-up-stång, Bänk/Pall, Stol & Diskbänk, Kroppsvikt. Hemmaträning behåller **fasta vikter** (inga fria kg-fält under passet). Följer alla regler: lägenhetsanpassat (inga hopp), balansanpassat (med stöd), inget marklyft/leg curl, återanvänder befintliga bilder + tekniksteg |
| K13 | 🔔 **Träningspåminnelse med Web Push** | Påminn runt 17.00 på aktiva träningsdagar även när appen är stängd | Utan GymApp-konto; separat push-tjänst krävs. Förberedelse och villkor: [PUSH-PLAN.md](../PUSH-PLAN.md). Inte implementerat. |
| K14 | 🏋️ **Enklare träningsvy** | Tydligare avbockning och översikt över dagens pass | Större lättåtkomliga knappar, tydligt vad som är klart och vad som återstår, mobilanpassat. Utan inloggning eller notiser. |

### 🔒 Väntar på konto-aktivering

Byggs först när användaren aktiverar konton (se *Kontoregler*).

| # | Funktion | Beskrivning |
|---|---|---|
| A1 | 🏆 **PB-tracker** | Personliga rekord per övning, konfetti-firande |
| A2 | 🔔 **Smart push-notis** | Påminnelser baserat på faktiskt träningsmönster |
| A3 | 📸 **Före/efter-foto** | Veckofoton – se förändringen över tid |
| A4 | 👥 **Kompis-läge** | Bjud in partner, se varandras streak, tävla |
| A5 | ☁️ **Molnsync** | Samma data på alla enheter via Firestore |

---

## ✅ Klart – tidigare kommande

Funktioner som låg i kommande-listan och nu är färdigbyggda.
**Hit flyttas punkter – de raderas aldrig.**

| # | Funktion | Klar | Noteringar |
|---|---|---|---|
| — | 🔥 **Firebase-integration** | 2026-09-02 | Färdig kodmodul i `firebase.js`, `FIREBASE_ENABLED = false`. Avvaktar användarens aktivering |
| — | 🖥️ **Responsiv layout & alla webbläsare** | 2026-10-11 | Alla 3 sidor (`index.html`, `träningsschema.html`, `balansrutin.html`): Bento-dashboard på Hem, sticky balans-timer + 2-kolumns kort på desktop, 2-kolumns dagsvy på bred skärm, 2×2 framstegs-grid, veckodags-snabbhopp i `träningsschema.html`, fix av ogiltig nästlad `<button>` i gym-övningsraden, `100vh→100svh→100dvh` fallback-kedja, `-webkit-backdrop-filter` + `@supports not`-fallback, Firefox/WebKit-scrollbars, nummerfält utan spinner-pilar, `forced-colors`-stöd, 0 inline-eventattribut |
| — | 📲 **PWA-installation** | 2026-09-05 | Knapp i nav + kort på hemsidan. Ingen banner. Detekterar installerat läge live |
| — | ✏️ **Egna scheman** | 2026-09-05 | Klistra in text/HTML → analysera → justera → spara. Import/export JSON |
| — | 🖼️ **Smart bildmatchning** | 2026-09-05 | ~150 nyckelord mot 33 bilder, emoji-fallback per muskelgrupp |
| — | 🤲 **Greppväljare** | 2026-09-05 | Över/underhandsgrepp per övning, handbild tonar in vid val |
| — | 🔗 **Sidorna delar appens data** | 2026-09-05 | `träningsschema.html` läser aktivt schema ur `ga_data` istället för hårdkodat – gamla datan blev teknikbank som berikar övningar via namnmatchning. `balansrutin.html` synkar avbockningar mot `ga_data.balDays` åt båda håll. Båda har tomt läge utan schema |
| — | 📍 **Dagsvy + inga färdiga scheman** | 2026-09-05 | `SCHED` tom – bara egna scheman visas. Mitt Schema kvar som mall i byggaren. Schemafliken öppnar i dagsvy med växlare Idag/Hela veckan |
| — | 🗓️ **träningsschema.html v2** | 2026-09-05 | Event delegation (8 onclick → 0), LOG-modul, 59 CSS-variabler, buggfix: 100-reps nollställs nu per dygn, toast, PWA-meta, 0 `!important` |
| — | 📱 **manifest.json v2** | 2026-09-05 | 4 genvägar (+ detaljerat schema), monochrome-ikon, `orientation:any` för liggande läge, bredare skärmbilder, musikreferens borttagen |
| — | ⚙️ **sw.js v6** | 2026-09-05 | Cachar även `träningsschema.html` och `balansrutin.html`, feltolerant installation (en fil kan saknas utan att allt fälls) |
| — | 🔥 **firebase.js v3** *(fortsatt inaktiv)* | 2026-09-05 | SDK 10.12 → 11.0.2, tyst LOG istället för console, **iOS-PWA redirect-fallback** för Google-inloggning, offline-cache med multi-tab, `completeGoogleRedirect()` |
| B14 | 🔁 **Uppdateringsbot** | 2026-09-05 | Upptäcker ny version, visar "Ladda om"-notis, kollar varje timme och vid återkomst. Sparar data före omladdning |
| — | 🎨 **index.html v9 – färgdesign** | 2026-09-05 | Utökad palett (68 variabler, 12 gradienter), animerad regnbågsrubrik, "Dagens pass"-genväg på hemskärmen, tidsanpassad hälsning, färgkodade statistikrutor och flikar, konfetti vid 6/6 balans (F22), räknande siffror (F25), större knappar, brytpunkter för 360px/liggande/1100px, 0 `!important` |
| — | ⚖️ **balansrutin.html v2** | 2026-09-05 | Buggfix:  gav UTC → pass efter midnatt hamnade på fel dag. Veckoringen räknade alla dagar någonsin → visade >100%. Plus event delegation, rAF-timer, Wake Lock, auto-avbockning vid 6/6, LOG-modul, mobilanpassning |
| O1–O10 | ⚡ **Optimeringspaket v8** | 2026-09-05 | Event delegation (0 inline onclick), partiell omritning, DocumentFragment, debouncad spara, timer-städning, content-visibility, sammanslagen renderare, wLog-trimning, GPU-avlastning, delad knappbas. Plus: rAF-timer, Wake Lock, swipe-navigering, tyst LOG-modul, prestandaprofil |
| K5 | ⬆️ **Auto-progression** | 2026-09-05 | Knapp "Klarade alla set" per gymövning. Efter **2 pass i rad på samma vikt** föreslås +2,5 kg. Endast förslag – höjs aldrig automatiskt. Vikthöjning nollställer räkningen, resultat äldre än 45 dagar räknas inte. Data i `ga_data.setsOk` |
| — | ⚖️ **Snabb viktinput** | 2026-09-04 | −5 / −2.5 / +2.5 / +5 / +10 kg med autospar |

---

## 🗣️ Kommandon

Nyckelord som styr hur assistenten svarar. Gäller alltid, i varje session.

### `kommande`

Visar hela listan över planerade funktioner (alla K + A + förslagsbanken nedan) som en meny att välja ur.
**Bygg ingenting** – bara presentera listan och invänta val.

### `filer`

Visa de **10 senast ändrade filerna** i workspacet, nyast först.

- Sorteras på ändringstid
- Visa: filnamn (som **klickbar länk** till filen i workspacet), sökväg, storlek, tidpunkt
- Uteslut brus: `.git/`, `node_modules/`, cache- och byggmappar
- Lägg till en kort notering om vad som ändrades, när det är känt
- Bygg/ändra ingenting – bara lista

### `töm`

Rensa workspacet så **endast aktiva filer** blir kvar.

**Arbetsgång:**
1. Lista alla filer och spåra vilka som faktiskt refereras från kod
2. Identifiera skräp: oanvända bilder, oreferade dokument, temp- och cachefiler, dubbletter
3. **Fråga alltid innan borttagning** av filer som kan ha ett syfte – radera aldrig tyst
4. Ta bort det bekräftade
5. Validera efteråt: JS-syntax, HTML-balans, att inga bildreferenser blivit brutna
6. Rapportera vad som togs bort, hur mycket utrymme som frigjordes och vad som är kvar

**Aldrig radera:** `index.html` · `manifest.json` · `sw.js` · `README.md` · `firebase.js` · `icons/` · bilder som refereras i koden

### `förslag`

Ge **25 helt nya idéer** som **inte redan finns** någonstans i denna spec.

**Fokus:** appen · designen · **minnesanvändning** · prestanda · tydlighet · viralitet

- Alla 25 skrivs in i [förslagsbanken](#-förslagsbank) direkt
- Nästa `förslag` måste därför ge 25 **andra** idéer
- Presenteras som en **meny att välja ur** – användaren plockar de som ska in i checklistan
- **Bygg ingenting** förrän användaren pekar ut vilka

### `checklista` / `lista`

Visa **implementations-checklistan** – allt som är valt men ännu inte byggt.

- Hämtas från [Implementations-checklista](#-implementations-checklista) nedan
- Visa status per rad: ☐ ej påbörjad · 🔄 pågående · ✅ klar
- Användaren kan välja vad som ska implementeras härnäst
- **Bygg ingenting** utan uttryckligt val

### Automatisk regel: optimeringsförslag var 5:e uppdatering

Efter **var femte kodändring** (räknat i [ändringsloggen](#-ändringslogg)) ska assistenten
**oombedd** ge **10 nya förslag** – aldrig återanvända – som förbättrar:

| Område | Exempel |
|---|---|
| 🧠 **Minne** | färre DOM-noder, städa event-lyssnare, mindre localStorage-payload |
| ⚡ **CPU** | färre omritningar, debounce, undvik layout thrash |
| 🧹 **Kod** | mindre duplicering, tydligare struktur, färre globala |
| 🎨 **Design** | konsekvens, kontrast, mikrointeraktioner |

Dessa räknas som förslag och skrivs in i banken med prefix **`O`** (O1, O2, …).

---

## ✔️ Implementations-checklista

Valda funktioner som väntar på att byggas. Visas med kommandot `checklista` eller `lista`.
**Inget här byggs utan uttryckligt val.**

### 🏋️ Träningsfunktioner – valda att bygga

| Status | ID | Funktion | Vad den gör | Vald |
|---|---|---|---|---|
| ☐ | **K12** | 🏠💪 **Programgenerator från hemmautrustning** | Kryssa i din utrustning (**Kettlebell, Hantlar, Ryggsäck med vikt, Magrulle/Ab-roller, Gummiband, Pull-up-stång, Bänk/Pall, Stol & Diskbänk, Kroppsvikt**) och välj läge (**Bara hemma** eller **Hemma + Gym**). Appen bygger ett komplett veckoschema 100 % offline med fasta hemvikter (inga manuella kg-fält hemma), bilder, tekniksteg, lägenhets- och balansanpassning (inga hopp, inget marklyft/leg curl). | 2026-10-17 |
| ☐ | **K14** | 🏋️ **Enklare träningsvy** | Tydligare avbockning, större knappar och översikt över vad som är klart och återstår i dagens pass. Mobilanpassad, utan inloggning eller notiser. | 2026-10-31 |

### 🔔 Påminnelser – undersökt och förberett

| Status | ID | Funktion | Vad den gör | Vald |
|---|---|---|---|---|
| ☐ | **K13** | Web Push på träningsdagar | Planerad påminnelse omkring 17.00 även när appen är stängd, utan GymApp-inloggning. Kräver separat tjänst och konfiguration. Se [PUSH-PLAN.md](../PUSH-PLAN.md). Inte byggd eller aktiverad. | 2026-10-31 |

### 🤖 Underhållsbotar – prioriterad ordning

| Status | ID | Bot | Vad den gör | Vald |
|---|---|---|---|---|
| ☐ | **B1** | 🔄 **Migrationsbot** | Versionsnummer på datastrukturen. Gammal data konverteras automatiskt vid start så befintliga användare aldrig kraschar när formatet ändras. **Grunden – allt annat bygger på denna.** | 2026-09-05 |
| ☐ | **B2** | 🧹 **Städbot** | Rensar tyst en gång i veckan: loggposter >200, balansdagar >400, föråldrade cacheversioner, övergivna `setsOk`-nycklar | 2026-09-05 |
| ☐ | **B3** | 📋 **Schema-validerare** | Kontrollerar egna scheman mot regeluppsättning vid inläsning. Trasigt schema lagas eller hoppas över – tar aldrig ner appen | 2026-09-05 |
| ☐ | **B4** | 🖼️ **Bild-autoregistrering** | Läser bildmappen och bygger `IMG_BANK` + SW-listan automatiskt. Idag krävs manuell inmatning på **tre ställen** – har redan orsakat ett fel (`counter-squat.png` saknades i `sw.js`) | 2026-09-05 |
| ☐ | **B5** | 🚀 **Pre-flight** | Skript som körs före uppladdning: JS-syntax, HTML-balans, saknade bilder, manifest-validitet, döda `data-act`, oanvänd CSS. Automatiserar dagens manuella kontroller | 2026-09-05 |

**Beroenden:** B1 bör byggas först. B2 och B3 är fristående. B4 och B5 rör byggkedjan och kan göras parallellt.

**Statusnycklar:** ☐ ej påbörjad · 🔄 pågående · ✅ klar → flyttas till [Klart](#-klart--tidigare-kommande)

---

## 📝 Ändringslogg

Räknare för regeln *"10 optimeringsförslag var 5:e uppdatering"*.

| # | Datum | Vad ändrades |
|---|---|---|
| 1 | 2026-09-05 | PWA-installation: banner borttagen, nav-knapp + hemkort med live-detektering |
| 2 | 2026-09-05 | Egna scheman: textparser, JSON-import/export, smart bildmatchning |
| 3 | 2026-09-05 | Nya bilder: pullup, hip-thrust, skullcrusher, tricep-kickback + komprimering 27→6 MB |
| 4 | 2026-09-05 | Greppväljare över/under med bild-i-bild |
| 5 | 2026-09-05 | **K5 Auto-progression** → ✅ optimeringsomgång **O1** levererad |
| 6 | 2026-09-05 | **Stor optimering v8** (index.html) – O1–O10 + mobil/PWA-paket |
| 7 | 2026-09-05 | **balansrutin.html v2** – 2 datumbuggar fixade, event delegation, rAF-timer, Wake Lock, LOG-modul |
| 8 | 2026-09-05 | **index.html v9 – färgdesign** – 68 CSS-variabler, 12 gradienter, Dagens pass-kort, konfetti, räknande siffror, mobilanpassning |
| 9 | 2026-09-05 | **Alla filer i linje** – träningsschema v2, balansrutin färgpalett, manifest v2, sw v6, firebase v3 + B14 uppdateringsbot |
| 10 | 2026-09-05 | **Tomma scheman + datakoppling** – inbyggda scheman borttagna, dagsvy, fristående sidor läser appens data |
| 11 | 2026-10-11 | **Responsiv layout & alla webbläsare** – Bento-dashboard, sticky balans-timer, 2-kolumns dagsvy, fix av nästlad `<button>`, `vh/svh/dvh`, `-webkit-backdrop-filter` + `@supports`-fallback, scrollbars, `forced-colors` |
| 12 | 2026-10-31 | **Säkerhetskopia** – lokal fil, valfri Google Drive-uppladdning och återställning med förhandsbekräftelse; kräver OAuth-konfiguration och test mot Google. Firebase och GymApp-konton fortsatt avstängda. |
| 13 | 2026-10-31 | **Enklare Drive-anslutning** – en anslutningsknapp efter engångskonfiguration, lokal ägarinställning, uppdaterad guide och tester. Google-konfiguration behövs fortfarande. |
| 14 | 2026-10-31 | **Städning** – dubblettkopior i rotmappen borttagna, oanvända logotyper borttagna, appikonerna beskurna/optimerade (2,1 MB → 51 kB), manifest utan falska skärmbilder och felaktig monochrome-ikon, service worker v9. Ett citat borttaget. |
| 15 | 2026-10-31 | **Standardpass + kortare README** – "🔥 Mitt Schema" läggs in och väljs automatiskt vid första start, dagsvyn ritas om vid dygnsbyte så bara dagens pass visas, copyright tillagd, README kortad och den interna manualen flyttad till `docs/PROJEKT.md`. Service worker v10. |
| 16 | 2026-10-31 | **Egna scheman** – knappen "➕ Eget schema" i Schema-fliken, redigeringsknapp (✏️) på egna schema-kort som sparar över befintligt schema, import av JSON blir alltid ett nytt schema. Service worker v11. |

---

## 💡 Förslagsbank

### 🤖 Botbank – diskuterade 2026-09-05 (ej valda)

Botar som togs upp men inte lades i checklistan. Kan väljas senare.

| # | Bot | Kort |
|---|---|---|
| B6 | 📼 **Logg-bot** | Flight recorder: varje tryck, action, tillståndsändring och sparning i ringbuffert. `?debug=1`, export till fil |
| B7 | 🩺 **Hälsokoll** | Kör vid start: saknade bilder, trasig localStorage, orimlig data, SW-status |
| B8 | 🔧 **Självläkare** | Lagar korrupt data: dubbletter, framtida datum, övningar utan schema. Backup först |
| B9 | ⚡ **Prestandavakt** | Mäter FPS och långa uppgifter, slår på `lowfx` automatiskt vid tappade bildrutor |
| B10 | 🧪 **Testrobot** | Klickar igenom alla knappar och flikar, rapporterar fel. `?selftest=1` |
| B11 | 📊 **Lokal användningsanalys** | Vilka övningar som hoppas över, träningstider. Lämnar aldrig enheten |
| B12 | 🔔 **Påminnelsebot** | Upptäcker mönsterbrott: "du brukar träna tisdagar men har missat två veckor" |
| B13 | 💾 **Backupbot** | Bevakar localStorage-kvoten, ber om export innan det blir fullt |
| B15 | 📐 **Kontraktsvakt** | Funktioner deklarerar förväntade typer. Fångar `NaN` innan det sprids |
| B16 | 🔑 **Nyckel-vakt** | Alla localStorage-nycklar via register – omöjligt att stava fel |
| B17 | 🏷️ **Versionsbot** | Bumpar `sw.js`-version automatiskt när filer ändrats |
| B18 | 📄 **Spec-synk** | Jämför README mot koden, flaggar när dokumentationen glidit isär |
| B19 | 🩹 **Krasch-skydd** | Trasig flik visar fel bara där – resten av appen lever vidare |
| B20 | 🆘 **Säkert läge** | Tre krascher i rad → minimalt läge med dataexport innan rensning |

---

### ⚙️ Optimeringsomgång O1 – 2026-09-05
*Automatisk regel: 10 förslag efter 5:e kodändringen. Mätt på faktisk kod.*

| # | Område | Idé | Effekt |
|---|---|---|---|
| O1 | 🧠 Minne | **Event delegation** – ersätt 48 inline-`onclick` med en lyssnare på `#wk-grid` + `data-act` | Färre funktionsreferenser, mindre GC-tryck |
| O2 | ⚡ CPU | **Partiell omritning** – `renderWorkout()` bygger om hela veckan vid varje val. Rita bara berörd dagkort | Slipper 6 dagkort × ~6 övningar per klick |
| O3 | 🧠 Minne | **DocumentFragment** – bygg listan utanför DOM, sätt in en gång istället för `appendChild` i loop | Färre reflows vid inladdning |
| O4 | ⚡ CPU | **Debounce på `save()`** – vikt-knapparna skriver localStorage vid varje tryck. Vänta 300 ms | 5 snabba tryck = 1 skrivning istället för 5 |
| O5 | 🧠 Minne | **Städa timers** – `_gripT` växer per övning och rensas aldrig. Rensa vid panelstängning | Undviker läcka vid långa sessioner |
| O6 | ⚡ CPU | **`content-visibility: auto`** på dagkort utanför skärmen | Webbläsaren hoppar över layout för dolt innehåll |
| O7 | 🧹 Kod | **Slå ihop `_renderDraft()` och `analyzeSchema()`** – nästan identisk kod på två ställen | ~40 rader mindre, en sanning |
| O8 | 🧠 Minne | **Trimma `wLog`** – växer obegränsat. Behåll 200 senaste, aggregera äldre per månad | localStorage-kvoten håller i åratal |
| O9 | ⚡ CPU | **`will-change` bort från orbs** – animerade bakgrundsorbs håller GPU-lager vid liv | Lägre batteriförbrukning på mobil |
| O10 | 🎨 Design | **Delad `.pill`-klass** – `.grip-tab`, `.qa-btn`, `.prog-btn`, `.sb-btn` har nästan samma CSS | ~60 rader CSS mindre, mer konsekvent |


Idéer från `förslag`-kommandot. **Ingen byggs utan klarsignal.**
Räknas som "finns i spec" – nästa `förslag` måste ge andra idéer.

### Omgång 1 – 2026-09-05

**Motivation & vanor**
| # | Idé |
|---|---|
| F1 | 🎖️ **Achievements** – badges för 10/50/100 pass, 30-dagars streak, första 100 kg |
| F2 | 🔥 **Streak-skydd** – en "frysning" i månaden räddar streaken vid sjukdom |
| F3 | 📊 **Årssammanfattning** – Spotify Wrapped-liknande: totala kg lyfta, favoritövning, bästa månad |
| F4 | 🎯 **Veckomål** – sätt eget mål (3 pass/vecka), ring som fylls |
| F5 | 🌡️ **Formkurva** – snabb 1–5-skattning efter pass, graf över tid |

**Delning & viralitet**
| # | Idé |
|---|---|
| F6 | 🖼️ **Dela-kort** – genererad bild av passet till Instagram/Story via Canvas |
| F7 | 🔗 **Dela schema via länk** – hela schemat kodat i URL:en, ingen server |
| F8 | 🏅 **Månadens diplom** – nedladdningsbar PNG när månadsmålet nås |
| F9 | 📱 **QR-kod till appen** – visa QR så kompisar kan installera direkt |
| F10 | 🤝 **Utmaningslänk** – skicka "slå min streak"-länk utan konto |

**Under passet**
| # | Idé |
|---|---|
| F11 | 🔊 **Röstuppläsning** – appen säger nästa övning högt, händerna fria |
| F12 | 📿 **Rep-räknare med ljud** – knacka/tryck för varje rep, pip vid målet |
| F13 | ⏭️ **Autopilot-läge** – kör hela passet automatiskt med timers, ingen touch |
| F14 | 🎚️ **RPE-skattning** – 1–10 hur tungt setet kändes, styr auto-progression |
| F15 | 🧊 **Superset-stöd** – koppla två övningar som körs växelvis |

**Tydlighet & UX**
| # | Idé |
|---|---|
| F16 | 🎬 **Animerad teknik-loop** – 2–3 bildrutor som växlar, visar rörelsen |
| F17 | 🩻 **Muskelkarta** – kroppssiluett som färgas efter vilka muskler passet träffar |
| F18 | 🔍 **Zoom på övningsbild** – tryck för helskärm (finns i träningsschema.html, saknas i appen) |
| F19 | 📖 **Övningslexikon** – bläddra alla övningar oberoende av schema |
| F20 | ⚠️ **Vanliga misstag** – "gör inte så här"-punkter i teknikpanelen |

**Snyggare**
| # | Idé |
|---|---|
| F21 | 🎨 **Temaväljare** – lila/teal (nuvarande), soluppgång, skog, midnatt |
| F22 | ✨ **Konfetti vid avklarat pass** – Canvas-partiklar, ingen extern kod |
| F23 | 🌈 **Dynamisk hälsning** – bakgrundens orbs skiftar färg efter tid på dygnet |
| F24 | 💫 **Sidövergångar** – mjuk slide mellan flikar istället för hårt hopp |
| F25 | 🔢 **Räknande siffror** – statistiken tickar upp till sitt värde vid inladdning |

### Omgång 2 – 2026-09-05

**Smarta hjälpmedel**
| # | Idé |
|---|---|
| F26 | 🧮 **Skivstångskalkylator** – visar exakt vilka viktskivor du ska sätta på för målvikten |
| F27 | 🔁 **Byt ut övning** – "🔄 Visa alternativ" föreslår liknande övning för samma muskelgrupp |
| F28 | 📉 **1RM-uppskattning** – räknar ut ditt teoretiska maxlyft från vikt × reps (Epley) |
| F29 | ⏳ **Tid kvar i passet** – live-uppskattning baserat på klara vs återstående övningar |
| F30 | 🧭 **Vart är jag?** – tunn progressstapel högst upp: övning 4 av 6 |

**Kroppen & hälsan**
| # | Idé |
|---|---|
| F31 | 🩹 **Skadeflagga** – markera "ont i axeln" så döljs/ersätts övningar automatiskt |
| F32 | 💧 **Vattenpåminnelse under passet** – diskret prick var 15:e minut |
| F33 | 😴 **Sömn vs prestation** – logga sömntimmar, se samband med hur passen känns |
| F34 | 🤸 **Stretchning efter pass** – 5 min nedvarvning som föreslås när passet bockas av |
| F35 | ⚖️ **Viktkurva** – logga kroppsvikt, glidande medelvärde så dagssvängningar jämnas ut |

**Bättre data**
| # | Idé |
|---|---|
| F36 | 🔎 **Sök i historiken** – "vad lyfte jag i bänkpress i mars?" |
| F37 | 📆 **Jämför veckor** – vecka 12 mot vecka 11, volym och närvaro sida vid sida |
| F38 | 🏋️ **Muskelbalans-varning** – flagga om du kör dubbelt så mycket bröst som rygg |
| F39 | 📤 **CSV-export** – öppna din träningsdata i Excel eller Google Sheets |
| F40 | 🕐 **Bästa träningstid** – visar vilken tid på dygnet dina bästa pass sker |

**Viralt & socialt**
| # | Idé |
|---|---|
| F41 | 🎥 **Tidslinje-video** – kort autogenererad klipprulle av årets framsteg |
| F42 | 🏆 **Veckans lyft** – appen lyfter fram din bästa prestation som delbart kort |
| F43 | 👋 **Gästläge** – låt en kompis testa appen utan att röra din data |
| F44 | 🗺️ **Gym-incheckning** – valfri plats per pass, karta över var du tränat |
| F45 | 💬 **Egen peppfras** – skriv din egen text som visas vid passets start |

**Polish & känsla**
| # | Idé |
|---|---|
| F46 | 🌓 **Följ systemets tema** – auto dark/light efter mobilens inställning |
| F47 | 📳 **Haptisk feedback** – korta vibrationer vid avbockning och knapptryck |
| F48 | 🖐️ **Svep mellan flikar** – dra åt sidan istället för att trycka i navigeringen |
| F49 | 💀 **Skelett-laddning** – mjuka platshållare istället för tomt innehåll vid start |
| F50 | 🔕 **Fokusläge** – dölj all statistik under passet, bara övningen syns |

### Omgång 3 – 2026-09-05

**Sömn & klocka** *(diskuterat 2026-09-05 – Health Connect/HealthKit har ingen webb-API, PWA kan inte läsa dem)*
| # | Idé |
|---|---|
| F51 | 😴 **Manuell sömnlogg** – snabbknappar 5/6/7/8/9 h, minns gårdagens värde. Enda vägen för PWA |
| F52 | 📥 **CSV-import från Zepp Life** – ladda upp exportfil, får sömn- och pulshistorik bakåt |
| F53 | 📲 **TWA-paketering** – bygg appen som Play Store-app, låser upp Health Connect. Android only |
| F54 | ⌚ **Parallellt klockpass** – guide: starta "Styrketräning" på bandet för puls, GymApp för vikter |
| F55 | 💓 **Manuell vilopuls** – logga morgonpuls, varning vid förhöjd (tecken på överträning) |

**Struktur i passet**
| # | Idé |
|---|---|
| F56 | 🔀 **Dropset-stöd** – markera set som dropset, logga alla vikttrappsteg |
| F57 | ⏸️ **Pausa passet** – avbryt och återuppta senare utan att tappa avbockningar |
| F58 | 🔁 **Repetera förra passet** – "kör exakt som sist" med samma vikter förifyllda |
| F59 | 📝 **Snabbanteckning per pass** – en rad om hur det gick, syns i historiken |
| F60 | 🎯 **Målvikt per övning** – sätt ett mål, se avstånd kvar som stapel |

**Tydligare övningar**
| # | Idé |
|---|---|
| F61 | 🔢 **Tempo-notation** – 3-1-2 (ned-håll-upp) i sekunder per övning |
| F62 | 📏 **Inställningar sparas** – sätesplacering, ryggstödsvinkel, pinnhål per maskin |
| F63 | 🆚 **Före/efter-teknik** – två bilder sida vid sida: rätt kontra vanligt fel |
| F64 | 🔤 **Alternativa namn** – "benböj = squat = knäböj", förbättrar sökning och matchning |
| F65 | 🎧 **Ljudsignal per fas** – kort pip vid excentrisk/koncentrisk fas i tempoläge |

**Data & säkerhet**
| # | Idé |
|---|---|
| F66 | 🔐 **PIN-lås till appen** – enkel kod innan data visas, allt fortsatt lokalt |
| F67 | ♻️ **Automatisk backup-påminnelse** – be om JSON-export var 30:e dag |
| F68 | 🗃️ **Papperskorg** – raderade scheman går till korg i 30 dagar innan de försvinner |
| F69 | 📦 **Lagringsindikator** – visa hur mycket localStorage som används av kvoten |
| F70 | 🔄 **Återställ till förra versionen** – ångra senaste schemaändringen |

**Känsla & motivation**
| # | Idé |
|---|---|
| F71 | 🌅 **Morgonhälsning** – annan startvy före kl 10: dagens pass i fokus, inget annat |
| F72 | 🎵 **Metronom för tempo** – tyst visuell puls som styr rörelsehastigheten |
| F73 | 🏔️ **Nivåsystem** – XP per pass, nivå 1–50, låser upp nya bakgrundsteman |
| F74 | 💤 **Vilodags-läge** – på vilodagar visas stretch och återhämtningstips istället för pass |
| F75 | 📈 **Milstolpar i historiken** – markera "första 100 kg", "50:e passet" som pärlor på tidslinjen |

### Omgång 4 – 2026-09-05

**Gymvardagen**
| # | Idé |
|---|---|
| F76 | 🚦 **Maskin upptagen** – markera övning som "hoppa över nu", appen flyttar den sist i passet |
| F77 | 🧳 **Resläge** – generera hotellpass av dagens övningar med bara kroppsvikt |
| F78 | 🅿️ **Flera gym** – spara olika maskinuppsättningar per gym, växla vid incheckning |
| F79 | 👥 **Träna med kompis** – dubbel viktkolumn i samma vy när ni turas om på samma maskin |
| F80 | 🧴 **Utrustningskoll** – kryssruta före hemmapass: matta, band, vattenflaska framme |

**Progression & analys**
| # | Idé |
|---|---|
| F81 | 📐 **Volym per muskelgrupp** – veckostapel som visar set per kroppsdel |
| F82 | 🐢 **Stagnationsvarning** – flagga övning som stått still i 4+ veckor |
| F83 | 🎢 **Periodisering** – 4-veckorsblock med planerad tung/lätt-växling |
| F84 | 🔬 **A/B-test av övningar** – kör två varianter växelvis, jämför utvecklingen |
| F85 | 📊 **Reps-i-reserv** – logga hur många reps du hade kvar, precisare progression än RPE |

**Onboarding & förståelse**
| # | Idé |
|---|---|
| F86 | 👋 **Första-gången-guide** – 4 skärmar som förklarar appen, visas bara en gång |
| F87 | 💡 **Tooltips vid nya funktioner** – liten prick på det som är nytt sedan förra besöket |
| F88 | ❓ **Varför denna övning?** – kort förklaring av dess roll i just ditt schema |
| F89 | 🎓 **Nybörjarläge** – döljer avancerat (RPE, tempo, dropset) tills du slår på det |
| F90 | 🗒️ **Ordlista** – förklarar set, reps, superset, deload på svenska |

**Snyggare & smidigare**
| # | Idé |
|---|---|
| F91 | 🖼️ **Egen bakgrundsbild** – ladda upp foto som subtil bakgrund i appen |
| F92 | 🔠 **Textstorlek** – tre steg för läsbarhet på håll, bra mitt i ett set |
| F93 | 👆 **Enhandsläge** – flytta ned knapparna inom tummens räckvidd |
| F94 | 🌗 **AMOLED-svart** – helsvart tema som sparar batteri på OLED-skärmar |
| F95 | 🔁 **Dra för att uppdatera** – pull-to-refresh som laddar om dagens vy |

**Utanför passet**
| # | Idé |
|---|---|
| F96 | 📅 **Lägg pass i kalendern** – exportera schemat som .ics till telefonkalendern |
| F97 | 🛒 **Utrustningsönskelista** – notera vad du vill köpa hem, med prisidé |
| F98 | 🍽️ **Proteinpåminnelse efter pass** – enkel notis, ingen kaloriräkning |
| F99 | 📚 **Länkbibliotek** – spara egna länkar till videor och artiklar per övning |
| F100 | 🧊 **Widget-vy** – minimal sida optimerad som telefonwidget: dagens pass i ett ögonkast |

### Omgång 5 – 2026-09-05

**Minne & lagring**
| # | Idé |
|---|---|
| F101 | 🗜️ **Komprimerad lagring** – korta nyckelnamn i localStorage (`w` istället för `weights`), ~40 % mindre |
| F102 | 🧊 **IndexedDB för historik** – flytta gammal logg dit, localStorage håller bara aktiv data |
| F103 | 🔗 **Delad bildcache** – samma bild återanvänds mellan scheman istället för en instans per referens |
| F104 | 📉 **Virtuell lista** – rendera bara synliga övningar vid långa scheman |
| F105 | ♻️ **Objektpool för DOM** – återanvänd kortelement vid schemabyte istället för att slänga och nyskapa |

**Uppstart & upplevd snabbhet**
| # | Idé |
|---|---|
| F106 | 🎨 **Kritisk CSS inline** – bara det som syns först, resten laddas efteråt |
| F107 | ⚡ **Optimistisk UI** – visa resultatet direkt, spara i bakgrunden |
| F108 | 🖼️ **WebP/AVIF med PNG-fallback** – ytterligare 40–60 % mindre bilder |
| F109 | 📦 **Bildsprite för småikoner** – greppbilderna i en fil istället för två förfrågningar |
| F110 | 🚦 **Prioriterad bildladdning** – `fetchpriority="high"` på dagens övningar, låg på resten |

**Felsökning i praktiken**
| # | Idé |
|---|---|
| F111 | 📸 **Skärmdump av fel** – rita om tillståndet som bild vid krasch, lätt att skicka vidare |
| F112 | 🕰️ **Tidsresa** – spola tillbaka datan till hur den såg ut för X ändringar sedan |
| F113 | 🔬 **Diff-vy** – visa exakt vad som ändrades i datan vid senaste åtgärden |
| F114 | 🧾 **Felrapport-knapp** – samlar logg, enhetsinfo och tillstånd i en textfil |
| F115 | 🎛️ **Funktionsflaggor** – slå av/på enskilda delar i felsökningsläge för att ringa in problem |

**Design & tydlighet**
| # | Idé |
|---|---|
| F116 | 🌡️ **Färgkodad intensitet** – kortets kantfärg speglar passets tyngd |
| F117 | 📊 **Mini-graf i övningsraden** – liten sparkline direkt vid vikten, ingen extra vy |
| F118 | 🎯 **Fokusring som följer** – tydlig tangentbordsnavigering genom hela appen |
| F119 | 🌓 **Automatisk kontrastjustering** – läser omgivningsljus där stöd finns |
| F120 | 📐 **Täthetsval** – kompakt eller luftig layout efter smak |

**Robusthet**
| # | Idé |
|---|---|
| F121 | 🔒 **Skrivlås** – hindrar två flikar från att skriva över varandras data |
| F122 | 🧯 **Transaktionssparning** – skriv till temporär nyckel först, byt sedan. Inget halvskrivet tillstånd |
| F123 | 📡 **Offline-kö** – åtgärder under avbrott köas och körs när nätet kommer tillbaka |
| F124 | 🔍 **Integritetskontroll** – checksumma på datan, upptäcker korruption vid inläsning |
| F125 | ⏰ **Klockskydd** – upptäcker om enhetens tid ändrats och varnar innan streaken räknas fel |

### Omgång 6 – 2026-10-17 *(Forskningsbaserade förslag: idrott, balans, återhämtning, vanor & kognitiv UX)*

**Hypertrofi & fasta hemvikter (Schoenfeld / mekanisk spänning / metabol stress)**
| # | Idé |
|---|---|
| F126 | 🧬 **Effektiva reps-indikator (Stimulating Reps)** – vid fasta/lättare hemvikter (15–30 reps) visar forskningen (Schoenfeld/Beardsley) att de sista ~5 repsen nära utmattning ger mest muskeltillväxt. Visuell markör för "effektiva zonen" |
| F127 | 📏 **Längd-spänningsfokus (Stretch-Mediated Hypertrophy)** – studier (Pedrosa/Maeo) visar att muskelns utsträckta bottenläge bygger mest muskelmassa. Markering i teknikpanelen var 1-sekundspausen i bottenläget ska hållas |
| F128 | 🔄 **Myo-reps / Rest-Pause för fasta hemvikter** – när hemvikten (16 kg KB / 5 kg hantlar) är fast ökar appen stimulansen vetenskapligt via 1 aktiveringsset + korta miniset (15 sek vila) istället för höjd vikt |
| F129 | 🎯 **MEV/MAV-volymkompass (10–20 set/muskel/vecka)** – visar om ditt schema ligger i den forskningsbelagda optimala zonen (10–20 set/vecka per muskelgrupp) utan att överskrida återhämtningstaket |
| F130 | ⚡ **Antagonist-parning (Reciprocal Inhibition)** – forskning (Robbins m.fl.) visar att varva drag + press (t.ex. rodd och armhävning) sparar halva tiden och ökar kraftutvecklingen. Smart parning i schemageneratorn |

**Neuromuskulär balans & fallprevention (Sherrington / Horak / proprioception)**
| # | Idé |
|---|---|
| F131 | 👀 **Sensorisk balansprogression (Syn → Blickfokus → Huvudvridning)** – balansforskning (Horak) bygger på syn, inneröra och fotsulor. När 60 sek är lätt föreslås mjuk huvudvridning (alltid med hand nära vägg/stol) |
| F132 | 🧠 **Dual-Task Balansläge (Kognitiv + Motorisk träning)** – fallpreventionsstudier visar att balans i vardagen kräver delad uppmärksamhet. Timern kan visa enkla ord-/sifferuppgifter under de 30 sekunderna med stöd |
| F133 | 🦶 **Asymmetri-logg (Vänster vs Höger ben)** – markera vilket ben som kändes ostadigast i enbensövningarna så föreslår appen 1 extra set på den svagare sidan för att jämna ut sidoskillnader |
| F134 | ⏱️ **Mikrodos-balans ("Exercise Snacks")** – motorisk inlärningsforskning visar att korta utspridda pass (2 övningar morgon/middag/kväll) ofta ger starkare nervkoppling än allt i en klump. Valbart läge |
| F135 | 🦴 **Isometriskt sen- & ledläge (Rio et al.)** – 30–45 sek statiska håll ger dokumenterad smärtlindring och senstyrka. Ett "Skonsamt läge" byter tillfälligt dynamiska reps mot statiska håll vid ömma leder |

**Återhämtning, CNS & skadeprevention (Gabbett / Autoreglering / Stanford)**
| # | Idé |
|---|---|
| F136 | 📈 **Akut:Kronisk belastningskvot (ACWR 0.8–1.3)** – idrottsmedicinsk modell (Gabbett) som jämför veckans volym mot snittet senaste 4 veckorna och varnar vid för tvära hopp (>1.5) |
| F137 | 🔋 **10-sekunders Readiness-check (Autoreglering)** – tre snabba tryck före passet (Energi, Muskelömhet, Stress) som justerar dagens rekommenderade set-antal (±1 set) efter dagsform |
| F138 | 🫁 **Fysiologisk suck (Cyclic Sighing) i vilotimern** – Stanford-studie (Balban/Huberman) visar att *dubbel inandning + lång utandning* sänker puls snabbast mellan set. Visuell andningsguide under vilan |
| F139 | ⏳ **Differentierad vilotid (Flerleds vs Isolering)** – studier (Schoenfeld) visar att tunga gym-basövningar vinner på 2–3 min vila medan hemmapass/isolering fungerar optimalt på 45–60 sek. Automatisk rekommendation |
| F140 | 🌡️ **PAP-uppvärmningsramp (Post-Activation Potentiation)** – räknar ut 2 snabba uppvärmningsset (50 % × 8, 75 % × 4) före dagens första gymövning så nervsystemet aktiveras utan att trötta ut muskeln |

**Beteendevetenskap & vanebildning (Lally 66 dagar / Gollwitzer / Fogg / Kahneman)**
| # | Idé |
|---|---|
| F141 | 🎯 **"Om–Så"-planering (Implementation Intentions, Gollwitzer)** – studier visar 2–3× högre närvaro när man binder träningen till en fast vardagstrigger (*"När jag kommer hem kl 17 → kör jag 12 min hemmapass"*) |
| F142 | 🌱 **66-dagars automatik-mätare (Lally et al.)** – forskning visar att en vana tar i snitt 66 dagar att bli automatisk, och att en enstaka missad dag inte sänker vanestyrkan. Mjuk kurva 0–100 % |
| F143 | 🪙 **Minimum Viable Workout ("2-minutersregeln", Fogg)** – knapp *"Låg energi idag?"* som kortar dagens pass till 1 set per övning (~4 min) så vanan och streaken överlever tunga dagar |
| F144 | 🧠 **Peak-End-avslutning (Kahneman)** – hjärnan bedömer ett pass efter dess topp och dess slut. Passet avslutas alltid med en positiv summering av det du presterade |
| F145 | 🔄 **"Never Miss Twice"-fokus (Vaneforskning)** – ett missat pass gör ingen skada, men två i rad bryter vanemönstret. Extra mjuk och enkel startknapp dagen efter ett missat pass |

**Kognitiv ergonomi, minne & visuell fokus (Miller / Hick / Fitts lag)**
| # | Idé |
|---|---|
| F146 | 🧩 **Stegvis informationsvisning (Hicks & Millers lag)** – minimerar kognitiv belastning under pågående set genom att bara visa aktivt steg i stor stil och tona ned övrig metadata |
| F147 | 👁️ **Perifer färg-puls i timern (Pre-attentive Processing)** – ögat registrerar färgskifte i periferin utan att du behöver läsa siffror. Timer-ringen skiftar mjukt nyans de sista 5 sekunderna |
| F148 | 📐 **Fitts lag-optimerad tumzon** – de mest använda knapparna under passet placeras inom tummens naturliga båge längst ned med generös träffyta och noll risk för feltryck |
| F149 | 📉 **Noll Layout-Shift (CLS = 0) & förberäknad kort-geometri** – reserverar exakt höjd för alla bilder och paneler innan de laddas så sidan aldrig hoppar och webbläsaren sparar layout-CPU |
| F150 | 🧪 **Mikro-evidenskort ("🔬 Varför funkar detta?")** – 2 meningar forskningsbakgrund per övning samt för 15–30 reps, 100-reps och balansrutinen för den som vill förstå mekanismen |

---

## ✅ Checklista

### GitHub Pages (kör nu)
- [ ] GitHub-konto skapat
- [ ] Repo skapat (`gymapp`, Public)
- [ ] Filer uppladdade
- [ ] GitHub Pages aktiverat
- [ ] Appen testad på `https://DITTNAMN.github.io/gymapp`

### Firebase (när du vill)
- [ ] Firebase-projekt skapat
- [ ] E-post/lösenord aktiverat
- [ ] Google-inloggning aktiverat
- [ ] Firestore skapad i **produktionsläge**
- [ ] Firestore-regler inlagda
- [ ] `FB_CONFIG` ifylld i `firebase.js`
- [ ] `FIREBASE_ENABLED = true` satt
- [ ] `DITTNAMN.github.io` tillagd i Authorized Domains
- [ ] `localhost` tillagd i Authorized Domains
- [ ] Migrerings-script kört (om lokala konton finns)

---

## 📞 Snabbreferens

```
App-URL:       https://DITTNAMN.github.io/gymapp
Firebase:      https://console.firebase.google.com
GitHub Pages:  https://github.com/DITTNAMN/gymapp/settings/pages

Lokal server:  python3 -m http.server 8080
               → http://localhost:8080
```

---

*GymApp v4 · Glassmorphism · PWA · Local-first · Firebase-ready*

---

## 📐 Spec & Designregler

> Dessa regler gäller för ALLA filer i projektet.
> Ny kod ska alltid följa dessa beslut.

### 🎨 Design – Glassmorphism

| Regel | Värde |
|---|---|
| Bakgrundsfärg | `#07070e` |
| Glasskort bakgrund | `rgba(255,255,255,.055)` |
| Glasskort blur | `backdrop-filter: blur(18px)` |
| Stark blur (auth/timer) | `backdrop-filter: blur(32px)` |
| Border normal | `rgba(255,255,255,.08)` |
| Border hover | `rgba(255,255,255,.17)` |
| Animerad bakgrund | Radial-gradients med `rgba(124,58,237,.13)` + `rgba(34,211,238,.09)` |
| Hover lift | `transform: translateY(-3px)` |
| Transition | `cubic-bezier(.4,0,.2,1)` – `.15s` fast, `.25s` mid |

### 🎨 Färgpaletten

| Token | Hex | Användning |
|---|---|---|
| `--p` / `--pl` / `--pd` | `#7c3aed` / `#a78bfa` / `#5b21b6` | Primär (lila) – knappar, glow |
| `--c` / `--cl` | `#22d3ee` / `#67e8f9` | Cyan – timer, accenter |
| `--g` | `#4ade80` | Grön – success, balans, hem-dag |
| `--o` | `#f97316` | Orange – spara, 100-reps |
| `--r` | `#ef4444` | Röd – fel, stop-knapp |
| `--b` | `#60a5fa` | Blå – gym-dag |
| `--y` | `#facc15` | Gul – utrustning-tags |
| `--t1/2/3` | `#f1f5f9` / `#94a3b8` / `#475569` | Text nivåer |

### 📏 Spacing & Radier

| Token | Värde | Användning |
|---|---|---|
| `--r8` | `8px` | Inputs, small cards |
| `--r12` | `12px` | Bilder, small cards |
| `--r16` | `16px` | Dag-kort, övningskort |
| `--r24` | `24px` | Auth-box, timer-kort |
| `--rFull` | `9999px` | Badges, chips, pills |
| `--page-pad` | `24px` | Sidfyllnad |

### 🏋️ Övningsregel – Alla filer

Varje övning SKA ha:
- ✅ **Bild** – illustration i `gymapp/images/`
- ✅ **Steg-för-steg** – 4–6 numrerade steg
- ✅ **Muskler** – vilka muskler som tränas
- ✅ **Tips** – ett konkret tekniktips
- ✅ **Andning** – exakt IN/UT timing
- ✅ **Expanderbar panel** – klick för att visa/dölja (chevron ▼)

### 📱 Mobilregler

- Bottom nav på `≤640px`, top nav på `≥641px`
- `100svh` istället för `100vh` (undviker iOS-adressfältet)
- `env(safe-area-inset-bottom)` på bottom-nav
- Alla grids → `grid-template-columns: 1fr` på mobil
- Inga hover-only interaktioner – allt klickbart

### 🔐 Kontoregler (nuläge)

- Inga konton och ingen inloggning är aktiverad – appen ägs av enheten.
- All data sparas lokalt: `ga_data` (scheman, viktlogg, balansdagar), `gymapp_balance` (balansrutin), `gym_100reps` (repsräknare), `ga-notif`/`ga-bt`/`ga-wt` (påminnelser) och `gymapp-drive-client-id` (frivilligt OAuth-klient-ID).
- `firebase.js` finns förberett men är avstängt (`FIREBASE_ENABLED = false`).

### 📁 Bildregler

- Alla bilder i `gymapp/images/`
- Format: `.png`
- Namnkonvention: `kebab-case.png`
- Aspect ratio i HTML: `16:9` (via `aspect-ratio: 16/9`)
- `loading="lazy"` på alla bilder
- `alt`-text = övningens namn

### 🔔 Notifikationsregler

- Lagras i `localStorage`: `ga-notif`, `ga-bt`, `ga-wt`
- Vid Firebase: sparas i Firestore under `notifBalTime` + `notifWoTime`
- Vibration vid timer-slut: `[150, 75, 150]`
- Toast-duration: `2800ms`

### 🚫 Förbjudet

- ❌ Inga `!important` i CSS
- ❌ Inga `inline styles` i HTML (undantag: `display:none` initial state)
- ❌ Inga `var()` utan fallback i kritiska platser
- ❌ `jump squats`, `burpees` eller andra hopp-övningar (lägenhetsanpassat)
- ❌ Övningar som kräver fri balans utan stöd (balansanpassat)
- ❌ Marklyft, leg curl (borttagna på användarens begäran)
