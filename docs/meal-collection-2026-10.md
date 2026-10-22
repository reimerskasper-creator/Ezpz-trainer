# Fruit, dairy and everyday meals — October 20
Added 15 new dish families, each with balanced, high-protein, high-carbohydrate and higher-fat gram profiles. 60 recipes append at indices 97–156. Existing 97 recipes and their numeric IDs stay unchanged. Totals: 31 protein, 31 carb, 31 fat, 64 balanced; 157 recipes.

## Nutrition
All recipe calories and macros use the same ingredient-weight calculation as before. Four new per-100g references are rounded generic estimates; actual brands, fruit varieties and cooking losses vary. Existing food references remain unchanged.

| Food | kcal | Protein g | Carbs g | Fat g | USDA SR Legacy FDC record |
|---|---:|---:|---:|---:|---|
| Green kiwi, peeled | 61 | 1.1 | 14.7 | 0.5 | 168153 |
| Mango flesh | 60 | 0.8 | 15 | 0.4 | 169910 |
| Honey | 304 | 0.3 | 82.4 | 0 | 169640 |
| 95% lean ground beef, crumbles, cooked pan-browned | 193 | 29.2 | 0 | 7.6 | 174028 |

Reference catalogue: [USDA FoodData Central](https://fdc.nal.usda.gov/). [USDA food composition overview](https://www.nal.usda.gov/human-nutrition-and-food-safety/food-composition). Beef data are for cooked crumbles, not raw beef. Fruit weights exclude peel, core or stone as labeled. Dairy is plain nonfat Greek yogurt or 2% cottage cheese as labeled. Dairy, honey and nut butter require no cooking; prepared protein/grain references use cooked weights. Prep times assume ingredients labeled cooked are ready.

Macro focus is the existing app convention: protein >=35%, carbs >=55%, fat >=40% of macro-derived 4/4/9 energy. Balanced is a general meal grouping. These labels are not regulatory nutrient claims.

## Photographs
Fifteen separate photographs generated with the built-in image-generation tool. All use an overhead ivory plate/bowl, pale beige stone, soft daylight and only the listed ingredients. The four gram profiles share the matching dish photo. Photos illustrate ingredients and plating, not precise gram quantities. Existing images are untouched. Final repo assets: meal-images/collection-2026-10-dish-01.jpg through meal-images/collection-2026-10-dish-15.jpg, 640px JPEGs.

Full prompt set, recipe names and ingredient weights are in [meal-collection-prompts-2026-10.json](meal-collection-prompts-2026-10.json). Images are reviewed for ingredients, presentation and style before committing.

## Verification
Recipe tests protect the previous 97 recipes and previous food-table entries. Added checks cover all 60 new diary/shopping paths, four distinct profiles per dish, 15 image assets and all focus thresholds. 532 half/standard/1.5/double portion cases. Browser tests cover counts, photos, search, newest profiles, half/double portion nutrition and phone overflow at 320/390/430px.
