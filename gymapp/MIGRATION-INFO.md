# B1: dataversion och migrering

Den gemensamma `migration.js` körs vid sidstart på huvudappen och de två fristående sidorna. Den använder `gymapp_schema_version` och aktuell dataversion 1, lokalt i webbläsaren.

## Migrering
- Saknad version betyder version 0. Om `gym_100reps` är ett gammalt heltal 0–100 sparas först en lokal kopia av de tre datanycklarnas originalsträngar i `gymapp_migration_backup_v0` (eller en unik nyckel om en tidigare kopia redan finns), sedan konverteras räknaren till `{d,n}` med dagens lokala datum och version 1 skrivs. Version 0 utan gammal siffra markeras som version 1 utan att datanycklarna skrivs om.
- Scheman, viktlogg och balanshistorik ändras inte av migreringen. Kopian skapas bara om en faktisk konvertering av den gamla räknaren behövs, inte som löpande backup.
- Före konvertering granskas några grundläggande typer. Vid trasig lagring, otillgänglig lagring, okänd version eller en nyare dataversion pausas skrivning och användaren får en varning och möjlighet att ladda ner rådata. Den filen är en felsökningskopia, inte samma sak som den vanliga importerbara GymApp-backupen.
- Om versionsskrivning misslyckas efter att räknaren konverterats försöker appen återställa originalräknaren; den lokala kopian behålls. Vid allvarliga lagringsfel kan rollback inte garanteras. Stäng övriga appflikar vid uppdatering och återställning.
- Vanliga säkerhetskopior innehåller nu `schemaVersion`. Äldre kopior utan detta fält behandlas som version 0 vid återställning; nyare okända versioner nekas. Ingen appinloggning behövs.

Skrivning skyddas även om migrationsmodulen saknas. Uppdatera alla berörda filer samtidigt och testa sedan på riktiga enheter. Alla lagrings- och layoutproblem kan inte uteslutas; den simulerade testsviten ersätter inte faktisk återställningstest. Ta gärna en separat lokal säkerhetskopia innan uppdateringen.
