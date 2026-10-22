# Organized workout library — October 2026

The chooser has two levels: eleven photo categories, then five named session programs per category (55 total). Selecting a category does not change the current workout. Each session shows its focus, equipment, estimated duration, photo and expandable prescription preview before selection.

## Categories
Full Body, Push, Pull, Legs, Arms, Glute Builder, Core, Mobility, Stability, Cardio and HIIT.

The original sixteen A/B sessions retain IDs, titles, exercise order, sets, reps, units, rest periods and technique cues. The existing rotating Full Body plan remains the first Full Body choice. Thirty-eight new sessions are appended, each with at least six main exercises and a distinct exercise combination within its category. Session names describe the emphasis rather than adding C/D/E labels.

Each fixed program uses its existing per-ID draft storage. The original rotating Full Body draft remains separate. No storage migration or food changes are included. New IDs pass through the existing backup restore validation.

## Programming references
These are original EZPZ single-session templates, not licensed professional programs, personalized prescriptions, or claims of professional review.

- ACSM, March 17, 2026: https://acsm.org/resistance-training-guidelines-update-2026/
  Informs the simple, repeatable resistance sessions, gradual progression, and non-exhaustive effort. Equipment and exercise variations support preference and access.
- ACE exercise library: https://www.acefitness.org/resources/everyone/exercise-library/
  Reference for familiar movement choices across body regions and equipment.

Choosing one program for a session does not create an eleven-day schedule. The guide encourages consistent repetition and recovery. New mobility and stability sessions emphasize controlled movement and support. Interval templates include warm-up, recovery and cooldown guidance.

## Images
Existing approved category covers are reused. Arms and Glutes get new generated editorial covers, clearly used as atmospheric workout illustrations rather than technically verified movement demonstrations. Every program uses a related category or focus cover; Home and Train show the selected program's cover.

## Verification
- Approved-food fixture remains unchanged.
- Approved-workouts fixture preserves all sixteen original session definitions.
- Node checks validate eleven categories, five choices each, 55 total, unique IDs, minimum exercise count, distinct exercise combinations, related covers, and rendering without storage writes.
- Chromium checks at 320, 390 and 430 px exercise all 55 selections, category back navigation, exercise previews, original and new drafts after reload, completed-set logging, full backup restore, food, history and navigation.
- Mobile screenshots are attached to the Mobile app checks workflow artifact.
