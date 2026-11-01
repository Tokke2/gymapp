# Gymlig

Personlig träningsapp som PWA – veckoschema, viktlogg med auto-progression,
hemmaredskap, balansrutin och framsteg. Allt sparas lokalt på enheten, inget konto krävs och
appen fungerar offline.

**Live:** <https://tokke2.github.io/gymapp/>

---

## Funktioner

| Funktion | Beskrivning |
|---|---|
| 📋 Egna scheman | Skapa, redigera och radera egna veckoscheman – via text, mall eller JSON |
| 🏋️ Dagens pass | Schemafliken visar bara **dagens** träning – inte morgondagens |
| 🏠 Redskap hemma | Markera kettlebell, hantlar, stol, matta och ab roller – hemmapassen anpassas |
| 💾 Viktlogg | Spara kg per övning och se historiken under Framsteg |
| ⬆️ Auto-progression | Efter 2 pass i rad på samma vikt föreslås +2,5 kg (bara förslag) |
| ⚖️ Balansrutin | 6 balansövningar med timer och avbockning |
| 📈 Framsteg | Streak, antal pass, viktlogg och veckoöversikt |
| 💽 Säkerhetskopia | Lokal JSON-fil och valfri manuell Google Drive-kopia |
| 📈 Viktförslag | Föreslår +2,5 kg när alla set klarats två pass i rad – syns som märke i raden, ändrar aldrig vikten själv |
| 🧭 Passframsteg | Rad överst i dagens pass: antal klara övningar, procent och uppskattad tid kvar |
| 🗂️ Mer-kortet | Installation, påminnelser, säkerhetskopia och tryckmaterial samlade på Hem – hopfällda |
| 🖨 Tryckmaterial | Visitkort och A5-flyer i SVG – skrivs ut från `visitkort.html` eller laddas ner |
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

## Redskap hemma

Under **Schema** finns kortet **🏠 Redskap hemma**. Markera vad du har:

| Redskap | Används av |
|---|---|
| Kettlebell 16 kg | KB-övningar (`kb`) |
| Hantlar 5 kg ×2 | hantelövningar (`ha`) |
| Stol med ryggstöd | sittande övningar (`st`) |
| Liggunderlag / matta | golvövningar (`li`) |
| Ab roller | maghjul (`ro`) |
| Motståndsband | reserverat för egna övningar (`ba`) |

- Övningar som kräver något du **inte** markerat märks *Saknar …*, och varje rad
  får ett **konkret ersättningsförslag** – t.ex. rodd med vattenflaska i stället
  för KB-rodd, plankan i stället för ab roller. Förslaget förklarar varför och
  anger set/reps, så passet kan köras direkt utan redskap.
- **Visa bara mina** döljer de övningarna helt i hemmapassen (gympassen påverkas inte).
- **Eget val per pass:** varje hemmapass har en rad *🏠 Redskap* i dagsvyn. Ändrar du
  där gäller det bara den dagen – bra när gympasset har allt men hemmapasset bara
  hantlar. `↺ Mina` tar tillbaka kortets lista.
- Valet sparas lokalt (`homeGear`, `gearFilter`, samt `gear` per dag i egna scheman).
  Är inget sparat gäller **alla** redskap, så appen beter sig som förut för äldre data.

## Egna scheman

Under **Schema** finns knappen **➕ Eget schema** (och korten på hemskärmen):

- **Klistra in text** – appen tolkar dagar, set, reps och matchar bilder automatiskt
- **Ladda mall** – utgå från standardpasset och ändra det du vill
- **JSON** – importera eller exportera ett schema
- **Redigera** – pennan på ett eget schema öppnar samma byggare och sparar över det
- **Radera** – papperskorgen tar bort schemat

Upp till 10 egna scheman. Det valda schemat styr vilket pass som visas i dagsvyn.

## Bilder & bildbot

Varje övningsrad visar en bild bredvid namnet, och den stora bilden finns i
övningspanelen. Bilden matchas automatiskt på övningsnamnet om schemat saknar
en sparad bild – annars visas en emoji i stället, så inget blir tomt.

**Bildboten** kontrollerar hela kedjan – och att bilden hör till rätt övning:

```bash
npm run bildbot        # kontroll: referenser, sw.js, IMG_BANK, standardpasset
npm run bildbot:fix    # rättar fel bild + lägger nya bilder i offline-cachen
```

Den felar om en bild saknas, om en övning i standardpasset inte har bild,
om `sw.js`/`IMG_BANK` pekar på filer som inte finns, eller om en övning
använder en bild som hör till en annan övning (t.ex. latsdrag på en
KB bent-over row). `--fix` byter då till bilden som namnet matchar.

Övningsnamnet väger tyngst vid matchningen – muskeltexten kan aldrig sno
bilden från själva namnet. Scheman som redan sparats med fel bild rättas
automatiskt vid start (en gång per data).

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
├── visitkort.html          ← tryckmaterial: visitkort + A5-flyer, skriv ut eller ladda ner
├── tryck/                  ← SVG-filer för tryck (visitkort fram/bak, flyer, QR)
├── tools/bygg-tryck.py     ← genererar allt i tryck/ (kör om efter textändringar)
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
