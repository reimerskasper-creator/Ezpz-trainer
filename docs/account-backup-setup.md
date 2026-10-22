# Optional account backup — implementation handoff

Status: **private Google login test implemented; cloud writes remain disabled**. The owner applied migration 001 successfully and configured Google basic identity, test user, callback and canonical Fitness return URLs. The app remains usable without signing in. Sign-in alone never uploads or replaces fitness records. Live settings confirm Google enabled; anonymous backup reads return HTTP 401. These checks do not prove authenticated account isolation.

## Owner step 1

Create an account at https://supabase.com/dashboard and a project called **EZPZ Fitness**. Use your own account, retain the database password privately, and choose a region appropriate for the first testers. Stop when the project dashboard opens. No database password, service-role key or Google client secret belongs in chat or the repository.

The assistant then needs the project's URL and public **publishable key** from the Connect/API panel. These identify the client project; they are not privileged secrets. Never substitute the database password or secret/service-role key. Confirm current dashboard labels with the owner before guiding subsequent settings.

## Prepared database

`backend/001_optional_backup.sql` defines an account-owned snapshot with row-level read isolation and checked server-side writes. Anonymous clients cannot access it. The server derives the user from the validated session; a client never chooses a user ID. Revision zero creates a first backup only; later writes require the exact previously read revision. A stale device cannot silently overwrite a newer snapshot. Account deletion cascades its snapshot. The payload limit matches the existing 2 MB restore limit.

Before enabling the UI, run the migration in the owner's project and test with two real test accounts: anonymous denial, cross-account SELECT denial, first-save collision, stale-revision rejection, payload limits, session expiry and account deletion. The SQL is not a substitute for these live authorization tests.

## Google setup, after the project exists

Use the official guide: https://supabase.com/docs/guides/auth/social-login/auth-google

1. Create/choose the owner's Google Cloud project. Configure the OAuth audience, branding and requested basic identity scopes.
2. Create a Web application OAuth client. Its authorized redirect URI is the exact callback URL displayed by Supabase (`https://<project-ref>.supabase.co/auth/v1/callback`).
3. Enter the Google client ID and client secret directly in Supabase's Google provider settings. Keep the secret there only.
4. Supabase Site URL and allowed return URL must use the canonical Fitness page: `https://reimerskasper-creator.github.io/Ezpz-trainer/fitness.html`, not the repository's redirecting index or the separate Trainer app. Use exact production URLs; development URLs only during testing.
5. Use PKCE through the maintained Supabase client library. Native Android will require its own approved deep-link return configuration, tested separately.

Official isolation reference: https://supabase.com/docs/guides/database/postgres/row-level-security

## Client work after credentials and authorization tests

- Sign-in is optional, offered in More → Save my progress. No forced login on launch.
- Sign-in alone must never upload, merge or replace records. Show the signed-in account and obtain explicit confirmation to attach this device's existing data.
- If both cloud and local records exist, compare and offer explicit restore/replace choices after downloading a safety copy. Do not union arrays or silently prefer newest timestamps.
- Store account identity with the local dataset. Another account must never inherit, upload or see the previous account's local records. Signing out must offer a clearly explained device-data choice; do not silently reuse guest data for the next account.
- Start with explicit cloud Save/Restore and clear status. Automatic offline synchronization follows only after revision conflicts, multi-tab writes, retries, remote deletion and sign-out boundaries are tested.
- Validate downloaded snapshots with `restoredState` before transactional replacement. Roll back when browser storage fails. Never cache authenticated API requests in the service worker.
- Export is available regardless of account status. Account deletion needs a secure server-side authenticated operation and removal of cloud data, with clear confirmation; the service-role key stays server-side.
- Retain sleep/steps/energy provider provenance. Google identity is not a wearable authorization.

## Release gates still outstanding

Actual two-account authorization and Google callback test; phone loss/restore; airplane-mode reopen; installed Android timer/resume; TalkBack/large-text checks; final privacy/support page with the owner's contact; Android signing and private tester distribution; Health Connect permission/revocation and metric mapping. No Play Store release until these pass.

## Owner project received — 22 October 2026

Owner created project `uwfetvlddswsmqcitgzy` and supplied its public app URL/publishable key. Public values are prepared in `fitness-app/account-config.json` with `enabled: false`. It is not loaded by the live app yet. No personal records have been uploaded. Next owner action: open Supabase SQL Editor to apply `backend/001_optional_backup.sql`; then verify anonymous denial and two-account isolation before enabling optional sign-in. Google provider configuration remains pending.

## Login test implementation — 22 October 2026
- More and onboarding include Save my progress. SDK 2.118.0 is vendored unchanged with its MIT license; PKCE code exchange, account display, sign-out and explicit backup review are implemented. No client secret or privileged key is shipped.
- `fitness-app/account-config.json`: enabled true (identity), backupEnabled false (fitness writes). Keep backupEnabled false until backend verification and real account/callback tests pass. Do not describe cloud Save/Restore as live.
- Explicit Save/Restore handlers are implemented behind the write gate, with account ownership, locked operations, safety downloads, validation, revision conflicts and storage failure handling. There is no automatic merge or sync. Owner association is preserved in device snapshots. A signed-out retained dataset stays readable on the device by the user's explicit choice.
- `backend/002_verify_backup_isolation.sql` is a transactional regression script for the owner to run in SQL Editor. It tests role permissions, two distinct identities, own-only reads, RPC writes, collisions, stale revisions and account deletion cascade, then rolls back. It has NOT been executed here. It does not replace real two-account OAuth testing.
- Next owner step after deployment: open Fitness → More → Continue with Google, finish sign-in in the same browser and report result. Never request session tokens/auth codes in chat.
- Remaining: live backend test above, two real-account tests, session expiry/multi-tab recovery checks, remote/device replacement review, secure self-service account deletion, public privacy/support pages, production OAuth branding/verification as applicable. Existing test-account deletion can be requested from the owner support address; no automated account deletion claim.

## Private backup activation — 22 October 2026
Owner completed Google sign-in, sign-out and read-only cloud checks with both own Google accounts on Android Chrome. Both accounts reported no backup; this alone is not populated-backup isolation proof. Owner ran migration 002 regression script and supplied its PASS result; all temporary records rolled back. Owner returned to main account and downloaded a safety backup. Explicit cloud Save/Restore is now enabled for the private test; there is no automatic upload. Next test: first Save under main account, verify backup, then test second account on a separate browser/device without deleting the main dataset. Live populated-account separation, restore and conflict testing remain outstanding.
