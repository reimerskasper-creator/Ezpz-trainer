# Photo-led food logging flow

Implements approved Sketch 2 with existing photo assets, dark forest overlays, emerald glass surfaces and the original footer icons. Add food opens directly to search + compact scan icon, Foods / Saved / Recipes tabs and a visible manual-entry action. Search/scanning share one compact amount and macro preview, then return to the meal tray. Review & log opens the existing food form with editable ingredient rows, name, photo and saved-meal options. Explicit logging and existing diary/saved-meal data formats remain unchanged.

Manual nutrition now adds a named food to the current meal draft, using the existing parser and validation. It does not log until the separate review/log action. Draft ingredients remain in session memory across food-screen views; refresh discards an unlogged draft as before. No automatic writes on search/tab/scanner navigation.

The homepage nutrition footer has an accessible barcode icon beside Log a meal. It opens Add food and starts the scanner from the user's tap, using today's diary date. Normal food diary entry preserves its selected date. Camera denial shows a typed-barcode fallback; camera cleanup, product validation and nutrition calculations are retained. The scanner occupies the viewport and hides the footer until closed; typed barcode and privacy/source details are disclosures.

Photography is decorative and reused from the existing app; no generated product photos are presented as package identification. Source/basis details remain available through information disclosures. Grams/mL is explicit and never converted without data. Saved foods and all 157 recipe flows are retained.

CI exercises phone widths 320/390/430, home camera/date behavior, manual ingredient addition, draft preservation, explicit logging, tabs, searches, and the existing recipe/custom-food/barcode suites. Review the screenshot artifacts before deployment.
