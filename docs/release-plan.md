# EZPZ Fitness release preparation

Single canonical app: `fitness.html`. The root `index.html` and original Trainer manifest/worker remain untouched. Preserve the current E/Z/P/Z assets and all recipe/program definitions.

## Completed in source, 22 October 2026

- Correct compact training header gutters at 320 px and keep closed Options descendants out of layout.
- Fitness-specific manifest, branded PNG icons, home-screen install instructions and an isolated public-asset worker. Network-first app HTML; bounded static-asset cache; core app precache; no account/API responses; no forced update during a workout.
- More → Your data & privacy: honest device storage description, export reminder/date (download requested, not a claim that a file was saved), clear export action and typed-confirmation deletion restricted to the Fitness storage key. No account upload.
- More → Use EZPZ as an app: installation flow/instructions and honest account-backup preparation status.
- SQL and owner setup instructions for optional identity/cloud backup. Not deployed or connected.

## Order of remaining work

1. Verify this release's regression and browser checks, deploy and test actual Android installation/offline/resume.
2. Owner creates Supabase project. Apply and test per-user database isolation in that project.
3. Owner configures Google provider privately; implement and verify optional sign-in and explicit backup/restore with two accounts and existing device records.
4. Add account deletion, tested account switching and conflict handling; then automatic queued sync.
5. Prepare signed Android test build using the existing app, test with a small group; fix observed problems before store submission.
6. Connect Health Connect for agreed basic metrics, with permissions and source rules. Do not add new scores or promise unavailable wearable data.

Storage note: browser records cannot be assumed to appear inside a future Android WebView. Use an explicit validated file/cloud migration. Keep the web storage key until migration is verified. Offline image caching is bounded; unseen photos and externally hosted exercise details may be unavailable offline.
