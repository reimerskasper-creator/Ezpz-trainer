## 2026-11-21 — Visual plan builder

## Android 1.0.187 — workout cover studio backgrounds

- Built-in anatomy covers share an emerald studio backdrop across the workout picker and previews, Home, Day and the plan builder. The existing muscle atlas and role mapping supply the highlights. Home retains the banner photo override.
- Based on Android branch commit `c0bb790`. Local source checks passed. Android packaging and mobile visual checks are pending.

- Android 1.0.186 updates the Plan Library day builder with a themed meal replacement confirmation, workout covers and exercise previews in the picker, and photo rows for scheduled workouts and meals.
- Android branch: android-health-connect. Plan Library data and package checks passed locally.

## 2026-11-21 — My Plan order and clean setup

- Android 1.0.185 places Plan library below the daily log and above day tools, omits the default workout from an empty Home schedule, and keeps cloud backup in More.

## 2026-11-21 — Setup pickers and swap confirmation

- Android 1.0.184 uses high-contrast in-app setup choices and a themed confirmation for clearing one exercise’s entries. Setup shows cloud backup in a compact row.

## 2026-11-21 — Simplify My Plan

- Android 1.0.183 removes both Edit day buttons, Workout details & options, and Copy plan & shopping list from My Plan.

## 2026-11-21 — Anatomy covers in My Plan

- Android 1.0.182 uses the same exercise-based anatomy cover in the workout picker and on the main and extra workout cards in My Plan. Saved workouts retain their uploaded cover or generated anatomy. My workouts uses the existing custom-workout anatomy artwork.
- Android branch: android-health-connect. Signed build uses the existing update certificate.

## 2026-11-21 — Hide the Android demo startup placeholder

- Android 1.0.181 reveals the bundled video after its first frame, avoiding the Android WebView's default play graphic during the opening swoosh.
- Android branch: android-health-connect. Signed build uses the existing update certificate.

## 2026-11-21 — Trainer demo player

- Android 1.0.180 opens bundled demos inline with muted autoplay, continuous looping and tap-to-pause. The opening emerald sweep respects the Trainer motion setting and reduced motion. Personal video links remain supported.
- Android branch: android-health-connect. Signed build uses the existing update certificate.

## 2026-11-21 — Complete exercise video library

- Android 1.0.179 bundles 143 approved Trainer exercise loops, including the final corrected Cable Y Raise, Reverse Pec Deck, Bird Dog, Mountain Climber, Dumbbell Squeeze Press, Lateral Band Walk, and Sled Push. The built-in video button plays the bundled clip offline. Personal video links still take precedence.
- Branch: android-health-connect. Android install testing uses the existing update signing certificate.

## 2026-11-21 — Program exercise photo grid

- Android 1.0.178 bundles 48 approved exercise demonstrations. The existing Trainer video button starts the matching clip in a loop. Personal video links and existing links for exercises awaiting a bundled demo are supported.

- Android 1.0.177 displays exercise photos under each program cover in the workout chooser. Tiles show the exercise name and prescription and open available demos. Program details holds the muscle groups, equipment, and training notes.
- Branch: android-health-connect. Native web packaging and runtime checks passed locally. The Android workflow builds the signed update and checks the program layout at mobile widths.

## 2026-11-21 — Barcode recovery screen

- Android 1.0.176 replaces the stopped scanner preview after a failed lookup with a nutrition-label action, a review-and-save reminder, food search, and a barcode rescan.
- Branch: android-health-connect. Barcode, package label, native packaging, and runtime checks passed locally. Android CI builds the signed update and runs the mobile recovery checks.

## 2026-11-21 — Full-width workout focus banners

- Android 1.0.175 uses one scrollable banner per workout focus, the original picker controls, and a full-body anatomy figure with stronger primary highlights over an emerald gradient.
- Branch: android-health-connect. Native web packaging and runtime checks passed. The Android workflow runs the mobile picker checks in dark, light, and personal palettes and builds the signed update.

## 2026-11-20 — Split-view workout category artwork

- Android 1.0.174 applies a full anatomy view and a category-specific detail crop to every workout focus card. Both panels render the existing category muscle masks, including primary traps and supporting triceps for Pull and front-view calves for Legs.
- Branch: android-health-connect. The Android workflow verifies the picker and signs the update.

## 2026-11-20 — Workout recap timing and nutrition readability

- Android 1.0.173 records the first Done checkmark and measures wall-clock time through Finish. The elapsed clock appears only in the workout recap. The independent rest timer stays in the workout footer.
- The collapsed Home food card reuses the expanded Protein, Carbs and Fat boxes. Food details shows a larger macro split ring and keeps a compact layout while the keyboard is open.
- Branch: android-health-connect. Source commit `78d77fa`. Workout timing, macro calculations, Home state and Android packaging passed locally. Android run `44854558092` built and signed 1.0.173 and passed Trainer and recap checks. The broader mobile suite stopped in the flexible-day test before the food layout checks. The APK matches the 1.0.172 signing certificate and launcher icon. Physical installation remains unverified.

## 2026-11-20 — Custom workout exercise photos and controls

- Android 1.0.171 enlarges exercise picker photos and fits the full source image in the picker and both builder states. The expanded editor puts Browse exercises before manual entry, keeps sets and reps together, and moves Remove to the timing options row.
- Zone replaces the beep with inhale and exhale audio synced to the animated phase, including custom previews, with silent holds and immediate mute.
- Android web packaging, Zone state, and native runtime checks passed. Local mobile browser checks were blocked by the runtime's socket restrictions. The Android workflow builds and signs the installable update.

## 2026-11-20 — Zone method picker and audible cues

- Android 1.0.170 builds on `0fbc276` and replaces the inline Zone method menu with a closable sheet. It shows a reason and technique name for each choice, with optional study links. Cyclic sighing starts with a five-minute timer.
- A bundled audio cue plays on enabling sound and on guided phase changes. Custom timing and the orchid layout carry forward.
- Android web assets synchronized and native runtime checks passed. Signed Android delivery uses the canonical GitHub Actions workflow; physical-device sound and installation still require verification.

## 2026-11-20 — Workout builder, muscle picker and Zone breathing

- Android 1.0.169 candidate based on canonical Android branch commit `d09407e`. The local `workout-zone-1.0.169` branch includes expandable exercise photo rows, compact workout cover controls, and larger existing anatomy artwork in the muscle picker.
- Zone keeps the orchid dialog and adds four guided breathing methods, saved custom timings, a one-cycle preview, and explanations with research links where available.
- Mobile checks passed for the workout builder, muscle picker, saved workouts and Zone at 320, 390 and 430 px. The muscle tiles were tested in dark, light and personal themes. Workout media rules, wellness, native health and packaged startup checks passed. A separate Home workout cover photo assertion also fails on the 1.0.168 base.
- Android web assets synced successfully. GitHub published signed APK 1.0.169 from `0fbc276` in run `44836774884`. Package identity, version, source assets and signing certificate were verified.

Warning: truncated output (original token count: 111701)
Total output lines: 2058

## 2026-11-20 — Quick food logging and meal review

- Android 1.0.168 on android-health-connect adds individual food logging, live ingredient portion and macro editing, compact photo controls, a refreshed collapsed Bodyweight card and a simpler collapsed nutrition card.
- Source commit `53429e4`. Mobile checks at 320, 390 and 430 px verified quick logging, draft preservation, live macros, photo controls, keyboard layout and Home cards. Android workflow 44827182110 built and signed the APK. Verified version code 169, packaged assets and the matching 1.0.167 signing certificate. Phone installation remains unverified.
- Android artifact https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/44827182110/artifacts/14675335698

## 2026-11-20 — Approved Home and My Plan layouts

- Android 1.0.167 applies the full-photo Home workout card with the top-right toggle and lowered anatomy, the compact My Plan macros, the Bodyweight redesign, and the collapsed food ring below the divider.
- Home and flexible-day mobile tests passed at widths from 320 to 430. The signed APK from source `21908dc` was verified against the 1.0.166 certificate. Physical installation remains unverified.
- Android artifact: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/44797577382/artifacts/14658954114

## 2026-11-20 — Trainer photo, timer and Home controls

- Android 1.0.166 shows the full exercise photo, keeps video access in the side controls, moves exercise selection to Workout options, and places the Home expand button beside Manage workouts.
- The saved workout duration counts visible Trainer time across multiple visits. Open drafts from older versions start counting from the first visit in this version because earlier drafts only stored a wall-clock start. Completed records are retained. Timer navigation, visibility, backup and recap tests passed locally. The signed APK from source `92afb38` was verified against the 1.0.165 certificate. Mobile browser checks covered the Trainer at four widths and the Home cover in both states. Physical installation remains unverified.
- Android artifact: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/44790853281/artifacts/14657685276

## 2026-11-20 — Focused active workout

- Android 1.0.165 simplifies the active Trainer to one exercise card by default, full-width media with right-hand controls, scrollable set rows, and a pinned elapsed, exercise picker, rest and finish bar. Native identity and signing workflow carry forward.
- Branch: android-health-connect. Source commit `195ddd1`. Four viewport tests covered set entry, next/previous, exercise picker, rest, Finish and keyboard-sized views. Trainer media and plan package views passed at three widths. Android run 44784346614 built the APK, and the package identity, version, signed integrity and certificate match against 1.0.164 were verified. Physical-device installation remains unverified.
- Android artifact: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/44784346614/artifacts/14653088901

## 2026-11-20 — Home and Day polish

- Android 1.0.164 candidate adds matching anatomy artwork to upcoming workout rows, a clearer Manage workouts action, named workout filters, shared Home and Day macro cards, a Scan label, and clearer steps and weigh-in labels.
- Branch: android-health-connect. Home, flexible-day, Home panel, native health and nutrition import suites passed locally. Source commit `7e31b72`. Android run 44780444665 passed packaged startup, required workout media, saved workout planning and native unit tests. Extracted APK verified as com.ezpz.fitness 1.0.164 (165), with the same signing certificate as 1.0.162. The post-build recap test searched for the previous picker label; its locator was updated. Physical phone installation is pending.
- Android artifact: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/44780444665/artifacts/14650847006

## 2026-11-17 — Workout cover and builder polish

- Android 1.0.162 aligns Manage workouts and the arrow in one rounded Home button, adds a themed builder discard dialog, and assigns distinct artwork to all 133 built-in entries. See docs/workout-cover-audit-2026-11-17.json for the ID, equipment, previous cover, and release cover.
- Generated people-free equipment photos for the guided catalog and legacy duplicates. Category artwork and personal photo controls retain their existing behavior.
- Branch: android-health-connect. Source commit `95a97b5`. Android run 44191237413 passed the packaged workout, Home button and draft-discard checks and native unit tests. The signed APK contains all 133 cover photos and matches the 1.0.161 certificate. Physical handset installation remains unverified.
- Download: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/44191237413/artifacts/14377371271

## 2026-11-17 — Matching workout covers on Home

- Android 1.0.161 shows the picker’s exact selected workout artwork and muscle layers on the Home Trainer card, open or closed. Expanded exercises sit beneath the cover with photos, sets, reps and completion.
- Home banner overrides affect the cover area. Recovery and empty states retain their own photos.
- Branch: android-health-connect. Source commit `f2deb80`. Android run 44175251871 passed Home picker cover parity and disclosure at 320, 390 and 430 px, native unit tests, and saved-workout and Trainer checks. Verified extracted APK artwork and matching 1.0.160 signing certificate. Physical handset installation remains unverified.
- Download: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/44175251871/artifacts/14369866840

## 2026-11-17 — Full-height workout picker and saved workout management

- Android 1.0.160 expands Find your workout to the safe area, compacts the shortcuts, and uses larger category and workout artwork.
- Saved cards show a compact exercise preview. The options menu provides in-place editing with the current cover controls and confirmed deletion with upcoming schedule dates. Completed history and standalone saved plans survive deletion.
- Branch: android-health-connect. Source commit `26274c3`. Android run 44172344670 passed saved-workout management at 320, 390 and 430 px, native unit tests, and saved-workout planning and Trainer smoke checks. The downloaded APK contains the approved picker and saved workout assets and matches the 1.0.159 signing certificate. Physical handset installation remains unverified.
- Download: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/44172344670/artifacts/14367124492

## 2026-11-17 — Live anatomy covers for personal workouts

- Android 1.0.159 draws the default cover from the personal workout’s exercise list. The builder updates as the user types, picks or removes exercises. Known movements show primary and supporting muscle highlights, and unmapped names leave the figure neutral unless other movements are mapped.
- A chosen photo takes priority. Use default restores the anatomy cover. Saved workouts and workout cards use the same derived cover with no new storage or backup fields.
- Branch: android-health-connect. Source commit `4c7fe14`. Android run 44167454318 passed packaged workout media and live cover checks and native unit tests. The downloaded APK contains the builder and photo assets and matches the 1.0.158 signing certificate. Physical handset installation remains unverified.
- Download: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/44167454318/artifacts/14367155409

## 2026-11-17 — Compound strength, trap exercises and recap anatomy

- Android 1.0.158 adds ten guided six-exercise sessions, including three compound-strength sessions and two back-and-trap sessions. Every visible category has at least four workouts in both Home and Gym (40 Home and 48 Gym choices, including shared sessions).
- The library adds Dumbbell Shrug and Barbell Shrug with distinct bundled training photos, demo references and primary trapezius maps. Trap roles were reviewed for selected rows, raises, carries and deadlifts. The recap now uses the same primary and supporting muscle artwork as workout covers and exercise details.
- Branch: android-health-connect. Source commit `12140be`. Android run 44162659153 passed packaged workout media and swap checks, native unit tests, saved-workout planning, Trainer, and the recap trap highlight interaction. Verified that the downloaded 1.0.158 APK contains all ten workouts and both shrug photos and matches the 1.0.157 signing certificate. Physical handset installation remains unverified.
- Download: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/44162659153/artifacts/14364381366

## 2026-11-17 — Muscle-based swaps and eight more goal workouts

- Android 1.0.157 ranks exercise replacements by shared primary muscles in Trainer, the Home workout editor, and the workout builder. Search covers the guided library, while the session picker filters movements already in that workout.
- Added eight ready-made sessions with six guided movements each, photos, demo links, and anatomy covers. This brings the goal categories to 18 sessions. Four new sessions work at home or in the gym, and four require gym equipment.
- Branch: android-health-connect. App source commit `88023fa`. Android run 44159886449 passed packaged media and themed swap checks, native unit tests, saved-workout planning, Trainer, and recap checks. The downloaded 1.0.157 APK includes all eight workouts and matches the signing certificate of 1.0.156. Physical handset installation remains unverified.
- Download: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/44159886449/artifacts/14363116968

## 2026-11-17 — Goal workouts, Trainer swaps and rest timer

- Android 1.0.156 adds ten six-exercise sessions in five new categories, with matching anatomy covers and exercise media. The chooser opens with Create your own, Saved workouts, Home/Gym and filters above the category cards.
- Trainer exposes searchable session-only swaps on every exercise card. The builder uses a larger muscle picker with Traps. Home and workout previews use larger exercise thumbnails.
- Android now reads rest timer deadlines as 64-bit milliseconds. Android run 44156039441 signed 1.0.156 with the existing key. Packaged picker, calf-raise swap, saved workout planning and Trainer checks passed. The recap smoke test had a stale selector for the moved Create your own button and was updated. Handset and Bluetooth audio playback remain unverified.
- Download: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/44156039441/artifacts/14360648549

## 2026-11-17 — Workout picker levels, anatomy, and Trainer controls

- Android 1.0.155 adds 20 six-exercise Intermediate and Advanced sessions across all five Home and Gym categories. The existing Beginner sessions retain their IDs.
- The Day workout picker shows gym photography with primary and supporting anatomy highlights on category and session cards. The Trainer photo has a shortcut to session-only exercise swaps.
- The rest timer uses the Android media volume stream for cues. The five-second warning falls back to a tone if spoken audio is unavailable. Android run 44149974115 signed 1.0.155 with the existing key. The packaged picker and swap checks passed. A later Trainer check still expected two workouts per category and was updated to expect four. Handset and Bluetooth playback remain unverified.
- Download: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/44149974115/artifacts/14359490387

## 2026-11-17 — Final 40 guided exercises

- Android 1.0.154 expands the guided library from 101 to 141 exercises. Each new entry includes a matched trainer photo, equipment, muscle map, and demonstration link.
- Close-grip V-handle searches resolve to the existing seated cable row. The wide-grip straight-bar setup has its own entry.
- Branch: android-health-connect. Source commit `63833de`. Android run 44138615131 verified the existing signing key, built 1.0.154, and passed packaged workout media, saved workouts, Trainer, and recap checks. The downloaded APK contains all 40 new trainer photos and the updated catalog.
- Download: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/44138615131/artifacts/14353102849
- Broader checks failed in the Home workout banner and in the separate Sleep overview/Progress workflow. Physical handset installation remains unverified. Preset programs are a separate follow-up.

## 2026-11-17 — 40 additional guided exercises

- Android 1.0.153 expands the guided library from 61 to 101 exercises. The batch includes single-leg Roman chair back extensions, chin-ups, dead hangs, machine accessories, and home variations.
- Every addition supplies a trainer photo, a variant-matched demonstration link, equipment, search aliases, muscle highlights, and editable set defaults.
- Branch: android-health-connect. Source commit `802ef4f`. Android run 44096355793 signed the APK and passed the guided library, picker, and timed exercise checks at 320, 390 and 430 px. Physical-phone installation remains unverified.
- Download: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/44096355793/artifacts/14334107479

## 2026-11-17 — Guided exercise expansion

- Android 1.0.152 increases the guided picker from 41 to 61 movements. Each addition has a trainer photo, exact exercise reference, searchable aliases, equipment, and primary or supporting muscle highlights.
- Custom workouts can select and log the new exercises through the existing builder. Step-ups and split squats default to per-side reps. Suitcase carries default to per-side seconds.
- Branch: android-health-connect. Source commit `15a3c29`. Android run 44082888744 produced the signed APK and passed picker and Trainer checks at 320, 390 and 430 px. Physical handset installation remains unverified.
- Download: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/44082888744/artifacts/14328217228

## 2026-11-17 — Workout builder and session clock

- Android 1.0.151 replaces the native exercise autocomplete with an in-app muscle and exercise picker. Guided choices use existing exercise photos and reviewed anatomy. Manual entry is available in the same builder.
- Create your own uses the same anatomy artwork as the workout chooser. Trainer shows elapsed session time alongside the exercise selector and uses the saved timestamp in the recap.
- Branch: android-health-connect. Source commit `a8a5e13`. Android run 44077756299 signed the APK and passed the focused mobile checks at 320, 390 and 430 px. Physical Android installation remains to be verified.
- Download: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/44077756299/artifacts/14324529983
- Exercise video consistency remains open. The current guided links need a clip-by-clip review for exercise variation, first-rep timing and presenter consistency.

## 2026-11-16 — Trainer and anatomy cover backgrounds

- Android 1.0.150 uses a soft forest green default Trainer background. Custom workout and exercise backgrounds still take precedence.
- Manage workouts uses charcoal-green studio backdrops behind the existing category anatomy figures and muscle layers. Program and custom workout photos retain their existing artwork.
- Branch: android-health-connect. Source commit `8412a05`. Android run 43997253011 built the signed APK and passed the saved workout, Trainer and recap checks. Broader regression checks were in progress at upload.
- Download: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/43997253011/artifacts/14289919875

## 2026-11-16 — Photo-first workout picker

- Android 1.0.149 brings Push, Pull, Legs and Core to the first two rows, restores the muscle legend to the header, and gives the existing gym photos and mapped anatomy more space. Full Body, Create your own, Saved workouts and filters remain available below.
- Branch: android-health-connect. Source commit `44cb88d`. Android run 43989867766 produced the signed APK and passed the saved workout, Trainer and recap checks. The broader regression suite was still running when the APK was uploaded.
- Download: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/43989867766/artifacts/14287676302

## 2026-11-16 — Workout cover anatomy and rest controls

- Android 1.0.148 separates the Home Start/Resume action from Manage workouts, which opens the existing chooser.
- The rest timer says “Five seconds left” and plays a tone at zero. Countdown voice opens a themed picker with voice previews.
- Category covers pair existing gym photos with the recap artwork. Guided workout covers use their current exercise lists. Primary and supporting muscles use separate shades. Unmapped exercises have no inferred highlights.
- Branch: android-health-connect. Build 43985393309 at `e4818aa` produced a signed APK and passed the saved-workout and Trainer checks, including phone widths of 320, 390 and 430 px. Bluetooth playback on a physical Android phone remains unverified.
- Download: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/43985393309/artifacts/14283979712

## 2026-11-16 — Workout completion and spoken countdowns

- Android 1.0.147 adds Done from recap to Home, blends the artwork into the recap and thickens muscle-button outlines.
- Home keeps exercise editing and swapping available after logging. Trainer lists load before reps.
- A visible five-second start countdown and spoken rest warning use available on-device English voices, with a device-default option.
- Branch: android-health-connect, source commit `6a6fe77`. Build 43978327733 signed the Android APK and passed saved-workout and Trainer checks, including the recap flows at 320, 390 and 430 px.
- Download: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/43978327733/artifacts/14282671923
- Physical Android and Bluetooth speech playback still need a device check.

## 2026-11-16 — Exercise thumbnails and workout recap

- Android 1.0.146 adds exercise thumbnails in Home, Trainer, swap choices, workout previews and history. Personal workout photos take precedence.
- Workout recap shows completed sets, elapsed time, lifting volume and selectable front/back muscle highlights using the approved anatomy artwork.
- On android-health-connect, build 43949206928 signed 1.0.146 with the existing certificate. Photo precedence, completed-set accounting, per-side volume and muscle selection passed at 320, 390 and 430 px. Compact Trainer, history and planner checks passed. A physical handset install remains to be verified.

## 2026-11-16 — Trainer gauges, workout sounds and plan scanner

- Android 1.0.145 puts a synchronized progress gauge on every exercise photo. The left rail shows the set fraction and the right rail keeps the media controls.
- Short workout-start and rest-complete sounds use Android’s media audio route. Workout sounds can be muted in Rest timer options.
- Barcode scanning from Day opens a dedicated camera dialog with typed barcode fallback, then returns to the planned meal amount and save flow.
- On android-health-connect, Android build 43940035365 signed 1.0.145 with the existing certificate. Trainer and planned-meal scanner passed at 320, 390 and 430 px. An audio-bridge smoke test passed for workout start, rest scheduling, pause, resume, mute and canceling at workout completion. Physical camera and Bluetooth playback remain to be verified.

## 2026-11-16 — Phone layout, calendar and Android Back

- Android 1.0.144 places Trainer progress in the left rail and the media actions in the right rail. Exercise photos use the center of the frame.
- Date fields open the themed app calendar. Android system Back dismisses the active app overlay, steps back through the app, and stays on Home at the root.
- Create your own uses a distinct workout notebook photo. Home’s scanner, upcoming workout plus icons, and Edit action have simpler styling. More opens with Save my progress collapsed.
- On android-health-connect, Android run 43936755249 built signed 1.0.144 with the existing certificate. Packaged-screen checks passed at 320, 390 and 430 px for Trainer, calendar selection, app Back handling, Home controls and the workout notebook tile. The compact Trainer also passed at 358 px. Physical Android system Back still needs handset verification. The separate Sleep sync-label regression check also failed on 1.0.143.

## 2026-11-16 — Trainer layout and saved workout repair

- Android 1.0.143 combines the exercise position and chooser, moves completed sets above the active exercise photo, and puts compact translucent media controls on the wider photo.
- Saved workouts that need references retain their picked day and workout slot through media repair. Adding a repaired workout returns to Day. Guided and custom exercise video link editing is covered by the Trainer checks.
- On android-health-connect, Android run 43931948098 built and signed 1.0.143 with the existing certificate. Mobile run 43932684569 passed saved-workout scheduling and media repair, responsive plan packages, and Trainer layout and media editing at 320, 390 and 430 px. The APK was delivered to the user. Physical Android verification remains open.

## 2026-11-16 — Scan food into a planned meal

- Android 1.0.142 adds Scan food barcode to Day meal pickers. Use the camera or enter the barcode, confirm the amount and save to the selected date and meal slot. Planned food stays separate from the diary.
- Planner and diary ingredient drafts are isolated. Canceling restores the meal picker’s filter and search.
- Android branch build 43929004200 at 83d818bf passed unit tests, packaged the signed 1.0.142 APK and passed the planned barcode flow at 320, 390 and 430 px. Guided swap and calculator tests passed. APK certificate matches 1.0.140.
- Broader browser checks still fail in saved-workout planning and the Trainer video editor. Android camera operation on a physical phone remains to be verified.

## 2026-11-16 — Guided swap search and calculator protein adjustment

- Android 1.0.141 searches all guided exercises from the Home swap picker, with fitting suggestions first, equipment labels, and duplicate rows marked.
- Calculate for me allows a user-chosen protein amount above the default recommendation. Carbs adjust against the same calories and fat.
## 2026-11-16 — Empty Home workout card

- Android 1.0.140 shows Choose workout on Home without an eligible plan entry, an explicit same-day pick, or an unfinished session. The empty card and quick action open the workout picker.
- Ad-hoc choices stay on Home for that day without adding a plan entry. Today’s scheduled workouts, recovery days and real unfinished sessions have dedicated states.
## 2026-11-16 — Six-movement workouts and clear plan

- Android 1.0.139 expands all 20 featured workouts and Coach Sample sessions to six distinct movements with bundled photos and demo links. Existing movement order and draft positions are preserved.
- My Plan shows Clear current plan at the top when it contains an active schedule. Clear removes the scheduled entries and detaches the plan name, cover and targets while preserving completed logs, separate saved plans and dates outside the current plan.
## 2026-11-16 — Require exercise photos and demos

- Android 1.0.138 limits exercise browsing and suggestions to available photo and video pairs. Incomplete personal workouts open a media-repair screen before the logger. Incomplete saved plans stay editable and require covered workouts before activation.
- Device data includes a workout-only reset for saved workout definitions, scheduling, drafts and trainer media. Existing logs, food, saved plan packages and other records remain available.
## 2026-11-16 — Home and Gym workout collection

- Android 1.0.137 presents 20 guided sessions across Full Body, Push, Pull, Legs and Core, with separate Home/Gym A/B choices and exact equipment lists.
- Every featured movement has original still photography and a linked demo. Suggested substitutions use covered movements, matching units and compatible equipment. The earlier workout definitions remain available to scheduled sessions, workout history and drafts.
- Added coverage for the collection and migration, plus mobile picker and demonstration preview checks. Android signing and APK delivery are tracked in CI.
## 2026-11-16 — Shared exercise photos and demos

- Android 1.0.136 bundles references for 30 exact movements, including the four Coach Sample Plan movements, with original photos and external video links.
- Workout previews identify sessions with full coverage. The exercise swap picker prioritizes complete references and Trainer applies them to the replacement. A workout-specific photo or link takes precedence independently.
- Local Trainer, workout photo and plan package checks pass. Mobile swap and signed update validation run in Android CI.
## 2026-11-16 — Coach Sample Plan

- Android 1.0.135 adds a built-in 14-day Plan Library example with a weekly preview, exercise photos and demo links, recipe portions, and daily plan macros.
- The existing activation and plan-file workflows carry plan targets and exercise media. Local plan library and package tests pass, including a serialized transfer into a clean profile. Mobile interaction and APK validation are tracked in Android CI.
## 2026-11-14 — Edit exercises in Today’s Workout

- Android 1.0.134 adds a Home workout exercise editor with the existing picker styles, catalog search, custom names, set counts, removal, and today-only or plan-scoped future changes.
- Local workout edit, Trainer, plan package, and flexible day logic checks passed. Browser and signed Android validation run in CI.

## 2026-11-14 — Progress detail chart polish

- Android 1.0.133 on `android-health-connect` updates the six Progress detail charts with wider filled columns, distinct goal and average lines, clearer Zone checkmarks, and one value label for the selected bar.
- The existing chart selection updates the label for touch, keyboard and the date picker. Zero remains visible and missing records have no value label. Trend and wellness checks pass locally. The Android workflow runs mobile interaction checks and produces the signed update.

## 2026-11-14 — Progress date picker

- Android 1.0.132 uses the existing in-app Progress picker for dates and grouped chart periods. Local trend checks passed. The Android workflow runs the date selection checks and builds the signed update.

## 2026-11-14 — More banner layout and picker contrast

- Android 1.0.131 places Everyday tools first on More and adds four themed photo banners under Backup & settings. The backup and account operations use the existing handlers.
- Native select options use a light popup palette. Trainer, planner, progress, wearable, nutrition source and plan draft picker labels use paired surface and text colors. Android CI builds the signed in-place update.

## 2026-11-14 — Simplify backup and privacy navigation

- Android 1.0.130 on the canonical Android branch groups manual cloud backup on More and links to Account & privacy, Device data, and Connected apps. Existing backup, restore, deletion, and import handlers back the new paths.
- Local account, deletion, and WHOOP contract checks pass. The Android workflow owns mobile validation and the signed APK. Next step after the build is an in-place phone update.

## 2026-11-14 — Fit the approved Food Details sketch

- Android 1.0.129 fits the scan details above the navigation, with units and the portion shortcut on one row, a larger calorie ring, and readable macro values. Mobile regression checks cover the full stack at phone widths.

## 2026-11-14 — Food details and tracker badge

- Android 1.0.128 replaces the empty plate and scale with photo and portion controls, adds Camera and Photos choices, and removes the green backing from the Home tracker logo.
- Verified nutrition and saved label handling locally. Android CI runs the mobile layout, photo picker, and signed package checks.

## 2026-11-14 — Restore Home tracker badge

- Android 1.0.127 restores the selected tracker logo and original sync dialog copy on Home. Progress still attributes readings to their saved sources.

## 2026-11-14 — Wearable attribution

- Canonical branch: `android-health-connect`. Android 1.0.126 uses a neutral tracker sync action on Home, shows record sources in Progress details, and limits the WHOOP cycle explanation to relevant records.
- Checked Progress, tracker switching and origin isolation, sleep, Steps and Step Bank, workout history, and Home with the local regression suites. Live wearable sync can be checked on Android after installing the signed update.

## 2026-11-14 — Food details polish

- Canonical branch: `android-health-connect`. Android 1.0.125 refines the existing macro ring and adds a projected daily calories and macros card using actual diary totals, targets and the meal draft.
- Checks: local macro ring, ingredients, barcode and projection checks. The Android test workflow builds the signed update and runs the mobile checks.

## 2026-11-13 — Android reviewer access

- Canonical Android branch adds a dedicated reviewer password sign-in in Save my progress. Android version 1.0.124.
- Provision and verify the isolated reviewer account before submitting the App access declaration.

## 2026-11-13 — Privacy disclosure and Android 1.0.123

- Canonical branch: `android-health-connect`. Updated the bundled policy for Health Connect, FatSecret barcode lookups, on-device label recognition and account deletion.
- Delivery: Android test workflow builds the update with the existing test signing certificate. Play release bundle and upload signing still need verification.

# EZPZ Fitness — continuation notes

## Canonical app
- Repository: reimerskasper-creator/Ezpz-trainer
- Branch: android-health-connect (canonical Android; older Pages main may lag)
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
User explicitly requested High protein, High carb, High fat, and Balanced meal sections …76701 tokens truncated…those two approved-food fixture entries in test-only56ec429a8b7ea95cf22702e291aeb7b1cbaa821f; no runtime or recipe/food data changed. Reran tests/recipes.cjs locally successfully (157recipes,532portion cases, logging/shopping/saved plans/photo identity) and tests/flexible-day.cjs successfully. All other hosted test cases, including the final complete mobile test, passed. The historical workflow remains red for that obsolete assertion; do not describe it as a green hosted run. No outstanding functional verification or known blocker; owner physical-phone review is next.

## Saved-workout planning correction — Android 1.0.89/code90
- Based on aa6a28d, retains verified1.0.88 changes. My Plan's My workouts tile opens Saved workouts first when available. The saved routine action adds to the captured selected date and returns to the day, preserving additional-workout slot context; regular training retains Start/Resume. Create workout remains available; new routines also retain extra-slot placement. Existing photos/data retained.
- Training, flexible-day and plan-package data checks pass locally. Added phone regression for future-day selection/return, extra slot and ordinary training at320/390/430 to Android CI. Local browser download unavailable; hosted phone/build/package verification pending. Do not deliver as verified until successful.

### Saved workout selection — verified Android 1.0.89 delivery
- Canonical runtime b7fec5c1ba03c0937a15ebadc7c14f91936d8c2d, tree6dfe6cb8469ac78528b1a5f84e4d8c50f1650978. Android41920376965/job126890974354 succeeded. New actual packaged phone regression passed320/390/430 for selected future date, saved-first tab, Add to date, automatic calendar return, extra slot without replacing primary, and ordinary Start workout. Existing packaged native phone checks and Android build/tests passed. Local training/usability/flexible-day/plan-package/recipes/native runtime checks passed. Full Mobile41920376935 still finishing at this checkpoint; do not claim it passed until observed.
- APK artifact13365749996: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/41920376965/artifacts/13365749996 . ZIP SHA2567d804e17239abdc74bd6735fa2a4243cb22d71aafe06afce7bb67da05d79555d; APK51,479,103bytes SHA256590a5035d7a7c1066ad88e93399a83bebf314e2b603e3e1e85961235bf40d588. Exact packaged canonical HTML/plan/trainer assets verified. Manifestcom.ezpz.fitness/code90/name1.0.89; APKv2 signature and full content digest verified; signer SHA256aff9b047133e210e827b62dcaedc49e40a2ae2248cea0e89656fa7ca8b918a65 matches existing app.
- Existing APK itemlibfile_545dd90f73f4819197110900611a1827 replaced as version71/file_00000000f0b881f79df0cb7b36897c37 with local metadata applied. Install as Update over existing app. Flow: My Plan → Add workout → My workouts → Add to selected date → back to day. Create workout remains beside Saved workouts. Preserve current photos, routines and records. Next: owner phone review and observe final full Mobile result.

### Final1.0.89 package supersedes earlier artifact
- Final runtime1ce68813b0a4b37dfcc6feb5c620141d8efaf85d preserves state.activePlanItem when the saved-routine action is used for planning. Packaged320/390/430 regression now explicitly verifies this alongside the original date/extra-slot/return cases. Android41922087114 passed. Test-only751575e4a89c550cd05271b60fd40804e561fc4f corrects tests/mobile.cjs to choose Create workout explicitly after the approved saved-first tab; earlier full Mobile failed that stale form expectation. Full follow-up41922206792 is still running at this checkpoint.
- Deliver ONLY final artifact13368051292: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/41922087114/artifacts/13368051292 . ZIP SHA2561ba1b7c1d081cc3688d5b839f7a86c3a5d07d659066452752bab4d297539f929. APK51,479,151bytes SHA25665326dd89ff5994962d8864f48a733f0cf16be70dcc8151197dacc676fe7d54f. Exact packaged native HTML/plan/trainer assets,1.0.89/code90, APKv2 signature/content digest and existing signer verified. Earlier13365749996 is superseded.
- Existing APK itemlibfile_545dd90f73f4819197110900611a1827 replaced as version72/file_000000001f5481f9b9824d84535b67ff, local metadata applied. Install as Update. Owner additionally suggested independent other Home banner backgrounds within Edit homepage, reusing overall photo/crop/zoom/dimming/default controls; discussed positively only, not implemented in this batch.

### Broader verification limit
- Full Mobile41922206792 failed only in tests/mobile.cjs:280, asserting aria-invalid=true after clearing reps and checking Done; actual=false. This is outside changed planning handlers. The earlier broad run reached the planner assertion later in the same test, so this input assertion had passed there. No unrelated runtime edit was made without reproduction. All preceding full-suite steps/contracts passed. Do not describe the complete hosted suite as green. Scoped packaged saved-workout tests and Android41922087114 remain successful. Owner phone test is next; investigate this general input-test failure separately if reproducible.

## Full-photo ring placement and individual Home banner backgrounds — Android1.0.90/code91
- Owner requested reaching the lower photo strip with individual rings and approved the earlier banner-photo suggestion. Ring editing migrates existing visible centers to a versioned full-card photo coordinate area, using the complete card bounds with5px padding. Whole rings/labels stay inside the photo, group movement/keyboard/size and Cancel/Done remain. Legacy saved positions render unchanged until editing; saved full-photo placements survive reload/backup.
- Edit homepage adds Change background on each available workout/nutrition/steps/upcoming workouts/upcoming meals/week/bodyweight banner. Reuses the existing photo dialog and picker, crop/zoom/dimming/Restore default with an independent optional override per banner. Workout source photos and original current defaults remain the fallback. No photo controls outside editing mode. Overrides whitelist keys, retain referenced photos through save/backup, reject missing references and roll back on storage failure; resetting removes only that banner override.
- Local personal-photo/new banner storage, Home simplification, plan-package and native-runtime checks passed; JS syntax checked. Updated existing appearance bounds test to full photo and added actual phone tests for bottom-edge reach/reload, banner controls, isolation, Save/Cancel/reset. Android/full Mobile workflows include these. Hosted checks/build/signature verification pending. Prior1.0.89 general mobile-input assertion failure remains documented; do not claim a green complete suite without observing it.

### Verified Android1.0.90 delivery
- Final runtime c2bb02993a08bd401360810fd61d47b29cc0df4f. Android41925445286 passed. Packaged tests320/390/430passed full-photo bottom-edge reach/reload, individual/group movement, actual touch, size, Cancel/Done, backup, failed-save rollback, independent banner upload/crop/dimming/reset and unchanged source workout cover. Original Home section-arrangement test passed after the final migration baseline fix; only actual appearance edits persist Home appearance. Expanded canvas is measured before migration, including initially collapsed overview. Earlier ad2797/b541f62 intermediate packages are superseded.
- Actual final screenshots reviewed: ring/label reaches the lower photo strip; visible Change background controls are restricted to edit mode and banner data/photos stay independent. Local personal-photo/banner storage tests, Home simplification, plan packages and native runtime passed. All native packaged app/integration checks and Android build/tests passed. Full Mobile41925445409 passed Home arrangement/appearance/banner checks and was still running its final general batch at this checkpoint; do not claim the entire run is green until observed. Prior unrelated general reps-input assertion is documented above.
- Deliver artifact13368572951: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/41925445286/artifacts/13368572951 . ZIP SHA256aa93fca4bf5486dd5b269e0dc5aefd4742bbcfdb37f1756caa83cd35eb51f8d3. APK51,480,907bytes SHA2563433c1d49fd75af3159a0d340b43c903ea5c5ee77994fef04da55cabb42138e4. Manifestcom.ezpz.fitness/code91/name1.0.90, exact packaged canonical HTML/home background JS/CSS/plan/trainer assets, APKv2 signature/content digest and existing signer SHA256aff9b047133e210e827b62dcaedc49e40a2ae2248cea0e89656fa7ca8b918a65 verified.
- Existing APK itemlibfile_545dd90f73f4819197110900611a1827 replaced as version73/file_000000004e5c81f5b40586ea59cb8b9e; local metadata applied. Install as Update over existing app. More → Edit homepage → Arrange rings → Individually; drag anywhere inside the full photo and Done. Each available banner offers Change background → upload/crop/zoom/dimming → Save background, or Restore default → Save. Original workout/meal/exercise photos and other preferences retained. Next: owner phone review; observe final full Mobile result without rebuilding a verified unchanged APK.

## Day photo fade and Eat cleanup — 4 November 2026
- User approved larger Day card photos, details on right, soft photo-to-emerald fade. Original meal/workout images and picker/start handlers retained, including extra sessions.
- Removed diary help disclosure; moved per-meal duplicate exclusion/undo into the existing action menu and replaced its ellipsis with a pencil icon. Source selector alignment tightened. Selected meal categories now use dark green with mint outline and readable pale text across appearance settings.
- Local daily-use, nutrition-import, planner-picker, flexible-day and appearance checks pass. Approved foodDiary fixture updated only for requested help removal; recipes/grams/photos unchanged. Local browser installation is blocked by truncated Chromium downloads; hosted mobile/package checks pending.

### Verified Android 1.0.91 delivery
- Runtime 5c2107d5cf01e9f5fc810ac17a9b4c7f55608825; Android run41947056897 succeeded. Dedicated fade/original-photo/pencil-edit/selected-category contrast checks pass at320/390/430px; all existing packaged runtime/integration/mobile checks and Android build/tests passed. Screenshots reviewed. Initial run failed only due to new test using data-plan-pick-recipe rather than existing data-plan-pick-meal; corrected before final build.
- Artifact13379451406: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/41947056897/artifacts/13379451406 . APK51481938bytes SHA2568e19d68d8f8cecbc431e9c42dd4becb386a36d61c1a6c2fa2356f0472adaf695. Verified packaged HTML links exact new fade CSS. Library APK itemlibfile_545dd90f73f4819197110900611a1827 replaced version74; local metadata applied. Install as Update.
- Full Mobile41947056909 passed all dedicated sections and remained in progress in its final general batch at delivery checkpoint. Do not claim the entire broader workflow succeeded until observed. Existing user data/images/integrations preserved; duplicate-exclusion/undo remains in meal pencil menu. Next: owner phone review.

## Home colored macro squares — 4 November 2026
- User approved keeping existing Home macro squares, matching Eat green/gold/blue glass fills. Updated only Home macro backgrounds/borders and progress accents; all tile sizes, text, data, background photos, rings and actions retained. Collapsed behavior unchanged. Android1.0.92/code93.
- Hosted Android/mobile checks and screenshot review pending.

### Verified Home macro color delivery
- Runtime b9c3572f49843dbaf8081477718712f52f65a5a5; Android41949129524 succeeded, including packaged phone checks and Android build/tests. Home nutrition screenshot reviewed: existing squares show green/gold/blue glass with readable pale text; layout/photos/actions unchanged. Packaged home-background.css matches source exactly.
- Android1.0.92/code93 APK51482034bytes SHA2568ec10ce6265bcd12735d44e81cbe675e0b71e0febd30af9c771110e1e22cce95. Artifact13380531369: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/41949129524/artifacts/13380531369 . Existing Library APK replaced version75; metadata applied. Install as Update over existing app. Full broader Mobile41949129448 status at checkpoint: [{"status":"in_progress","conclusion":null}]. Next: owner phone review.

## Backup/export and document import repair — 5 November 2026, Android 1.0.93/code94
- Owner reproduced zero-byte exported JSON and native app crash selecting a file. Exact phone stack trace unavailable. Android plan/backup import now uses an explicit native ACTION_OPEN_DOCUMENT reader rather than WebView file inputs; bounds reads, closes streams, rejects empty/unreadable/malformed JSON and preserves existing data. Browser file inputs remain. Wrong backup-versus-plan choices show actionable errors. Restore still requires confirmation.
- Exports stage UTF-8 content in private cache before launching save on the main thread, then write/close/read back exact bytes before reporting success. Temporary payload removed after success/failure/cancel/destroy. No new storage permission or data migration.
- Added stream tests for zero-byte/oversized/failed reads and empty writes; actual Capacitor transport browser checks cover cancelled/empty/malformed/wrong-type imports, unchanged state before confirmation, backup round trip and native shared-plan preview/import. Existing portable-plan and privacy suites pass locally; local Chromium download is truncated, so hosted native browser/build checks required. Physical S23 retest remains necessary; no claim of verified phone fix until then.

- Root-cause evidence in installed Capacitor source: Plugin.saveInstanceState serializes full call options and Bridge.saveInstanceState writes them into the activity Bundle. Export options previously retained complete JSON/photos, potentially exceeding Android Binder saved-state limits and crashing when backgrounding/selecting another document. stageExport now removes json from call.data after staging and before startActivityForResult, so saved state contains only small metadata. Static lifecycle guard added to native-runtime; physical-phone confirmation remains required. Initial hosted build08322dc is superseded by this correction.

### Verified Android 1.0.93 backup/import repair delivery
- Final runtime and tests: 26f20506bb325b8a61ef9b51bc9453d957c1d700. Android42074776642/job127411935630 passed all packaged phone regressions, native backup/plan import transport scenarios, Android compilation and JVM tests. Initial runs were superseded: a new test first needed to expand the plan tools, then compare portable workout prescriptions rather than intentionally remapped client IDs. No runtime change was made to force those assertions.
- APK artifact13437369361: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/42074776642/artifacts/13437369361 . ZIP SHA256a8f442f326f02516e361b82238a171e4f9c56f5634e5da13b352cd07dfc3e35d. APK51492362bytes SHA25666584b662dc776a23cab1bb549c49da501a47a8456c55ade756ee9de819230fe. Verified manifestcom.ezpz.fitness/code94/name1.0.93; packaged canonical HTML and plan-manager script match local prepared source, native importDocument is compiled. APKv2 signature/content digest verified; certificate SHA256aff9b047133e210e827b62dcaedc49e40a2ae2248cea0e89656fa7ca8b918a65 matches installed update key.
- Existing APK Library itemlibfile_545dd90f73f4819197110900611a1827 replaced as version76/file_000000008e48822fbdad88b57f23fc94; local metadata applied. Install as Update, never uninstall. Create a NEW backup; prior 0-byte files contain no restorable data. Test Restore backup versus Import a plan with the appropriate file, preferably in Secure Folder. Physical S23 retest remains required; exact phone stack trace was not available. No UI redesign or records migration.
- Full broader Mobile42074776572 was still running its final general app batch at delivery checkpoint; all Android packaged checks passed. Do not claim that separate broader workflow is green unless its final result is observed. Next task: owner physical export/import test, especially a backup with uploaded photos; observe remaining broad workflow if needed.

## Imported-plan first-render repair — 5 November 2026, Android1.0.94/code95
- Owner confirmed1.0.93 export/edit/import works on physical S23; screenshots show unstyled My Plan until navigating away/back. Cause: plan-manager.refreshed called planner() directly after setting tab from More, leaving body[data-view], navigation/header-return and appearance in More state. Use full render() after plan actions; data/import semantics unchanged.
- Existing native transport regression and320/390/430 plan UI tests now import from More → Data & privacy → Share a plan and assert immediate planner view, removed stale header return and shopping icon bounded to24px, without page switching. Added plan-import-opened.jpg screenshot. Hosted verification/build pending; preserve1.0.93 backup fix and installed signing key.
- Prior full Mobile42074776572 completed with an unrelated tests/mobile.cjs:510 "Meal backdrop matches breakfast" assertion failure. Packaged Android42074776642 and1.0.93 owner export/import confirmation remain valid. Do not describe the entire broader suite as green; this batch only changes the imported-plan page refresh.

### Verified Android1.0.94 delivery
- Runtime62b13cabfd8625c72626dd0a1cdd4c916f09f22d; Android42079650401/job127429037917 passed packaged cross-page import, all existing packaged phone/integration checks and Android build/JVM tests. Browser plan tests320/390/430 passed immediately opening an imported plan from More, with body[data-view=planner], no stale header-return and shopping icon width<=24px. Screenshot plan-import-opened.jpg visually reviewed: correct compact date controls, readable dark-green import notice, original workout/meal photos, no duplicated outer back button. Owner physical recheck remains next.
- Artifact13439704160: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/42079650401/artifacts/13439704160 . ZIP SHA256e0e641289b910ff2cf03b51314e961bf0ffdcdb1a5447561239b18bdae54e968. APK51492358bytes SHA25687039c1790cf1c7f47dca2c94dad43b7380328fb2f2af47621efbab36be61572. Exact packaged canonical HTML/plan-manager.js, manifestcom.ezpz.fitness/name1.0.94/code95 and APKv2 signature/content digest verified. Signer SHA256aff9b047133e210e827b62dcaedc49e40a2ae2248cea0e89656fa7ca8b918a65 matches installed app.
- Existing APK itemlibfile_545dd90f73f4819197110900611a1827 replaced version77/file_00000000f988822fac426eb6831d3228; local metadata applied. Install as Update. No data/import-format change;1.0.93 backup repair retained. Full separate Mobile42079650377 was still running at delivery checkpoint; prior broader meal-backdrop assertion remains documented, not silently fixed. Next: owner confirms immediate correct layout after importing from More without navigating away/back.

## Readable goal editing and removal of burned calories — 6 November 2026
- Based on canonical android-health-connect bf1d2b4; all three requested fixes were absent. Added an explicitly colored Edit goals & plan dialog with Cancel/Continue, Escape cancellation and profile rollback on save failure. Existing setup flow retained.
- Removed duplicate Connected apps Steps & calories shortcut, training calorie mini-card, movement calorie fields/totals/history, calorie diagnostics and burned-calorie trend categories. Retained food calories, steps/source selection/manual goal/history, stored wellness records, imports and backups; no schema migration or record deletion.
- Android1.0.95/code96. Local wellness, native-health/runtime, training/usability, food recipes, nutrition-import, accounts/native accounts, WHOOP import/auto/connect/mapping/sync, flexible-day and portable-plan checks pass. Updated scoped phone regressions to verify dialog cancellation/continuation and absent burn displays. Local Chromium download unavailable (truncated archive); hosted packaged phone checks and Android build must pass before delivery. Preserve known installed APK signer and verify package bytes/version.
- First hosted Android run42216153251 stopped in trainer-space-mobile: after removal of the optional calorie card, a training-photo button overlapped Change exercise background. Scoped the menu's photo control to normal flow regardless of grouping; no functionality/data change. Rerun required.
- Local browser testing recovered using an isolated Chromium binary. Root cause of menu interception: position:static left the camera's absolute ::after touch target relative to the entire menu. Changed existing scoped rule to position:relative with auto offsets, containing the touch target. Removed superseded broad CSS rule. Full trainer-space-mobile and wellness-mobile pass320/390/430; actual native-package transport suite passes with dialog cancellation/Escape/Continue/state preservation, step data and absent calorie UI. Dialog screenshot visually reviewed; explicit colors override global theme rules. Latest hosted rebuild pending.

### Verified Android1.0.95 delivery
- Final runtime76899aeaa17cda8e2ba07a08dfcf89e26f979c24 on android-health-connect. Android42217334069/job127890506656 succeeded: all packaged phone regressions, actual Capacitor transport/dialog retention checks, Android compilation and JVM tests. Local trainer-space/wellness/WHOOP phone checks pass320/390/430. Readable dialog screenshot reviewed; cancel/Escape preserve state and Continue retains all fields except the intentionally reopened profile. Camera pseudo-element touch target stays contained, preserving background customization.
- Artifact13501288919: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/42217334069/artifacts/13501288919 . ZIP SHA256b191783dcd176511a1f80b7679050ba3959caec90dcf0c0813e769779a479980. APK51491806bytes SHA256ac44490bd6a00f22712b4a9e2111d26c7de0e290fc7458bb02973bde0e1b8c40. Verified all packaged web assets byte-for-byte; manifestcom.ezpz.fitness/name1.0.95/code96; APKv2 signature and full content digest; certificate SHA256aff9b047133e210e827b62dcaedc49e40a2ae2248cea0e89656fa7ca8b918a65 matches installed update key.
- Existing APK itemlibfile_545dd90f73f4819197110900611a1827 replaced version78/file_00000000fb9481f6bcc473d913bd10cc; local metadata applied. Install as Update over existing app. All three requested UI fixes are included; food calories, steps, saved records, photos, plans, imports and backup functionality preserved. No repository replacement or data migration.
- Separate broader Mobile42217334113 had passed every dedicated section and was still in its final general batch at this checkpoint. Do not describe that entire workflow as green until observed. Owner physical-phone review remains next.

## EZPZ method guide and purple wave Z — 6 November 2026
- Resumed on canonical android-health-connect after5c7f185. Prior guide update was absent; retained verified1.0.95 goal dialog/calorie fixes. Replaced the existing foundations dialog content with one scrolling guide: small repeatable steps, four pillars in yellow/blue/green/purple, Zone as preparation/learning/reflection supporting the others, practical starting points and returning at your pace. Existing close/Escape/focus behavior retained.
- Original first three wordmark letters retained; final Z uses a transparent purple two-wave vector in logo/navigation/guide. Transparent fork E removes baked green navigation square. No state/schema/scoring or tracker/import changes; original photos and all existing customization controls retained.
- Android1.0.96/code97. Local pillar, clarity, privacy, native-health and wellness checks passed. New three-width guide regression verifies content/assets/green Progress accent/no rings, scroll fit, closing/reopening/Escape/focus and unchanged persisted records. Hosted packaged checks/build and APK signer verification pending; do not deliver before success.

### Verified Android1.0.96 method guide delivery
- Canonical runtime f3e207f4113e5866ed08400497bac00c7d44e39b. Android42219618302/job127898105860 succeeded: all packaged phone checks including new three-width method guide, actual Capacitor startup/transport, Android build and unit tests. Local guide, branding, header/food/plan, native-package, appearance320/390/430, pillar/clarity/privacy/native-health/wellness and plan-package checks passed. Guide top/Zone and unchanged Home/navigation screenshots reviewed.
- Artifact13502762306: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/42219618302/artifacts/13502762306 . ZIP SHA2568504df1ede2e347e3ed54e8d9a526020091920365b631bab8105be76c0efcb56. APK51496502bytes SHA256c01f9e2434e04d77975766a2625174a9d732a1e5f197662cc0176865b4178993. Exact packaged web assets verified against local canonical package. Manifestcom.ezpz.fitness/name1.0.96/code97; APKv2 signature and full digest verified; signer SHA256aff9b047133e210e827b62dcaedc49e40a2ae2248cea0e89656fa7ca8b918a65 matches installed update key.
- Existing APK itemlibfile_545dd90f73f4819197110900611a1827 replaced version79/file_000000001b1081f59592650ab3493de4; local metadata applied. Install as Update over existing app. Owner phone review of guide/logo remains next. Preserved1.0.95 dialog/calorie fixes, original photos/customizations/records and integrations.
- Separate broader Mobile42219618255 passed dedicated sections and was in final general batch at delivery checkpoint. Do not call the entire broader workflow green without observing its final result. Prior broader suite already had a documented meal-backdrop assertion failure; no unrelated runtime changes were made for it.

## Exact uploaded purple Z — 6 November 2026, Android1.0.97/code98
- Owner requested the specific uploaded Z instead of1.0.96 approximation. Traced its actual silhouette and two curved negative-space cutouts into the existing transparent vector asset; shared by guide, navigation and colored logo. Updated dynamic Zone heading and Progress card image paths, which still referenced older PNG. Kept other letters, layout, controls and saved records unchanged.
- Updated existing asset expectations and guide phone check to verify Zone heading uses same asset and navigation leaves saved records unchanged. Local pillar/Sleep/Zone checks pass. Phone checks and hosted build/signature verification pending.

### Verified exact-Z Android1.0.97 delivery
- Runtime2e3a566148f4169c7bfd8ada2a4314a3469c1599. Android42221661363/job127904948294 succeeded: all packaged phone checks, actual Capacitor transport/startup, Android compilation and JVM tests. Local guide/Zone interaction checks pass320/390/430. Reference vector and Zone phone screenshots visually reviewed against owner upload.
- Artifact13503847977: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/42221661363/artifacts/13503847977 . ZIP SHA256f5d2311b6b2a962d490987eb94cb4682e9717cce4cad14f2b5c280f72fd82608. APK51503546bytes SHA25666f2d06d5f1d1312e64eca22ae47c4e49f653e8469dbd8d6c8cb416898765e70. Exact packaged web assets, manifestcom.ezpz.fitness/name1.0.97/code98, APKv2 signature/full digest and known signer aff9b047133e210e827b62dcaedc49e40a2ae2248cea0e89656fa7ca8b918a65 verified. Install as Update; do not uninstall.
- Broader Mobile42221661266 stopped on sleep-overview-mobile image decoding because its test HTTP server mislabeled SVG as JPEG. Test-only followup serves SVG correctly; full sleep-overview-mobile now passes320/390/430. Compact-training-mobile similarly updates old PNG filename expectation and SVG MIME; passes320/390/430 including transparent corners. General mobile guide expectations now match approved Progress label and Zone wording. No runtime workaround or second APK build required for test-server fixes. Full broader suite not claimed green; prior general meal-backdrop issue remains outside this logo scope.
- Owner physical-phone confirmation of exact Z remains next. No changes to data, photos, scoring, logging, backups or integrations.

## Restore original fork E — 6 November 2026, Android1.0.98/code99
- Owner approved the new Z/guide but identified altered E geometry in navigation and guide. Replaced hand-drawn approximation in pillar-eat-clear.svg with a transparent vector trace of the actual original pillar-eat.png silhouette. Keeps original fork/E proportions and three tines, without its baked green rectangle. No Z, layout, wording, photos, data or integration changes.
- Existing guide phone checks pass320/390/430. Original-vs-transparent E and phone guide visually reviewed; compact-training transparency/layout check and hosted Android verification pending.

### Verified original-E Android1.0.98 delivery
- Runtime4b90cfb362ba98873808c2dd45f50f824dcb964b. Android42223686165/job127911672026 succeeded: packaged phone regressions, actual native transport/startup, Android build and unit tests. Local guide and compact-training checks pass320/390/430, including transparent icon corners and unchanged persisted records. Guide phone screenshot reviewed; original fork E restored and uploaded reference Z retained.
- Artifact13505680258: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/42223686165/artifacts/13505680258 . ZIP SHA256616ba092e0a44d4fa6d594b552a24222313d1ba97c1564d57032d2864100d67e. APK51504226bytes SHA2560326e47b25b59513ec5940a1a56733b1e245e2c0f9a4eade1c2297803f064c13. All packaged web assets match local canonical package; manifestcom.ezpz.fitness/name1.0.98/code99; APKv2 signature/full digest verified; signer aff9b047133e210e827b62dcaedc49e40a2ae2248cea0e89656fa7ca8b918a65 matches installed update key. Install as Update, never uninstall.
- Separate broader Mobile42223686262 passed dedicated checks, including corrected SVG fixture sections, and was in final general batch at checkpoint. Do not claim that complete broader suite green unless observed. Owner phone review of restored E is next; no data/layout/other-letter changes.

## Home workout banner Sketch1 — 6 November 2026, Android1.0.99/code100
- Owner approved Sketch1: minimized shows title, actual total checked-set progress and Start/Resume; expanded adds exercise names, per-exercise checked/required sets, completed check marks and existing Change action. Uses real featured workout/draft, including selected/saved routines; no example exercises hardcoded. Original photo/background customization, +/− saved preference and start/change handlers retained. Same title size in both states; expanded content, not larger typography, provides the difference.
- Recovery cards reveal recovery guidance rather than irrelevant exercise rows. Already logged sessions without a draft say Workout logged today and show planned set counts, avoiding fabricated completed sets. No data/schema/scoring/import changes. Read-only previews escape exercise names and no editing controls are added to Home.
- Local Home/unit/logging/training/usability/portable-plan checks pass. Phone guide/banner checks320/390/430 verify shorter minimized height, actual draft counts, selected exercise list, disclosure id/focus/reload, retained records/photos, Start/Change and recovery. Existing Home logging, banner/background editor and rearrangement phone checks pass320/390/430. Scoped screenshots reviewed. Hosted packaged regression/build and APK signer verification pending.

### Verified Sketch1 Android1.0.99 delivery
- Runtime3897041d026cd505f570e38540d9e1410cafd77d. Android42239456659/job127965581728 succeeded: all packaged phone checks including new three-width banner regression, actual Capacitor transport/startup, Android compilation and JVM tests. Local Home preview/logging/background editor/rearrangement checks pass320/390/430; collapsed and expanded screenshots visually reviewed against approved Sketch1.
- Artifact13515611830: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/42239456659/artifacts/13515611830 . ZIP SHA25653e55b06daa0ebb811f5f14334d3a46a7abc29bcfa018f7a47c5f5f13facac46. APK51506470bytes SHA256484c66086a5e3ca8c8da593990cc12f444b0d1a95652f510bc6561fb6f67c54f. Exact canonical packaged assets, manifestcom.ezpz.fitness/name1.0.99/code100, APKv2 signature/full content digest and known signer aff9b047133e210e827b62dcaedc49e40a2ae2248cea0e89656fa7ca8b918a65 verified. Install as Update, never uninstall.
- Separate broader Mobile42239456963 stopped in personal-home-mobile because its legacy assertion expected Change visible in minimized workout card. Updated that test to check hidden Change while minimized and expand before choosing; full personal-home-mobile then passed320/390/430 with saved records, selected photos and all card preferences retained. Test-only followup needs no new runtime build; broader workflow not claimed green. Owner phone review of Sketch1 remains next.

## Readable plan tools and clear current plan — 6 November 2026, Android1.0.100/code101
- Owner found Saved plans & sharing/Reset plan text low contrast and clear option undiscoverable. Added explicit theme-aware summary/dialog text and disclosure indicator. Replaced nested Reset plan with directly visible Clear current plan button inside Saved plans & sharing, alongside unchanged Save/New/Export/Import workflows.
- Confirmation names the displayed active-plan date range, states that past/upcoming scheduled entries in these dates are removed, and explains retained logs, measurements, saved plans/meals/workouts and exercise photos/links. Clears main/extra workout schedules and all meal slots across active dates only; retains entries outside that range, completed history, media, drafts, settings and plan dates. Transactional save rolls back all data on failure. Legacy clearUpcomingPlan API retained unchanged; new explicit whole-current-plan operation used by the button.
- Local plan package/clear-range/flexible-day/privacy checks pass. New phone check320/390/430 verifies actual dark/light foregrounds, visible button, Cancel/Escape/focus, quota failure, three-month first/past/today/final endpoints/extra slots, outside-date and saved content retention, successful blank schedule and reload. Existing packaged save/new/export/import/photo/finish checks pass320/390/430. Tools and confirmation screenshots visually reviewed. Hosted packaged build and APK verification pending.

### Verified readable plan tools Android1.0.100 delivery
- Runtime4ecb189f25f722c1f09edc9ba776ad121420c604. Android42243887303/job127980926703 succeeded: all packaged phone checks, new clear-plan confirmation/cancel/theme/rollback/retention/reload tests320/390/430, native transport/startup, Android compilation and JVM tests. Save/new/export/import/photo and prior Home Sketch1 preserved. Tools and confirmation screenshots reviewed.
- Artifact13516129148: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/42243887303/artifacts/13516129148 . ZIP SHA2561a849c3635040f797e927cdf3c1f7b0dd7a42e9ef73f0e155c64ae29f8d1dc0f. APK51506942bytes SHA256bfb601d00d3d1debc6a8c466e6e32727548680bee0c5823c60af27e9abc1916a. Exact canonical packaged assets, manifestcom.ezpz.fitness/name1.0.100/code101, APKv2 signature/full content digest and known update signer aff9b047133e210e827b62dcaedc49e40a2ae2248cea0e89656fa7ca8b918a65 verified. Install as Update over existing app, never uninstall.
- Day → Saved plans & sharing → Clear current plan opens confirmation with full affected date range; no user data is cleared until the owner explicitly confirms in the app. Clearing keeps completed logs, saved plans/meals/workouts, measurements/media/drafts and dates outside the current range. Physical phone review remains next.
- Separate broader Mobile42243887314 passed dedicated checks and was in final general batch at checkpoint; do not call the whole broader workflow green without observing its final result. All Android packaged checks passed.

## Visual Plan library — 6 November 2026, Android1.0.101/code102
- Implemented approved wide photo-card library and plan preview, reachable with visible Day → Pick my plan and from existing Saved plans & sharing. Saved/received plans share cards with actual scheduled workout/meal counts, lengths, Active/Imported badges, custom cover camera controls, preview contents, rename/export/delete, chosen start date and Activate plan. Existing save/new/export/import/clear actions retained.
- Received files can Save to library without changing any schedule, or activate with a library copy. Activation explicitly reviews occupied dates, requires replacement confirmation, and optionally saves the current plan in the same atomic operation. All failures roll back. Repeated activation reuses unchanged workouts/foods/media; edited existing media is isolated instead of overwritten. Logged records, accounts, goals, photos and unrelated dates retained.
- Covers use existing shared photo cropper, referenced in storage cleanup/full backups and portable plan exports/imports. Optional cover metadata remains compatible with existing version1/2 plan contents. Validated active identity retained in backup; clear/new/delete remove stale Active marker. Existing saved plans need no migration.
- Local plan-library/package/flexible-day/privacy/native-health/training/accounts/photo suites pass. Phone library tests320/390/430 cover actual upload/crop/reload, real counts/contents, rename, atomic save-before/activation/conflict/quota handling, no duplication, import save-only, deletion, themes and retained history. Packaged native transport and existing plan import/export/clear tests pass320/390/430. Library/preview screenshots reviewed against sketch. Hosted build and APK verification pending.
- Pre-delivery review found and fixed a received-cover preview collision: preview now prefers validated photo bytes from the received file over a same-named local photo. Three-width import test explicitly uses a colliding photo ID with different image bytes, then saves without activation; current schedule remains unchanged. Supersede initial b18c97c build with this small correction before delivery.

### Verified Plan library Android1.0.101 delivery
- Final runtimefa17f5aa37de75e9fceca7cc0ba91d0c128426b1 supersedes initialb18c97c. Android42250124300/job128002680886 succeeded: full packaged phone checks including library/covers/activation/colliding received-photo preview and clear-plan regression320/390/430, actual native transport/startup, Android compilation and JVM tests. Initial Android42249206875 also passed before the cover preview correction. Library/preview and actual crop/photo persistence reviewed locally.
- Artifact13519479820: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/42250124300/artifacts/13519479820 . ZIP SHA25621ba6bc9068aa19c67419a51fbf204533f751d27ded54447a43f25deef7053b9. APK51512902bytes SHA2564608c6c9c4ccef88f62b624f25795a8614fe4d8017a395de327383fbcb19a490. Exact canonical packaged assets, manifestcom.ezpz.fitness/name1.0.101/code102, APKv2 signature/full content digest and known update signer aff9b047133e210e827b62dcaedc49e40a2ae2248cea0e89656fa7ca8b918a65 verified. Install as Update, never uninstall.
- Day → Pick my plan opens library. Save current plan or Import a plan; received plans offer Save to library without calendar mutation. Tap a photo card for contents/rename/export/delete and choose start date/Activate plan. Camera uses existing cropper; replacement dates require explicit checkbox; optional save-before is atomic with activation. Existing saved templates migrate through validated optional metadata without overwriting records.
- Separate broader Mobile42250124195 passed dedicated checks and was in final general batch at checkpoint. Do not claim the complete broader workflow green without observing final result. Owner physical-phone review of library/save/import/activation remains next.


## Fresh-eyes clarity polish — 6 November 2026, Android1.0.102/code103
- Owner approved all five review findings. Improved workout-picker secondary/action text contrast; current schedule stays My plan, saved/received templates use Plan library, and current-plan save/new/share/clear actions use Current plan & sharing. Removed duplicate library shortcut inside those tools and added a spaced library entry with a short distinction between library and schedule.
- Progress period controls now explicitly say Through yesterday · Today appears on Home for the current comparison window; older windows say Completed dates · Earlier period. Scoring, windows and tracker data remain unchanged.
- Eat initially displays eight matching recipe cards; Show more reveals eight at a time, moves focus to the first revealed recipe, and keeps all recipes/filters/search accessible. A changed search/category resets the displayed count; counts show displayed/total, and empty results hide Show more. No persisted data or recipe contents changed.
- Local recipe calculations/combined filters, plan library/packages, flexible-day, privacy and native-health suites pass. Three-width phone checks pass for paging/search/all recipes/focus, plan routes/spacing, progress overview/detail period context, light/dark themes and saved-data retention. Existing library cover/import/activation/rollback and clear-plan regression checks also pass320/390/430. Picker and plan-entry screenshots reviewed. Hosted packaged checks/build and APK verification pending.


### Verified clarity polish Android1.0.102 delivery
- Runtime2bb453c47cc3b03c5a52b7340286514079f53788 contains the exact locally reviewed tree7b50d8489c02298e5eb41a991694b63cfb7e192b. After command-line credentials were unavailable, the connected GitHub account uploaded the verified files sequentially with intermediate skip-ci commits; only the completed version triggered the Android build. Owner explicitly renewed publication approval in this chat after automatic approval review rejected earlier retrieved authorization.
- Android42270825566/job128074614319 succeeded: all packaged phone checks including the new three-width review-polish regression, native startup/transport, Android compilation and native unit tests. Local existing library, clear-plan, Progress photo and food-flow regressions pass320/390/430. No recorded data, integration/scoring logic, recipe contents or photo customization changed.
- Artifact13530415010: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/42270825566/artifacts/13530415010 . ZIP SHA2561b0915b0f5753ae28fa1a73ea3e676a25bb4b9a59e0846c391307946f3b5fa34. APK51514162bytes SHA2564c061d73bf4b5921b5ba4c11e01c57ed1b155bfb8dff2e16c5a6f146c2bb0b2e. Exact canonical packaged assets, manifestcom.ezpz.fitness/name1.0.102/code103, APKv2 signature/content digest and known update signer aff9b047133e210e827b62dcaedc49e40a2ae2248cea0e89656fa7ca8b918a65 verified. Install as Update over existing app. Owner phone review remains next.
- Existing APK itemlibfile_545dd90f73f4819197110900611a1827 replaced as version85/file_000000003da081fda2e55cadc121cd1e; metadata applied successfully. Physical phone review of the five polish changes is next.

## Remove unused disclosures and align plan banners — 6 November 2026, Android 1.0.103/code104 (local, awaiting upload)
- User approved removing My plan's Portions & details and Progress overview's Training history & body weight disclosure. Removed both from default rendering; existing direct Home weight/history routes and records remain available without the unused disclosure. No saved-state schema or data changes.
- Plan dates & length, Current plan & sharing, and Copy plan & shopping list now share identical collapsed dimensions, padding, font and arrow layout. Expanded tools retain their controls.
- Local plan library/packages, flexible day and overall suites pass. Extended existing review-polish phone checks pass at 320/390/430 in light/dark themes, verifying missing disclosures, equal computed banner dimensions/styles, expansion, navigation and unchanged saved data. WHOOP and flexible-day phone regressions also pass at all three widths. Local browser used /tmp/ezpz-chromium with a temporary Playwright executable override after browser downloads failed.
- GitHub push was rejected by automatic approval review: explicit authorization to upload/publish this batch to the public repository is required. No remote changes made; do not bypass rejection. APK build/signature/artifact delivery pending owner approval and hosted build. Android version reserved locally as 1.0.103/code104. Prior delivered APK remains 1.0.102/code103.

### Verified Android 1.0.103 delivery — 6 November 2026
- Owner explicitly granted publication permission in the following turn. Uploaded the exact local tree6208b857e0976d15b9064f157699d9ff0644cf71 as runtime8cebe696081bdb7ca998317975bae6cc1d917a86 through the connected GitHub account after CLI credentials were unavailable.
- Android run42274474624/job128087131674 SUCCEEDED: packaged startup and phone regressions, native integration/import contracts, native unit tests and APK compilation. Artifact13531519471: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/42274474624/artifacts/13531519471 . ZIP SHA256c5202c74e545b680a17d3bcb75650f20a78741e8d7d59af54b681fc95f77e949.
- APK51514206bytes SHA2567feecdc2808a7d999d40b3d29af2968fb94548b09115a9e3974814678dadcd4b: full APK v2 signature and content digest, known signer aff9b047133e210e827b62dcaedc49e40a2ae2248cea0e89656fa7ca8b918a65, ZIP integrity, packaged HTML and plan assets checked against the locally tested source. Version1.0.103/code104; install as Update without uninstalling.
- Local focused layout checks passed320/390/430 in light/dark, with identical banner dimensions/styles, working expansion and read-only data retention. WHOOP, flexible-day, plan-library, header/meal-only plan, personal photo and habit-trend phone checks passed at all three widths. Existing photo assertions now use the retained meal banner instead of the deleted duplicate portions block; history renderer tests explicitly open the retained historical view.
- WHOOP callback run42274474713 exposed a pre-existing clock race in tests/whoop-mapping.mjs (two Date.now calls could differ by1ms). Test-only commit1a0adec uses one timestamp; rerun42274669868 SUCCEEDED. No WHOOP runtime change.
- The broad legacy Mobile app checks are separate from the passing packaged Android suite. The legacy habit-trends unit test still includes an obsolete burned-calorie category check that fails after its previously approved removal; do not claim that full legacy suite passed. No new runtime scope was added to address legacy test drift.
- APK signature and package verified; owner phone review is next.
- Existing APK itemlibfile_545dd90f73f4819197110900611a1827 replaced successfully as version86/file_00000000b4a881fb9d0f053040e57397; local metadata applied.

## Scanned salmon label and readable unit controls — 6 November 2026, Android1.0.104/code105
- User requested correcting the pictured salmon macros and unreadable/clipped native g/mL picker. Live read of OFF0096619896622 confirms the source supplies223.214285714286kcal,38.2653061224489P,3.18877551020409C,6.37755102040816F per100g, yielding the reported125/21.4/1.8/3.6 for56g. The existing quantity calculation is correct; the remote record is wrong compared with the photographed package.
- Added an exact UPC/EAN-equivalent label correction for0096619896622 /096619896622 only: photographed56g=70kcal/P12/C1/F2. Maintains full normalized precision, identifies the source as Package label and explains the discrepancy in source details. Other barcodes still use validated OFF data unchanged; no global heuristic or correction to existing logged records.
- Replaced native select with two labelled g/mL toggle buttons, visible selected state, keyboard focus and palette variables. Controls occupy a separate full-width row, eliminating Android's dark-text popup and clipped selected unit. Existing mass/volume basis semantics retained (no inferred density conversion).
- Local barcode mapping and ingredient unit tests pass. Extended barcode phone checks passed320/390/430: exact salmon lookup/56g preview, half/double portions (unit), UPC/EAN equivalence, unrelated barcode isolation, mass/volume selection, >=4.5 contrast in light/dark/lavender themes, no overflow, zero rejection, explicit log, previous-log preservation and reload retention. Existing scanner failures/camera lifecycle and ordinary yogurt logging pass. Food search/manual/photo-flow regression passed all three widths.390px salmon screenshot visually reviewed.
- Updated Android version to1.0.104/code105. Hosted build and signed APK verification pending; same canonical branch/repository and update signer required.

### Verified salmon/unit-controls Android1.0.104 delivery
- Published exact locally tested tree12cf57e2a668e06fbd7ecfc07c7eb4dc0886066e as runtime89522f5405f5c08f9e8c74c41c157ea94212161b after user's fix request, under existing publication approval.
- Android42278430542/job128100753734 SUCCEEDED: canonical packaging, real Capacitor startup, integration/import contracts, full packaged phone suite including extended barcode salmon/contrast/log/reload regressions and native unit tests/compilation. Separate broad legacy mobile workflow retains older test drift; this is the verified packaged Android release.
- Artifact13533858909: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/42278430542/artifacts/13533858909 . ZIP SHA256280fc6280b72d8ce3f5df609e49cb1327664aa76082e61d964b9230c6e39388c. APK51515334bytes SHA2560dcdef8983dea1536c8090f9b528877e1b5a83f8927bc727f9f624c4686f2f6a.
- APK v2 cryptographic signature/content digest, known update signer aff9b047133e210e827b62dcaedc49e40a2ae2248cea0e89656fa7ca8b918a65, ZIP integrity and exact packaged source/plan assets checked. Version1.0.104/code105. Install as Update over existing app. Rescan salmon for corrected values; existing saved meals/logs are intentionally unchanged.
- Existing APK itemlibfile_545dd90f73f4819197110900611a1827 replaced successfully as version87/file_000000003e3c81fda4f0a997c4f3cfa5; local metadata applied. Physical phone scan/review is next.

## Approved matching Add food / Food details — 6 November 2026, Android1.0.105/code106
- Owner approved both sketches, explicitly rejected decorative forks and requested implementation. Food find screen now has a smaller heading, subtle gold glow, gold selected tab, unboxed real search results and a fixed meal tray above original navigation. Count/calories update through the existing ingredient calculation; review remains disabled until ingredients exist. No decorative forks, new data sources, fake suggestions or food photographs added.
- Food details uses compact identity/source, one-row amount/unit controls and gold/blue/mint macro tiles, with the original Add to meal action anchored above navigation. Removed duplicate Back to foods button; the accessible header Back remains. Normal meal review/manual inputs and explicit save handlers remain unchanged.
- Presentation-only food-flow-design.js observes rendered panels and viewport/focus changes. It measures actual nav/dock heights, uses visualViewport offset/height for overlay keyboards and detects native resized keyboards, hides nav/header while keyboard is open, compacts details, restores layout when closed and clears keyboard state on navigation. Android activity explicitly requests adjustResize. Long content remains scrollable above anchored actions. No record writes, nutrition changes, draft migration or integration changes.
- Existing barcode mapping (including package-corrected salmon), ingredient and phone barcode/search/manual/recipe/saved-food flows pass320/390/430. Added three-width phone regression for440px keyboard viewport, anchored actions and macro visibility, light/dark/lavender contrast, no horizontal overflow, count/calories, unchanged state during layout changes and explicit correct log. Test servers now serve external CSS/SVG correctly, so layout checks exercise real styles and original logos. Keyboard and find390px screenshots visually reviewed. Native phone keyboard behaviour still needs owner confirmation.
- Added new phone check to existing Android and mobile workflows. Version1.0.105/code106; hosted packaging/native checks/build and signer verification pending.

### Verified matching food screens Android1.0.105 delivery
- Published locally tested treebb6de6c8993458faaadee64e4430dbfa508e3dda as runtime8e190b180fef43afd5f3ef36461aa27071022fe6 on canonical android-health-connect. Android42282822929/job128115926860 SUCCEEDED, including the new food design phone check, existing packaged food/barcode/integration checks, native tests and compilation.
- Three-width local design regression also passed overlay-keyboard simulation (visualViewport440px/20px offset while layout height stays844) in addition to native-style resize. Screenshot review confirmed compact amount/macros and visible action, matching find screen, original footer artwork (test servers corrected to serve SVG/CSS with actual MIME types).
- Artifact13537250216: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/42282822929/artifacts/13537250216 . ZIP SHA25634e4003143153b5e8ac1c6c25d54bcf44628582fcbd290cb64ec8aa9b4d2ba25; APK51518649bytes SHA256094d1c37f0b087563b25cd019b1d3419b36a13abf11a6ed50c8dc3d0a367b0d6.
- Verified cryptographic APKv2 signature/content digest, known update signer aff9b047133e210e827b62dcaedc49e40a2ae2248cea0e89656fa7ca8b918a65, ZIP integrity, version1.0.105/code106, canonical packaged HTML and exact new food-flow-design.css/js plus plan assets. Install as Update without uninstalling. Physical Samsung keyboard review is next; browser keyboard simulations do not replace that device check.
- Existing APK itemlibfile_545dd90f73f4819197110900611a1827 replaced as version88/file_00000000fb08821287fa21085dfda97d; local metadata applied. Owner should test food search/amount and Samsung numeric keyboard on the installed update.

## Free package-label reader and saved barcode corrections — 6 November 2026, Android1.0.106/code107
- Owner requested a reliable scanner at zero paid API cost after OFF records differed from three package labels. Keep free barcode lookup; clearly mark database entries as unchecked. Bundle Google ML Kit Latin text recognition16.0.1 in the APK: label photos processed on device, no paid API/key/account or cloud OCR service. Explicit user review remains necessary; no promise all database records or OCR results are correct.
- Food details offers Read / correct label. A photo fills a draft serving amount/unit/calories/P/C/F; uncertain, missing or multi-column values remain blank. Saving requires every value and the package-confirmation checkbox. Save per canonical barcode, support UPC/EAN equivalence, use saved values before network, preserve historical logs and include validated corrections in full backups. Unknown/unavailable barcodes can also be completed from their package. Storage failure rolls back. No label image or recognized text retained in state.
- Built-in photographed-package corrections: salmon09661989662256g=70/12/1/2; NuttZo89469700218433g=180/6/8/15; Genoa01111099836157g=230/10/2/20 (kcal/P/C/F). Full precision normalized values avoid serving drift. User corrections take precedence. Existing logs/drafts are not silently rewritten.
- Local pure tests pass label parsing/validation, checksum/aliases, known serving arithmetic, overrides, backup cleaning and quota rollback. Phone tests cover320/390/430, photo draft bridge simulation, explicit review/save, failed persistence rollback, reload/offline lookup, backup, old-history retention and logging. Android instrumentation separately runs actual bundled OCR against three generated labels with emulator Wi-Fi/data disabled; hosted result pending. No private package photos are published.
- Native compile, full packaged checks, actual OCR emulator run and APK signer verification pending hosted build. Canonical source upload authorized by existing agreement. Prior delivered APK1.0.105/code106 remains current until verified replacement.

- Follow-up integrity guard: scanned foods retain their declared g or mL nutrition basis; opposite-unit control is disabled because grams cannot be converted to volume without density. Package-label editor can specify the actual label basis. Updated barcode phone test verifies no unsupported weight-to-volume conversion.

### Verified Android1.0.106 delivery — free on-device label reader
- Runtime tree69ed057dbd3c9f75fb1097d02d5ace61bcb7d0c2 published as eadd92f38615848a9d467b78f6e0bbd80a0fb220. Canonical Android run42289143565/job128137674707 SUCCEEDED: import contracts, real Capacitor startup, full packaged phone suite including label review/persistence/backup/offline/unknown-barcode flows, native unit tests and compilation. Local barcode, package-label and keyboard/design checks passed320/390/430. No paid API/key/account, provider signup or billing change.
- Actual bundled ML Kit OCR run42289676206/job128139501314 SUCCEEDED on API35 emulator with Wi-Fi and mobile data disabled. One instrumented test runs three generated labels and checks serving amount, calories, total fat, carbohydrate and protein. Initial run42288789985 read all required salmon fields but failed an assertion on unused saturated-fat 0g (recognized as Og); test follow-up c02258d0865d8479eaf78b01156c7bcda32b4d31 checks only imported fields. Runtime does not coerce ambiguous OCR characters to zero; missing values remain blank and explicit human confirmation is required. These synthetic emulator fixtures do not replace physical Samsung package-photo testing.
- Final APK artifact13538743572: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/42289143565/artifacts/13538743572 . Complete ZIP SHA256590aa20b2fbe73b646ff60e585c781622f7b2055e444d23d459821fb287f8693. Two partial local transfers were rejected before extraction; complete transfer matches artifact digest.
- APK96578342bytes SHA256a9ac1541b1055e53c23f92978cb859c9147ef93051b854be19411940c6b16350. Verified APKv2 cryptographic signature/full content digest, known update signer aff9b047133e210e827b62dcaedc49e40a2ae2248cea0e89656fa7ca8b918a65, ZIP integrity, version1.0.106/code107, canonical packaged HTML, exact package-label and food-design assets, native reader registration and bundled OCR model/library. Install as Update without uninstalling.
- Replaced existing APK itemlibfile_545dd90f73f4819197110900611a1827 as version89/file_00000000b38481fdb9eee486cdaeb9d8; local metadata applied. Current source branch remains android-health-connect. Next: physical S23 photo reading and review. Free database records remain unchecked until package-confirmed; no universal accuracy claim or silent historical-log rewrite. Separate broad legacy mobile workflow remains distinct from this passing packaged release.

## Direct camera nutrition-label correction — Android1.0.107/code108
- Owner's Samsung opened gallery from the former HTML capture input. Replaced camera route with explicit native ACTION_IMAGE_CAPTURE, full-resolution EXTRA_OUTPUT private FileProvider URI, camera permission handling, bounded decode and EXIF orientation correction; completed/cancelled captures delete temporary images. Existing gallery photo option remains separate with no capture attribute. No paid API/dependency added.
- Scanned food now offers a camera-icon Scan nutrition label action that immediately opens camera via native capture and feeds returned OCR into serving amount/unit/calories/P/C/F review fields. No manual copying when values read successfully; ambiguous values stay blank. Explicit review/save applies remembered per-barcode correction and refreshes current portion, preserving old logs. Cancellation/permission denial keep draft/state unchanged; closed-dialog late results ignored.
- Focused320/390/430 browser tests pass automatic native capture bridge invocation, transferred values, required review, cancellation and permission denial, existing gallery OCR, save rollback, reload/offline/backup and unknown barcode. Android instrumentation now verifies full-resolution camera intent/output and actual rotated high-resolution JPEG decode in addition to real bundled offline OCR fixtures. Hosted build/tests and APK verification pending.

### Verified direct camera delivery — Android1.0.107/code108
- Runtime864df2367022c4f475227d6a3c0d7733f308dc9d, treec48e2b311ace8850b2dae7ed7f2cc6bcf79c13f9: Android42293834425/job128153819940 SUCCEEDED including full packaged regressions, native unit tests and compilation. Offline OCR42293834510/job128153819997 SUCCEEDED:2 instrumentation tests cover full-resolution camera intent/FileProvider output, bounded EXIF-rotated JPEG decode and real OCR on3 generated labels. Browser tests mock camera bridge; actual Samsung camera handoff awaits owner confirmation.
- Artifact13541406328: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/42293834425/artifacts/13541406328 . ZIP SHA256812960792f2644a20d824840afa1c42fea539fcca505d253463a5aa88f5bfb2d. APK96578638bytes SHA256f705b86485ed78134b84db7af54d0130d123e0c0af88adf989d77997892f2946. APKv2 signature/content digest, known update signer aff9b047133e210e827b62dcaedc49e40a2ae2248cea0e89656fa7ca8b918a65, ZIP integrity, version1.0.107/code108 and exact packaged HTML/food modules verified. Install as Update without uninstalling.
- Existing APK itemlibfile_545dd90f73f4819197110900611a1827 replaced as version90/file_0000000084dc81f5b2cb5eabcc0fcf3a; metadata applied. Next: physical phone scan, camera-icon Scan nutrition label, photograph label, confirm automatic macro/serving transfer, save and rescan. Unreadable values require correction; no universal OCR/database accuracy promise. No paid API added.

## Approved food macro ring — Android1.0.108/code109
- Owner approved sketch: compact energy-share ring beside calories, gold carbs/blue protein/mint fat matching existing tiles, percentages under grams and unchanged anchored Add to meal. Ring shrinks with keyboard. This is presentation only; package calories, portion totals, source data, label-reader corrections, logs and explicit save handlers remain unchanged.
- Shares normalize C×4, P×4, F×9; largest-remainder whole percentages total100. Spaghetti42C/7P/1F shows82/14/4, rather than the sketch's approximate81/14/5. Labelled200kcal remains200 despite macro-derived205kcal. Accessible ring describes estimated macro energy split; no daily-goal or net-carb claim. Empty/zero-energy states have no ring.
- Pure tests pass rounding/sum100, scaling invariance, single-macro and invalid/zero cases. New phone check covers320/390/430, portion changes/unchanged grams and calories, empty state, themes, keyboard shrink and anchored action. Local browser checks passed using an extracted Chromium after standard download failed. Existing food-design checks also pass320/390/430 in all tested themes and both keyboard models. Percentage captions hide while typing and ring shrinks56px to preserve macro/action visibility. Hosted Android package/native checks pending. Latest delivered remains1.0.107/code108 until verification. Owner confirmed direct camera label correction works well.

### Verified macro-ring delivery — Android1.0.108/code109
- Runtime5a76189d6190bde1fc1eef9b30b29a433dc22f93 treecf4a688bb5d8b04138c2e28a05f6956eac9acd06. Android42303358130/job128186465202 SUCCEEDED: full packaged phone/startup suite including new macro-share and three-width ring checks, native unit tests and APK compilation. Offline camera/label-reader42303358181/job128186465466 SUCCEEDED. Local macro-ring and existing food-flow keyboard/theme checks passed320/390/430. Actual ring390 screenshot visually reviewed. No nutrition records/source values or save semantics changed.
- APK artifact13546320117: https://github.com/reimerskasper-creator/Ezpz-trainer/actions/runs/42303358130/artifacts/13546320117 . ZIP SHA256406d045a2c95cc454073f0571dd1f47727cfdcb049ae430bf29f7155508d426f. APK96579998bytes SHA256fdde14e839b5105c01dbf9dac39ae35c316cebf748a781500dccd7683739c7e0. Verified APKv2 cryptographic signature/full content digest, known update signer aff9b047133e210e827b62dcaedc49e40a2ae2248cea0e89656fa7ca8b918a65, version1.0.108/code109, ZIP integrity and exact packaged HTML/food-design/package-label assets. Install as Update without uninstalling.
- Replaced existing APK itemlibfile_545dd90f73f4819197110900611a1827 as version91/file_00000000b7e881f58527e58bbde788e3; metadata applied. Next: owner physical-phone review of ring, portion changes and keyboard. Broader legacy mobile workflow remains separate from the verified packaged Android suite. No paid services added.

## Steps screen and Step Bank — Android 1.0.109 / code 110
- Branch: android-health-connect. This source update adds the Steps hero, standalone goal editor, Overall switch and opt-in Step Bank, with a Home badge in both states of the Steps banner.
- Bank credit uses selected daily totals from completed dates after opt-in. Withdrawals are explicit and capped at 40% of the applicable daily goal. Late syncs reconcile credit without altering walked totals.
- Local checks: wellness, Home, native-health and whitespace checks. Android delivery: Android Health Connect test workflow for this source commit. Next: verify packaged APK and test the interaction on Android.

## Exercise progress pickers — Android 1.0.110 / code 111
- Android branch: android-health-connect. Exercise and Show use the existing app dialog style. Exercise supports search; the selected value has a checkmark. Chart logic and Zone are untouched.
- Local checks: overall, wellness, script syntax and diff whitespace. Android delivery pending the test workflow. Next: verify the Android picker interaction.

## Scanned food details — Android 1.0.115 / code 116
- Canonical Android branch: android-health-connect. Carries forward the packaged 1.0.114 startup sweep from commit 8ea413a and the preceding FatSecret fallback and Steps fixes.
- Barcode details show the food illustration and live portion macros alongside the amount field. Gram-based labels use a scale, volume-based labels use a measuring jug. Package corrections still use the existing camera and review flow.
- Bundled reusable food illustrations and a neutral plate for uncertain matches. The illustrations are generic and selected conservatively from the product name. No external photo service is needed.
- The Android workflow includes a three-width regression for gram and mL scans, live totals, keyboard geometry, illustration fallback and adding a portion. Verify the signed APK before delivery.

## Android 1.0.116 — scanned product photos and startup lighting

- Food details can pick, crop, replace or remove a personal product photo. Barcode aliases share the photo. Ingredient review shows it, and single-product diary entries and saved foods inherit it unless an explicit meal photo is selected.
- The startup wordmark is larger. A full-screen emerald highlight travels diagonally from lower left to upper right before the app fades in. Android's animation preference and startup timeout still apply.
- Build and delivery are tracked by the Android Health Connect workflow on the canonical Android branch.

## Android 1.0.117 — consistent pillar lettering

- The four marks have a common visible height in the Method guide, navigation and pillar headings. The Home and Android startup wordmarks use the same four marks, including the approved two-wave purple Zone Z.
- Delivery is tracked by the Android Health Connect workflow on the canonical Android branch.

## Android 1.0.118 — create and edit plans in Plan library

- Create a plan opens a separate 1–93-day draft with numbered days, available workouts and meals, portions and extra entries. Saved plans can be edited in place. Saving commits the library entry independently of the active schedule.
- The existing library preview handles export and explicit date-based activation. Local planning, package and library regression checks pass. The Android workflow runs the create/edit/export/activate flow at three phone widths and packages the signed test APK.

## Android 1.0.119 — searchable library plan pickers

- The draft editor opens saved workouts and meals first when available, with separate searchable EZPZ lists. Meal slots and half-portion controls are in-app. The native day selector uses a light popup palette.
- Existing plan packages, export and activation remain compatible. Mobile coverage exercises saved and built-in entries, search, picker dismissal, meal slots, portions and active schedule isolation.

## Android 1.0.120 — approved four-color wing

- Android launcher resources use the approved wing. The startup asset combines the wing and EZPZ Fitness lettering. Existing launch animation code continues to draw the new asset.
- The signed test APK is produced by the Android Health Connect workflow on the canonical Android branch.

## Android 1.0.121 — C1 swirl and split-letter branding

- The approved C1 swirl is the Android launcher mark. The full C1 and split-letter wordmark appears in the Home header and on startup with the existing diagonal sweep.
- The signed test APK is built by the canonical Android Health Connect workflow.

## Android 1.0.122 — shared branding and Home tab

- The shared page header uses the approved C1 lockup, with a compact size beside Back and More on inner pages. The Home tab uses a 30 px C1 swirl with a mint selected-state halo. The new asset is included in the offline cache and native web package.
- Local Home, wellness, Health Connect and account checks passed. Browser checks could not launch locally. Android delivery uses the canonical Health Connect workflow.
