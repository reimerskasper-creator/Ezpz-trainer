# Nutrition targets

The questionnaire provides a starting estimate for adults, with editable manual targets. It does not measure metabolism or determine uniquely correct macros. Existing profiles retain their previous targets until the user explicitly saves new ones.

## Calculation

- Resting energy: Mifflin–St Jeor, `10 × kg + 6.25 × cm − 5 × age + coefficient`; coefficient +5 for the male equation or −161 for the female equation.
- Overall activity factors: seated 1.2; light 1.375; moderate 1.55; very active 1.725; exceptional 1.9. These are broad app assumptions covering daily life **and exercise together**, not measured expenditure or Cronometer/MyFitnessPal's proprietary calculations. Logged workouts do not add calories again.
- Goal adjustment: maintain 0%; gentle loss −10%; steady loss −15%; gentle gain +5%; steady gain +10%. Energy is rounded to 10 kcal before allocating macros.
- General-calculator starting minimum: 1,500 kcal; estimates above 7,000 kcal require individual targets. Rounded macro energy can differ by up to 2 kcal from the allocation value.
- Protein defaults: seated maintenance 1.2 g/kg; seated loss/gain 1.4; active maintenance 1.6; active loss/gain 1.8. Protein is capped at 35% of energy. Fat uses about 30% of energy; carbohydrate receives the rest. These are explicit product defaults, not a claim that any one split is optimal for every person.
- Grams round to whole numbers, and displayed calories are computed from those final grams (4P + 4C + 9F), so totals remain internally consistent.
- Example: male coefficient, 35 years, 80 kg, 180 cm gives 1,755 kcal resting and about 2,720 kcal estimated maintenance at factor 1.55. Gentle loss allocates 2,450 kcal: protein 144 g, carbohydrate 284 g, fat 82 g.

## Boundaries and persistence

The calculator validates adult age, height and weight, does not provide standard estimates for pregnancy/breastfeeding or clinician-prescribed diets, and blocks weight-loss calculations at BMI below 18.5. These boundaries do not make it a clinical tool. Users are prompted to review their weight trend, energy and training after 2–3 weeks and adjust their targets.

Manual gram targets calculate calories directly; storage validation accepts totals of 1,000–10,000 kcal and finite nonnegative macro values. These validation limits are not recommended intakes. Target changes preserve food logs. Both Home and the diary call the same `target()` function. Saved estimates include normalized questionnaire answers; backups sanitize both targets and answers. Failed saves roll back both records.

## Primary sources reviewed on 21 October 2026

- Mifflin et al., *A new predictive equation for resting energy expenditure in healthy individuals*, 1990: https://pubmed.ncbi.nlm.nih.gov/2305711/ — resting-energy equation.
- ISSN position stand, *Protein and exercise*, 2017: https://link.springer.com/article/10.1186/s12970-017-0177-8 — protein context for exercising adults; does not prescribe the app's entire allocation algorithm.
- NIDDK Body Weight Planner research: https://www.niddk.nih.gov/research-funding/at-niddk/labs-branches/laboratory-biological-modeling/integrative-physiology-section/research/body-weight-planner — adult scope and limits; EZPZ does not implement NIH's dynamic weight-change model.
- MyFitnessPal's own description: https://support.myfitnesspal.com/hc/en-us/articles/24763932864397-Macro-Calculator — inspiration for body/activity/goal questions. MyFitnessPal separates exercise from baseline activity; EZPZ explicitly uses overall activity instead.
- Cronometer's own descriptions: https://support.cronometer.com/hc/en-us/articles/31974307318420-Energy-Expenditure and https://cronometer.com/blog/how-to-set-your-macro-and-micronutrient-targets/ — inspiration for manual targets alongside estimates.

## Verification

Unit checks cover reference math, sex/age/size changes, imperial conversion, all activity/goal combinations, rounded energy consistency, validation boundaries, unsupported situations, manual overrides, backups, preservation of logs and storage-failure rollback. Chromium checks all three questionnaire steps, cancellation/review without saving, manual targets, Home/diary updates and reload persistence at 320, 390 and 430 pixels.
