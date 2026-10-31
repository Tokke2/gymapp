# 💪 GymApp

Personlig träningsapp som PWA – veckoschema, viktlogg med auto-progression,
balansrutin och framsteg. Allt sparas lokalt på enheten, inget konto krävs och
appen fungerar offline.

**Live:** <https://tokke2.github.io/gymapp/>

---

## Funktioner

| Funktion | Beskrivning |
|---|---|
| 📋 Schema | Eget veckoschema med övningar, set, reps, bilder, steg och andning |
| 🏋️ Dagens pass | Schemafliken visar bara **dagens** träning – inte morgondagens |
| 💾 Viktlogg | Spara kg per övning och se historiken under Framsteg |
| ⬆️ Auto-progression | Efter 2 pass i rad på samma vikt föreslås +2,5 kg (bara förslag) |
| ⚖️ Balansrutin | 6 balansövningar med timer och avbockning |
| 📈 Framsteg | Streak, antal pass, viktlogg och veckoöversikt |
| 💽 Säkerhetskopia | Lokal JSON-fil och valfri manuell Google Drive-kopia |
| 📱 PWA | Installeras på hemskärmen och fungerar offline |
| 🔔 Påminnelser | Lokal timer medan sidan körs (se [PUSH-PLAN.md](PUSH-PLAN.md)) |

Appen har **inga konton och ingen server**. `firebase.js` finns förberett men är avstängt.

## Standardpass

Första gången appen startas läggs **🔥 Mitt Schema** in automatiskt under
Schema-fliken:

- **Måndag** – hemma (squat, KB deadlift, armhävningar, shoulder press, glute bridge)
- **Tisdag** – gym (bänkpress, cable flyes, axelpress, lateral raises, triceps, facepull)
- **Onsdag** – hemma (sumo squat, KB-press, lateral raise, ab roller, bicycle crunches)
- **Torsdag** – gym (knäböj, benpress, latsdrag, rodd, bicepscurl, kabeldrag)
- **Fredag** – vila
- **Lördag** – hemma (KB-rodd, bicepscurl, dips, KB chest press, ab roller)
- **Söndag** – vila

Schemat är ett vanligt eget schema – det kan redigeras eller raderas. Efter det
läggs det inte tillbaka automatiskt.

## Filstruktur

```
gymapp/                     ← repots rot (GitHub Pages)
├── index.html              ← startsida, skickar vidare till appen
├── gymapp/                 ← själva appen
│   ├── index.html          ← appen (HTML + CSS + JS i en fil)
│   ├── manifest.json       ← PWA-manifest
│   ├── sw.js               ← service worker (cache, offline, notiser)
│   ├── backup.js           ← säkerhetskopia
│   ├── firebase.js         ← Firebase-integration (inaktiverad)
│   ├── google-drive-setup.html
│   ├── icons/              ← appikoner (192/512 px)
│   └── images/             ← övningsbilder
├── balansrutin.html        ← balansrutin, fristående sida
├── träningsschema.html     ← detaljerat schema med 100-reps-räknare
├── tests/                  ← node-test för backup.js
├── docs/PROJEKT.md         ← arbetsmanual, checklista och ändringslogg
├── GOOGLE-DRIVE-SETUP.md
└── PUSH-PLAN.md
```

## Kom igång lokalt

```bash
# från repots rot – öppna sedan http://localhost:8000/gymapp/index.html
python3 -m http.server 8000
```

Service worker och PWA-installation kräver `https://` eller `localhost`.

## Publicera

Repot publiceras med GitHub Pages från `main` (rotmappen). Puscha till `main`
och sidan uppdateras automatiskt:

<https://github.com/Tokke2/gymapp/settings/pages>

Höj `VERSION` i `gymapp/sw.js` när filer ändras, så att installerade klienter
hämtar den nya versionen.

## Säkerhetskopia & Google Drive

- **Ladda ner kopia** och **Återställ från fil** fungerar utan konfiguration.
- Google Drive kräver ett eget OAuth-klient-ID – se
  [GOOGLE-DRIVE-SETUP.md](GOOGLE-DRIVE-SETUP.md).

## Test

```bash
node tests/backup.test.cjs
```

## Integritet

All träningsdata ligger i `localStorage` på enheten. Inget skickas till någon
server. Google Drive används bara om du själv ansluter det, och då lagras
kopian i ditt eget Drive.

## Underhåll

Arbetsmanual med kommandon (`kommande`, `förslag`, `checklista`), checklista,
ändringslogg och förslagsbank finns i [docs/PROJEKT.md](docs/PROJEKT.md).

---

© 2026 **Rickard Längkvist**. Alla rättigheter förbehållna.
