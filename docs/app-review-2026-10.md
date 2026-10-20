# EZPZ app review — 20 October 2026

## Scope and method

A benchmark of 10 established comparable fitness apps, selected for strength logging, guided training, planning and progress. This is a curated comparison, not a claim about a universal download ranking. Research used the apps' official product pages and help guides. EZPZ was reviewed through its source and real Chromium mobile sessions at 320, 390 and 430 px. Competitor native apps were not installed or tested hands-on.

The approved Home and food design remain the visual foundation: green actions, warm light surfaces, dark navigation, generous dish photography. All 49 recipes, ingredient weights, macros, ordering, portion controls, meal logging and planning remain unchanged. The 18 older emoji placeholders were completed with dish-specific generated photographs.

## Benchmark

| App | Relevant published pattern | EZPZ decision |
|---|---|---|
| [Hevy](https://www.hevyapp.com/features/track-workouts/) | Routines, set logging and visible previous workout values | Show the previous matching set beside each current entry |
| [Strong](https://help.strongapp.io/article/229-my-first-workout) | Exercise/set structure with an explicit finish action and history | Use full-width exercise cards and a persistent Finish button |
| [Fitbod](https://fitbod.me/) | Training tied to goals, ability and available equipment | Make the current plan and training setting easy to see in More |
| [JEFIT](https://www.jefit.com/use-case/workout-logging-app) | Workout logging, exercise instructions and history | Make the existing exercise library a clear main-menu destination |
| [Boostcamp](https://www.boostcamp.app/features) | Structured programs, tracking and analytics | Retain the A/B workout picker and keep program context clear |
| [Caliber](https://caliberstrong.com/workout-app/) | Strength tracking and progress review | Improve consistency, completed-set totals and history presentation |
| [Nike Training Club](https://www.nike.com/ntc-app) | Intentional programs and workouts for different needs | Retain clear workout focus, time and equipment information |
| [Freeletics](https://www.freeletics.com/en/) | Training guided by goals and circumstances | Keep plan editing discoverable beside a readable plan summary |
| [Alpha Progression](https://alphaprogression.com/en/blog/alpha-progression-guide) | Previous performance, workout history and progress charts | Compare like-for-like set units and label weight charts clearly |
| [Ladder](https://www.joinladder.com/) | A clear daily workout and structured guidance | Retain the strong Home workout action; simplify the logging journey |

These patterns informed the changes; no competitor branding, screenshots, videos or program content were copied.

## Whole-app findings and changes

- **Home:** Existing selected-workout, resume, nutrition and weekly actions already provide a strong starting point. Kept its layout. The weight shortcut now opens the weight-entry disclosure before focusing the field.
- **Training:** The old photo-placeholder column squeezed the inputs. Replaced it with full-width cards, clearer exercise targets, 44 px completion controls, per-set previous results, and a persistent finish bar. All workout prescriptions and draft storage keys remain intact.
- **Technique:** Existing cues stay available beside the workout. Added a direct return to the session. Unreviewed exercise photographs remain unpublished.
- **Exercise library:** Replaced the dense grid of photo-pending notices with readable movement rows, category symbols and equipment labels. Search and filters remain. Draft coaching status remains disclosed in the individual guide.
- **Progress:** Replaced the sparse summary with workout and completed-set totals, four weeks of actual training-day consistency, a labeled weight chart, readable session history and access to every saved session. No estimated strength or recovery scores were invented.
- **More:** It previously opened the shopping list despite being labeled More. It now opens plan settings, exercise guides, shopping, progress and backup tools.
- **Backup:** Existing restore code discarded food logs, meal plans, shopping checkmarks and the full-body draft. Restore now preserves these fields alongside workout drafts and prior history. Editing goals no longer silently clears the full-body draft.
- **Food:** Only the remaining recipe-image references were added. Approved recipe data, nutrition functions, food controls and food CSS are locked by a regression fixture.
- **Onboarding and offline data:** Existing onboarding, storage key and service worker retained. Real mobile checks create a separate localhost test profile; they do not read or change a user's live browser data.

## Verification

- `node tests/home.cjs`: all 16 workouts, Home states, nutrition, weekly activity and shortcuts.
- `node tests/recipes.cjs`: 49 photos, approved food snapshot, 100 portion cases, search/filter, meal logging and shopping quantities.
- `node tests/app-review.cjs`: workout cards, prior-set unit matching, complete history, truthful counts, navigation and full backup state.
- `node tests/mobile.cjs`: actual Chromium at 320/390/430 px; all 49 image requests; all 16 workouts; reload/resume; checked-set logging; history expansion; navigation; library search; onboarding; full backup restoration; overflow and completion-button placement.
- GitHub Actions retains mobile screenshots and a machine-readable result. Commits marked `[visual-review]` also emit one contact sheet in the job log for remote visual inspection. Normal runs do not emit image data.

Remaining limitation: these checks cover Chromium mobile emulation; they do not substitute for a physical Android or iOS device, Safari, or assistive-technology testing.
