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
3. More → Connected apps → Allow EZPZ access. WHOOP's permission is separate from EZPZ's permission.
4. Choose Sync now. Check imported counts and values against Health Connect and WHOOP.
5. Sync twice, revoke individual permissions, cancel consent, and retry offline. Existing manual records must stay intact.
6. Verify backup export and restore on the phone before relying on the native app. Cloud login and native download handling are release blockers.

## Data contract

The reader imports only records with Android data origin `com.whoop.android`. Cronometer is not read. Every successful sync is an authoritative snapshot of permitted types for the last seven local calendar days. It removes deleted WHOOP imports inside that window, preserves other sources/manual records, and does not upload data. Missing metrics remain missing, never fabricated zeros. Read grants are checked before and after each sync. There is no background job or history permission. Stages are optional wearable estimates.

Active calories use Health Connect aggregation filtered to WHOOP; total calories require complete raw coverage (below). Steps use the rule below. Active and total energy are separate. Sleep is grouped by wake date using each record's end offset (current timezone fallback), unioned to avoid overlapping/duplicate sessions, and awake/out-of-bed intervals are subtracted. Unknown gaps count as session duration; this may differ from WHOOP's displayed sleep calculation. Stages are included only when available and internally consistent. No WHOOP recovery/strain/HRV or food macros are imported.

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
