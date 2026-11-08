# Förberedelse: träningspåminnelse via Web Push

**Status: undersökt och planerat, inte byggt eller aktiverat.** 2026-10-31

## Mål
En valfri påminnelse omkring kl. 17.00 lokal tid på dagarna i användarens aktiva träningsschema, även när appen är stängd. Ingen användarinloggning eller Firebase-aktivering. Ingen påminnelse när ett aktivt schema saknas eller dagen saknar pass. Om tiden ska kunna ändras avgörs vid implementation.

## Vad som finns idag
- `index.html` har en tidsinställning för träning som förvalt är 17:00. Den använder `setTimeout` medan sidan körs; det är **inte** schemalagd Web Push. Den tar inte hänsyn till schemats träningsdagar. Funktionen startas vid aktivering eller när tider sparas, inte automatiskt när appen öppnas igen.
- `sw.js` kan redan ta emot ett push-event och visa en notis, men en push-prenumeration och en tjänst som skickar meddelanden saknas. Det är inte en färdig pushlösning. Den befintliga klickhanteringen måste testas med GitHub Pages-undermapp och både öppen och stängd app.

## Föreslagen lösning
1. GymApp ligger kvar på GitHub Pages. Med en uttrycklig knapp begär appen notistillstånd och registrerar en Web Push-prenumeration via service workern. Tillstånd innebär inte i sig att prenumerationen eller tjänsten fungerar.
2. En separat tjänst, exempelvis Cloudflare Worker med Cron Trigger och D1-databas, tar emot och lagrar endast prenumeration, veckodagar för aktivt schema, tid och IANA-tidszon. Användaren behöver inget GymApp-konto; den som driver tjänsten behöver konfigurera ett Cloudflare-konto. Plattform, kostnad och begränsningar kontrolleras innan driftsättning.
3. En schemalagd körning kontrollerar lokal veckodag och tid och skickar Web Push med serverns VAPID-nyckel. Cron körs i UTC: lokal tid och sommar-/vintertid måste räknas med tidszonsdatabas, aldrig en fast UTC-offset. Använd idempotensnyckel per prenumeration och lokalt datum för att minska dubbleringar. Fördröjningar och missad leverans kan fortfarande förekomma.
4. När schemat ändras eller en annan enhet används synkas relevanta dagar för just den enhetens prenumeration. Utan internet kan inte ändringarna nå tjänsten direkt: visa väntande synk och försök igen när appen öppnas/anslutningen återkommer. Huvudschemat och träningshistoriken fortsätter lagras lokalt. Inte samma sak som molnsynk eller inloggning.
5. Stäng av via appen: avregistrera prenumerationen och be servern radera posten. Hantera fel vid borttagning med tydlig status och nytt försök. Ta även bort ogiltiga prenumerationer efter push-tjänstens 404/410-svar.

## Integritet och säkerhet
- Informera tydligt före aktivering: en extern tjänst får enhetens push-endpoint, tillhörande nycklar, träningsdagar, tid och tidszon. Inga övningar, vikter eller kompletta träningsloggar behövs.
- Skydda endpoint och administrationsuppgifter: hemlig VAPID-nyckel endast på servern; slumpmässig enhetstoken för ändring/radering, TLS, validering, begränsade anrop och inga känsliga uppgifter i loggar. Granska URL:er för push-endpoints mot SSRF och tillåt bara betrodda push-tjänster. CORS är inte autentisering.
- Designa för leverans högst en gång så långt det går; försök igen vid tillfälliga fel, men extern Web Push ger ingen absolut garanti mot missad eller dubblerad notis. Tydlig retention och borttagning krävs.
- Att slippa notis efter ett redan genomfört pass är inte utlovat: servern känner inte till lokal passhistorik. Kräver separat, frivilligt överförd slutfördstatus och kan vara inaktuell offline.

## Test före aktivering
- HTTPS på korrekt GitHub Pages-sökväg; aktiv service worker; test av tillstånd, prenumeration och verklig leverans när appen är stängd.
- iPhone/iPad med iOS/iPadOS 16.4+: installerad hemskärmsapp, notistillstånd begärt vid knapptryckning. Testa även stödda Android-webbläsare.
- Träningsdag/vilodag/inget schema, schemaändring, offline-synk, avregistrering, ogiltig prenumeration och serverfel.
- Testa 17:00 i Europe/Stockholm under sommar- och vintertid samt tidszonsbyte; säkerställ högst en avsedd notis per lokal dag.
- Kontrollera att ett tryck på notisen öppnar rätt app och träningsflik både när appen är öppen och stängd. Operativsystemets inställningar, fokusläge och uppkoppling kan påverka leveransen.

## Källor
- [MDN: Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [WebKit: Web Push on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- [Cloudflare: Cron Triggers (UTC)](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
