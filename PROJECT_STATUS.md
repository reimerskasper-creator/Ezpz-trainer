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

## Latest update — welcome questionnaire and personal greeting, 21 October 2026
- First-time setup now has a gym-photo welcome hero, green/gold/blue habit pills, and three photo-backed panels for personal preferences, training choices and starting body details. Same one-page questionnaire, existing choices, body units and calculations; every form field has an explicit label. Setup branding matches Home. Completion scrolls Home to the top.
- Optional firstName is collected at setup; existing users can add/edit/remove it in More → What should we call you? Home's heading says “[name], you’ve got this!” or “You’ve got this!” when blank. No name is hardcoded or inferred for other users.
- Names are whitespace/control cleaned and limited to 40 Unicode characters, escaped in markup, retained while switching setup units, included in backups and validated on restore. Save failures roll back; name edits do not change profiles, foods, weights, workouts or targets. Setup profile/name writes now also roll back together.
- tests/personal-welcome.cjs covers names, Unicode, escaping, backup validation, rollback and retained records. Mobile flows cover new setup, unit switching with draft preservation, name save/reload/change/removal, 40-character greeting layout and read-only record preservation at 320/390/430px. New screenshots: personal-welcome-setup.jpg and personal-welcome-home.jpg.
- Local unit/regression checks passed. CUA visually inspected the photo-backed setup and a named Home greeting; verified name/measurement preservation across unit switching and name changes through More. Source 36b6841a3bc4891b526537fa298a9402ad6a16a8 passed Mobile app checks 39634310220 (job 119340568735), including all new name/setup flows at 320/390/430px; Pages deployment 39634309384 succeeded. No known release blocker.

## Latest update — Train color harmony, 21 October 2026
- User requested less white on Train, one or two darker tones, Home's green/gold/blue boxes and a more visual top workout summary.
- Train-only color-harmony stylesheet darkens the page and exercise-photo overlay to sage; colors logging actions green/gold/blue, next-weight guidance green, swap blue, technique tips gold, and next-exercise green. Light number inputs remain distinct; photos, selected/completed/invalid states and functionality are preserved.
- Train calls workoutPicker(true) to omit its redundant count/time subtitle; the default picker is unchanged elsewhere. Header now shows three colored real-value tiles (exercise count, duration, total logged sets), followed by labeled format/progression and equipment rows. Experience/effort badges and workout/photo selection remain.
- Added a dumbbell path to the existing homeIcon helper for the equipment row. No workout definitions, recipes, saved-data readers, handlers, unit conversion or schema changes.
- Local syntax, training, training-usability, workout-photo/prescription and protected recipe suites passed. CUA preview header and logger visually reviewed with actual photo assets. Mobile suite now checks summary/color distinctions, duplicate removal and responsive layout at 320/390/430px; Mobile app checks 39622823949 and Pages deployment 39622823228 passed on source bef89f02a4927dabdba69baf74253e040a2a2263.

## Latest update — five training usability improvements, 21 October 2026
- The saved metric/imperial preference now applies to workout load entry, previous results, history corrections, strength charts, archived entries and kettlebell per-bell cues. All storage, comparisons and backups remain kg; exact stored loads survive display-only switches and unchanged edits. Food content is unchanged.
- Next weight hints use completed paired results. An increase is suggested only after two sessions with every recorded set completed at the current rep target and the same load, with at least the current required number of sets. The user chooses the smallest available increment; no automatic load changes. Timed sets, assistance exercises and nonnumeric prescriptions are excluded.
- Curated movement groups offer Swap exercise for the current draft/session only. Replacements use their own cues, side markers and related equipment imagery, preserving session set/rep/rest targets. Existing exercise entries lock swapping; an explicit confirmed clear applies only to that exercise. Base programs, past logs, other exercises and future sessions remain unchanged. Swap keys survive validated backups and reload.
- Finishing shows a recap above Progress with completed sets, elapsed minutes since first manual entry (includes breaks and resumed time), paired load/rep improvements against the previous comparable record, and next scheduled workout. Missing legacy duration is not invented. Session finish now rolls back logs and drafts together if saving fails.
- More begins with measurement/display settings and plan settings, then planner/shopping shortcuts. Exercise guides/history and backups/archived drafts are collapsed sections.
- tests/training-usability.cjs covers conversions, failed writes, swaps, completion eligibility, paired improvement comparisons and recap/finish. Existing browser flows open the intentionally collapsed sections; new mobile flows test all five features at 320/390/430px. Current supported unit suites pass; legacy tests/workouts.cjs is obsolete (expects 16 fixed programs; current protected suite verifies 64).
- CUA preview manually verified setup conversion, swap, lb entry, finish recap and More controls. Source 1c6b01250b4d090e1fe1d7e4c67e101116d437d3 passed Mobile app checks 39620756092 (job 119293196667) including the new five-feature flows at 320/390/430px; Pages deployment 39620755124 succeeded. The deployed app blob matches the locally checked source. No known release blocker.

## Latest update — body measurement preference, 21 October 2026
- More → Measurement units persists Metric (kg/cm) or Imperial (lb/inches), default metric for existing users. Setup includes the same choice and converts entered body measurements while preserving other answers.
- Home weight/delta, Progress summary/trend/accessible chart text, weigh-in entry and editing use selected units. Stored profiles/measurements remain normalized kg/cm; changing display does not rewrite history. Nutrition questionnaire starts in preferred units; existing explicit calculator unit switching remains.
- Backup restore validates state.units. Weigh-in save now rolls back on storage failure.
- Scope: body measurements. Workout load inputs/history remain explicitly kg; recipe portions/macros remain grams.
- Added tests/units.cjs to CI; local syntax, units, privacy, nutrition-targets, daily-use, Home and protected recipes passed. Browser checks and deployment pending.

## Latest update — five everyday-use upgrades, 21 October 2026
- Eat diary has a date picker, previous/next day and Back to today. Recipe/custom/recent logging uses the selected past-or-today date; recipe screen displays date too. Home totals remain today-only. Food entries have portion/date editing, exact dish photos retained, transactional removal and Undo.
- Favourite library recipe indexes are validated in state.favouriteRecipes, included in backups. Recipe pages toggle favourites; Eat's collapsed Favourites & recent meals has photos, portions and direct logging. Recents derive from logs, deduplicated by recipe identity or custom per-portion snapshot. Custom unitMacros prevent repeated editing rounding drift.
- Progress shows separate four-week protein/carb/fat average grams, uncapped percentages (bars capped only visually), logged-day coverage, current target labels and methodology. Combined habit rings remain a clearly capped average.
- Exercise progress on Progress has exercise/unit and load/reps selectors, actual-date SVG chart, first/latest values and per-session records. Each point is the heaviest completed set paired with reps or highest completed reps/duration; bodyweight never converted to external load. Sec/min distinct; latest 30 sessions. History exercise names open their chart.
- Workout history can edit set reps/duration, kg/BW and completed state; legacy aggregate fields updated alongside sets. At least one valid completed set required. Workout deletion has confirmation and Undo. Weigh-ins can edit/remove with Undo, respecting hidden weight setting. Removal Undo is session-only and cleared on backup restore.
- All mutations roll back on storage failure. Rendering does not alter saved logs, foods, recipes, schedules or targets. Existing food fixture updates restricted to authorized foodSummary/foodDiary/mealDetail UI/date changes; recipe ingredients/macros/photos unchanged.
- Initial complete browser run 39614387563 (job 119271407850) and Pages 39614388931 succeeded; diary, individual macro chart, exercise chart and workout editor screenshots visually reviewed. Follow-up validates recipe date at log time and auto-selects reps for bodyweight-only exercises; mobile coverage adds past-day custom/recent reuse and a favourite-photo review.
- Final source 22f0d0c4e247fc0125c9845b7549ff79a0bc2f0c verified: Mobile app checks 39615130641 (job 119274016723) and Pages deployment 39615132110 succeeded. All new and existing browser flows passed at 320/390/430px; favourite photo panel screenshot also visually reviewed.
- tests/daily-use.cjs covers dates, precise custom portions, favourites/recent, over-target macros, chart units/completed sets, correction, undo, backups and rollback. Mobile tests cover the main workflows at 320/390/430px with visual review markers EZPZ_DAILY_DIARY_DATA / MACROS / EXERCISE / HISTORY.

## Previous update — Show weight shortcut, 21 October 2026
- Hiding weight now leaves a small Show weight button in place on Home and Progress. It restores weight immediately using the same persisted preference. More's existing switch remains available. Hidden measurements are still omitted from markup.
- Privacy unit and mobile tests now verify direct restoration on both pages, including after reload.

## Previous update — optional weight display, 21 October 2026
- Home's weight shortcut and Progress's weight trend have a Hide weight button. Hiding omits Home's weigh-in card, Progress's weight summary tile, weight trend and logging reminder from rendered markup. Progress becomes a two-tile summary.
- More has a matching photo-backed Display preferences panel with Show weight on Home & Progress On/Off control. Users can re-enable without losing measurements.
- state.hideWeight is an explicit boolean (false/default visible). Restore validates strict true; export includes preference. setWeightHidden rolls back on storage failure. Does not delete measurements, change body-weight-based nutrition calculations, profile, workouts or food logs.
- Verified source commit e2969ce565e8d1db5d5a09f81e01db427d1ec5bd: Mobile app checks 39609713055 (job 119255072087) and Pages deployment 39609712079 succeeded. Final preference screenshot visually reviewed.
- tests/privacy.cjs covers omitted weight DOM, opt-in, data retention, backup validation and rollback. Mobile tests hide from both locations, reload, restore via More, verify persisted measurements and layouts at 320/390/430px.

## Previous update — Build the habit progress visuals, 21 October 2026
- Progress's Build the habit card has three selectable current-week completion rings (training, macros, sleep) and a corresponding four-week chart.
- Training uses unique workout days/current weekly goal and retains counts/session labels. Macros sum each logged day's foods (including custom), use the Home macro completion calculation, and average only logged food days. Sleep averages per-night completion against the current personal goal, capped each night at 100%. Future days excluded.
- Missing macro/sleep weeks show an em dash and zero logged days/nights, rather than inferred 0%; coverage counts and methodology are visible. Historical comparisons use current targets explicitly; no historical target snapshots are invented. Current-week comparison is labelled in progress.
- Rings switch charts locally without storage writes or changing logs. Log food and Log sleep actions use existing pages. Existing body-weight and workout-history sections unchanged.
- Verified main implementation with Mobile app checks run 39608546167 (job 119251030960) and Pages deployment 39608544163: all checks passed; final macro and sleep panel screenshots visually reviewed. Follow-up label polish singularizes day/night counts.
- tests/habits.cjs verifies grouping, per-day food aggregation, cutoff, missing logs, capped averages and read-only rendering. Mobile checks exercise all three views at 320/390/430px and capture macro/sleep review screenshots.

## Previous update — weekly habit circles and sleep, 21 October 2026
- Home's This week card retains the training calendar and adds three interactive 0–100% SVG rings: unique training days / weekly goal; today's macro completion; sleep logged for today's wake-up date / personal sleep goal.
- Macro completion averages protein/carbs/fat target fractions, capping each at 100% before averaging (zero targets excluded). It reads shared target() and today's foodSummary(), including custom foods. Clearly labelled weekly versus today.
- Sleep opens from the ring or Log sleep & set your goal. Matching photo-backed page supports wake-up date, integer hours/minutes, personal goal (default 8 hours), replacing/editing a date and recent seven nights. Up to 24h sleep and 1–24h goal; no future dates. This is a user preference, no clinical recommendation.
- state.sleepLog is a date=>minutes record; state.sleepGoal is minutes. Backup restore validates both. Save failure rolls back both; other logs/drafts unchanged.
- Verified source commit 44e6999abed30a08c87b15e57047f0782d3d59fc: Mobile app checks 39607057518 (job 119245873688) and Pages 39607057244 succeeded. Both final habit-card and sleep-form screenshots visually reviewed.
- tests/sleep.cjs covers math, validation, cap, roundtrip and rollback. Chromium mobile tests cover logging 3h30 against 7h=50%, reload, editing to 100%, navigation, no data loss and 320/390/430px. Visual review markers EZPZ_HABITS_DATA and EZPZ_SLEEP_FORM_DATA.

## Previous update — planner back button and More visuals, 21 October 2026
- My Plan has a visible 44px-minimum back button above its hero. Both top and bottom back links return to the section that opened the planner (Home, Train, Eat, More or Progress), rather than always Home.
- Ephemeral plannerReturnTo / lastMainView routing tracks the last main section during render; it does not alter saved state, schedule dates or planner selections.
- More now matches Home with a photo hero, photo-backed training-plan card, distinct related photos for the four Explore tools, and a logbook-backed backup/restore panel. All existing tool links, editing and backup behaviors remain intact.
- Verified source commit b7fc90b540f3c35640abfbf8a35794c207cf5feb; Mobile app checks run 39604805847 and Pages deployment 39604805138 passed. Chromium tested top back visibility, return destinations from Home/Train/Eat/More, scroll reset and preservation of stored data, distinct More tool backdrops, links, restore controls and layouts at 320/390/430px. The final four-panel screenshot was visually reviewed.

## Previous visual update — My Plan, 21 October 2026
- My Plan now matches Home with a photographic hero, logbook-backed date/length controls, week tabs and a landscape-backed day calendar with clear selected-day highlighting.
- Workout panels and picker triggers use the chosen program's actual cover. Rest days use the recovery landscape. Meal triggers use the chosen recipe's exact photograph alongside the existing thumbnail; empty meal slots show relevant labelled suggestions.
- Meals/portions sit over a softly washed nutrition photo. Daily totals have separate calorie/protein/carb/fat colors and compare with the shared current nutrition targets. Copy/repeat/shopping actions have a dark nutrition-photo panel.
- Workout and meal picker headers have related photo backdrops with readable search/filter controls.
- This was a visual change: planning IDs, date ranges, portions, copying, repeating, shopping, workout starts and saved data remain unchanged.
- Verified source commit 4f73c9b28d338b32e8d4e5ddf8a89d683cd81a57; Mobile app checks run 39603270439 and Pages deployment 39603271233 passed. Chromium tested 320/390/430px, exact selected recipe/workout backdrops, empty slots, rest days, picker headers, current macro targets, no rendering storage writes and existing planning flows. The five-panel My Plan screenshot was visually reviewed.

## Previous update — logging first and nutrition targets, 21 October 2026
- Eat now starts with photo-backed Log custom food and Nutrition targets buttons, followed by Today's food and the planner. These precede recipe search and all recipe cards. Navigation into new pages returns to the top.
- Custom-food saved/fill panels have distinct related photo backgrounds. Input text is explicitly dark on light fields and browser-checked for at least 4.5:1 contrast.
- Nutrition targets has Set my own (daily protein/carbs/fat boxes with matching calculated calories) and Calculate for me (three steps: body details, overall routine/goals, review/save).
- The questionnaire supports kg/cm and lb/in, with draft preservation across units and tabs. It uses Mifflin–St Jeor plus explicit overall activity factors, modest goal adjustments and documented macro defaults. Exercise is included in the activity choice and is not added again.
- Results are clearly personalized starting estimates, not exact measured needs. Unsupported pregnancy/breastfeeding/clinician-prescribed situations route to individual target entry. Weight-loss estimates below BMI 18.5 are blocked. Calculation details, assumptions and primary research are in docs/nutrition-targets.md and the result's expandable method.
- state.nutritionTargets is validated and read by target() for both Home and diary. state.nutritionAssessment stores normalized answers. Existing targets remain unchanged until the user explicitly saves. Logged foods, custom foods, recipes, workout data and saved portions remain intact. Backups sanitize/preserve the two new records; save failures roll back.
- tests/nutrition-targets.cjs covers formula examples, all activity/goal combinations, units, limits, source consistency, targets/backup integration and rollback. Full Chromium flows cover entry-point placement, manual targets, all questionnaire steps, unsupported situations, draft preservation, photo/form contrast, reload and backup behavior at 320/390/430px.
- Verified source commit 9bceefff3d57353c3374245ed057debe56e84bd4; Mobile app checks run 39601715299 and Pages deployment 39601714386 passed. Final Eat, manual-target, body/activity/result, and dark custom-food screenshots were visually reviewed.

## Previous feature — custom foods, 21 October 2026
- Eat → Today's food → Add your own food opens a simple form for a food name and protein/carbs/fat grams for one portion. Calories calculate as 4P+4C+9F unless optional label calories are entered. The live label distinguishes label calories from calculated calories.
- A required eight-choice photo picker uses existing related dish assets. It is explicitly a closest-photo visual reminder; all nutrition comes from user input. The chosen photo appears on every logged custom food.
- Save for next time is optional. Saved foods can be logged at different portion amounts or removed without removing diary entries or their photo snapshots.
- state.customFoods contains small validated records (id/name/macros/photoKey). Diary entries use custom:true, photoKey and optional customFoodId. Custom entries never resolve by recipe name, even if their name matches a library dish.
- New helpers: parseCustomFood, logCustomFood, cleanCustomFoods, customFoodPhoto, deleteCustomFood, customFoodPage and openFoodDiary. Save failures roll back additions/deletions. Backup restoration validates saved foods and preserves logged food/photo metadata.
- Existing recipes, nutrition references, gram weights and library recipe logging remain unchanged. The authorized diary presentation snapshot now includes the custom-food entry button.
- tests/custom-foods.cjs covers calculations, override, validation, images, totals, portions, reuse, duplicate prevention, removal, legacy isolation, backups and failed-storage rollback; it is included in Mobile app checks.
- Final verification: commit c3aa447d51248ced180f01a6da9a350dd89c3009; Mobile app checks run 39597968713 and Pages deployment 39597968115 passed. Chromium exercised creation, required photo selection, invalid values, live calorie override, saved-food portion reuse, reload persistence, deletion and backup photo metadata at 320/390/430px. The final form/diary screenshot was visually reviewed.

## Previous visual update — food logging, 21 October 2026
- Today's food diary now matches Home with a dark green nutrition-photo overview, bright calorie progress and readable macro tiles. Individual logged meals use white cards with small matching recipe photographs.
- New food entries save recipeIndex alongside the existing name/servings/macros. loggedRecipeIndex validates the indexed name, then resolves old entries by exact recipe name. The two same-name Turkey avocado sandwich variants are disambiguated by saved nutrition; if ambiguity remains, matching photographs must agree. Unknown foods use a neutral utensil icon, never an unrelated dish.
- Thumbnails open the existing recipe. Logging opens and scrolls to the diary. Broken thumbnails have a neutral fallback.
- Recipes, gram weights, nutrition calculations and saved totals are unchanged. Only the user-authorized foodDiary presentation snapshot was refreshed; all other approved food snapshots remain protected.
- Verified commit 369400c099b0cb0afc501f588f4bc5c0901b3b45; Mobile app checks run 39595431515 and Pages deployment 39595431230 passed. All 157 logged recipe photos were checked, along with legacy references, backup identity and rendering without storage changes. Chromium passed at 320/390/430px including photo decoding, persistence after reload and thumbnail navigation. The diary screenshot was visually reviewed.

## Previous visual update — Progress and Train, 21 October 2026
- Progress summary tiles now use relevant gym, dumbbell and body-weight photographs. Four-week consistency has a dark green landscape photo; the weight-trend panel uses a scale photo under a light overlay and a white chart surface.
- Workout-history cards show the corresponding logged program's cover, with readable date/title overlays and light expanded details. Old logs without a recognized workout ID use a related title-based cover or Full Body fallback.
- Train exercise shortcuts show the same stable individual photos as their exercise cards. View controls have a subtle logbook backdrop, and expanded logging panels have a more visible photo while keeping white entry fields.
- Harmony CSS must remain AFTER train-photo-refresh and all other legacy style blocks so the Train imagery is not overridden.
- Verified source commit: 196a5afa42271176fdcf22788a780c34ef4ca0ae. Mobile checks run 39593773017 and Pages deployment 39593773338 passed. Chromium checked 320/390/430px, all 65 choices, data preservation, history, logging, backups, and empty/single-entry/populated Progress states. Progress and Train screenshot sheets were visually reviewed.
- Saved data, prescriptions, recipe content and calculations remain unchanged.

## Current release — 21 October 2026
This section supersedes earlier category/program counts below.
- Train now has 12 categories and 65 choices: 64 fixed programs plus the existing rotating Full Body plan.
- New Kettlebell category contains ten complete six-exercise sessions: Foundations, Full Body Strength, Lower Body, Upper Body, Core & Carries, Hinge & Swing, Single-side Strength, Low-impact Basics, Controlled Conditioning, Double Bell Strength.
- Kettlebell sessions include sets/reps or duration, rests, per-side markers, warm-up, cooldown and technique cues. Timed loaded exercises retain kg inputs through exerciseHasLoad(x.load).
- Kettlebell works in the Train chooser, Home cover, planner, builder category and saved/backup data validation. No IDs or prescriptions in the original 54 fixed programs changed; the regression fixture now protects all 54.
- Eleven original generated still-life gym photographs live in train-images/*.jpg (about 1.2 MB total). These are background decoration, not exercise demonstrations. All were visually inspected before compression.
- trainingExercisePhotos(plan) assigns stable distinct relevant equipment photos to each exercise in every built-in session. It does not depend on catalogue loading or logged sets. The workout hero retains the category photo; progress, rest, guide and finish panels use separate photos. The expanded logger shares its card's photo under a light overlay.
- Verification: Mobile app checks run 39591657316 passed on commit fc7c44fc06f55c570ae223285cb92b2e78960039; Pages deployment run 39591657240 passed. The six-panel Train/Kettlebell screenshot was visually reviewed.
- Mobile checks cover 320/390/430px, all 65 choices, distinct exercise photos, timed kettlebell load inputs, draft persistence, planner assignment and existing app behavior.

## Earlier implemented request
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


## Verified own-workout release
Code a14e584f49f15eeafe330f01deb00020bb95eb01: mobile workflow 39500632783 (job 118896916072) and Pages deployment 39500631485 succeeded. All eight non-browser suites passed; Chromium creation, free-text names, cover selection, save-for-later, start, set persistence after reload and standard training passed at 320/390/430px with no browser errors. EZPZ_OWN_DATA builder/saved/Train contact sheet visually inspected. Approved food and all built-in workout prescriptions remain unchanged. No known release blocker.

## Verified meal sections — October 20
User explicitly requested High protein, High carb, High fat, and Balanced meal sections with matching photography. Implemented four compact photo tiles and section heading/count, combining existing meal-type and ingredient filters. Default Balanced contains all original 49 meals, completely unchanged. Added 18 portion-adjusted dishes (six per focus), appended at indices 49–66. They reuse photos of the same original dishes with the same ingredient sets; the UI explains that listed grams define portions. No new photographs were generated. All 67 recipes are available in planning, diary and shopping.

Focus sorting conventions: protein >=35%, carbs >=55%, fat >=40% of macro-derived energy. See docs/meal-sections-2026-10.md. Storage schema and old recipe IDs remain stable. Updated tests preserve original food data and every protected food function except intentionally changed eat/filterRecipes. 172 portion cases, focus thresholds, matching photo ingredients, and new-recipe logging are covered.

Implementation b37edb1079911b05c91ce686768e15b8a4c167f3; final screenshot test 680c52024050ca164ec939254cb1e6f45db274c9. Mobile workflow 39502710544 (job 118903923332) and Pages deployment 39502710575 succeeded. All eight unit suites and Chromium at 320/390/430px passed. Four-section screenshot sheet was visually reviewed from EZPZ_MEALS_DATA logs. No known release blocker.

## Meal category expansion — October 20
User requested 10 more meals per new category. Appended 30 portion-adjusted dishes at indices 67–96, keeping every previous recipe unchanged. High protein, High carb and High fat now contain 16 each; Balanced retains 49. Total 97. The dishes reuse the matching original photos and same ingredient sets. All new names are distinct from previous names. Gram-based nutrition and focus thresholds are unchanged.

Added a snapshot of the first 67 recipes to protect them. Recipe tests cover all 30 new meals through diary/shopping handlers, 292 portion cases and same-dish photo checks. Browser checks cover all category counts, newest dishes at half/double portions and planner availability. Verification pending for this commit.

## Verified 97-meal release
Final code 74cc8388888cf73f421c88ab53b7d4cbcb69ca66. Mobile workflow 39503987459 (job 118908184068) passed all eight unit suites and Chromium flows at 320/390/430px. Pages deployment 39503987119 succeeded. Four-category contact sheet visually reviewed. Newest recipes tested at half/double portions; all 30 additions checked through diary/shopping handlers; 292 portion cases passed. The browser test found an existing 320px recipe-detail margin overflow; a scoped media rule now aligns hero/detail margins with the small-screen body padding. Previous 67 recipe data and all workout definitions remain unchanged. No known release blocker.

## Popular-ingredient meal collection — October 20
User requested another 15 recipes per category and suggested kiwi, apples, banana, blueberry, Greek yogurt, cottage cheese, chicken, beef, peanut butter, avocado, mango, honey and oats. Scope communicated as all four categories. Added 15 new dish families with four gram-weighted profiles each: 60 appended recipes, IDs 97–156. Totals now 31 protein, 31 carb, 31 fat and 64 balanced (157 total). Prior 97 recipes remain exactly unchanged; new recipes appear first in the browsing sections.

Generated 15 new individual dish photographs with the built-in image-generation tool. The four profiles of a dish share its matching photograph. Existing images remain unchanged. See docs/meal-collection-2026-10.md and docs/meal-collection-prompts-2026-10.json for ingredients, generic nutrient references, photo paths and prompts. Added four food references: green kiwi, mango, honey and cooked 95% lean ground beef crumbles. Prior ingredient reference values are untouched.

Tests protect the first 97 recipe objects, four new references, 15 new images, four distinct gram profiles per dish, focus thresholds, all new diary/shopping paths and 532 portion cases. Browser tests include new kiwi dishes in every section and half/double portion rendering. Unit recipe and planner-picker checks passed in memory; real asset/Chromium verification pending.

## Verified 157-recipe release
Code b67c9fcc8b6bbe69a88be669a67eaddaca21395a. Mobile workflow 39507765809 (job 118920894856) and Pages deployment 39507764883 succeeded. All eight unit suites and Chromium at 320/390/430px passed: 157 recipe image references, all 15 new photo assets, 532 portion cases, new profiles, search, logging/shopping, planner and existing workout/backup behavior. Four-section screenshot sheet was visually reviewed from EZPZ_MEALS_DATA logs, and every new photograph was individually reviewed in contact sheets. All existing 97 recipes and their data remain unchanged. Photos are 640px JPEGs, approximately 1.48 MB total for the 15 new assets. No known release blocker.

## Home visual overhaul — October 20
User requested a finished, polished front page after sharing the existing nutrition/week/upcoming cards. Refined Home only: horizontal dark-green branding, date hierarchy, larger photo workout hero with clear CTA, real calorie percentage ring, colored macro tiles with explicit Chromium/Firefox progress fills, dark weekly card with dated day markers, tighter upcoming-workout rows and deliberate dashed planning placeholders, and coordinated weight/settings footer.

All new styles are scoped to body[data-view=home] in home-visual-overhaul. Home markup adds presentation for the ring and day numbers; homeOverview, scheduling, food, logging, goals and storage readers/handlers are unchanged. Calorie totals remain exact; arc caps at 100% while percentage/over-target labels report real values. No recipe, workout definition, image asset or saved-data changes.

Home unit checks passed for empty, populated, over-goal and resumed/completed states. Existing training/schedule tests passed in memory. Added mobile Home component screenshots and checks at 320/390/430px; inspect EZPZ_HOME_DATA and confirm Actions/Pages before declaring verified.

## Verified Home visual refresh
App code 020e5c26e8b98377db6b6c67eee88b5a0035f4e1; final screenshot-test commit 5841fe8fe91515eabc8e5632a47dd98e4eb6caae. Final mobile workflow 39509492631 (job 118926666854) and Pages deployment 39509491902 succeeded. All eight unit suites and Chromium at 320/390/430px passed. Unobstructed Home top/nutrition/week/upcoming screenshot sheet visually reviewed from EZPZ_HOME_DATA. The test capture scroll alignment was adjusted to keep fixed navigation out of component crops; app behavior was unchanged by that follow-up. All 157 recipes, workout definitions, scheduling and saved-data behavior remain intact. No known release blocker.

## Relevant photo backgrounds across Home — October 20
User requested photos behind every Home card, like the selected-workout hero, with relevant and different subjects. Added four new built-in-generated background assets: home-images/nutrition.jpg (healthy food spread), consistency.jpg (coastal walking), planning.jpg (gym equipment) and weight.jpg (blank-display scale). 960px JPEGs, approximately 494 KB total. Each was visually reviewed before commit. Source prompts and asset paths: docs/home-photo-backgrounds-2026-10.json.

The three macro tiles also use different existing relevant food photos: chicken quinoa (protein), overnight oats (carbs), salmon/olive oil (fat). Dark directional overlays, localized contrast surfaces, bright numbers and retained green/gold/blue macro cues preserve legibility. These are decorative illustrations, not photographs of the user's actual logged meal, weight, or session.

Implementation is Home-scoped CSS only; all markup, data readers, navigation, scheduling, food recipes and storage are unchanged. The existing workout hero and matching upcoming thumbnails remain. Added actual background URL/HTTP checks and weight-card screenshot to the mobile Home review sheet. Unit Home checks pass. Confirm Actions and inspect EZPZ_HOME_DATA before declaring verified.

## Verified Home photo backgrounds
Code f5bc6c855014f3f573c0259209bd5209af01a8e6. Mobile workflow 39510779272 (job 118930961455) and Pages deployment 39510778316 succeeded. All unit suites and Chromium at 320/390/430px passed, including real background-image URLs/HTTP availability and unchanged stored data. The five-panel Home/nutrition/week/upcoming/weight screenshot sheet was visually reviewed from EZPZ_HOME_DATA logs. Relevant photos are clearly visible behind every main Home card and the macro tiles, with readable overlays and unchanged workout thumbnail mapping. All 157 recipes and training/planning behavior remain intact. No known release blocker.

## Train photo styling — October 20
User approved Home photo backgrounds and requested similar visuals for Train. Added a photo header that follows the selected workout's cover, equipment backdrop for session progress and options/footer, calm coastal imagery for the rest timer, and matching muscle-group cover backgrounds behind exercise summaries. The logging surface uses a very faint equipment photo under a nearly opaque light layer; input fields stay high contrast. Refined view tabs, jump chips, checked/invalid states and Finish bar.

No new assets: reuse approved workout-category photographs plus Home planning/consistency images. Summary photos are decorative category covers, not verified demonstrations of each named exercise. No unapproved technical exercise imagery enabled. Custom/unknown exercises fall back to their workout cover.

Implementation: new Train-only stylesheet; only train() presentation markup gains two escaped CSS cover variables (workout header and exercise cards). Exercise definitions, input IDs, saved fields, selectors, logging/timer/navigation logic and state schema are unchanged. Unit training suite passed in memory. Added assertions that all 55 workout headers follow the chosen photo and screenshots of header/progress/rest/logger/footer. Confirm Actions and visually review EZPZ_TRAIN_PHOTO_DATA before declaring verified.

## Verified Train photo refresh
Code f66fa2dd84ed4f8b377d2b7d0f0583d02d176baa. Mobile workflow 39511828306 (job 118934472523) and Pages deployment 39511828705 succeeded. All unit suites and Chromium at 320/390/430px passed, including all 55 header-cover associations, saved set entries after reload, checked/invalid rows, rest-timer persistence, focus/all navigation, custom workouts and completion/history. Five-panel header/progress/rest/logger/footer screenshot sheet visually reviewed from EZPZ_TRAIN_PHOTO_DATA. Home and all 157 recipes remain intact. No known release blocker.

## Distinct workout program covers — 2026-10-21

- All 65 workout choices now have explicit relevant cover mappings, with distinct images within each of the 12 categories (including all ten kettlebell choices).
- Added 38 optimized 960×480 generated JPEG covers, retaining the main category photos and reusing relevant movement photos across categories. These are decorative covers, not exercise technique demonstrations.
- Selected program covers follow through Home, Train, planner, previews and history. Custom workouts retain category fallbacks. Kettlebell program counts now reflect the actual ten choices.
- Mapping and generation provenance are recorded in docs/program-cover-mapping.json and docs/program-covers-2026-10.json.
- Workout prescriptions, saved-data schema and all approved meal content remain unchanged.
- Local workout-photo, training, planning, planner-picker, recipe and training-usability checks passed. Push and Arms chooser visuals were reviewed in the mobile preview. Full hosted mobile CI passed: run 39641858707, job 119367162984, on cc1bffd7fa98ff9b7f10797be96a5c8b8d76965f. GitHub Pages deployment 39641856482 succeeded. Cover implementation commit: fdfdf73731efd18d228465eba5a6b07c50990c3a.

## More page visual harmony — 2026-10-21

- Reworked More with a larger photo hero, forest-green personal card, blue equipment-backed measurement settings and warm gold display settings. Existing local photos are reused without extra downloads.
- Larger photo-backed tool links and photographic disclosure headers tie guides, history and backups into the same visual style. Settings behavior and saved-data formats remain unchanged; the units class is styled only within More.
- Reviewed top preferences and expanded tools/backup sections in browser preview. Local name and units checks passed. Full Mobile app checks run 39645729719 (job 119380668917) and Pages deployment 39645728313 succeeded on bfa21536eeb4d433da3636d20c2b571b42a9e0e3.

## Why EZPZ method introduction — 2026-10-21

- Added a small Why EZPZ? button at the top-right of Home. Opens a native modal bottom sheet with photo-backed Eat, Sleep, Progression and Zone cards, followed by Stronger together and Why a simple system helps using the approved wording.
- Zone means mental state. This is an optional introduction without extra scores, tracking or changes to saved records. Uses existing local photos, readable overlays, sticky close control, Escape dismissal, native focus return and Got it.
- Reviewed panel visuals and keyboard dismissal in browser preview. Home and planner-picker local checks passed. Mobile suite now checks all four pillars, phone-width fit, Escape/focus return, Got it and unchanged browser data at 320/390/430px.
- Full mobile checks 39651209043 (job 119399691522) passed; Pages deployment 39651206734 succeeded on 6988fd61254dd45c9270829d322b1536f3198354.

## Method background corrections — 2026-10-21

- Sleep now uses a dedicated calm bedroom photo. Stronger together has a balanced morning routine (breakfast, journal and walking shoes), and the simple system section has an open planner background. Dark green/blue overlays and light text preserve readability; approved wording is unchanged.
- Added three optimized 960×480 JPEGs in home-images/method-{sleep,together,system}.jpg. Built-in image_gen prompts recorded in docs/method-backgrounds.json; all source images visually reviewed.
- Full Mobile app checks 39652842214 and Pages deployment 39652841214 succeeded on c8f1b8531ffe55e8d8f866f47987db2347c8fd5d.

## Home method tile and Trainer separation preparation — 2026-10-21

- Replaced the two pale Home pills with a compact forest-green method tile and four colored EZPZ letters. Native modal behavior and accessible Why EZPZ label retained. Preview visually reviewed, Home checks passed; full Mobile checks 39654460397 and Pages deployment 39654456950 succeeded on 10fc1e4f6d9715d66e050d2e76b09e23e3ef6b2f.
- Trainer is the separate self-contained index.html coaching app, with manifest.webmanifest, sw.js and icon.svg. Exact unchanged source package and SHA256 manifest are committed under docs/trainer-separation. No client records are included.
- Repository separation is NOT completed: GitHub connector has no repository-creation operation; browser GitHub/new requires sign-in. Need user-created destination repo (suggest EZPZ-Coach) and connector access. Transfer source, enable and verify hosting, then update fitness.html Trainer link. Keep old Trainer route until verified; review old root service-worker scope before removing it. Same github.io origin preserves localStorage access if keys remain unchanged; other origins require backup/restore.

## Trainer repository separated — hosting activation pending

- User authorized an existing repository from their list. reimerskasper-creator/Ezpz contained only README.md; preserved it and committed exact Trainer index.html, manifest.webmanifest, icon.svg and sw.js plus deployment workflow and TRAINER.md. Canonical Trainer source now resides in Ezpz; fitness.html remains in Ezpz-trainer.
- Destination commit ce6d74ccafc60ce55ad1138eeb7a85b1f4ac77ab, Deploy Trainer run 39655223019. Trainer script/manifest validation passed. configure-pages failed first-time creation with Resource not accessible by integration. User must set Ezpz Settings → Pages → Source: GitHub Actions, then rerun workflow.
- Old Trainer route and fitness.html link deliberately retained pending successful destination deployment. Once live is verified, update Trainer link and replace old Trainer source with compatibility redirect; review root service worker before removal. No client records copied or changed.

## Trainer split completed — 2026-10-21

- Standalone Trainer canonical source: reimerskasper-creator/Ezpz; live https://reimerskasper-creator.github.io/Ezpz/. User enabled GitHub Actions Pages. Deploy Trainer run 39655223019 attempt 2, job 119414687105 succeeded. Downloaded live HTML SHA256 af65331532046f49748832e4df1705291d1279520918f891d88060d83719b0f4 exactly matched original Trainer source.
- Fitness header now links to standalone Trainer. Old Ezpz-trainer/index.html is a compatibility redirect to the new Trainer, preserving query/hash and leaving browser records unchanged. Same github.io origin and unchanged Trainer keys retain saved records. Old service-worker files retained for installed-client compatibility; do not clear browser data.
- Fitness canonical URL remains /Ezpz-trainer/fitness.html. Future Trainer edits belong in Ezpz, fitness edits in Ezpz-trainer.

## Four foundations and daily Zone — 2026-10-21

- User approved all proposed scope: Home now has a 2×2 Eat, Sleep, Progression, Zone layout, captioned Your four foundations. Eat/sleep/zone have Today context; Progression retains weekly training target. Existing Progress page three-metric history remains unchanged.
- Lavender Zone ring opens a native modal asking whether the user made time for themselves today, with walk/breathing/meditation/journaling/distraction-free examples. Save fills ring with checkmark; reopen to undo. No timer, mood score or required activity.
- zoneLog maps local date strings to true, validated on use and backup restoration; missing values default to empty. Save is idempotent, undo removes only today's flag, and failed persistence rolls back. Stale dialogs crossing midnight reject changes and request reopening. Existing workouts, food and measurement records unchanged.
- Browser preview reviewed check-in modal and completed ring/focus return. tests/zone.cjs verifies persistence, idempotence, undo, separate dates, restore validation and failure rollback. Browser tests verify four ring order, panel width, reload persistence, undo and preservation at 320/390/430px. Local Home/sleep/habits checks passed; full Mobile app checks 39658185339 and Pages deployment 39658185929 succeeded on dd180335c6dab2932034656a8374dab573f15127. Trainer was not edited.

## Overall foundation ring and direct Sleep entry — 2026-10-21

- Removed Home sleep logging bar. Sleep ring remains the entry point to log sleep and adjust goal.
- Fifth, read-only Overall ring above the four pillars automatically averages raw Eat macro completion, sleep duration/goal, weekly training-day completion and today's binary Zone. Each contributes 25%, capped independently at 100%. Missing/unlogged values count zero. Average rounded down; 100 only if every pillar is fully complete. Thus 26 minutes short of an 8h sleep target with other pillars complete yields 98%, one minute short 99%.
- Overall color bands use displayed integer: 0–25 red, 26–50 orange, 51–69 yellow, 70–100 green. Expandable explanation discloses mixed daily/weekly periods, caps and that this is goal completion rather than health/wellbeing scoring. Existing four pillar colors remain unchanged.
- Pure tests/overall.cjs checks precise sleep/macros, caps, no early 100, missing goals, invalid values and boundaries; existing sleep/Home checks pass. Browser suite updated to log through Sleep ring and confirm Overall exists and bar absent. Preview visually reviewed red Overall and expanded explanation.
- Full Mobile app checks 39659910246 and Pages deployment 39659910250 succeeded on b88b21059f4e98f4b9dd602be573db7e9dd825b9. No new saved fields or Trainer edits.

## Connected five-ring foundation map — 2026-10-21

- User approved four corner rings around centered Overall with lit paths. Home now places Eat/Sleep top left/right, Progression/Zone bottom left/right and slightly larger Overall centrally, in a compact 350px map (340px narrow phones).
- Four decorative steady SVG paths are dim until something is logged: today's food entries, sleep entry for today's wake date (including zero minutes), at least one training day this week, today's Zone check-in. Lit does not mean full completion; original scoring, caps and red/orange/yellow/green thresholds remain unchanged. Paths ignore pointer input, center is read-only, corner actions and accessible labels retained.
- Shortened corner helper text. All long explanation moved into How your overall ring works directly below the map, including logged-vs-complete distinction. Existing Progress-page ring layout unaffected.
- Preview visually reviewed collapsed map and lit Zone path. Local Home, Zone and overall tests passed; pure path assertions added. Browser checks assert no five-ring visual overlap, corner touch targets, path state after reload/undo at 320/390/430px. Full Mobile app checks 39661733899 and Pages deployment 39661732622 succeeded on 82f0f8fef4ff1235509fbb19b64cf48ec06b5a1d.

## Daily Progression and softer Home card — 2026-10-21

- Progression now measures the best saved session on the current local day, not weekly training days. 100% requires every saved exercise's planned sets to have explicit done=true and positive finite reps/duration; prescription count prevents omitted planned sets from appearing complete. Partial session ratios are not pooled; yesterday/future records and drafts do not count. Overall now uses the daily percentage too; all four pillars are daily.
- Removed weekly count in Home card heading, training meter and dated weekday boxes. Progress-page weekly statistics remain unchanged. Footer links to training history.
- Curved connecting paths, softer ring backgrounds, radial glow and rounded explanation area reduce rigid framing. Preview visually reviewed. Existing data and prescriptions unchanged.
- Added tests for full and partial daily sessions, unchecked/invalid reps, omitted planned sets, missing exercise sets, multiple partial sessions, yesterday/future exclusion. Home, Zone and overall local checks passed; browser asserts weekly strip absent. Full Mobile app checks 39663266925 and Pages deployment 39663266091 succeeded on d5544ed50c658578fde81384703080374bd172aa.

## Compact row of four with Overall below — 2026-10-21

- User approved removing all connectors and arranging four smaller equal rings (Eat, Sleep, Train, Zone) in one row, with a larger Overall centered beneath. Removed foundationPaths rendering/function and related obsolete assertions. No scoring or saved-data changes.
- Removed visible helper sentences under rings; detailed state remains in accessible labels and the original tap views. Train is the short Home label; method explanation still calls the pillar Progression. Expandable score explanation remains below with updated wording and no path references.
- Preview visually reviewed. Home, Zone and overall local checks passed. Mobile suite asserts one top row, centered Overall beneath, non-overlapping ring visuals, usable touch targets, no paths and unchanged interactions at 320/390/430px. Full Mobile app checks 39664651191 and Pages deployment 39664650184 succeeded on 7f8cbf1edcb1db14009a3ee041c8393625b74cab.


## Workout support photo update verified — 2026-10-21

- Recovered interrupted update f67ab388c271a8f8404ce2a69556e8488c9c32a8. Next weight now uses a green hinge-photo panel, Swap exercise a blue kettlebell-photo panel, and Technique tips a gold guide-photo panel. Existing local images reused; light set-entry fields remain clear.
- Train-scoped presentation only; no changes to logging, exercise prescriptions, saved records or approved meal content.
- Local training-usability, training, workout-photos and protected recipe checks passed. Live HTML SHA256 matches checked source. Pages deployment 39678494294 and Mobile app checks 39678494983 both succeeded. Live browser review confirmed photo panels and functioning swap/technique disclosures. Local Chromium unavailable; hosted mobile CI provides responsive verification.

## App-wide daily-use refinement — 2026-10-21

User approved all ten review recommendations plus the two smaller fixes. Continue this same canonical app.

- Train: compact photo header with expandable session details; one progress row; horizontally scrolling exercise shortcuts; compact idle timer that expands while running. Set inputs now precede next-weight/swap guidance. Existing photos, guidance, focus/all modes, checked-set rules, timing and draft storage remain.
- Home: read-only featured-session resolution prefers the selected unfinished session, otherwise today's scheduled workout or a recovery card, then selected fallback. Starting explicitly selects/persists the featured workout and plan date with rollback on failed save.
- Progress: first-use welcome instead of empty weekly/macro/exercise charts; relevant charts appear with records. Existing weight visibility, history, corrections and trends retained.
- More: everyday planner/shopping shortcuts first, direct backup shortcut, name/units/display grouped in a collapsed Profile & preferences disclosure. Existing settings and backup data retained.
- Workout chooser: equipment, experience and maximum-duration filters with reset/no-match state; filters persist and survive validated backup restore. Duration uses the upper end of the published range. Labels use programName consistently; rotating plan includes its A/B session. Historical records are not renamed.
- Eat: logging and open diary first, compact target settings below recent meals, direct My plan button. Removed duplicate custom-food button inside the diary. Recipe photos, all 157 recipes, ingredients, portions, nutrition values and instructions unchanged.
- Planner: confirmed Log as eaten action uses selected recipe, exact portion and past/today date; future logging disabled. Planning itself never logs meals.
- Shopping: grouped grocery sections, live remaining count, saved checks, compact management disclosure, relevant photo header and planner back link. Removed unrelated exercise-library link. Plan updates replace previously tracked contributions for the selected dates instead of repeatedly adding them. Manual ingredients, other-date contributions and legacy untracked lists are preserved; older contributions cannot be inferred retroactively. Increased requirements uncheck affected items; unchanged requirements retain checks. Storage failure rolls back updates, clears, checks and individual recipe additions.
- Custom-food photo is optional with Main meal selected by default; the photo selector is collapsed. Invalid supplied photo IDs remain rejected.
- Added tests/daily-refinement.cjs and tests/daily-refinement-mobile.cjs. Existing tests adapted for intentional disclosures/names/default photo. Only explicitly authorized shopping/diary UI snapshots changed in the protected fixture; recipe/reference baselines remain intact.

- Verification: all 20 current local unit/regression suites passed. Full existing Chromium mobile suite passed at 320/390/430px with zero browser errors; new daily-refinement browser flows also passed at all three widths. Phone screenshots of Train, filters, first-use Progress, More, Eat and grouped shopping were visually reviewed and refined.
- Final Home choice check: choosing an alternative workout from Home opens that selected workout in Train, without changing the scheduled calendar. Selection rolls back on storage failure. Added a phone regression for the explicit choice and preserved calendar; it passes at all three widths.

- Release verified: final source 34efdf4d3522aeff97f0238896892edc94d0258d passed hosted Mobile app checks 39682599005 (job 119508556200); Pages deployment 39682598310 succeeded. Downloaded live HTML blob cf1388ac851e64e8271446b5e7080df3ae727fc6 matches local tested source. Live Home, compact Train and More daily tools/preferences were inspected. No known release blocker.

## Tappable Overall and weekly foundation progress — 2026-10-21

- Overall is now a keyboard-accessible button opening a native modal sheet with the existing scoring explanation. Close, Got it, Escape, backdrop dismissal and native focus return are supported. Removed the standalone explanation disclosure from Home; daily scoring is unchanged.
- Under Overall, a compact Monday–Sunday grid shows Eat, Sleep, Train and Zone in their existing colors. Daily progress fills each marker; completed goals get checks, today is outlined, and future days are faded. Missing entries and logged zero values remain distinct. Encouraging copy counts individual completed foundation goals, not healthy days or weekly training targets.
- Historical day values use current nutrition/sleep goals explicitly. Training uses the same best-saved-session completion rule as the daily ring, with no pooling of partial sessions, and excludes future timestamps. No new state or storage writes from rendering or modal interaction.
- Added foundation-week unit and phone-browser suites covering historical grouping, partial/full/missing/zero logs, future dates/times, week boundary, modal controls/Escape/focus, reload/data preservation and layouts at 320/390/430px. Those suites and existing Home/overall/Zone/sleep/habits/daily-refinement/protected recipe checks passed locally. Weekly grid and explanation screenshots were visually reviewed.

- Release verified on 7b6b27886db58734bbef76ad2babebbeac5edb2d: hosted Mobile app checks 39685757157 and Pages deployment 39685756851 both succeeded. Downloaded live HTML blob b6dc94a57843c3cc81d3efdb6790fbb973ff9e1d matches the tested source. Live weekly grid and Overall open/Got it interaction were verified. No known release blocker.

## Weekly foundation shortcuts — 2026-10-21

- Weekly cells are now native buttons, with category/date/status labels and keyboard focus. Future cells remain disabled; the navigation handler separately rejects future/invalid dates and unknown categories. Small-box appearance is retained with a 32px minimum height.
- Eat opens the selected date's food diary. Sleep opens that wake-up date with its existing hours/minutes and today's date as the maximum; ordinary Sleep links still start on today.
- Zone opens the selected date's check-in, with dated wording and explicit save/undo. Historical changes are allowed only through the explicit past-day path; the original saveZone API stays today-only by default. Future dates, stale dialogs crossing midnight and failed writes are rejected/rolled back. Opening a check-in never completes it.
- Train resumes today's unfinished selected/scheduled workout, or opens a selected-day history view when there is a saved session. Past days open their own saved sessions and the existing set editor. Empty past days are shown honestly; no sessions or dates are invented. Editing preserves the original session date and updates the weekly marker from the saved result.
- Expanded foundation-week browser tests verify all category/date routes, past sleep saving, past Zone save/undo, past workout set correction with date preservation, today's draft resume, future guards, unchanged data on opening and all phone widths. Zone unit tests cover explicit historical opt-in and storage rollback. Related Home/sleep/overall/weekly/protected recipe suites passed locally; updated cell styling visually reviewed.

- Zone focus return retains the initiating control after a saved check-in: the main Zone ring for normal entry, or the selected weekly cell for weekly entry. The expanded phone suite verifies this along with selected-day navigation and passes at all three widths.

- Verified release: final source c99b16db5cdbfffd12d73b08a6504aff4f5f9f0e passed hosted Mobile app checks 39687601014; Pages deployment 39687600411 succeeded. Live HTML blob 0f60e7428d5766cb241ebe29c41b0eb6bbba45f6 matches the tested source. Live weekly buttons and a past-day Sleep route were inspected. No known release blocker.

## Weekly progress rings — 21 October 2026
- Replaced all 28 weekly square progress cells with SVG rings matching the four foundation colors. Arcs start at twelve o’clock and fill clockwise with the existing exact daily percentage; completed rings retain checkmarks, today has a circular halo, and future rings remain faint and disabled.
- Existing selected-date log shortcuts, calculations, records, recipes and top five rings remain unchanged. Phone verification at 320/390/430px checks arc percentages, circular styling, no box fills, all navigation/save flows and record preservation. Weekly math, Home and protected recipe checks passed; screenshot visually reviewed.
- Published source 06340f03fede61b245afa0f537b1dc1c51ed9449: Mobile app checks 39688720514 passed; Pages 39688719432 succeeded. Live HTML blob e44e208b9d6d87d4345a77fc56f906610424064c matches the tested source.

## Approved EZPZ branding — 21 October 2026
- Header now uses the approved four-letter square emblem beside EZPZ Fitness. Removed the separate Home method tile; a horizontal gold/blue/mint/lavender EZPZ wordmark sits beside the date below the full-width greeting and opens the existing method dialog. Accessible dialog label, keyboard focus and minimum 44px tap target retained.
- Shared crisp SVG letterforms incorporate fork, crescent, rising arrow and breathing wave; transparent backgrounds support both header and Home. No data/schema, recipe, workout or ring changes.
- Branding checks at 320/390/430px verify assets load, no horizontal overflow, dialog activation/Escape/focus return and no stored record changes. Weekly shortcut mobile suite and Home checks passed.

## Corrected logo artwork — 21 October 2026
- Removed the colored square emblem from the header at user request, retaining white EZPZ Fitness. Replaced the inaccurate SVG recreation in Home with a production image generated from the approved logo reference, preserving the clear fork, crescent, diagonal arrow and wave. The image uses the pale Home background and remains the method-dialog button.

- Removed the external Trainer app link from the top banner at user request. Header retains EZPZ Fitness; no replacement control added pending design choice.

## Compact Home calendar — 21 October 2026
- Replaced plain date with a compact flip-calendar visual: dark green month strip, bold day, subtle page seam/shadow and weekday beside it. Semantic time element provides the complete localized date; no animation or new action. Existing local date source and method shortcut retained.

- Added the visible “Explore the EZPZ method ›” caption below the Home logo within the same accessible button, with subtle pressed feedback and retained keyboard focus. Calendar and logo share the existing compact row.

## Discoverable method banner — 21 October 2026
- Moved the logo shortcut into its own compact dark green banner beneath greeting/calendar. Richer gold, blue, mint and lavender artwork generated from the approved letterforms. Clear “Discover your four foundations” title, foundation subtitle and chevron make the entire button discoverable; it retains the existing explanation dialog and pressed/focus behavior.

## Compact Home introduction — 21 October 2026
- Removed the calendar/date from Home at user request and tightened greeting, method banner and workout spacing. Banner now has a compact 76px minimum height, with 12px spacing between adjacent sections; same readable copy, artwork and dialog behavior.

## Main-tab swipe navigation — 21 October 2026
- Added touch swipes in bottom-nav order Home → Train → Eat → Progress → More. Left advances and right returns; ends do not wrap. Swipes use the existing nav handlers, preserve saved drafts and selected workouts, and reset scroll like a tab tap. A subtle 160ms entrance respects reduced motion.
- Only clear, short-duration horizontal gestures navigate. Inputs/buttons/links/labels/summary controls, nested horizontal scrollers, open dialogs, setup/nested views, selections, multi-touch, cancellation and browser-edge gestures are excluded. Vertical movement/scroll cancels navigation; touchmove is prevented only after a valid horizontal direction is established. Brief ghost-click suppression follows navigation.
- New swipe-mobile suite uses native Chromium touch input at 320/390/430px across all tabs, verifies boundaries/nav selection, draft preservation through swipe/reload and unchanged stored data, plus vertical/short/edge/cancelled gestures, form controls, dialogs, carousels and nested views. Included in hosted mobile workflow.

## Visible nutrition targets — 21 October 2026
- Replaced the small collapsed Nutrition targets disclosure with a prominent photo-backed card immediately below Log food, above Today’s food and favourites/recent meals. It displays actual current calories and protein/carbs/fat goals in matching colored tiles; “Adjust targets ›” and the whole card open the existing editor in one tap.
- Calculations, manual/calculator forms, recipes, logs and saved-data schema remain unchanged. Target math, recipe protection and daily-use unit checks passed; phone suite covers displayed goals, editor access, no record changes and responsive layout.

## Dark exercise cards — 21 October 2026
- Replaced the translucent pale green set logger with an opaque deep charcoal-green surface. Related header photographs remain; one faint equipment accent sits in the bottom corner away from inputs. Solid high-contrast set rows and light numeric fields retain clear completed/invalid/unchecked states.
- Logging actions now use richer green/gold/blue. Next weight, Swap and Technique panels use restrained solid colors instead of competing full photographs; all handlers, draft saving and workout data are unchanged.

## Food diary date panel — 21 October 2026
- Styled the date navigation as a cohesive dark green band between the diary summary and nutrition panel. High-contrast date field, lighter label, outlined day arrows and clear disabled future navigation replace the unfinished pale strip. Native date picker, day selection, limits and stored meals remain unchanged.

## Dark recipe category menu — 21 October 2026
- Restyled the four meal-category tiles as dark forest green cards with white labels, muted readable counts and preserved dish thumbnails. Active category uses a richer green surface and clear mint border; keyboard focus and pressed feedback remain distinct. Existing selection/filtering, counts, recipes and photos unchanged.

## Set completion and next exercise access — 21 October 2026
- Moved Next exercise directly below set validation/last set, ahead of Next weight, Swap and Technique panels. Last exercise note follows the same position. Increased Next action to 48px.
- Added an explicit high-contrast SVG checkmark to checked set controls, restoring a clear completion symbol after dark-card background styling had reset the previous background image. Existing checkbox semantics, validation and draft saving unchanged.

## Footer rest timer and profile panel — 21 October 2026
- Added a compact countdown between Session progress and Finish workout. It shares the existing deadline timer and saved state: tap to start the current exercise rest duration, pause while running, resume while paused, or restart when ready. Updates immediately on Train render and every existing timer tick; no second timer or completion changes.
- Profile & preferences now uses a dark photo-backed summary, lighter labels and clear chevron, matching More’s existing cards. The expandable settings and controls remain unchanged.

## Footer-only rest timer — 21 October 2026
- Removed the large inline timer and its page space from Train. The exercise cards immediately follow the jump selector. Widened the footer countdown with larger numerals.
- Preserved existing presets, pause/resume, clear and Auto after a set in a bottom-sheet dialog opened by the footer ellipsis. Countdown still shares the existing persisted deadline and updates on reload. Main footer timer keeps direct start/pause/resume behavior.

## Eat plan and discovery color harmony — 21 October 2026
- Styled My plan as a dark photo-backed banner and grouped Explore recipes/count/search in a dark green search panel matching meal categories. Existing planner access, recipe search/filtering, counts, dish content and saved records unchanged.
- Navigation/Zone redesign is under discussion only; main tabs and More access unchanged.

## Four pillar navigation and visual overhaul — 21 October 2026
- Resumed user-approved work after conversation interruption. Bottom navigation is Home → Eat → Sleep → Train → Zone; More remains directly available in the header. Swipe order follows the new main tabs; Progress remains accessible through Home and More and Zone.
- Sleep retains the validated dated hours/minutes and goal form, adds a blue-accent photographic introduction, actual last-night status, current-week logged-duration bars and an optional wind-down disclosure. Missing nights remain missing. No generated or illustrative values.
- Zone is now a full lavender-accent page with existing explicit check-in/edit/undo, simple activity suggestions, shared weekly foundation shortcuts and a Progress link. Check-in completion renders Zone again when entered there; Home still preserves its existing behavior.
- Manual workout builder now uses dark forest cards, gold exercise numbers, related cover imagery and high-contrast light fields. Existing options, validations, draft handling and save destinations remain unchanged.
- Updated navigation-dependent mobile tests and swipe expectations. Local sleep, Zone, own-workout, recipe protection, overall, Home, weekly foundation, training-usability and daily-refinement tests pass. CUA inspected Sleep and Zone and confirmed explicit Zone save updates its page and weekly marker. Hosted mobile/deployment checks pending.

- Release verified 22 October 2026 after explicit publication approval: runtime source 4edb40db419b26fb48caf21590e981ce516d61f7 passed full Mobile app checks 39766500498; Pages deployment 39766499855 succeeded. Final live fitness.html matches the locally checked source byte-for-byte. Header More remains visible across pages; original protected base styles retained with a scoped override. Weekly navigation test now returns through persistent Home. No known release blocker.

## Recipe selection from food logging — 22 October 2026
- User requested built-in recipes directly from the custom-food logging entry point. Page now says Log your food and adds a collapsed Choose a recipe section before saved/custom foods: all 157 exact dish photos, current per-serving nutrition, name/ingredient search and empty results state. Choosing a dish uses the existing recipe page, serving selector, selected diary date and explicit Log this meal action. Browsing never logs a meal or modifies records; recipes/macros/grams unchanged.
- Existing custom-food, protected recipe and daily-use suites passed. New daily-refinement phone flows verify searchable choices, no-result state, read-only browsing, date carry-through, 1.5-serving logging and persistence across reload at 320/390/430px. Full Mobile app checks 39768260868 succeeded on runtime source 7974ac26007e301d228d25e4ec7f4db4540234fb; Pages deployment 39768260367 succeeded. Live app matches checked source.

## Diary log shortcut and solid nutrition colors — 22 October 2026
- Added explicit Log food button in food-diary-overview at user-marked area, opening the existing recipe/custom-food entry page without changing the selected date or records. Added solid forest targets and opaque green/gold/blue macro cards with white text on targets and diary.
- Fixed root cause of pale targets/date controls after recipe logging: handler called eat() directly while body data-view remained meal. It now uses openFoodDiary(), which renders Eat and opens/scrolls the diary consistently with custom-food logging.
- Used ImageGen for the requested visual reference; implementation is native CSS/HTML. Only authorized foodDiary protected fixture refreshed; recipes, references, grams, macros and photos unchanged. Local recipes/custom-foods/daily-use checks pass; Pages 39769756884 succeeded on source 8790591643978ac264cf03297ebabb1ded8e8468. Live HTML matches local source. Full Mobile app checks 39769756659 remains in progress, delayed at Install Chromium; do not report it as passed without checking. New mobile assertions verify post-log Eat state, opaque RGB colors, next-log access, unchanged records and phone layout.

## Calm Sleep/Zone overhaul and original pillar marks — 22 October 2026
- User requested richer Home/Train-style forest surfaces, related calming photography, useful explanatory guidance, removal of duplicate top Eat logging and original logo lettermarks on Eat/Train/Sleep/Zone.
- Sleep now has bedroom-photo hero, actual last-night/goal tiles, retained validated date/duration/goal form, weekly chart, sleep-quality explanation, a bedroom story card and reading-corner bedtime tips. CDC source linked. Zone has shore-photo hero and retained explicit check-in/undo, relaxation explanation with NIH NCCIH source, woodland noticing-walk tips, reading-corner breathing/routine tips and shared weekly progress. Informational disclosures never save data. No new timers, health scores, clinical promises or auto check-ins.
- Four generated photographic assets: home-images/sleep-bedroom.jpg, zone-shore.jpg, quiet-reading.jpg and zone-woodland.jpg. Built-in ImageGen briefs: realistic dim sage/linen bedroom with amber lamp at blue hour; quiet empty misty shore at sunrise; dim book/mug/armchair reading corner; peaceful mossy woodland path. Optimized JPGs stored in repository. Existing method-sleep.jpg reused as secondary Sleep imagery.
- Four pillar PNGs are exact crops of approved brand/ezpz-wordmark-banner.png, not the inaccurate legacy SVG. Eat uses fork-E; Sleep crescent-Z; Train arrow-P; Zone wave-Z. Text labels retained for clarity/accessibility; Home unchanged. Train only receives its title lettermark.
- Removed Eat top quick-action banner; retained one diary Log food button opening recipe/custom-food logging. Recipes, portions, macros, existing record schema, Sleep/Zone save rules and controls unchanged. Updated old entry-point tests; expanded pillar unit tests and three-width mobile tests for images, labels, disclosure/read-only state, single logging entry and responsive layout.
- Preview visually inspected Sleep/Zone; sleep save and Zone explicit check-in tested through CUA. Relevant local suites passed. Full Mobile app checks 39772192096 succeeded on runtime source 9886ca0c696a4426ffb639d41603ebfd119b88e6, including 320/390/430px. Pages deployment 39772191673 succeeded. Live HTML and all eight new assets match local bytes. This full successful run also covers the previous diary update whose browser check was pending. No known release blocker.


## Pillar navigation and Sleep field harmony — 22 October 2026
- Footer uses the original E / crescent-Z / arrow-P / wave-Z artwork with clear Eat / Sleep / Progress / Zone text labels; Home retains its icon. The training route remains internal `train` while its user-facing header says Progress. Sleep stays spelled Sleep.
- Sleep date, hours, minutes and goal inputs use the same opaque forest-green field styling as Eat's date panel. Taller logo navigation has a matching finish-bar offset, including safe-area padding.


## Wearable preparation — 22 October 2026
- Home foundations includes a compact Steps today row with an adjustable personal goal; no fifth ring. Steps & calories supports dated manual daily totals, real zero versus missing, seven-day history and persistence.
- Progress/training has a small Active calories today shortcut. Active and total daily energy remain separate and never alter Eat targets or workout completion.
- More → Connected apps honestly reports no automatic connections. Provider cards are preparation only; no OAuth, tokens, background sync, fake Connect action or demonstration user records.
- Version 1 normalized daily import boundary accepts steps, sleep minutes with optional deep/REM minutes, active kcal and optional total kcal. Atomic validation, idempotent updates, stale-revision rejection, corrected-date moves, explicit per-day source choice, preserved manual logs, import timestamps and backup restore are implemented. Manual data wins by default; sources are never summed. Sleep summaries, rings and history use the selected source without replacing original manual logs. Deep/REM only appear when supplied; no inferred stages.
- See docs/wellness-imports.md for the adapter contract and remaining secure authentication/consent/provider mapping work. Actual wearable connections require a later implementation.
- Added tests/wellness.cjs and tests/wellness-mobile.cjs to hosted checks. Updated native swipe surface search to avoid horizontal exercise scrollers, matching existing app gesture exclusions. Fixed the workout finish bar offset for the taller logo navigation.

- Validation: all current local non-browser workflow suites pass. Full hosted Mobile app checks **39780800805** succeeded on source **aeea92968d51abc4278d1ff4bd9aad840cc75572**, covering wellness data and three-width phone flows plus the complete existing app/backup suite. Pages **39780798487** succeeded. This passing full run supersedes pending or failed intermediate checks for the footer and wellness work; no known release blocker.


## Compact workout logging and clean footer letters — 22 October 2026
- User and wife found the Progress/training screen too busy and the first set controls too far below the top. User approved the generated compact concept and explicitly authorized implementation, plus removing the dark backing tiles and purple contamination from footer Z/P/Z.
- Progress now opens with a compact photographic session heading, actual progress line, one Exercises selector and the current exercise's editable set rows. Completed/other exercise cards are hidden in the default focus view. A single Options disclosure contains workout selection, My plan, guide, active calories, session details, the optional All exercises view, next-unfinished shortcut and clear draft. No separate Continue card, view toolbar or exercise carousel remains above the logger.
- Previous results, Use previous, Repeat entered set, rest shortcut, progression, swap and technique remain under Exercise details & tools. The exercise ellipsis opens that disclosure; repeat/copy preserve it after refresh. Next/selector update the active card and return the focused layout to the top without popping up the keyboard. All-exercises mode still scrolls selected cards into view. Set prescriptions, units, completion validation, timer, drafts, history, backups, schedules and food data are preserved.
- Legacy trainingView is retained. New trainingCompactAll defaults to false unless deliberately selected, so existing users who previously selected All get the simplified first view without a data migration. Opening the page is read-only; explicit view changes save.
- Fixed footer now contains only the shared rest timer and Finish action; the session count appears once in the header. Header/first set spacing and touch targets are compact while retaining forest surfaces and related existing workout photographs.
- Built-in ImageGen cleaned the exact existing blue crescent-Z, mint arrow-P and purple wave-Z assets on transparent backgrounds; removed P's neighboring purple fragment. New files: brand/pillar-sleep-clean.png, pillar-train-clean.png, pillar-zone-clean.png. Original crops retained. Footer and pillar headings use clean assets; Eat's original fork-E is unchanged. No backdrop filters or tiles are added. One alpha level of export rounding is allowed at transparent canvas corners; former opaque dark backing pixels fail the test.
- Added tests/compact-training-mobile.cjs: all four rotating-plan set rows fit above the footer without scrolling at 320/390/430px, source-state is unchanged on opening, drafts survive navigation/reload, Next/dropdown, tools and chooser work, and icons have transparent canvas corners. Dedicated compact training checks passed all three widths on run 39785946172. Existing wellness, pillar, foundation and branding checks passed there as well. Native gesture test hit-slop was restored to 28px to keep its start point clear of the new Options control.
- Local current non-browser workflow checks pass, including training, units, rollback, backup and protected recipe suites. CUA visually inspected the implemented page, exercised the picker and confirmed chooser opens outside the collapsed Options ancestor. Preview was stopped. Runtime source b065b337d3e29bcf46b12b514206dcbdb1952f66 is published; later commits refine tests only. Pages run 39785945347 succeeded. Full follow-up mobile run 39787475497 on ebe2b4b2c27b6c504c7e5444e145f2ce38b48e77 is pending; do not claim its full success without checking.

- Follow-up verification: compact workout checks and native swipe checks passed at 320/390/430px on run 39789594728; its remaining failure was an obsolete old icon filename assertion in daily-refinement-mobile, now corrected. Browser installation is pinned to ubuntu-24.04 after ubuntu-latest dependency downloads timed out. Full rerun 39793523857 on 006816485264d645dc037fc303f6a1ea77f80b60 is queued; do not claim the full suite has passed yet. The final app tree matches e94da81 except the intended test expectation change (verified using GitHub compare).


## Release preparation and optional accounts — 22 October 2026
- User approved the reliability/data protection/install/privacy/testing plan and optional sign-in with cloud backup. Account login must remain optional; no forced login screen. Asked to proceed and give owner concrete steps when needed.
- Icon decision: after several concept previews, user approved ONLY the solid Home house. All existing E/Z/P/Z letters stay unchanged. Home is a native solid rounded SVG, 28px, selected cream. Source 050e57ae366f1f75ea1ef36a29116f66d76dadc2; later deployed with e3bbdd8465a4c214db8782cbe6c67509da7d77bb.
- Native Android exercise dropdown's white list replaced with forest-green native HTML dialog, cream text, mint current-state marker, close control and actual completed-state symbols. Existing focus/draft behavior retained. Button retains training-exercise-select ID; choices use data-exercise-pick. E3bbdd source Pages 39797260656 succeeded; its mobile run found the previously known 320px header overflow.
- Fixed narrow compact-header gutter specificity (13px at <=360px); closed Options bodies explicitly display:none, open links use minmax(0,1fr). CUA verified formerly affected Classic Push A at narrow iframe width with no horizontal overflow, including Options and chooser navigation.
- Dedicated Fitness manifest under fitness-app/ with identity/start_url fitness.html and branded PNG icons. Root index/Trainer manifest/old sw left untouched. Fitness registers root fitness-sw.js (root placement needed for scope), which handles only allowlisted Fitness public assets, not Trainer pages, other apps, APIs or foreign origins. Core precache, network-first HTML, bounded static image cache, no forced waiting-worker activation during sessions. A user may need to close/reopen tabs for an old worker to retire. Unseen photos/external exercise details may be unavailable offline.
- More has Your data & privacy and Use EZPZ as an app panels. Honest device-only storage description, download reminder/date (only download REQUESTED, never claims a file was saved), normal export, typed DELETE confirmation for this Fitness storage key/device metadata only, and browser install prompt/instructions. No production records were deleted during QA. Metadata is separate device-local KEY+'-device'; no existing log/backup schema changed.
- All 24 current local non-browser suites passed. New release-readiness unit tests cover read-only rendering, metadata write failure, exact erase confirmation, erase failure, unrelated-key isolation, manifest targets, offline fallback and private-cache exclusion. New browser checks test actual service-worker offline reopen/draft preservation, Home icon, green picker, More privacy and narrow Options at 320/390/430.
- Source 33418723b5722046d2a6133d224769fdfaaf7483 Pages 39800480897 succeeded. Final full hosted Mobile app checks 39801146072 (job 119901845610) SUCCEEDED on 2f2e876119545ba5727f45c32f3269a04e04bd15, including new offline/privacy and compact flows at all three widths and the complete existing suite. CI installs only the Chromium headless shell on ubuntu-24.04; avoids intermittent apt/font downloads. This passing full run supersedes previous pending/failing compact regression notes. Preview stopped.
- Prepared backend/001_optional_backup.sql for a future owned Supabase project: own-row SELECT via RLS, no anon/direct client writes, authenticated checked-revision RPC, auth.uid-derived ownership, 2 MB payload cap, stale-write rejection and cascade on account deletion. This SQL is NOT applied or live-tested. No auth SDK, Google button, credentials, cloud upload or automatic sync is active.
- docs/account-backup-setup.md gives owner setup and security test gates; docs/release-plan.md records stages. NEXT owner step: create a Supabase account/Free project named EZPZ Fitness and stop at project dashboard. Keep database password/secret keys private. Then obtain only project URL/public publishable key; apply and test migration with two test accounts before wiring optional Google sign-in, explicit attach/backup/restore and account switching. Google Cloud client secret is entered directly into Supabase provider settings, never chat/repo.
- Explicit cloud save/restore first; automatic sync only after conflict/account-boundary tests. No automatic merge of browser records into newly signed-in accounts. Native Android packaging/signing and private testers follow; browser-to-WebView storage needs explicit validated migration. Health Connect integration remains later; existing normalized wellness boundary is preserved.


## Optional Google account login test — 22 October 2026
- Owner applied migration 001 and configured Google OAuth in project ezpz-fitness, basic email/profile/openid scopes, own test email, exact Supabase callback and canonical Fitness Site/redirect URL. Live read-only checks: Google enabled, anonymous backup SELECT HTTP 401, OAuth start 302 to accounts.google.com with exact Supabase callback. No authenticated session or personal records used in these checks.
- Implemented optional Save my progress panel in More and onboarding. Vendored maintained Supabase JS 2.118.0 + MIT license. PKCE authorization/code exchange; isolated SDK storage; sign-in identity/status; explicit Check cloud backup; local sign-out keeps records only after explanation/confirmation. Signing in alone does not attach, upload, replace or merge fitness data.
- Full explicit Save/Restore client handlers are prepared behind backupEnabled:false pending live isolation tests. Do NOT flip that flag or claim cloud save is active before verification. Guards include owner identity in device snapshots, verified session, navigator lock, revision CAS, validation, safety download requests, explicit replacement, storage-write-before-in-memory replacement. No background sync and no privileged secret shipped.
- fitness-app/account-config.json enabled:true enables only identity; backupEnabled:false remains. No account deletion automation yet; test users can contact owner for deletion. Public privacy/legal and secure self-service deletion remain release work. Existing device deletion remains device-only and download backup remains available offline.
- Worker bumped version, caches only public JS/SDK as well as existing assets; config and all API/auth requests bypass cache. Original Trainer worker/index/manifest and all E/Z/P/Z artwork preserved.
- 25 local current non-browser suites pass including new tests/accounts.cjs for read-only sign-in, cross-account rejection, write gate, explicit save/restore, stale revision, safety downloads, failed restore and sign-out. CUA inspected 320px More panel, visible Continue with Google and matching sage/forest layout. Hosted full mobile and Pages results still to be recorded.
- backend/002_verify_backup_isolation.sql prepared, NOT EXECUTED. Uses two transaction-local auth rows and real database roles/claims to assert isolation/privileges/CAS/deletion, rolls back. Next owner action after deployed login test: More → Continue with Google in own browser; report success screenshot (no codes/tokens). Then perform backend script plus real second-account checks before activating fitness backup.

- Final verification: full Mobile app checks 39813849081 succeeded on runtime source e50827a7ee5e79e236564beb0b3981ad8ab7612f; Pages 39813847439 succeeded. Live Fitness HTML, accounts module, SDK, config and worker match local bytes. Anonymous REST SELECT and RPC write both return HTTP 401. Cloud writes remain disabled pending real callback/account-isolation tests. First owner action: More → Continue with Google, finish login in the same browser and report the returned screen.

## Android Health Connect work in progress — 22 October 2026
- Development branch `android-health-connect` packages canonical Fitness in `native/` with Capacitor. Browser app and existing account config remain canonical.
- Read-only foreground WHOOP reader, explicit consent/partial grants/settings, last-seven-day snapshots, origin-filtered steps/active and total calories, wake-date sleep and optional stages. Uses existing atomic imports; preserves manual entries and reconciles deletions only for granted native types.
- Node wellness/native snapshot/account/release/recipe checks passed locally. Native compilation and browser execution still need verification: local Gradle/browser downloads were blocked. GitHub Android build workflow prepared.
- Native Google login deliberately disabled pending native callback; Android/browser storage are separate. Verify migration, export/restore and stable signing before relying on this build. Not published to Play; no phone sync claimed yet.


## Product direction and overview-first Home — 23 October 2026
- Authoritative Android branch: android-health-connect. Prior completed source 84d07cce388ebe649a16b5ba0306ebaf119da895; Android source 9dd187e with same runtime passed build 39969646231. Full mobile run 39970105591 passed. Previous APK artifact 12507879633, versionCode 10/versionName 1.0.9. Library APK is libfile_545dd90f73f4819197110900611a1827, version 11 before this batch.
- User's end goal is one editable, easy overview across Eat, Sleep, Progression and Zone: WHOOP for activity/sleep, Cronometer for nutrition, Withings/Lifesum and future Strava/MyFitnessPal/Apple Health/Health Connect coverage. Implement only supported data flows; choose sources per metric and prevent duplicates. No claim that roadmap apps are connected today.
- Current batch moves today's overall and four pillar rings to first Home content, with Start/Resume workout and Log food actions. Existing workout/nutrition/movement/weekly/history content follows; method introduction moves lower. Scores and storage unchanged. Android version 11/1.0.10. Existing mobile suite now checks above-fold rings, ordering and both quick actions.
- CI now skips the redundant owned-Android-branch PR mobile job; its push suite still runs. One runtime commit/build for the batch. Verification and artifact IDs must be recorded after completion; do not infer success.
- WHOOP: direct authorization and launch/resume refresh, two-minute throttle, last seven days and workout imports are implemented/tested; real-world phone accuracy/freshness remains a beta acceptance task. Cycle totals are not calendar-day totals. Cronometer nutrition through Health Connect is the recommended next integration, not implemented in this batch.
- Future workflow: online visual previews and batched APK releases first; evaluate a proper live-update mechanism later. Packaged native functionality/permissions still need native releases. No updater is installed today.
- User asks for early handoffs before long chats fill. No reliable context-capacity meter exists. Keep a compact resumable brief and read this file/AGENTS.md at continuation. User wants lower usage without another paid upgrade.

- Completed overview release: runtime b83b36c2f10330d80071d7105c1d52c42642ae85 passed Android 39985396949 and full mobile 39985397163. APK artifact 12514484664 at https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/39985396949/artifacts/12514484664. Android 1.0.10/versionCode 11. APK Library identity remains libfile_545dd90f73f4819197110900611a1827, now version 12. Local archive checksum and packaged Home content verified. Product brief and handoff saved separately as EZPZ-Product-Brief-and-Handoff.md. Next: owner checks Home/WHOOP daily accuracy; agree Cronometer nutrition reader scope. No live-update mechanism or new tracker added by this batch. Documentation-only completion commits may skip CI; runtime checks above remain authoritative.
