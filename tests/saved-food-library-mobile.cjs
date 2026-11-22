const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const formats = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json' };
const localApp = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  fs.readFile(file, (error, data) => {
    if (error) res.writeHead(404).end();
    else res.writeHead(200, { 'Content-Type': formats[path.extname(file)] || 'application/octet-stream' }).end(data);
  });
});
const mealId = 'cf-breakfast';
const dates = ['2026-11-23', '2026-11-24'];
const diary = [{ id: 'food-original', date: '2026-11-22', name: 'Breakfast bowl', custom: true, customFoodId: mealId, servings: 1, macros: [400, 30, 40, 12], photoKey: 'plate' }];
const fixture = {
  profile: { goal: 'maintain', level: 'Beginner', equipment: 'home', days: 3, age: 35, weight: 80, height: 180, sex: 'male' },
  logs: [], weights: [], workoutLayoutVersion: 2, foodLog: diary, favouriteRecipes: [0],
  customFoods: [{ id: mealId, name: 'Breakfast bowl', macros: [400, 30, 40, 12], photoKey: 'plate' }],
  mealPlan: { [dates[0]]: { breakfast: mealId, breakfastPortion: 1.5 }, [dates[1]]: { lunch: mealId, lunchPortion: 2 } }
};

async function check(width, mode, accent) {
  const page = await browser.newPage({ viewport: { width, height: 820 }, isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(data => {
    const key = 'ezpz-fitness-pilot-1';
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(data));
  }, { ...fixture, appAppearance: { mode, accent } });
  await page.goto('http://127.0.0.1:' + localApp.address().port + '/fitness.html');
  await page.locator('.nav [data-tab=eat]').click();
  const library = page.locator('.quick-meals');
  await library.locator(':scope > summary').click();
  assert.deepEqual(await library.locator('.quick-tabs button').allTextContents(), ['Saved', 'Favorites', 'Recent']);
  await library.getByRole('button', { name: 'Add to Favorites: Breakfast bowl' }).click();
  await library.getByRole('button', { name: 'Favorites', exact: true }).click();
  assert.equal(await library.locator('.quick-meal').count(), 2);
  await library.getByRole('button', { name: 'Saved', exact: true }).click();
  await library.getByRole('button', { name: 'Options for Breakfast bowl' }).click();
  await library.getByRole('button', { name: 'Archive', exact: true }).click();
  const dialog = page.locator('#saved-food-dialog');
  assert(await dialog.isVisible());
  assert(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth));
  await dialog.getByRole('button', { name: 'Archive', exact: true }).click();
  assert.equal(await library.locator('.quick-meal').count(), 0);
  assert.deepEqual(await page.evaluate(() => state.mealPlan), fixture.mealPlan);
  assert.equal(await page.evaluate(id => availableCustomFoods().some(f => f.id === id), mealId), false);
  assert.equal(await page.evaluate(id => plannedRecipe(id).name, mealId), 'Breakfast bowl');
  await library.getByRole('button', { name: 'Archived (1)' }).click();
  await library.getByRole('button', { name: 'Options for Breakfast bowl' }).click();
  await library.getByRole('button', { name: 'Restore', exact: true }).click();
  assert.equal(await page.evaluate(id => availableCustomFoods().some(f => f.id === id && f.favorite), mealId), true);

  await library.getByRole('button', { name: 'Saved', exact: true }).click();
  await library.getByRole('button', { name: 'Options for Breakfast bowl' }).click();
  await library.getByRole('button', { name: 'Archive', exact: true }).click();
  await dialog.getByRole('button', { name: 'View planned days' }).click();
  await dialog.getByRole('checkbox').first().check();
  await dialog.getByRole('button', { name: 'Remove selected' }).click();
  assert.deepEqual(await page.evaluate(() => state.mealPlan), { [dates[0]]: {}, [dates[1]]: fixture.mealPlan[dates[1]] });
  await dialog.getByRole('button', { name: 'Cancel' }).click();

  await library.getByRole('button', { name: 'Archive', exact: true }).click();
  await dialog.getByRole('button', { name: 'Archive', exact: true }).click();
  await library.getByRole('button', { name: 'Archived (1)' }).click();
  await library.getByRole('button', { name: 'Options for Breakfast bowl' }).click();
  await library.getByRole('button', { name: 'Delete permanently', exact: true }).click();
  assert.equal(await dialog.locator('h2').textContent(), 'Still in My Plan');
  await dialog.getByRole('button', { name: 'View planned days' }).click();
  await dialog.getByRole('checkbox').check();
  await dialog.getByRole('button', { name: 'Remove selected' }).click();
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await library.getByRole('button', { name: 'Delete permanently', exact: true }).click();
  await dialog.getByRole('button', { name: 'Delete permanently', exact: true }).click();
  assert.equal(await page.evaluate(() => state.customFoods.length), 0);
  assert.deepEqual(await page.evaluate(() => state.foodLog), diary);
  assert(await library.evaluate(el => el.scrollWidth <= el.clientWidth));

  await page.evaluate(() => { tab = 'custom-food'; render(); });
  await page.evaluate(() => showIngredientAmount(['test-usda', 'Apple', 52, .3, 14, .2]));
  await page.getByRole('button', { name: 'Add to Favorites: Apple' }).click();
  await page.locator('[data-ingredient-cancel]').click();
  await page.getByRole('tab', { name: 'Saved' }).click();
  await page.getByRole('button', { name: 'Favorites', exact: true }).click();
  await page.getByRole('button', { name: /Apple.*52 kcal/ }).click();
  await page.getByRole('button', { name: 'Choose amount' }).click();
  assert(await page.getByRole('button', { name: 'Remove from Favorites: Apple' }).isVisible());
  assert.deepEqual(await page.evaluate(() => restoredState(state).favoriteFoods.map(f => f.name)), ['Apple']);
  assert.deepEqual(errors, []);
  await page.close();
  console.log('PASS food library, favorites, archive, restore, selected plan dates and diary retention at ' + width + 'px · ' + mode + ' ' + accent);
}

let browser;
(async () => {
  await new Promise(resolve => localApp.listen(0, '127.0.0.1', resolve));
  const executablePath = process.env.EZPZ_TEST_CHROMIUM;
  browser = await chromium.launch(executablePath ? { executablePath } : {});
  await check(320, 'dark', 'emerald');
  await check(390, 'light', 'emerald');
  await check(430, 'dark', 'lavender');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await browser?.close();
  localApp.close();
});
