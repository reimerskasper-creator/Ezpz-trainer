const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {chromium} = require('playwright');

const root = path.resolve(__dirname, '..');
const types = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.webp':'image/webp', '.svg':'image/svg+xml', '.json':'application/json'};
const server = http.createServer((req, res) => {
 const file = path.join(root, new URL(req.url, 'http://localhost').pathname);
 fs.readFile(file, (error, bytes) => {
  res.writeHead(error ? 404 : 200, {'Content-Type': types[path.extname(file)] || 'application/octet-stream'});
  res.end(error ? 'Missing' : bytes);
 });
});

async function check(page, width) {
 const errors = [];
 page.on('pageerror', error => errors.push(error.message));
 let productName = 'Pepperoni Pizza';
 let unit = 'g';
 await page.route('https://world.openfoodfacts.org/**', route => route.fulfill({json: {
  status: 1,
  product: {
   product_name: productName,
   brands: 'Test Brand',
   nutrition_data_per: '100' + unit,
   serving_quantity_unit: unit,
   nutriments: unit === 'ml'
    ? {'energy-kcal_100g':0, proteins_100g:0, carbohydrates_100g:0, fat_100g:0}
    : {'energy-kcal_100g':260, proteins_100g:12, carbohydrates_100g:26, fat_100g:12},
  },
 }}));
 await page.goto('http://127.0.0.1:' + server.address().port + '/fitness.html');
 const scan = (barcode='012345678905') => page.evaluate(async barcode => {
  state.profile = {goal:'maintain', level:'Beginner', equipment:'home', days:3, age:35, weight:80, height:180, sex:'male'};
  tab = 'custom-food';
  render();
  openBarcodeScanner();
  await lookupFoodBarcode(barcode);
 }, barcode);
 const input = page.locator('#ingredient-amount');
 const preview = page.locator('#ingredient-amount-preview');
 await scan();
 assert.match(await preview.innerText(), /Per 100 g.*260\s+kcal/s);
 assert.match(await page.locator('.scanned-food-art').getAttribute('src'), /pizza\.webp$/);
 assert.equal(await page.locator('.scanned-measure-art').count(),0);
 await page.getByRole('button',{name:'100 g',exact:true}).click();
 assert.equal(await input.inputValue(),'100');
 assert(await page.locator('.package-label-open').isVisible());
 await page.waitForFunction(() => [...document.querySelectorAll('.scanned-food-split img')].every(img => img.naturalWidth > 0));
 assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
 await input.fill('150');
 assert.match(await preview.innerText(), /For this amount.*390\s+kcal/s);
 assert.deepEqual(await preview.locator('b').allTextContents(), ['18 g', '39 g', '18 g']);
 await input.blur();
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.waitForFunction(()=>document.querySelector('.food-macro-ring').getBoundingClientRect().width>=65);
 const fit=await page.evaluate(()=>{
  const bounds=selector=>document.querySelector(selector).getBoundingClientRect();
  return {
   heading:bounds('#food-amount-view h2').top,
   footer:bounds('.food-amount-actions').bottom,
   nav:bounds('.nav').top,
   units:bounds('.food-basis-toggle').top,
   portion:bounds('.scanned-portion').top,
   totals:document.querySelectorAll('.food-day-row').length,
  };
 });
 assert(fit.heading>=0 && fit.footer<=fit.nav, 'Food details fit above the navigation without scrolling');
 assert(Math.abs(fit.units-fit.portion)<=3, 'Units and portion shortcut share one row');
 assert.equal(fit.totals,4);
 await input.focus();
 await page.setViewportSize({width, height:440});
 await page.waitForFunction(() => document.body.classList.contains('food-keyboard'));
 const macros = await preview.boundingBox();
 const dock = await page.locator('.food-amount-actions').boundingBox();
 assert(macros.y + macros.height <= dock.y, 'The action follows the nutrition preview');
 await page.setViewportSize({width, height:844});
 await page.waitForFunction(() => !document.body.classList.contains('food-keyboard'));
 await input.fill('0');
 assert.match(await page.locator('#ingredient-amount-error').innerText(), /10,000 g/);
 await input.fill('150');
 await page.locator('[data-ingredient-confirm]').click();
 assert.match(await page.locator('#food-meal-summary').innerText(), /390 kcal/);

 productName = 'Sparkling Water';
 unit = 'ml';
 await scan();
 assert.match(await page.locator('.scanned-food-art').getAttribute('src'), /water\.webp$/);
 assert.equal(await page.locator('.scanned-measure-art').count(),0);
 assert.equal(await input.getAttribute('aria-label'), 'Amount in milliliters');
 assert(await page.locator('[data-ingredient-basis=g]').isDisabled());
 await input.fill('50');
 assert.match(await preview.innerText(), /For this amount.*0\s+kcal/s);

 productName = 'Pepperoni Pizza Rolls';
 unit = 'g';
 await scan();
 assert(await page.getByRole('button',{name:'Add food photo'}).isVisible());
  assert(await page.locator('.scanned-food-art').isHidden());
 if (width === 390) {
  await page.reload();
  await scan();
  const photo = await page.evaluate(() => {
   const canvas = document.createElement('canvas');
   canvas.width = canvas.height = 32;
   const context = canvas.getContext('2d');
   context.fillStyle = '#ab3232';
   context.fillRect(0, 0, 32, 32);
   return canvas.toDataURL().split(',')[1];
  });
  await page.getByRole('button',{name:'Add food photo'}).click();
  assert(await page.getByRole('button',{name:'Take photo',exact:true}).isVisible());
  assert.equal(await page.getByLabel('Take food photo').getAttribute('capture'),'environment');
  const [chooser]=await Promise.all([page.waitForEvent('filechooser'),page.getByRole('button',{name:'Choose from Photos'}).click()]);
  await chooser.setFiles({
   name:'tomatoes.png', mimeType:'image/png', buffer:Buffer.from(photo, 'base64'),
  });
  await page.getByRole('button', {name:'Use photo',exact:true}).click();
  await page.waitForFunction(() => document.querySelector('.scanned-food-art').src.startsWith('data:image/jpeg'));
  await page.reload();
  await scan('0012345678905');
  assert.match(await page.locator('.scanned-food-art').getAttribute('src'), /^data:image\/jpeg/);
  await scan('3017620422003');
  assert(await page.getByRole('button',{name:'Add food photo'}).isVisible());
  assert(await page.locator('.scanned-food-art').isHidden());
  await scan();
  await input.fill('100');
  await page.locator('[data-ingredient-confirm]').click();
  await page.locator('[data-food-review]').click();
  assert.match(await page.locator('.scanned-ingredient-thumb').getAttribute('src'), /^data:image\/jpeg/);
  await page.locator('.custom-food-submit').click();
  assert(await page.evaluate(() => customFoodImage(state.foodLog.at(-1)).startsWith('data:image/jpeg')));
  await scan();
  await page.getByRole('button',{name:'Change food photo'}).click();
  await page.getByRole('button',{name:'Remove food photo'}).click();
  assert(await page.getByRole('button',{name:'Add food photo'}).isVisible());
  assert(await page.locator('.scanned-food-art').isHidden());
 }
 assert.deepEqual(errors, []);
}

(async () => {
 await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
 const browser = await chromium.launch({executablePath:process.env.EZPZ_CHROMIUM});
 try {
  for (const width of [320, 390, 430]) {
   const page = await browser.newPage({viewport:{width, height:844}, isMobile:true, hasTouch:true});
   await check(page, width);
   await page.close();
   console.log('PASS scanned food details at ' + width + ' px');
  }
 } finally {
  await browser.close();
  server.close();
 }
})().catch(error => {
 console.error(error);
 server.close();
 process.exitCode = 1;
});
