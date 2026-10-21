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

## Latest update — optional weight display, 21 October 2026
- Home's weight shortcut and Progress's weight trend have a Hide weight button. Hiding omits Home's weigh-in card, Progress's weight summary tile, weight trend and logging reminder from rendered markup. Progress becomes a two-tile summary.
- More has a matching photo-backed Display preferences panel with Show weight on Home & Progress On/Off control. Users can re-enable without losing measurements.
- state.hideWeight is an explicit boolean (false/default visible). Restore validates strict true; export includes preference. setWeightHidden rolls back on storage failure. Does not delete measurements, change body-weight-based nutrition calculations, profile, workouts or food logs.
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
