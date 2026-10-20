# Day-to-four-week planning

Single canonical fitness.html app. Home's empty shopping shortcut is replaced by a related-photo next-workout preview and compact weight row. The next uncompleted scheduled workout takes priority; the selected workout is the fallback.

My plan is accessible from Home's next workout card, Train, More, and Eat's planning tool. Choose a start date and a 1-, 7-, 14-, 21-, or 28-day range. Edit one day at a time; longer ranges have week navigation. Plans for other dates are preserved when changing range. Workouts can be fixed sessions, the existing rotating plan, rest, or a saved custom session. Breakfast/lunch/dinner use the 49 approved recipes and existing portion options. Planning does not log food as eaten.

Custom workouts can be built from scratch or cloned from an existing session. Choose a focus, experience level, equipment, estimated time, then add/reorder-by-creation exercise rows with sets, reps or duration, units, rest and per-side flag. Short custom sessions are allowed. Saved sessions are reusable from the planner and participate in standard workout logging, drafts, history and backups. Category cover photographs remain illustrations rather than technique demonstrations.

Copy-day and repeat-first-week actions require confirmation because they overwrite destination plans, including blank entries. Shopping uses all dates in the selected range and exact scaled ingredient weights, adding to the existing list. Repeated shopping actions add again, matching existing behavior; the UI states this explicitly.

All 55 built-in choices show experience level, effort and setup before selection. A chair squat remains a beginner foundation even when the user's profile adds sets. Mobility and easy foundation work are distinguished from hard intervals. Levels describe movement demands, not a promise of a particular physiological response; loads and effort remain adjustable.

Three impractical interval layouts were revised: hiit-a uses six standing bodyweight movements; hiit-b uses a low stable step and sturdy counter; hiit-gym uses light dumbbells and a mat, including marching in place. No revised HIIT session requires switching between cardio machines, ropes and sleds. Each uses straight intervals at one movement before the next. Other HIIT sessions already use one space. Multi-machine steady cardio retains an explicit multiple-station label and has no timed transitions.

Changed HIIT drafts are matched by exercise name, not old row index. Full originals are archived with their old prescriptions and available in More and exports; unmatched sets never appear under a new exercise name. Existing history is untouched. State adds customWorkouts, workoutSchedule, plannerStart, plannerDays, plannerOffset, activePlanDate, hiitLayoutVersion and workoutDraftArchives. Restores validate custom definitions, schedule dates and IDs, and retain valid custom drafts. The storage key and recipe indices remain unchanged.

The food fixture updates only eat() to route to the new planner. All other approved food functions, recipe data, ingredient weights, reference macros, photographs and base stylesheet remain locked. The workout fixture updates only the two authorized legacy HIIT definitions; other legacy definitions remain locked.

Verification: tests/planning.cjs covers ranges, date boundaries, copying, rest, exact nutrition and shopping, custom validation/restoration, next workout and draft migration. tests/mobile.cjs adds real Chromium flows for planning, building, logging custom sessions and restoring plans at 320/390/430px, plus screenshots.
