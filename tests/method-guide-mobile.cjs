const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const root = path.resolve(__dirname, '..');
const key = 'ezpz-fitness-pilot-1';
const pillarNames = ['Eat', 'Sleep', 'Progress', 'Zone'];
const pillarAssets = ['pillar-eat-clear.svg', 'pillar-sleep-clean.png', 'pillar-train-clean.png', 'pillar-zone-wave.svg'];
const headline = ['The work is yours.', 'The simplicity is ours.'];
const contentTypes = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403);
    return res.end();
  }
  fs.readFile(file, (error, bytes) => {
    if (error) {
      res.writeHead(404);
      return res.end();
    }
    res.setHeader('Content-Type', contentTypes[path.extname(file)] || 'image/jpeg');
    res.end(bytes);
  });
});

async function checkImages(images) {
  assert(await images.count());
  await images.evaluateAll(elements => Promise.all(elements.map(image => image.decode())));
}

async function run() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const executablePath = process.env.EZPZ_TEST_CHROMIUM;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  try {
    for (const width of [320, 390, 430]) {
      const page = await browser.newPage({ viewport: { width, height: 780 }, isMobile: true, hasTouch: true });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://127.0.0.1:' + server.address().port + '/fitness.html');
      const welcome = page.locator('.setup-hero');
      await welcome.waitFor();
      assert.deepEqual(await welcome.locator('h2 span').allTextContents(), headline);
      assert.deepEqual(await welcome.locator('li span').allTextContents(), pillarNames);
      assert.deepEqual(await welcome.locator('li img').evaluateAll(images => images.map(image => image.src.split('/').pop())), pillarAssets);
      assert(await welcome.locator('li').evaluateAll(tiles =>
        tiles.every(tile => tile.clientWidth === tiles[0].clientWidth && tile.scrollWidth <= tile.clientWidth)));
      assert(await welcome.evaluate(hero => hero.scrollWidth <= hero.clientWidth));
      await checkImages(welcome.locator('img'));
      await checkImages(page.locator('.header-brand-logo'));

      await page.locator('#setup-first-name').fill('Kasper');
      await page.locator('#setup-age').fill('35');
      const imperial = (await page.locator('label[for=setup-weight]').innerText()).includes('lb');
      await page.locator('#setup-weight').fill(imperial ? '176' : '80');
      await page.locator('#setup-height').fill(imperial ? '71' : '180');
      if (width === 390) {
        fs.mkdirSync('test-results', { recursive: true });
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: 'test-results/method-guide-welcome.jpg' });
      }
      await page.getByRole('button', { name: /create my plan/i }).click();
      const trigger = page.locator('.overview-foundations');
      await trigger.waitFor();
      const saved = () => page.evaluate(storageKey => localStorage.getItem(storageKey), key);
      const snapshot = await saved();
      const { firstName, profile } = JSON.parse(snapshot);
      assert.equal(firstName, 'Kasper');
      assert.equal(profile.age, 35);
      assert.equal(profile.days, 3);
      assert(await page.evaluate(() => target().calories > 1000));

      await trigger.click();
      const guide = page.locator('#ezpz-method');
      assert(await guide.evaluate(dialog => dialog.open));
      assert.deepEqual(await guide.locator('h2 span').allTextContents(), headline);
      assert.deepEqual(await guide.locator('.method-pillar strong').allTextContents(), pillarNames);
      assert.deepEqual(await guide.locator('.method-pillar img').evaluateAll(images => images.map(image => image.src.split('/').pop())), pillarAssets);
      assert.equal(await guide.locator('.method-wheel path').count(), 4);
      assert.equal(await guide.locator('.method-links path').count(), 4);
      assert.equal(await guide.locator('.method-principles h3').count(), 3);
      assert.equal(await guide.locator('.habit-ring, [role=progressbar], progress').count(), 0);
      await checkImages(guide.locator('img'));
      assert(await guide.evaluate(dialog => dialog.scrollWidth <= dialog.clientWidth));
      if (width === 390) await page.screenshot({ path: 'test-results/method-guide-top.jpg', animations: 'disabled' });

      await guide.locator('.method-done').click();
      assert(!await guide.isVisible());
      assert(await trigger.evaluate(button => document.activeElement === button));
      await trigger.click();
      assert.equal(await guide.evaluate(dialog => dialog.scrollTop), 0);
      await guide.getByRole('button', { name: 'Close the EZPZ method' }).click();
      assert(!await guide.isVisible());
      await trigger.click();
      await page.keyboard.press('Escape');
      assert(!await guide.isVisible());
      await trigger.click();
      await page.mouse.click(1, 1);
      assert(!await guide.isVisible());

      const zone = page.locator('.nav [data-tab=zone]');
      assert((await zone.locator('img').getAttribute('src')).endsWith('pillar-zone-wave.svg'));
      await zone.click();
      await page.locator('body[data-view=zone]').waitFor();
      await checkImages(page.locator('.pillar-title img'));
      await page.locator('.nav [data-tab=home]').click();
      await trigger.waitFor();
      assert.equal(await saved(), snapshot);
      assert.deepEqual(errors, []);
      await page.close();
      console.log('PASS welcome, plan creation, method, navigation and retained data at ' + width + 'px');
    }
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => server.close());
