# Ingredient calculator test

Source: USDA FoodData Central SR Legacy April 2018, downloaded from https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip on 2026-11-02. Public-domain CC0 data. `fitness-app/usda-foods.json` contains 7,793 records with all four required nutrients. Row format: FDC ID, original description, kcal, protein g, carbohydrate g, fat g, all per 100g. Nutrient IDs: 1008, 1003, 1005, 1004. Incomplete records excluded; actual zeros retained.

Generic database, not current branded-product coverage. Source and vintage shown in UI. No API key, paid API, AI or barcode scanning. Database bundled and precached for offline use. Browser storage receives only explicitly saved meal totals; no provider receives user searches. Ingredient rows are a session draft; saved meals retain existing reusable totals/portions, not editable ingredient recipes. Refresh discards an unlogged ingredient draft.

Log food → Add ingredients → search, e.g. banana 120g → select Bananas, raw → search Greek yogurt → select plain nonfat → change grams to 200. Expected totals: 224.8 kcal, P 21.7g, C 34.6g, F 1.2g. Review food types, name meal, Log food. Existing saved food and diary path is reused. Manual fields become read-only while ingredients are present; removing all ingredients restores manual input. Invalid grams block logging. No-results/load failures offer manual fallback.

Browser checks: `node tests/ingredients-mobile.cjs` at 320/390/430px, plus existing custom-foods and recipes checks. This repository contains the browser app; no native Android wrapper/build configuration is present.
