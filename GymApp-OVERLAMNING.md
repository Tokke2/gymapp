# GymApp – överlämning till ny chatt

Detta dokument sammanfattar användarens önskemål, projektets läge, vad som gjorts och vad som återstår. Hela den nuvarande specen och förslagsbanken finns också infogad längst ned. Källkoden måste följa med separat: använd ZIP-filen `GymApp-kallkod-och-overlamning.zip`.

## Läs först – viktigt för nästa assistent

1. Svara på **svenska**, kort och praktiskt. Användaren skriver ibland snabbt med stavfel.
2. Appen ska vara **local-first**, fungera på GitHub Pages och vara enkel på mobil. Spara inte användarens träningsdata i Git eller på en server utan uttryckligt godkännande.
3. **Aktivera inte GymApp-konton, inloggning eller Firebase** utan att användaren uttryckligen ber om det. `FIREBASE_ENABLED` är fortfarande `false`. Google-inloggningen som byggts avser endast **frivillig Drive-backup**, inte ett GymApp-konto.
4. **Inga nya notiser ännu.** Web Push/K13 är planerat men ska avvakta användarens besked. Befintlig äldre lokal påminnelsekod finns i appen; den är inte samma sak som pålitlig bakgrunds-push.
5. Inbyggd musikspelare ska inte återinföras. Visa inte kommande-/roadmaplistan på appens startsida.
6. Hemmaövningar ska ha **fasta vikter/utrustning utan manuella kg-fält under passet**. Ta hänsyn till balans: användaren klarar inte vissa stående övningar. Gummiband och sittande alternativ med lämpligt stöd är viktiga. Överdriv inte säkerheten; användaren ska kontrollera stol och bandfäste.
7. Publicera inte eller logga GitHub-tokens, OAuth client secrets eller andra hemligheter. En GitHub-token delades tidigare i chatten och användaren uppmanades att återkalla den; **det är inte bekräftat att den är återkallad**. Be aldrig om en ny token i klartext och använd inte den tidigare.
8. Vid begärda kodförbättringar: ändra faktiskt filerna, testa vad som går och redovisa exakt vad som är gjort. Påstå inte att webbläsare, Drive eller GitHub testats om de bara simulerats.
9. Fråga innan otydlig eller potentiellt destruktiv åtgärd. Särskilt: bevara befintliga scheman och sparad träningsdata; ta en backup före migration eller återställning.

## Projekt och GitHub

- Projekt: **GymApp**, en svensk tränings-PWA med schemabyggare, styrketräning och balans.
- GitHub-repository: `https://github.com/Tokke2/gymapp`, branch `main`.
- GitHub Pages startsida: `https://tokke2.github.io/gymapp/`.
- Faktisk app: `https://tokke2.github.io/gymapp/gymapp/index.html`.
- Google OAuth:s **Authorized JavaScript origin**: `https://tokke2.github.io` – ingen sökväg.
- Repositoryts rot har en `index.html` som omdirigerar till `gymapp/index.html`. De fristående sidorna ligger på rotnivå: `träningsschema.html` och `balansrutin.html`. Huvudappen ligger i mappen `gymapp/`.
- Det finns även äldre dubblerade appfiler i repositoryts rot sedan en tidigare uppladdning. Radera inte utan att kontrollera referenser och fråga användaren. Appens lokala källor och GitHub har **inte** samma innehåll.

### Senast kontrollerade skillnader mot offentliga GitHub

Vid kontroll i den här sessionen gick repositoryts filer att läsa offentligt. **Lokala arbetsytan var nyare:**

- `gymapp/index.html`, `gymapp/sw.js`, `gymapp/backup.js`, `träningsschema.html` och `balansrutin.html` skilde sig från `main`.
- `gymapp/migration.js` fanns **inte** på GitHub (`404`). B1-paketet är därför inte bekräftat publicerat.
- GitHubs `gymapp/sw.js` angav `gymapp-v9`; lokala filen anger `gymapp-v12`.
- Vid samma kontroll innehöll GitHubs `gymapp/index.html` inte det ifyllda publika Google-klient-ID:t eller den sittande bandövningen. Lokala versionen innehåller båda.
- GitHubs `README.md` i roten skilde sig från lokala `gymapp/README.md`, där senaste checklistan och F176–F275 finns.
- Detta är en ögonblicksbild, inte en garanti om GitHubs aktuella läge. Jämför med GitHub igen innan någon push. Skriv inte över användarens senare ändringar.

Tidigare chatt kunde inte ansluta GitHub som connector och pushade aldrig. Den nya chattens anslutning måste kontrolleras separat. Om användaren ber om en push och anslutningen tillåter det: jämför först ändringarna, bevara eventuella nyare remote-ändringar, testa och redovisa commit/branch/resultat. Om den inte fungerar, använd uppladdningspaket; be inte användaren klistra in en token.

### Om användaren vill publicera B1 manuellt

`GymApp-B1-uppdatering.zip` skapades med följande sex filer. Ladda inte upp ZIP-filen som en enda fil; extrahera först och behåll sökvägarna:

- `gymapp/index.html`
- `gymapp/backup.js`
- `gymapp/migration.js`
- `gymapp/sw.js`
- `balansrutin.html` i repositoryts rot
- `träningsschema.html` i repositoryts rot

Stäng andra appflikar och exportera helst en lokal säkerhetskopia före uppdatering. Om en direkt GitHub-anslutning finns är det bättre att granska och publicera filerna tillsammans i en commit. ZIP-paket från äldre steg är historiska och kan sakna senare ändringar. `GymApp-GitHub.zip` är det senast uppdaterade rena deployments-paketet, men innehåller inte hela specen och alla tester. Det kompletta överlämningspaketet innehåller källkod, spec och tester.

## Aktiv filstruktur

```text
/home/user/
├── GymApp-OVERLAMNING.md          denna handoff med infogad spec
├── GymApp-kallkod-och-overlamning.zip  komplett källkod och denna handoff
├── träningsschema.html            detaljsida, samma origin som appen
├── balansrutin.html               fristående balansrutin
└── gymapp/
    ├── index.html                 huvudapp, lokal lagring
    ├── manifest.json              PWA-manifest
    ├── sw.js                      service worker, lokalt v12
    ├── backup.js                  lokal och valfri Google Drive-backup
    ├── migration.js               B1 versionskontroll/migrering
    ├── firebase.js                förberett men inaktivt
    ├── README.md                  fullständig spec/checklista/förslagsbank
    ├── MIGRATION-INFO.md          tekniska begränsningar för B1
    ├── GOOGLE-DRIVE-SETUP.md      Google-konfigurationsguide
    ├── google-drive-setup.html    guiden i appvänligt HTML-format
    ├── PUSH-PLAN.md               endast plan för framtida notiser
    ├── mitt-schema-original.json  originalmall; innehåller KB-marklyft
    ├── mitt-schema-sittande-band.json  uppdaterad mallfil för import
    ├── mitt-schema-sittande-band.md    mänskligt läsbart schema
    ├── icons/                     appikoner
    ├── images/                    tränings- och balansbilder
    └── tests/                     simulerade tester för backup och migrering
```

Överlämnings-ZIP:en ska extraheras med den här strukturen; `träningsschema.html` och `balansrutin.html` ska inte flyttas in i `gymapp/` utan att alla referenser och PWA-scope samtidigt ses över. Testa GitHub Pages-sökvägar efter eventuella strukturändringar.

## Vad som gjorts lokalt

### App och design

- Eget schemabyggarflöde: klistra in text eller HTML, analysera, förhandsgranska och spara; JSON-import/export för scheman; bildmatchning och reservsymbol.
- `SCHED = []`: inga scheman visas som redan skapade. `🔥 Mitt Schema` finns som **mall i byggaren** och ska sparas av användaren. Användaren hade uttryckligen bett att färdiga scheman inte ska synas som egna automatiskt.
- `Dagens pass` öppnar dagsvy, inte automatiskt hela veckan; vilodag går till balans.
- Viktknappar för gymövningar, fasta hemvikter och förslag till auto-progression finns. Träning och balans sparas lokalt.
- Responsiv layout, bento-startsida, dagsvy/veckovy, safe-area, flexibla kort, CSS-fallbacks och glassmorphism. Långa övningsnamn radbryts lokalt (O19).
- Installationsknapp i stället för påträngande banner; iOS måste läggas till på hemskärmen manuellt. Funktionen behöver prövas i verkliga webbläsare.
- `balansrutin.html` delar avbockningar via `ga_data.balDays` men har även egen veckohistorik. `träningsschema.html` läser aktivt användarschema från `ga_data` och har 100-repsräknare.
- Fokus, bra kontrast och fungerande layout på mobil, dator och olika skärmar är viktiga. Det har inte gjorts fullständiga tester på riktiga enheter.

### Schemat och användarens balans

- Den gamla mallen finns kvar inne i `gymapp/index.html`. Användaren sa att schemat inte syntes trots laddning. Det felet är **inte bekräftat löst eller testat i riktig webbläsare**; undersök innan du påstår något. `Ladda mall` läser in ett utkast; användaren måste också trycka `Spara schemat`.
- Användaren bad att stående face pull ersätts av en hemmaövning med band eftersom balansen inte räcker. Lokalt är gymövningen flyttad till **måndag hemma** som `Sittande banddrag mot ansiktet` med ryggstöd och fast band; den har ingen manuell kg-inmatning. Tidigare sparade scheman ändras inte automatiskt.
- Filerna `mitt-schema-original.json`, `mitt-schema-sittande-band.json` och den läsbara `.md` är exporterade från mallen. Den gamla mallen innehåller fortfarande **KB-marklyft**; detta har uppmärksammats för användaren, men inte ändrats. Nya generatorn K12 ska inte välja marklyft eller leg curl. Gör inte tysta förändringar i sparade scheman.
- Vid träning: inga hopp, lägenhets- och balansanpassning och stöd där det behövs enligt användarens tidigare krav för nya scheman. Prioritera relevanta, säkra alternativ och påstå inte att en övning passar alla.

### Säkerhetskopia och Google Drive

- `gymapp/backup.js` kan exportera/importera lokal JSON samt frivilligt spara och återställa från användarens egen Google Drive. Detta kräver internet, OAuth-konfiguration, rätt origin och användarens godkännande.
- Innehåll: `ga_data` (egna scheman, viktlogg, balans m.m.), `gymapp_balance`, `gym_100reps`. Vanlig kopia inkluderar dataversion. Notisinställningar och Google-token ingår inte.
- Återställning ersätter de berörda nycklarna efter bekräftelse; andra öppna flikar ska stängas först. Appen försöker återställa tidigare värden vid skrivfel men detta är inte en garanti.
- OAuth-behörighet: `https://www.googleapis.com/auth/drive.file`, avsedd att begränsa åtkomsten till appskapade/uttryckligen valda filer. Google Identity Services används vid valfri användarinitierad anslutning. Access-token hålls tillfälligt i minnet, inte i backupfilen.
- Användaren skapade ett Google Cloud-projekt och valde Drive API och `drive.file`. Det publika OAuth-klient-ID:t finns lokalt i `window.GYMAPP_GOOGLE_CLIENT_ID` i `gymapp/index.html`; det är inte en client secret. Originalet finns i källfilen och behöver inte klistras in i chatten igen. Samma Google Cloud-projekt och samma Google-konto behövs för att hitta säkerhetskopian på ny telefon.
- **Ingen verklig uppladdning/återställning på Google Drive har bekräftats testad.** Kontrollera publicerad kod, OAuth-origin, Drive API, testanvändare och faktiskt resultat. Google kan ha verifierings- eller testanvändarkrav.
- En logotyp för Googles medgivandeskärm genererades som `gymapp/gymapp-google-logo-120.png`. Google kan kräva varumärkesverifiering innan logotypen visas. Den är valfri.

### B1 – migrationsbot, byggd lokalt

- `gymapp/migration.js` använder `gymapp_schema_version`, aktuell version **1**. Läggs in före övriga skript på huvudappen och båda fristående sidorna.
- Om en gammal 100-repsräknare är ett giltigt heltal sparas lokala originaldata först under `gymapp_migration_backup_v0` eller en unik variant; sedan konverteras räknaren till `{d,n}` med lokal dag.
- Vid oläsbar data, nyare/okänd version eller lagringsfel pausas skrivning och rådata kan exporteras. Rollback försöks vid versionsskrivningsfel men är inte garanterad vid allvarliga lagringsfel.
- Backupformatet känner till `schemaVersion`; äldre kopior utan fältet behandlas som version 0 och framtida okända versioner nekas.
- Äldre automatisk trimning i save path togs bort för att minska risken att kasta träningshistorik vid migrering. Detta kan påverka lagringsutrymme; prova kvotfel.
- B1 är **byggd och testad med simulerad lagring**, inte bevisat driftsatt eller testad på användarens enhet. Se `gymapp/MIGRATION-INFO.md`.

### Begränsningar i PWA/utveckling

- Service workerns scope är `gymapp/`. De fristående HTML-sidorna ligger en nivå upp. Trots att SW försöker cacha dem ska man **inte lova att navigation till dem fungerar offline** utan att testa scope eller flytta sidor med kompatibla länkar.
- Manifestet har `id: /gymapp/`, `start_url: ./index.html?source=pwa` och `scope: ./`. Den faktiska installationen ligger under dubbla `/gymapp/gymapp/` i projektet. Testa installation och identitet på riktiga enheter innan ändringar.
- Den gamla README:n innehåller motsägelsefulla historiska uppgifter om tre färdiga scheman, musik och lokala konton. Den ska inte användas som enda sanningskälla för appens nuläge. Detta överlämningsdokuments begränsningar och aktuell kod väger tyngre.
- F126–F150 i förslagsbanken innehåller forskningspåståenden som inte har verifierats här. Kontrollera aktuell evidens och källor innan de används som medicinska fakta eller implementeras.

## Aktuell checklista – valda men inte byggda

- **K12:** Program från hemmautrustning. Användaren valde *checklista först*, inte bygg nu. Både bara hemma (3–5 pass/vecka) och hemma + gym. Utrustning: kettlebell, hantlar, ryggsäck med vikt, ab roller, gummiband, pull-up-stång, bänk/pall, stol/diskbänk och kroppsvikt. Offline, stöd vid balans, inga hopp, inget marklyft/leg curl, inga fria hemviktsfält, återanvänd bilder och teknik.
- **K14:** Enklare träningsvy, bättre avbockning, större knappar och översikt över återstående övningar.
- **F167:** Dagsljusläge med bättre kontrast och mindre genomskinlighet.
- **F216:** Mycket smala skärmar, inklusive 320 px.
- **F217:** Liggande mobilvy utan att navigering täcker passet.
- **F219:** Tillgängliga dialoger när mobiltangentbordet är öppet.
- **F220:** Menyer och dialoger inom skärmen vid förstoring/liggande läge.
- **B2:** Städbot – vänta på klarsignal och var försiktig med radering.
- **B3:** Schema-validerare.
- **B4:** Automatisk bildregistrering.
- **B5:** Pre-flight-kontroll före publicering.
- **K13:** Web Push efter cirka 17.00 på träningsdagar. **Avvaktar uttryckligt besked.** En separat server/tjänst krävs för pålitlig bakgrundspush; GitHub Pages ensamt räcker inte. Se `PUSH-PLAN.md`. Användaren sa senare tydligt ”inga notiser än”.

### Övriga kommande funktioner

Kommande-listan i specen innehåller även K1 seträknare, K2 skärmen tänd/låst läge, K3 progressionsgrafer, K4 utrustningsinventering, K6 balansprogression, K7 schemagenerator efter tre månader, K8 deload, K9 utskrift/PDF, K10 tema och K11 vilotimer. Dessa är en meny, inte en order att implementera. K5 är tidigare implementerad.

A1 PB-tracker, A2 smart push, A3 foton, A4 kompisläge och A5 molnsynk avvaktar konton/uttryckligt besked. Särskilt PB-tracker ska vänta tills konton aktiveras.

## Kommandon och användarens arbetsregler

- `kommande`: visa de planerade punkterna som meny, bygg ingenting.
- `checklista` eller `lista`: visa checklistan från specen, bygg ingenting bara för att listan efterfrågas.
- `filer`: visa de tio senast ändrade aktiva arbetsytefilerna, sorterade med klickbara länkar.
- `töm`: analysera referenser, fråga alltid innan tvetydig borttagning, ta bort endast bekräftade filer och validera.
- `förslag`: ge 25 nya idéer som inte finns i specen, och lägg in dem i förslagsbanken. Om användaren uttryckligen ber om annat antal, följ det antalet. 100 nya idéer F176–F275 lades till senast. Kontrollera hela banken inför nästa omgång; nästa lediga F-nummer är F276.
- Efter varje **femte koduppdatering**: ge tio nya optimeringsförslag O-nummer och skriv in i specen. Senast dokumenterade koduppdatering är #17; nästa tröskel enligt den räknaren är #20. O1–O20 finns, O19 implementerad.
- Radera inte kommande-punkter tyst. När en punkt är färdig, flytta/registrera den under `✅ Klart – tidigare kommande` med datum.
- Datum i äldre changelog innehåller inkonsekvenser och framtida datum. Kontrollera aktuellt datum i den nya miljön och använd faktisk verifiering i stället för att gissa tidsordning.

## Kontroller genomförda i denna session

Följande kördes lokalt och passerade, men testerna simulerar webbläsare/Drive och lagring; de bevisar inte full produktion:

```bash
node gymapp/tests/migration.test.cjs
node gymapp/tests/backup.test.cjs
node --check gymapp/migration.js
node --check gymapp/backup.js
node --check gymapp/sw.js
```

Dessutom kontrollerades att de tre HTML-filernas inline-JavaScript parse:ar och att de lokala sidorna/modulerna kunde hämtas via en tillfällig lokal HTTP-server. ZIP-filerna kontrollerades för korrupta arkiv. Ingen riktig Google-anslutning, komplett webbläsar-/mobiltest eller GitHub-push är bekräftad.

## Rekommenderad start i nästa chatt

1. Läs detta dokument och extrahera källkods-ZIP:en. Kontrollera vilka GitHub-verktyg som faktiskt finns i den nya chatten.
2. Kontrollera att den tidigare exponerade token är återkallad, utan att fråga efter eller upprepa tokenvärdet.
3. Fråga användaren om den vill att de **lokala förändringarna ska publiceras först** eller om en vald checklistepunkt ska byggas först. Att användaren öppnar ny chatt är inte i sig ett godkännande att skriva till GitHub.
4. Om publicering uttryckligen godkänns och GitHub är anslutet: jämför remote och lokal kod, bevara befintlig historik/data, lägg de sex B1-filerna på rätt sökvägar i en genomtänkt commit och verifiera Pages efteråt. Hantera remote-ändringar varsamt.
5. Testa lokalt och på riktiga enheter. Bekräfta särskilt schemats synlighet, Google Drive-återställning, migrering, offline och mobil layout. Gissa inte om något är klart.

---

# Bilaga: komplett spec och förslagsbank från arbetsytan

**OBS:** Bilagan är en ordagrann kopia av `gymapp/README.md` vid överlämning. Den innehåller historiska och ibland motsägelsefulla formuleringar. Se nulägesförtydligandena ovan och läs faktisk kod innan ändringar.



# 💪 GymApp

> **Din personliga träningsapp** – schema, vikter, balansrutin & musik.
> Byggd som en PWA (Progressive Web App) med lokal datalagring och valfri Firebase-integration.

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
| 🔐 Konton | Användarnamn + lösenord, lokalt sparade |
| 📋 3 träningsscheman | Mitt Schema (avancerat), Nybörjare, Mellannivå |
| 💾 Viktloggning | Spara kg per övning, visas i framsteg |
| 💽 Säkerhetskopia | Lokal JSON-kopia och valfri manuell Google Drive-kopia. Kräver egen Google-konfiguration för Drive; [installationsguide](GOOGLE-DRIVE-SETUP.md). |
| ⚖️ Balansrutin | 6 övningar med SVG-timer & avbockning |
| 🎵 Musikspelare | 4 genrer, play/pause/next, volymkontroll |
| 📈 Framstegsöversikt | Viktlogg, streak, träningshistorik |
| 🔔 Påminnelser | Lokal timer när sidan körs; inte pålitliga push-notiser när appen är stängd. [Plan för Web Push](PUSH-PLAN.md) |
| 📱 PWA | Installeras på hemskärmen, fungerar offline |
| 🌐 Genvägar | Manifest-shortcuts till schema/balans/framsteg |

### 🚧 Kommande

Se [Kommande funktioner](#-kommande-funktioner) för hela listan.
**Inget byggs utan användarens klarsignal.** Visas aldrig i appens UI.

---

## 📁 Filstruktur

```
gymapp/
│
├── index.html          ← Hela appen (HTML + CSS + JS i en fil)
├── manifest.json       ← PWA-manifest (ikoner, genvägar, display)
├── sw.js               ← Service Worker (cache, offline, notiser)
├── firebase.js         ← Firebase-integration (⏸ INAKTIVERAD)
├── README.md           ← Den här filen
│
└── icons/
    ├── icon-192.png    ← App-ikon (liten)
    └── icon-512.png    ← App-ikon (stor / splash)
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
| K13 | 🔔 **Träningspåminnelse med Web Push** | Påminn runt 17.00 på aktiva träningsdagar även när appen är stängd | Utan GymApp-konto; separat push-tjänst krävs. Förberedelse och villkor: [PUSH-PLAN.md](PUSH-PLAN.md). Inte implementerat. |
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
| B1 | 🔄 **Migrationsbot** | 2026-06-07 | Lokal dataversion 1, migrerar gammal 100-reps-siffra med säkerhetskopia; stoppar skrivning för trasig eller nyare data och erbjuder nedladdning av rådata. Testad med simulerad lagring, inte på riktiga enheter. |
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

### 🎨 Design – vald för checklistan

| Status | ID | Funktion | Vad den gör | Vald |
|---|---|---|---|---|
| ☐ | **F167** | ☀️ **Dagsljusläge** | Valbart läge med högre kontrast och mindre genomskinlighet i passvyn, utan att ändra telefonens tema. Inte byggt. | 2026-06-07 |
| ☐ | **F216** | 📱 **Mycket smala skärmar** | Anpassa och testa navigation och knappar vid 320 px utan horisontell skrollning. | 2026-06-07 |
| ☐ | **F217** | ↔️ **Liggande passläge** | Förbättra passvyn i liggande läge utan att navigeringen döljer innehållet. | 2026-06-07 |
| ☐ | **F219** | ⌨️ **Tangentbordssäkra dialoger** | Håll fält och sparknapp åtkomliga när mobiltangentbordet är öppet. | 2026-06-07 |
| ☐ | **F220** | 🪟 **Menyer inom skärmen** | Förhindra kapade menyer och dialoger vid förstoring och liggande läge. | 2026-06-07 |

### 🔔 Påminnelser – undersökt och förberett

| Status | ID | Funktion | Vad den gör | Vald |
|---|---|---|---|---|
| ☐ | **K13** | Web Push på träningsdagar | Planerad påminnelse omkring 17.00 även när appen är stängd, utan GymApp-inloggning. Kräver separat tjänst och konfiguration. Se [PUSH-PLAN.md](PUSH-PLAN.md). Inte byggd eller aktiverad. **Avvaktar användarens besked.** | 2026-10-31 |

### 🤖 Underhållsbotar – prioriterad ordning

| Status | ID | Bot | Vad den gör | Vald |
|---|---|---|---|---|
| ☐ | **B2** | 🧹 **Städbot** | Rensar tyst en gång i veckan: loggposter >200, balansdagar >400, föråldrade cacheversioner, övergivna `setsOk`-nycklar | 2026-09-05 |
| ☐ | **B3** | 📋 **Schema-validerare** | Kontrollerar egna scheman mot regeluppsättning vid inläsning. Trasigt schema lagas eller hoppas över – tar aldrig ner appen | 2026-09-05 |
| ☐ | **B4** | 🖼️ **Bild-autoregistrering** | Läser bildmappen och bygger `IMG_BANK` + SW-listan automatiskt. Idag krävs manuell inmatning på **tre ställen** – har redan orsakat ett fel (`counter-squat.png` saknades i `sw.js`) | 2026-09-05 |
| ☐ | **B5** | 🚀 **Pre-flight** | Skript som körs före uppladdning: JS-syntax, HTML-balans, saknade bilder, manifest-validitet, döda `data-act`, oanvänd CSS. Automatiserar dagens manuella kontroller | 2026-09-05 |

**Beroenden:** B1 är byggd. B2 och B3 är fristående. B4 och B5 rör byggkedjan och kan göras parallellt.

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
| 14 | 2026-10-31 | **Google Drive-konfiguration** – användarens publika OAuth-klient-ID inlagt och service workerns cacheversion uppdaterad. Faktisk anslutning behöver testas efter uppladdning. |
| 15 | 2026-06-07 | **Balansanpassad face pull** – stående gymövning flyttad till måndag hemma som sittande banddrag med ryggstöd; mallen och separat schemafil uppdaterade. Sparade scheman ändras inte automatiskt. |
| 16 | 2026-06-07 | **O19 Läsbara övningsnamn** – radbryt långa namn i träningsvy, schemaförhandsvisning och viktlogg. Service worker cacheversion uppdaterad. |
| 17 | 2026-06-07 | **B1 Migrationsbot** – dataversion, icke-destruktiv migrering av gammal 100-reps-räknare, skrivskydd vid okänt format samt versionshantering vid backup; tester med simulerad lagring. |

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


### ⚙️ Optimeringsomgång O2 – 2026-06-07
*10 nya förslag efter koduppdatering 15; ej implementerade.*

| # | Område | Idé |
|---|---|---|
| O11 | Start | Ladda backupmodulen först när säkerhetskopieringspanelen öppnas, med offline-fallback. |
| O12 | CPU | Skapa normaliserade nyckelordsindex en gång för bildmatchning i stället för att normalisera samma sökord upprepade gånger. |
| O13 | Bilder | Skapa små bildversioner särskilt för schemaförhandsvisningen så mobil inte avkodar fullstora träningsbilder. |
| O14 | Minne | Byt oanvända flikars inlästa bilder till platshållare efter att användaren lämnat fliken, om enheten har ont om minne. |
| O15 | Offline | Hämta bara bilder som ingår i användarens aktiva schema vid installation, och låt övriga hämtas när de behövs. |
| O16 | Kod | Flytta schemamallen till en separat versionsstyrd JSON-fil så data kan testas utan att ladda hela appen. |
| O17 | CPU | Beräkna veckans datum en gång per dygn och återanvänd i statistikvyerna, med kontroll vid datumbyte. |
| O18 | Batteri | Avsluta animationer när en panel inte längre syns, även om fliken fortfarande är aktiv. |
| O19 | Design | ✅ **Genomförd 2026-06-07** – radbryt långa övningsnamn i träningsvy, förhandsvisning och historik utan att dölja set och reps. |
| O20 | Kod | Samla datumformattering i en gemensam funktion som återanvänder `Intl.DateTimeFormat`-instanser. |


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

### Omgång 7 – 2026-06-07 *(Balans, schemaredigering, säkerhetskopiering och tillgänglighet)*

| # | Idé |
|---|---|
| F151 | **🪑 Stödkort per övning** – Ange om en övning kräver ryggstöd, diskbänk eller stabilt fäste och visa stödet tydligt före start. |
| F152 | **🧭 Balansgranskning av eget schema** – Lista övningar som är markerade som stående eller utan angivet stöd så användaren kan granska dem själv; inget automatiskt säkerhetslöfte. |
| F153 | **🪢 Bandfäste i schemat** – Beskriv vald fästpunkt och vilken höjd som fungerar hemma, utan att registrera vikt eller belastning i kilo. |
| F154 | **🔀 Flytta övning till annan dag** – Flytta en övning mellan dagar i ett eget schema och behåll teknik, bild och anteckningar. |
| F155 | **📋 Kopiera en enskild träningsdag** – Kopiera en dag till ett annat schema utan att ersätta de befintliga dagarna. |
| F156 | **✏️ Redigera en enskild övning** – Ändra namn, set, reps och tekniksteg direkt i schemabyggaren; hemma utan fria kg-fält. |
| F157 | **🧰 Utrustningsfilter för schemat** – Filtrera övningar i det aktuella schemat efter exempelvis band, stol eller hantlar utan att radera dem. |
| F158 | **🗂️ Namngivna schemaversioner** – Spara en manuell namngiven kopia av ett schema, exempelvis sommar eller vinter, och växla mellan kopiorna. |
| F159 | **📊 Jämför två schemaversioner** – Visa skillnader i dagar och övningar mellan två valda scheman innan användaren byter. |
| F160 | **📝 Kopiera övningsinstruktioner** – Kopiera namn och tekniksteg för en övning som ren text, utan personlig träningshistorik. |
| F161 | **🔎 Granska backup utan att återställa** – Visa formatversion, vilka datatyper som finns och eventuella fel innan användaren väljer att importera. |
| F162 | **🎛️ Välj vad som återställs** – Låt användaren återställa endast scheman, endast balans eller hela kopian efter tydlig bekräftelse; ersätt aldrig annat i tysthet. |
| F163 | **📦 Backup utan träningshistorik** – Skapa en separat kopia av bara scheman och inställningar när användaren inte vill exportera viktloggen. |
| F164 | **🧯 Skydd mot identiska scheman** – Visa att samma schema redan finns före import och låt användaren välja avbryt eller spara en extra kopia. |
| F165 | **🕵️ Privat delningskontroll** – Visa exakt vilka uppgifter som kommer med före schemaexport, och låt användaren exkludera egna anteckningar. |
| F166 | **◐ Färgoberoende statusmarkering** – Komplettera färg med olika symboler och text så aktivt, avklarat och vilodag går att skilja åt utan färgseende. |
| F167 | **☀️ Skärmläge för starkt dagsljus** – Öka kontrast och minska genomskinlighet i passvyn, utan att byta operativsystemets tema. |
| F168 | **🔎 Detaljtext för skärmläsare** – Ge övningsbilder alternativa beskrivningar och låt användaren läsa dem separat från teknikstegen. |
| F169 | **🖼️ Stillbildsläge** – Stäng av dekorativa rörelser och effekter via en synlig appinställning, även när systemet inte signalerar minskad rörelse. |
| F170 | **📏 Förhandsgranska stora texter** – Visa ett exempel på ett träningskort med systemets textförstoring innan användaren väljer layoutinställningar. |
| F171 | **⏱️ Tidsbudget för schemaredigering** – Visa en grov uppskattning av hur lång varje dag blir när användaren ändrar set och vilopauser; ange tydligt att den är ungefärlig. |
| F172 | **🧪 Lokala exempel för importtester** – Samla små testfiler för tomma, trasiga och långa scheman så importen kan kontrolleras utan riktiga användardata. |
| F173 | **🛡️ Validera bildsökvägar vid återställning** – Kontrollera att återställda övningsbilder pekar till tillåtna lokala resurser innan schemat visas. |
| F174 | **🧭 Lista oanvända cachefiler** – Visa vilka lokalt cachade övningsbilder som inte används av aktuella scheman, med frivillig rensning och utan att röra persondata. |
| F175 | **📤 Storlekskontroll före backup** – Visa den uppskattade filstorleken och låt användaren bekräfta före uppladdning, särskilt vid mobildata. |


### Omgång 8 – 2026-06-07 *(100 nya förslag: funktion, design, kod och driftsäkerhet)*

**Navigation och tydlighet**

| # | Idé |
|---|---|
| F176 | **🧭 Aktiv flik i sidtiteln** – Visa aktuell flik i webbläsarens titel så flera öppna flikar går att skilja åt. |
| F177 | **↩️ Behåll läsposition** – Återgå till samma position när användaren byter flik och kommer tillbaka. |
| F178 | **🔗 Länk till en övning** – Skapa en lokal djuplänk som öppnar en viss dag och övning i det aktiva schemat. |
| F179 | **📍 Aktuell veckodag vid skrollning** – Visa namnet på den schemadag som just är synlig när användaren skrollar genom veckovyn. |
| F180 | **🚫 Skydd mot felsvep** – Stäng av svepnavigering när användaren drar i ett inmatningsfält, en horisontell lista eller en modal. |
| F181 | **🧭 Tillbaka från detaljsida** – Återgå till den flik och det schema användaren lämnade när detaljsidan öppnades. |
| F182 | **↕️ Stanna på övningen** – Behåll vald övning i bild när dess teknikpanel öppnas eller stängs. |
| F183 | **📍 Fästbart schemahuvud** – Visa vald dag och schemanamn i en liten fast rubrik när man skrollar genom ett långt pass. |
| F184 | **🧩 Tydliga inaktiva knappar** – Visa kort varför en knapp är avstängd, exempelvis att inget schema är valt. |
| F185 | **🔎 Sök funktion i appen** – Sök lokalt efter appfunktioner som schemaimport, balans och säkerhetskopia och öppna rätt vy. |

**Träningspass och övningar**

| # | Idé |
|---|---|
| F186 | **🧱 Fästpunktens riktning** – Visa med en enkel pil var bandets fäste ska vara i förhållande till stolen. |
| F187 | **🪢 Kontrollera bandets skick** – Visa en kort frivillig check för skador på band och fäste före bandövningar, utan notiser. |
| F188 | **🦶 Fotplacering som symbol** – Visa en enkel fotplaceringsikon bredvid tekniktexten där den behövs. |
| F189 | **📌 Håll en teknikpunkt synlig** – Låt användaren välja en teknikpunkt som ligger kvar överst när övningspanelen är öppen. |
| F190 | **🧮 Summa set i dagens pass** – Räkna planerade set för dagens övningar och visa summan utan att bedöma om den är optimal. |
| F191 | **🛠️ Egna utrustningsetiketter** – Låt användaren döpa sina band eller vikter till exempelvis lätt och tung, utan fria kg-fält under hemmapass. |
| F192 | **📐 Sidoanpassad tekniktext** – Visa användarens valda startposition, exempelvis vänster sida först, i teknikpanelen. |
| F193 | **🧘 Rörelsens start och slut** – Markera startposition och slutposition separat i övningsbeskrivningen. |
| F194 | **⏭️ Nästa övning i samma dag** – Visa nästa övnings namn längst ned i en öppen teknikpanel utan automatisk navigering. |
| F195 | **🎚️ Kompakt bildvisning per pass** – Låt användaren välja om träningsbilder visas små eller stora utan att ta bort tekniktexten. |

**Schemabyggare**

| # | Idé |
|---|---|
| F196 | **🗓️ Dagsordning med knappar** – Flytta en övning upp eller ned i en dag med tydliga knappar som också fungerar med tangentbord. |
| F197 | **🧱 Avgränsa inklistrad text** – Visa exakt vilken del av inklistrad text som tolkats som varje dag innan schemat sparas. |
| F198 | **📍 Hoppa till importvarning** – Klicka på en importvarning och gå direkt till den berörda dagen i förhandsvisningen. |
| F199 | **🔢 Förhandsgranskning av repsformat** – Markera när olika set- eller repsformat tolkats osäkert och låt användaren kontrollera dem. |
| F200 | **🧹 Ta bort tom dag i utkast** – Dölj en tom dag i förhandsvisningen endast efter användarens bekräftelse, utan att ändra sparad data. |
| F201 | **🗓️ Skapa vilodag i byggaren** – Lägg till eller ändra en dag till vilodag med en knapp i schemabyggaren. |
| F202 | **🔁 Ändra hem eller gym för en dag** – Välj plats för en sparad schemadag och visa hur det påverkar vilka viktfält som visas. |
| F203 | **📏 Visa importgränser i förväg** – Visa maxstorlek, antal dagar och antal övningar innan användaren väljer en schemafil. |
| F204 | **📝 Återskapa osparat utkast** – Behåll ett påbörjat schemautkast under webbläsarsessionen så det kan återtas efter en oavsiktlig omladdning. |
| F205 | **📝 Schemabeskrivning** – Låt användaren lägga till en kort beskrivning av syftet med varje eget schema. |

**Tillgänglighet**

| # | Idé |
|---|---|
| F206 | **⌨️ Tangentbordsfälla i dialoger** – Håll fokus inom en öppen dialog och återför fokus till knappen som öppnade den. |
| F207 | **🧭 Hoppa över navigation** – Lägg till en synlig-vid-fokus-länk som leder direkt till sidans huvudinnehåll. |
| F208 | **📢 Status utan dubbel uppläsning** – Samordna statusmeddelanden så skärmläsare inte läser samma bekräftelse flera gånger. |
| F209 | **🧩 Struktur för rubriknivåer** – Ge varje sida en logisk rubrikordning så skärmläsare kan navigera mellan sektioner. |
| F210 | **🖼️ Textalternativ för utrustningssymboler** – Gör att exempelvis stol- och hantelikoner har begripliga textalternativ. |
| F211 | **⏳ Valbar visningstid för besked** – Låt användaren välja hur länge tillfälliga statusmeddelanden stannar kvar på skärmen. |
| F212 | **↕️ Respektera webbläsarzoom** – Prova att alla knappar och texter fungerar när sidan förstoras till 200 och 400 procent. |
| F213 | **⌨️ Behåll fokus vid borttagning** – Flytta tangentbordsfokus till en logisk närliggande knapp när ett schemakort tas bort. |
| F214 | **🧪 Kontrollera kontrast för alla knapplägen** – Granska normal, aktiv, fokuserad och avstängd knapp mot bakgrunden med faktiska kontrastmätningar. |
| F215 | **🗣️ Beskriv timers utan konstant prat** – Meddela start, paus och slut för skärmläsare utan att läsa upp varje sekund. |

**Responsiv design**

| # | Idé |
|---|---|
| F216 | **📱 Kontroller för mycket smala skärmar** – Granska och anpassa navigation och knappar vid 320 pixels bredd utan horisontell skrollning. |
| F217 | **↔️ Liggande passläge** – Använd skärmbredden bättre i liggande mobilvy utan att innehåll döljs av navigeringen. |
| F218 | **🪟 Anpassning efter kortets bredd** – Använd containerbaserade brytpunkter där en övningskorts layout beror på kortets faktiska bredd. |
| F219 | **📲 Tangentbordssäker modal** – Se till att inmatningsfält och spara-knapp förblir åtkomliga när mobiltangentbordet visas. |
| F220 | **🔄 Undvik kapade menyer** – Kontrollera att menyer och dialoger håller sig inom skärmen vid kraftig förstoring och liggande läge. |
| F221 | **📐 Anpassa diagram till utrymmet** – Låt diagrametiketter radbrytas eller förenklas på smala skärmar utan att dölja värden. |
| F222 | **📏 Minsta höjd för tomma vyer** – Ge tomma lägen tillräcklig plats så instruktioner och knappar inte trängs på små telefoner. |
| F223 | **📱 Tåligare säkerhetsmarginaler** – Prova att knappar inte hamnar under mobilens kameraurtag, hemindikator eller systemfält. |
| F224 | **📦 Flexibla långa knapptexter** – Tillåt långa knapptexter att radbrytas i stället för att lämna dialogen på små skärmar. |
| F225 | **🧱 Förhindra oläsbara kort** – Ge kortens kolumner en rimlig minbredd och låt dem staplas innan innehållet blir för trångt. |

**Backup och datasäkerhet**

| # | Idé |
|---|---|
| F226 | **🗓️ Datum och enhet i backupnamnet** – Lägg till valfritt enhetsnamn och tid i säkerhetskopians filnamn så kopior är lätta att skilja åt. |
| F227 | **🔐 Lösenordsskyddad backupfil** – Erbjud frivillig kryptering av lokal backup med Web Crypto och förklara att ett förlorat lösenord inte kan återställas. |
| F228 | **📄 Kontrollera kopia efter uppladdning** – Läs tillbaka filmetadata från Drive efter uppladdning och visa om Google bekräftat att filen finns. |
| F229 | **🧾 Tydlig senaste lyckade backup** – Visa lokalt datum för senaste bekräftade export respektive Drive-uppladdning, utan påminnelse eller notis. |
| F230 | **🏷️ Appversion i säkerhetskopian** – Märk nya kopior med vilken appversion som skapade dem, utöver dataversionen, för tydligare felsökning. |
| F231 | **🛑 Bekräfta rätt Google-konto** – Visa en tydlig instruktion om att kontrollera valt konto i Googles fönster före återställning. |
| F232 | **📥 Stoppa oväntat stor Drive-fil** – Avbryt nedladdning när en backup passerar storleksgränsen, även om servern inte anger filstorlek i förväg. |
| F233 | **🗂️ Välj äldre Drive-kopior** – Ladda nästa sida i Drives fillista så även kopior utöver de första 100 kan väljas. |
| F234 | **🧪 Testa återställning på tillfällig data** – Prova en kopia i en isolerad förhandsgranskning utan att röra den aktiva träningsdatan. |
| F235 | **📤 Exportera återställningsrapport** – Visa en lokal rapport om vilka datatyper som återställdes eller nekades, utan att inkludera personliga värden. |

**Offline och GitHub Pages**

| # | Idé |
|---|---|
| F236 | **🌐 Kontrollera rätt Pages-sökväg** – Testa automatiskt att appen fungerar i en undermapp, inte bara när den ligger på domänens rot. |
| F237 | **📖 Fristående sidor inom appens scope** – Utred att placera detaljsidorna inom service workerns scope så de kan omfattas av offlinehanteringen. |
| F238 | **🚦 Synlig cachestatus vid installation** – Visa när appens grundfiler faktiskt har sparats för offlinebruk i stället för att anta att cache är färdig. |
| F239 | **🪟 Hjälp när uppdatering fastnar** – Visa en förklaring om en uppdatering väntar på andra öppna appflikar och vägled användaren att stänga dem. |
| F240 | **🖼️ Hämta saknade bilder igen** – Erbjud en manuell knapp för att försöka cachelagra saknade övningsbilder när uppkopplingen kommit tillbaka. |
| F241 | **📁 Testa packad release** – Kontrollera att uppdaterings-ZIP:en har rätt mappar och att varje obligatorisk fil finns med. |
| F242 | **🧭 Omdirigeringskontroll** – Kontrollera att startsidan, installerad app och genvägar leder till rätt sökväg efter publicering. |
| F243 | **🔄 Skydd mot blandade filversioner** – Kontrollera att huvudfil och hjälpmoduler har kompatibla versionsnummer före start. |
| F244 | **🛰️ Nätverksberoenden i en vy** – Lista vilka funktioner som kräver internet, exempelvis Google Drive, och vilka som fungerar lokalt. |
| F245 | **🧪 Testa uppdatering från gammal cache** – Automatisera ett test där en äldre installerad version uppgraderas utan att lokala data påverkas. |

**Kod och underhåll**

| # | Idé |
|---|---|
| F246 | **🗂️ Dela upp stilmallar per vy** – Samla gemensamma designvariabler och separera sedan hem-, pass- och dialogstilar i tydliga moduler. |
| F247 | **📘 Dokumentera datastrukturer** – Beskriv scheman, övningar och loggposter med exempel så framtida ändringar kan granskas. |
| F248 | **🔍 Samma funktion för textsanering** – Använd en gemensam säker text- och attributhantering i huvudappen och detaljsidorna. |
| F249 | **🧪 Testbara beräkningsfunktioner** – Flytta rena beräkningar för datum och statistik till små funktioner som kan testas utan webbläsargränssnitt. |
| F250 | **🏷️ Namngivna feltyper** – Skilj på lagringsfel, ogiltiga filer och nätverksfel med tydliga interna felkoder. |
| F251 | **📦 Lås testberoenden** – Versionslås eventuella testverktyg så samma tester kan upprepas på en annan dator. |
| F252 | **🧭 En plats för sökvägar** – Samla länkar och resursvägar i ett gemensamt register så sidflyttar kräver färre manuella ändringar. |
| F253 | **📐 Designvariabler för mellanrum** – Använd ett litet konsekvent system för marginaler och avstånd över alla sidor. |
| F254 | **🗑️ Identifiera övergiven kod** – Lägg till en granskningsrapport som flaggar funktioner och CSS-klasser utan kända anrop innan något tas bort. |
| F255 | **📋 Releaseanteckningar per paket** – Lägg en kort fil i varje uppdateringspaket som beskriver vilka filer som ska placeras var. |

**Prestanda och minne**

| # | Idé |
|---|---|
| F256 | **🖼️ Avkoda bilder först vid öppning** – Vänta med att ladda bilder i stängda övningspaneler tills användaren öppnar dem. |
| F257 | **⏸️ Vila pausade vyer** – Stoppa uppdateringar som inte behövs när en dold flik eller panel inte syns. |
| F258 | **⚖️ Begränsa parallell bildhämtning** – Låt appen hämta ett fåtal träningsbilder åt gången för jämnare uppstart på långsamma mobiler. |
| F259 | **🗜️ Optimera PNG utan formatbyte** – Testa förlustfri optimering av befintliga PNG-filer och behåll samma filnamn och kvalitet. |
| F260 | **📊 Mät starttid lokalt** – Visa frivillig starttidsmätning i felsökningsläge utan att skicka data till någon server. |
| F261 | **🧹 Rensa frånkopplade DOM-referenser** – Kontrollera att referenser till borttagna övningskort släpps efter schemabyte. |
| F262 | **🎯 Avbryt föråldrad renderingsuppgift** – Stoppa en väntande bakgrundsritning om användaren redan har valt ett annat schema. |
| F263 | **📉 Färre upprepade layoutmätningar** – Gruppera avläsningar och skrivningar till sidans layout för att minska onödiga omräkningar. |
| F264 | **🧮 Återanvänd statistikresultat** – Beräkna statistik på nytt endast när dess underliggande data har ändrats. |
| F265 | **🧊 Undvik dubbla JSON-kopior** – Gå igenom backupflödet för att undvika onödiga kopior av stora JSON-strängar i minnet. |

**Säkerhet och tester**

| # | Idé |
|---|---|
| F266 | **🛡️ Granska farlig HTML vid schemaimport** – Testa att importerade namn och tekniksteg visas som text och inte kan köras som kod. |
| F267 | **🔗 Begränsa externa länkar i innehåll** – Kontrollera att importerad data inte skapar oväntade externa länkar eller bildanrop. |
| F268 | **🔐 Utvärdera innehållssäkerhetspolicy** – Ta fram en CSP som begränsar skript och nätverksanrop utan att bryta Google Drive-flödet. |
| F269 | **🧪 Testa stopp vid full lagring** – Simulera full localStorage och kontrollera att användaren får besked utan att äldre data raderas. |
| F270 | **🧪 Testa avbruten Google-auktorisering** – Kontrollera att stängt eller blockerat Google-fönster inte lämnar appen i ett låst läge. |
| F271 | **🧪 Testa byte av telefon** – Dokumentera ett test där en säkerhetskopia skapas i en webbläsare och återställs i en annan profil. |
| F272 | **📱 Manuella webbläsarscenarier** – Skapa en kort testlista för iPhone, Android och dator med faktiska resultat och datum. |
| F273 | **🔄 Testa backa vid skrivfel** – Simulera fel mitt i en återställning och kontrollera vilka data som går att återföra. |
| F274 | **🔍 Granska beroenden före publicering** – Sök i releasepaketet efter hemligheter, testadresser och filer som inte ska publiceras. |
| F275 | **🧭 Testa navigering utan mus** – Kör ett sammanhängande test av appens viktigaste flöden med bara tangentbord. |


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
- `env(safe-area-inset-bottom)` på musikbar och bottom-nav
- Alla grids → `grid-template-columns: 1fr` på mobil
- Inga hover-only interaktioner – allt klickbart

### 🔐 Kontoregler (nuläge)

- Konton sparas i `localStorage` under nyckel `ga_a`
- Lösenord hashas med 31-multiplikator hash (enkel men OK för localStorage)
- Session sparas i `ga_s`
- Användardata per uid: `ga_d_{uid}`
- Vid Firebase-aktivering: byt ut `DB`-objektet mot `FBDB` från `firebase.js`

### 📁 Bildregler

- Alla bilder i `gymapp/images/`
- Format: `.png`
- Namnkonvention: `kebab-case.png`
- Aspect ratio i HTML: `16:9` (via `aspect-ratio: 16/9`)
- `loading="lazy"` på alla bilder
- `alt`-text = övningens namn

### 🔊 Musikregler

- Fyra genrer: `gym`, `hiit`, `focus`, `heavy`
- Varje genre: 2 radioströmmar (Zeno.fm)
- Automatisk next-track vid slut (`ended`-event)
- Volym och position i musikbaren

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
