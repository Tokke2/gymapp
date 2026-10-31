# Google Drive-säkerhetskopia – installation

## Status
Klienten för lokal fil och Google Drive är byggd, men Google Drive fungerar inte förrän ett eget OAuth-klient-ID har konfigurerats. Ingen Firebase, inget GymApp-konto och inga notiser aktiveras. Det här är **manuell** säkerhetskopiering, inte automatisk molnsynk.

## Konfigurera Google Cloud
1. Publicera GymApp på GitHub Pages med HTTPS. Notera sidans **origin**, exempelvis `https://anvandarnamn.github.io` (utan sökväg eller snedstreck). Exempelvärdet ska inte användas som verklig adress.
2. Skapa eller välj ett Google Cloud-projekt i [Google Cloud Console](https://console.cloud.google.com/). Aktivera **Google Drive API**.
3. Konfigurera Googles OAuth-medgivandeskärm: appnamn, kontaktuppgifter och målgrupp. Om appen ligger i testläge: lägg till de Google-konton som ska testa. Googles regler för publicering, verifiering och testanvändare kan ändras; kontrollera konsolens aktuella krav före distribution.
4. Skapa en OAuth-klient av typen **Web application**. Lägg till din exakta GitHub Pages-origin under *Authorized JavaScript origins*. Observera att Google-kontots inloggningsfönster och tredjepartsskript kan blockeras av webbläsarinställningar.
5. Kopiera det **publika klient-ID:t**, som slutar på `.apps.googleusercontent.com`. Lägg in det publika klient-ID:t i `window.GYMAPP_GOOGLE_CLIENT_ID` i `index.html` och publicera appen på nytt, så behöver användarna inte ange ID:t. För test på en enhet kan du i stället använda Säkerhetskopia → Google Drive → Inställningar för appens ägare → Spara klient-ID på enheten; detta följer inte med till en ny telefon. Lägg aldrig in någon client secret eller något access-/refresh-token i appens filer.
6. Testa med kontot: öppna **Säkerhetskopiera till Google Drive**, vänta tills knappen är klar och välj **Anslut Google Drive**, tillåt den begärda behörigheten och välj **Spara i Drive**. Token finns endast tillfälligt i sidans minne. När sidan laddas om måste Google anslutas igen.
7. Testa på en andra enhet eller i en separat webbläsarprofil med samma publicerade app/OAuth-projekt och samma Google-konto: **Anslut → Visa mina kopior → välj kopia → Återställ**. Läs bekräftelsen innan befintlig lokal data ersätts. Använd samma OAuth-projekt även vid senare publicering: åtkomsten till appskapade filer är knuten till appen/projektet.

Google-anslutningen använder scope `https://www.googleapis.com/auth/drive.file`: appen får tillgång till filer den skapar eller som användaren öppnar med appen, inte hela Drive. Google-kopiorna skapas som synliga JSON-filer i användarens Drive. Upp till 100 senaste kopior visas; äldre finns kvar i Drive. Ingen automatisk radering utförs. Användaren kan när som helst koppla från eller återkalla appens Google-behörighet.

## Säkerhetskopians innehåll
Kopian innehåller `ga_data` (bland annat egna scheman, viktlogg och balansavbockningar), `gymapp_balance` (balanssidans historik) och `gym_100reps`. Den inkluderar inte Google-token, Google-klient-ID eller notisinställningar. Innehållet ligger i JSON utan extra lösenordskryptering: skydda ditt Google-konto och dina lokala filer.

Återställning **ersätter** dessa data på enheten efter bekräftelse och laddar om appen. Stäng andra öppna GymApp-flikar först så att de inte skriver tillbaka äldre data. Fel vid lagringsskrivning leder till försök att återställa tidigare lokala värden, men vid allvarliga lagringsfel är det inte garanterat. Spara gärna en separat lokal kopia först.

## Begränsningar och felsökning
- En Drive-kopia kan inte laddas upp eller hämtas offline. Lokalt nedladdad kopia kan importeras utan Google-anslutning.
- Drive-åtkomst kräver giltig Google-konfiguration, internet och användarens godkännande. Popupblockering, ändrade Google-regler, full Drive eller nekad behörighet kan hindra det. Anslut på nytt om tillstånd/token löper ut. När Google laddas för första gången kan knappen vara tillfälligt inaktiv; tryck på Försök igen om laddningen misslyckas.
- Google-anslutningen är frivillig och förblir frånkopplad efter sidomladdning. Inga träningsdata laddas upp förrän användaren trycker **Spara i Drive**.
- Bekräfta på riktiga enheter att popup, uppladdning och återställning fungerar, särskilt på iPhone-hemskärmsapp. Kodkontroller är inte ett ersättningsbevis för riktig Google-integration.

## Referenser
- [Google Identity Services: tokenmodell](https://developers.google.com/identity/oauth2/web/guides/use-token-model)
- [Google Drive API: begränsade behörigheter](https://developers.google.com/workspace/drive/api/guides/api-specific-auth)
- [Google Drive API: uppladdning](https://developers.google.com/workspace/drive/api/guides/manage-uploads)
