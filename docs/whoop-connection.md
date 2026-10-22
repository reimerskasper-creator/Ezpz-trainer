# Direct WHOOP connection
Callback deployed at https://uwfetvlddswsmqcitgzy.supabase.co/functions/v1/whoop-connect

Status: direct authorization and manual Sync are implemented in the Android app. The user must authorize WHOOP and choose Sync WHOOP now.
Client ID and client secret must be configured as Supabase Edge Function secrets WHOOP_CLIENT_ID and WHOOP_CLIENT_SECRET. Never put them in frontend code or commits.

WHOOP app dashboard: privacy URL https://reimerskasper-creator.github.io/Ezpz-trainer/fitness-privacy.html; callback URL above; read:cycles and read:sleep scopes.
Authorization also requests offline to allow token refresh in a later sync implementation.

POST action=start and action=status require a verified EZPZ bearer session. Start returns the WHOOP authorization URL. The callback checks and atomically consumes hashed state (10 minute expiry), exchanges the code server-side, encrypts returned tokens using AES-GCM with user ID as additional authenticated data, and redirects to the fixed web app URL with only a result marker.
The encryption key is derived from the server service-role key with an application-specific prefix. Rotating that key requires reconnecting WHOOP accounts unless token records are migrated first.
No measurements are stored in these tables; token/state tables have no public client grants and RLS is enabled with no client policies. Account deletion cascades to both tables.
Source tests cover unauthorized calls, origin rejection, state hashing/expiry/replay, token encryption, status isolation and failed storage. CI also checks the deployed health and rejection paths. Live WHOOP consent and token exchange have been verified on the test phone. Measurement imports still need live user verification.

Sync reads the last seven wake-up dates using read:cycles and read:sleep only. Cycle dates use the associated main sleep's local wake date, and the UI labels steps/energy as cycle values instead of midnight-to-midnight totals. Main sleep uses summed sleep stages, excludes naps and time awake, and retains optional deep/REM when actually supplied. Kilojoules are converted to kcal by dividing by 4.184. Missing values are omitted.
A per-user 120-second database lease prevents concurrent token refresh. Each refresh saves the rotated credentials before using them. Provider read failures do not return partial snapshots. Sync returns measurement data to the signed-in user only; no raw data is logged or persisted on the server. An explicit Disconnect revokes the provider access and removes server credentials while retaining existing device measurements.

Authorization now stages encrypted credentials in a server-only, expiring completion record. The returning app must verify its starting EZPZ account and finish using the one-time completion proof before the server activates the connection. Completion proofs cannot finalize another account’s pending connection. Existing verified connections remain usable. Account deletion cascades to pending completion records too.
