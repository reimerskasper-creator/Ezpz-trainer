# Train photo styling
This extends the approved Home visual language to Train using existing images.

- Selected workout cover behind the session header.
- Gym equipment behind session progress, options and the Finish bar.
- Coastal walking image behind the rest timer.
- Relevant workout-category covers behind exercise summaries.
- A faint equipment texture under the light logger body, with solid high-contrast fields.

Exercise-summary photos are decorative category covers. They are not a technique demonstration for each listed movement, and no unapproved exercise-library image was enabled. Unknown custom exercises use their chosen session cover.

All set fields, data attributes, readers, validation, draft persistence, timers and workout definitions are unchanged. The selected-workout cover variable comes from the existing trusted cover map, HTML-escaped into a CSS url. Existing chooser photo markup remains in the DOM for compatibility; its redundant thumbnail is hidden on Train because the same cover now fills the header.

Verification includes all existing suites, all 55 selected cover associations, real Chromium at 320/390/430px, set logging/reload/completion and rest timer flows, and a dedicated five-panel screenshot sheet.