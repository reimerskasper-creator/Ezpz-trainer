# Optional account backup — implementation handoff

Status: **prepared, not connected**. The live app stays usable without signing in. No SDK, login button, account, token, database or cloud backup is active. This migration is source preparation; it has not been run against Postgres yet.

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
