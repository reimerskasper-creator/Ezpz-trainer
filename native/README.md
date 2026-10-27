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

GitHub's **Android Health Connect test** workflow builds the APK on the development branch and attaches it as `EZPZ-Fitness-Android-test`. A debug APK is for testing only. The workflow caches an explicit test signing key. Verify its certificate against the previous APK before distributing an in-place update; losing that cache can still break update compatibility. Production signing has not been configured.

## First test

1. Keep the existing browser app and a downloaded backup.
2. Install the APK, restore the backup, and verify workouts, foods and preferences.
3. Enable Health Connect sharing in your supported tracker app. In EZPZ: More → Connected apps → choose Your activity tracker → Details & permissions → Allow EZPZ access. Include Workouts for completed training imports.
4. Choose Sync now. Check imported counts and values against Health Connect and the selected tracker.
5. Sync twice, revoke individual permissions, cancel consent, and retry offline. Existing manual records must stay intact.
6. Verify backup export and restore on the phone before relying on the native app. Cloud login and native download handling are release blockers.

## Data contract

The activity reader imports one explicitly selected origin: WHOOP `com.whoop.android`, Samsung Health `com.sec.android.app.shealth`, Fitbit `com.fitbit.FitbitMobile`, Garmin `com.garmin.android.apps.connectmobile`, Oura `com.ouraring.oura`, Polar Flow `fi.polar.polarflow`, Amazfit/Zepp `com.huami.watch.hmwatchmanager`, Xiaomi/Mi Fitness `com.xiaomi.wearable`, or Withings `com.withings.wiscale2`. Nutrition is separate and supports sources such as Cronometer. Every successful sync is an authoritative snapshot of permitted types for the last seven local calendar days. It removes deleted imports from the selected source inside that window, preserves other sources/manual records, and does not upload data. Missing metrics remain missing, never fabricated zeros. Read grants are checked before and after each sync. There is no background job or history permission. Stages are optional wearable estimates.

Steps and active calories use Health Connect aggregation filtered to the selected origin; WHOOP retains its reporting-period step handling. total calories require complete raw coverage (below). Steps use the rule below. Active and total energy are separate. Sleep is grouped by wake date using each record's end offset (current timezone fallback), unioned to avoid overlapping/duplicate sessions, and awake/out-of-bed intervals are subtracted. Unknown gaps count as session duration; this may differ from WHOOP's displayed sleep calculation. Stages are included only when available and internally consistent. No recovery/strain/HRV or routes are read by the activity reader. Exercise sessions use their recorded local start date, stable Health Connect ID and end time; unfinished sessions are ignored. Imported workouts use one external source per date, preferring the selected tracker and direct WHOOP over its Health Connect copy. Local workouts remain independently editable. Source preferences survive backup/restore and step-goal changes.

Remaining release work: real-device consent/read/export/restore verification, native Google login, stable signing, privacy policy review and Play health-data declarations. Do not describe this as working on a phone until the APK and permissions are verified there.

## Read-only step comparison

More → Connected apps → Check step totals reads yesterday's WHOOP-only aggregate using phone-zone, UTC and record-local date boundaries. It inspects a bounded, paginated surrounding record window and formats one copyable report with dates, counts and up to eight record time ranges. It does not import, delete, select a source or upload anything. Raw counts are explicitly marked as unsplit record sums. The v2 report also shows the reporting-period import calculation. No device records are changed.

## WHOOP reporting-period steps

The phone report for Oct 21, 2026 contains one WHOOP record: 8,061 steps from Oct 20 22:16 to Oct 21 22:07, offset -04:00. WHOOP displays 8,061 for Wednesday; midnight aggregation returns 7,478. Android 1.0.4 preserves this whole interval on its local ending date, rather than estimating how steps were distributed through it. This is inferred from the observed export, not a documented universal WHOOP contract.

The reader fetches paginated WHOOP-only raw steps with a two-day boundary buffer. If daily-sized periods occur, all completed records must be 18–30 hours, nonoverlapping, and have distinct local ending dates. Exact duplicate periods are collapsed. Midnight endpoints use the covered date; supplied end offset wins over phone zone. Ambiguous/mixed formats reject the snapshot atomically instead of summing overlapping records or fabricating totals. Missing days stay blank (including today until exported); old midnight-split imports in the successful seven-day snapshot are replaced. Short-only records retain WHOOP-filtered Health Connect aggregation. Neither mode includes phone counts. UI stores and displays period provenance; manual source selections stay intact. Calories and sleep calculations are unchanged.

Validation includes the exact phone interval/count, duplicates, revisions, adjacent periods, midnight, timezone travel, future records, short-only fallback, ambiguity rejection, and JS replacement/provenance/manual-data preservation. Device re-sync is still needed to verify the other six days against WHOOP.

## Read-only calorie comparison

Android 1.0.5 adds Check calorie totals with a date picker limited to the last seven days. Reports WHOOP-filtered total and active aggregates, UTC total comparison, and bounded paginated raw records from a surrounding window, separately identifying raw unsplit sums and record intervals. Missing grants are explicit; granted calorie permissions are rechecked before returning. No BMR permission is requested, no state is saved, and no calorie correction is inferred. JS appends saved native calorie values and import times for the selected date. The packaged runtime test checks date routing, report display, zero raw records alongside a nonzero aggregate, and unchanged saved state.

## Reject unsupported total-calorie aggregates

The Oct 20 phone report contains a total aggregate of 2608.2169 kcal but zero WHOOP raw total-calorie records. WHOOP displays 2274 kcal; the only backed energy is 465.8817 kcal from an activity interval. Android 1.0.6 no longer imports total-calorie aggregates. It reads paginated WHOOP raw totals and accepts only exact, gapless, nonoverlapping coverage of the requested local day (or elapsed today), with whole records contained in that window. No raw records, gaps, overlaps and boundary-straddling summaries stay missing; no synthetic resting energy or prorated distribution is added. Diagnostic aggregate reads remain read-only for comparison.

A successful sync reconciles permitted total-calorie records in the last seven days and clears prior unsupported native totals, preserving manual entries and other sources. UI explicitly shows unavailable WHOOP daily totals and explains shared activity calories may be incomplete. Steps and sleep are unchanged. Tests cover the exact no-raw-total report, complete/fractional/zero totals, duplicates, gaps/overlap/boundaries, stale-import cleanup, manual-total preservation and packaged UI.

## Android backup export

Android 1.0.7 adds EzpzBackup, registered before BridgeActivity startup. Export opens ACTION_CREATE_DOCUMENT for one JSON file, with the user's selected destination only and no storage permission. It writes UTF-8 on Dispatchers.IO, flushes/closes, then reads back and compares exact bytes. The bridge resolves saved/verified only after comparison succeeds. Cancel/write/read/close failures never record successful export; app records are not changed. A JVM test exercises byte-exact Unicode data, stream closure, write failure, corrupt reads, missing streams and close failure. The web app retains requested-download wording for browser anchor downloads; Android records saved/verified metadata only after the native result. Restore still uses the existing validated file chooser and remains a phone verification step. Its file limit is aligned to the native 16 MB export limit; cloud backup limits are unchanged. Native Google login remains disabled.

## Steps overview and direct WHOOP investigation

Android 1.0.8 replaces the Home steps strip with a goal ring and seven-day bars. It respects manual source choices, distinguishes missing counts from zero, and labels a fallback count with its actual date; it never fills today's count with yesterday's value. Whole card opens the existing movement log. It does not change pillar scores or import calculations. Packaged visual checks cover 320/390/430 widths, missing/current/latest states and navigation.

Official WHOOP v2 docs reviewed Oct 22, 2026 expose cycle step_count (including current cycle), cycle score.kilojoule and sleep stage_summary. Physiological cycles differ from calendar days; exact phone comparison remains required. The official Getting Started guide requires the client secret to stay server-side, never in web/mobile code. No direct OAuth connection is implemented or enabled by this UI change; registration, backend secret storage and native sign-in callback/account isolation must be established first. Sources: https://developer.whoop.com/docs/developing/user-data/cycle/ ; https://developer.whoop.com/docs/developing/user-data/sleep/ ; https://developer.whoop.com/api/ ; https://developer.whoop.com/docs/developing/getting-started/


## Expanded tracker picker (Android 1.0.37)
Nine selectable sources share the same daily measurement and workout contract. All activity reads use only the selected publisher package; changing source never sums trackers or deletes other-source imports. The six added sources feed existing Sleep/Train/Steps rings and Progress; Eat remains food intake and Zone stays a manual check-in. No new permissions, weight reader, wearable-specific scores or per-brand OAuth.

Source setup stays inside Details & permissions. Garmin Health Connect sharing requires Android 14+. Oura Gen3+ requires its active membership. Withings accounts created after October 13, 2026 require Withings+ for exports; older accounts retain prior access. Xiaomi support here is Mi Fitness, not Zepp Life. Sources: publisher Google Play pages, Polar Health Connect support, Oura Health Connect support, Google Health partner documentation and Withings export support, checked 27 October 2026. Device models/app versions and granted/shared types determine availability; real manufacturer-device testing is still required.
