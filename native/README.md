# EZPZ Fitness Android connection test

This packages the canonical `../fitness.html` and existing assets with Capacitor 8.5.3. It is a test build, not a Play release. Android and browser storage are separate. Restore a downloaded browser backup on first launch; verify counts before entering new data. Google browser OAuth is deliberately disabled in the native package until a system-browser callback and account isolation have been tested. The browser account flow is untouched.

## Build

Use Node 24, JDK 21 and Android SDK 36:

```
npm ci
npm run sync
cd android
./gradlew testDebugUnitTest assembleDebug
```

GitHub's **Android Health Connect test** workflow builds the APK on the development branch and attaches it as `EZPZ-Fitness-Android-test`. A debug APK is for testing only. GitHub's temporary debug signing key can change between builds, so subsequent APKs may require uninstalling; export/restore support must be verified before using this as the sole copy of real data. Production signing has not been configured.

## First test

1. Keep the existing browser app and a downloaded backup.
2. Install the APK, restore the backup, and verify workouts, foods and preferences.
3. More → Connected apps → Allow EZPZ access. WHOOP's permission is separate from EZPZ's permission.
4. Choose Sync now. Check imported counts and values against Health Connect and WHOOP.
5. Sync twice, revoke individual permissions, cancel consent, and retry offline. Existing manual records must stay intact.
6. Verify backup export and restore on the phone before relying on the native app. Cloud login and native download handling are release blockers.

## Data contract

The reader imports only records with Android data origin `com.whoop.android`. Cronometer is not read. Every successful sync is an authoritative snapshot of permitted types for the last seven local calendar days. It removes deleted WHOOP imports inside that window, preserves other sources/manual records, and does not upload data. Missing metrics remain missing, never fabricated zeros. Read grants are checked before and after each sync. There is no background job or history permission. Stages are optional wearable estimates.

Steps and active/total calories use Health Connect aggregation filtered to WHOOP. Active and total energy are separate. Sleep is grouped by wake date using each record's end offset (current timezone fallback), unioned to avoid overlapping/duplicate sessions, and awake/out-of-bed intervals are subtracted. Unknown gaps count as session duration; this may differ from WHOOP's displayed sleep calculation. Stages are included only when available and internally consistent. No WHOOP recovery/strain/HRV or food macros are imported.

Remaining release work: real-device consent/read/export/restore verification, native Google login, stable signing, privacy policy review and Play health-data declarations. Do not describe this as working on a phone until the APK and permissions are verified there.
