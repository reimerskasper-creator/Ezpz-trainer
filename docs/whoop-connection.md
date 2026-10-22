# Direct WHOOP connection
Callback deployed at https://uwfetvlddswsmqcitgzy.supabase.co/functions/v1/whoop-connect

Status: callback and authorization backend only; direct measurement sync and app UI are not enabled yet.
Client ID and client secret must be configured as Supabase Edge Function secrets WHOOP_CLIENT_ID and WHOOP_CLIENT_SECRET. Never put them in frontend code or commits.

WHOOP app dashboard: privacy URL https://reimerskasper-creator.github.io/Ezpz-trainer/fitness-privacy.html; callback URL above; read:cycles and read:sleep scopes.
Authorization also requests offline to allow token refresh in a later sync implementation.

POST action=start and action=status require a verified EZPZ bearer session. Start returns the WHOOP authorization URL. The callback checks and atomically consumes hashed state (10 minute expiry), exchanges the code server-side, encrypts returned tokens using AES-GCM with user ID as additional authenticated data, and redirects to the fixed web app URL with only a result marker.
The encryption key is derived from the server service-role key with an application-specific prefix. Rotating that key requires reconnecting WHOOP accounts unless token records are migrated first.
No measurements are stored in these tables; token/state tables have no public client grants and RLS is enabled with no client policies. Account deletion cascades to both tables.
Source tests cover unauthorized calls, origin rejection, state hashing/expiry/replay, token encryption, status isolation and failed storage. CI also checks the deployed health and rejection paths. Live WHOOP consent and token exchange still require configuring the WHOOP credentials.
