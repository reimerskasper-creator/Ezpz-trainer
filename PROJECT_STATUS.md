# EZPZ Fitness — continuation notes

## Canonical app
- Repository: reimerskasper-creator/Ezpz-trainer
- Branch: main
- Live: https://reimerskasper-creator.github.io/Ezpz-trainer/fitness.html
- Continue this existing app. Do not create a replacement or parallel version.

## User preferences and boundaries
- Preserve all saved browser data and existing functionality.
- The food section is approved: do not redesign it or change its recipes, grams, macros, photography, diary, meal planner or shopping behavior without a new request.
- Visual direction: green primary actions, dark green header/navigation, light backgrounds, rounded white cards, realistic workout photographs, simple mobile navigation.
- Every workout program needs a related cover photograph.
- Do not present generated workout covers as professionally verified exercise demonstrations.
- Minimum six main exercises per workout.
- The user wants meaningful named variations, organized by category, rather than only A/B labels.

## Latest implemented request
The workout chooser opens eleven photo categories. Opening a category shows five session programs with a description, equipment, estimated duration, related photograph and an expandable exercise/prescription preview.

Categories: Full Body, Push, Pull, Legs, Arms, Glute Builder, Core, Mobility, Stability, Cardio, HIIT.

55 choices total: the existing rotating Full Body plan, 16 unchanged A/B sessions, and 38 new fixed sessions. The original IDs, titles and exercise prescriptions remain stable. Existing unfinished drafts remain separate for each workout; backup restore supports the new IDs.

Examples under Full Body: Your Rotating Plan, Balanced Strength, Lower-Body Emphasis, Home Essentials, Full-Body HIIT.

Program metadata and all behavior are currently in fitness.html. See docs/workout-library-2026-10.md for program rationale and reference sources. These are original individual EZPZ sessions, not licensed professional multiweek programs.

## Storage and compatibility
Storage key: ezpz-fitness-pilot-1.
Preserve profile, logs, weights, shopping, checkedShopping, foodLog, mealPlan, mealPlanOffset, selectedWorkout, draft, workoutDrafts, workoutLayoutVersion.
The rotating Full Body uses state.draft. Fixed sessions use state.workoutDrafts[programId].
Set fields use srI-J, swI-J and sdI-J. Reps and weight fields now save on input as well as change, so editing an already completed set survives a reload even while the field remains focused.
Do not change recipe array indices. There are 49 approved photographed recipes.

## Verification
- tests/home.cjs: read-only home rendering and workout state.
- tests/recipes.cjs and tests/fixtures/approved-food.json: approved food content and base stylesheet.
- tests/app-review.cjs: logging, previous performance, progress, history, navigation and restore.
- tests/workout-photos.cjs and tests/fixtures/approved-workouts.json: all 55 choices, five per category, six main exercises minimum, distinct exercise combinations, related covers, unchanged original prescriptions.
- tests/mobile.cjs: real Chromium at 320/390/430px, all 55 program selections, category navigation, previews, drafts after reload, food, completion, history, full restore.
- Workflow: .github/workflows/mobile-checks.yml.
- A commit message containing [visual-review] makes the mobile test print a base64 JPEG contact sheet in workflow job logs. The mobile-screenshots artifact also contains full screenshots.
- Tests now compare page width with document.documentElement.clientWidth, not innerWidth, to catch mobile viewport expansion.
- The rotating Full Body week markers previously widened a 320px phone layout; they now have constrained grid tracks.
- The chooser uses a fixed heading and independently scrolling body to keep tap targets clear.

## Other recent work
Home shows selected workout, real nutrition totals, training days, weight and useful shortcuts.
Progress has genuine history, set totals and weight trend; More contains the library, settings and backup tools.
All 49 food recipes are photographed. Workout covers follow the selected program on Home and Train.
Exercise catalogue has 100 entries; technical demonstration images remain unapproved. Do not mark them reviewed without actual review.
See docs/app-review-2026-10.md for the earlier ten-app comparison.

## Future ideas, not yet authorized as a new implementation
The rest timer is now implemented under the user's broad Train-optimization request. A dedicated post-workout summary and professionally filmed technique demonstrations remain future ideas.

## Starting a new chat
Ask the assistant to read this file and the latest GitHub Actions results, then continue the same app. GitHub is the source of truth; fetch current main before editing.

## Last verified release
Code commit: b2c40728db65f64ce85c32b5a80032df82056c91.
Mobile workflow: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/39497527210 — success.
GitHub Pages workflow: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/39497525748 — success.
All checks passed, including real Chromium at 320/390/430px. The Home schedule and Train contact sheet was visually reviewed. No known outstanding blocker remains for the latest Home and Train requests.

## Logged-food visual polish — October 20
User authorized visual improvements to logged food only. Added a separate scoped style block (`food-log-visuals`) in fitness.html: block portion details, aligned 44px Remove controls, full-width calorie progress, readable macro tiles and less nested card padding. All existing approved functions, base stylesheet, recipes, values, images, handlers and storage remain identical. No wger/Feeel code imported; their stacks differ from this static web app. Added mobile checks and Logged-food screenshots at 320/390/430px in tests/mobile.cjs. Implementation commit 972df23; test commit fd9347e. Check their Actions results before continuing. This session has no local execution environment; verification runs in GitHub Actions.

## Day-to-four-week planning and practical sessions — October 20
User explicitly authorized replacement of Home's Plan your meals shortcut, 1-day to 4-week workout/meal planning and workout building, visible difficulty labels for every program, and practical HIIT setups. Implemented next-workout photo preview and compact weight row; My plan from Home/Train/More/Eat; 1/7/14/21/28-day ranges, day and week navigation, workout/rest selection, recipe portions, daily nutrition, copying a day or first week, and range shopping. Custom workouts can be built from scratch or cloned, scheduled, logged and restored with their drafts. Built-in beginner foundations, effort and setup are now labeled upfront.

Reworked hiit-a, hiit-b and hiit-gym to use one space (standing bodyweight; low step/counter; light dumbbells/mat). Old changed-layout drafts are archived under workoutDraftArchives, visible in More and backups; matching movements migrate by name only. History stays unchanged. See docs/planning-2026-10.md for details. All other approved recipe content and food functions are unchanged; only eat() routes to the new planning tool. Existing legacy mealPlanner() remains intact for compatibility.

New state: customWorkouts, workoutSchedule (date → workout ID or rest), plannerStart, plannerDays, plannerOffset, activePlanDate, hiitLayoutVersion=3, workoutDraftArchives. User custom sessions may have fewer than six exercises; the six-main-exercise minimum still applies to the 55 built-ins.

New tests/planning.cjs and expanded tests/mobile.cjs cover plans, custom sessions and backups. All non-browser checks passed in an in-memory harness; real asset and Chromium checks must be confirmed through the new GitHub Actions run before calling the release verified. Previous food-log run 39491993897 and deployment 39492016080 both succeeded. No local shell environment is available in this session.

## Verified planning release
Code commit 2dae9eb9d40dec9c2d1d7929a38aef59c1feaaf0 passed all GitHub checks: Home, 49 locked recipes and all image assets, app review, 55 built-in workouts, the new planning suite, and real Chromium flows at 320/390/430px. Mobile run 39494819881 succeeded; deployment run 39494819707 succeeded. Planning and builder screenshots were visually reviewed. The first run caught an unconstrained icon in More; the verified fix wraps it in the existing icon container. Custom sessions also appear in the main workout chooser. No outstanding known blocker. Continue this exact app and preserve the approved food content.

## Home schedule and Train optimization — October 20
Authorized user request: show the next three workouts or a full week on Home using smaller matching workout photographs, then seriously optimize Train. Implemented ordered next-3 and next-7-days views, real schedule dates, rest/unplanned rows and honest unscheduled fallback. Home view changes do not create or alter plans.

Train now has a compact header, focus/all views, per-exercise progress, exercise jump chips, Continue/Next navigation, explicit blank-only Use previous and Repeat entered set actions, fractional load inputs, inline invalid-result feedback, and a sticky deadline rest timer with pause/resume and opt-in automatic starts. Resume opens the first unfinished exercise. Every set remains in the DOM, with the same IDs/keys and save-on-input behavior. Fixed the pre-existing unchecked-entry finish confirmation (it previously inspected sanitized data), and added invalid-weight validation. Finishing clears the rest timer.

New state: trainingView, autoRest, restTimer. Pure readers ignore invalid timer values; backup restoration preserves valid preferences/deadlines. No food functions or approved food data/styles changed. All 55 built-in workout definitions and custom/planning behavior remain intact. See docs/training-2026-10.md.

Added tests/training.cjs to the workflow and expanded real mobile flows with schedule thumbnails/order, views, previous/repeat results, validation, rest timer persistence, focused navigation and finishing confirmation. Existing non-browser checks and the new training suite passed in an in-memory harness. Confirm the new GitHub Actions and deployment results, and visually inspect EZPZ_TRAIN_DATA contact-sheet output before calling this release verified.

## Verified Home/Train release
Final code b2c40728db65f64ce85c32b5a80032df82056c91. Mobile workflow 39497527210 — success; Pages deployment 39497525748 — success. All seven check commands passed: Home, locked food/recipe assets, app review, workout photos/prescriptions, planning, training, and real Chromium at 320/390/430px. The Home upcoming list and Train overview/focused set-entry screenshots were visually inspected in the preceding successful run 39497144356; the final follow-up changes only automatic-rest fallback and adds zero-rest warm-up coverage. All approved food functions/data/styles and all built-in workout prescriptions remain unchanged.

Follow-up fixes: browser-only interval scheduling prevents Node test processes being kept alive; fresh/cleared workouts reset exercise focus; rotating sessions use a 60-second default for opt-in automatic rest, while explicit zero-rest warm-ups do not start the timer. No known outstanding blocker. This remains the same canonical fitness.html app; continue from current main.

## Planner photo pickers — October 20
User requested fixing My plan's long native workout/meal dropdowns. Replaced them with photo-card triggers and a dedicated native modal picker: eleven workout photo categories, experience filters, search, saved custom sessions and expandable exercise previews; meal photos, per-serving calories/macros, meal-type filters and ingredient search. Explicit rest, remove and build actions remain available. Short portion and range selects stay native.

Planner picker UI state is ephemeral. Selections target the opening date/slot, preserve active workout/drafts and other dates, and never log eaten food. Reselecting the same recipe preserves its portion; selecting a new one starts at one serving. Closing/Escape/backdrop makes no storage writes. Storage failures roll back the changed plan. Native focus trapping and return focus are preserved; opening focuses Close to avoid summoning the phone keyboard.

No approved food functions/data/images/styles, workout prescriptions or storage schema changed. tests/planner-picker.cjs was added, and existing mobile planning flows now interact with the photo pickers. Non-browser checks passed in memory. Confirm the new Actions results and inspect EZPZ_PICKER_DATA screenshots before calling this release verified. See docs/planner-pickers-2026-10.md.


## Verified planner pickers
Code 693b011c737705fb4bf630175eeee1dfc7ef1e19: mobile workflow 39499371002 and Pages 39499370946 both succeeded. Workout and meal picker screenshots were visually reviewed. All protected food and built-in workout checks passed.

## Create your own workouts — October 20
Added a Create your own photo category beside the eleven built-in workout categories, also available from the planner. Simple manually named workout/exercise boxes, sets and reps, with optional cover/equipment/time/rest controls collapsed. Saved workouts have photo cards and Start/Resume actions. Direct creation offers Save & start or Save for later; neither forces a schedule entry. Planner creation saves only to its chosen day. Sessions use the standard Train logger, persistence, rest timer and history. No storage schema or approved food/built-in workout changes. Added own-workouts unit coverage and real mobile creation/save/start/persistence flows. Browser and deployment verification pending for this commit.
