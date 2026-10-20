# Recipe catalogue expansion

25 recipes appended to the original 24. Numeric indices 0–23 remain unchanged because existing meal plans store them. The recipe browser shows the new entries first without changing these references.

## Inspiration

These are original EZPZ combinations and instructions, not reproductions or endorsements. Inspiration: [USDA black bean quesadilla](https://www.nutrition.gov/recipes/black-bean-quesadilla), [VA Nutrition vegetarian recipe collection](https://www.nutrition.va.gov/Recipes/Vegetarian_Recipes.asp), and [NHS balanced eating guidance](https://www.nhs.uk/live-well/eat-well/how-to-eat-a-balanced-diet/eight-tips-for-healthy-eating/). Each new detail page links its relevant inspiration.

## Nutrition and portions

Calories, protein, carbohydrate and fat use generic per-100g ingredient reference estimates in foods, multiplied by the listed ingredient weights. They are estimates, not laboratory analysis or exact branded label values. Raw/cooked/drained states are included in ingredient names. Existing reference values are unchanged. These adapted recipes do not use the source recipes' nutrition numbers. [USDA FoodData Central documentation](https://fdc.nal.usda.gov/data-documentation/) explains food-data types and variability.

All oil, nuts, dairy and seasoning used in these recipes are counted. Prep estimates assume ingredients labeled cooked are already prepared; overnight chilling is stated separately. Ingredient weight includes water before evaporation, so it is not a claim about finished plated weight.

## Images

One independently generated serving illustration per new dish, based on its listed ingredients. JPEGs are sized to 640 pixels at quality 78 for mobile loading. Photos illustrate the dish and do not establish measured portions. No influencer photos or copyrighted recipe prose were copied.

## Validation

Run `node tests/recipes.cjs`. Covers all 49 recipe cards, 25 image paths, 100 portion calculations and displayed ingredient weights, combined search/category filtering, meal planner access, food logging and shopping quantities. Saved numeric meal references and storage are retained. Browser/mobile visual QA was unavailable in the authoring session.

| New recipe | kcal | Protein g | Carbs g | Fat g |
|---|---:|---:|---:|---:|
| Apple cinnamon overnight oats | 450 | 31 | 66 | 8 |
| Strawberry almond yogurt bowl | 438 | 37 | 50 | 12 |
| Spinach mushroom egg toast | 421 | 28 | 39 | 18 |
| Cottage cheese pear bowl | 509 | 34 | 58 | 18 |
| Banana oat pancakes | 486 | 27 | 72 | 12 |
| Breakfast bean burrito | 495 | 26 | 57 | 18 |
| Peanut strawberry porridge | 465 | 22 | 63 | 16 |
| Chickpea quinoa crunch salad | 504 | 22 | 71 | 16 |
| Black bean quesadilla | 529 | 27 | 78 | 13 |
| Lemon chicken quinoa bowl | 466 | 55 | 43 | 8 |
| Tuna white bean salad | 412 | 41 | 44 | 9 |
| Tofu edamame rice bowl | 563 | 40 | 58 | 23 |
| Turkey avocado sandwich | 487 | 49 | 46 | 13 |
| Lentil feta grain bowl | 460 | 25 | 63 | 13 |
| Chicken hummus-style wrap | 540 | 50 | 60 | 11 |
| Shrimp avocado quinoa bowl | 449 | 42 | 43 | 14 |
| Lentil tomato pasta | 555 | 29 | 99 | 9 |
| Lemon cod tray bake | 489 | 41 | 60 | 10 |
| Chicken pepper fajita bowl | 569 | 55 | 56 | 13 |
| Smoky bean sweet potato | 558 | 25 | 102 | 8 |
| Salmon quinoa greens | 550 | 42 | 44 | 24 |
| White bean tomato skillet | 573 | 32 | 92 | 11 |
| Tofu peanut whole wheat noodles | 616 | 43 | 72 | 24 |
| Chickpea spinach tomato stew | 554 | 24 | 95 | 11 |
| Warm lentil vegetable soup | 514 | 28 | 85 | 9 |
