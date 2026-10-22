# Daily wellness import boundary (version 1)

This release prepares browser storage and views. No provider connection, OAuth flow, background sync, credentials or native bridge exists yet. Manual entries work now. `More → Connected apps` reports this honestly.

Future adapters call `previewWellnessImport(batch)` before `importWellnessBatch(batch)`. The adapter must obtain consent, authenticate securely, normalize provider units and aggregate to one daily total per metric/source/date. Never put provider secrets in `fitness.html`. A web API requiring a client secret needs a secure service; platform health stores need their supported native access layer.

```json
{
  "version": 1,
  "records": [{
    "metric": "sleep",
    "date": "2026-10-21",
    "source": "whoop",
    "externalId": "stable-provider-daily-record-id",
    "unit": "minutes",
    "value": 450,
    "deepMinutes": 80,
    "remMinutes": 95,
    "updatedAt": "2026-10-21T08:30:00Z"
  }]
}
```

The example is documentation only; it is never installed as user data.

| Metric | Unit | Meaning |
| --- | --- | --- |
| `steps` | `count` | Integer daily total, never a delta |
| `sleep` | `minutes` | Integer total for the wake-up date; adapter aggregates sessions |
| `activeCalories` | `kcal` | Daily activity energy, excluding resting energy |
| `totalCalories` | `kcal` | Daily energy including resting energy; optional |

Dates are the user's local calendar days as normalized by the adapter, never future days. Use explicit timestamp timezone offsets. The adapter must retain the provider's day boundaries and documented calorie semantics; do not map total energy to active energy. Omit unsupported metrics and unavailable stages. Zero is a measured zero; missing is unavailable. Deep and REM are optional integer minutes, individually and jointly no greater than total sleep. Stages remain wearable estimates; manual duration never creates them.

A daily record is keyed by metric/date/source. Stable external IDs permit a newer revision to move a record to a corrected date. Imports replace their own daily totals, never sum sources. Older revisions are ignored; identical revisions do not write; conflicting equal timestamps and conflicting batch duplicates reject the whole batch. Validation and storage failure leave existing data intact. Limits: 10,000 records per batch and saved collection; steps 200,000/day, sleep 1,440 minutes/day, active energy 20,000 kcal/day, total energy 30,000 kcal/day. These are defensive input limits, not personal targets.

Manual sleep remains in the existing `sleepLog`; movement records use source `manual`. Manual data wins by default. A per-day/per-metric source choice can select a wearable while preserving originals. Saving a manual entry selects it again. Without manual data or an explicit choice, the most recently received imported source is displayed; sources are never added together. `syncedAt` is assigned locally on changed imports and shown as last import, not a live connection status. Records, choices and the adjustable step goal round-trip through the existing backup flow.

Home steps, sleep summaries/rings/history and Progress active calories use the selected record. Steps remain a small row inside foundations and do not change the four foundation rings. Active and total calories stay separate and do not modify food targets.

Before connecting the first provider: implement its consent/revocation and secure token lifecycle, adapter mappings, timezone/day aggregation, retries and sync cursor, account isolation, and real connection status. Test against provider fixtures and these app contracts before enabling any Connect action. Provider cards are preparation, not promises that each provider supplies all four metrics.
