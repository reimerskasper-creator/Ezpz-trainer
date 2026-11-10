// Run with server-side FATSECRET_CLIENT_ID and FATSECRET_CLIENT_SECRET.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');

const html = readFileSync(new URL('../fitness.html', 'file://' + __filename), 'utf8');
const { normalizeFoodBarcode, parseBarcodeProduct } = runInNewContext(
  html.match(/^function (?:normalizeFoodBarcode|parseBarcodeProduct)\(.*$/gm).join('\n') +
    '\n({ normalizeFoodBarcode, parseBarcodeProduct })'
);

function fatsecretBarcode(code) {
  if (code.length === 14) return code.startsWith('0') ? code.slice(1) : null;
  return code.padStart(13, '0');
}

function parseFatSecret(data, code) {
  const food = data?.food;
  const entries = food?.servings?.serving;
  for (const serving of Array.isArray(entries) ? entries : entries ? [entries] : []) {
    const unit = serving.metric_serving_unit;
    const amount = Number(serving.metric_serving_amount);
    if (!['g', 'ml'].includes(unit) || !Number.isFinite(amount) || amount <= 0) continue;
    const values = ['calories', 'protein', 'carbohydrate', 'fat'].map(key => {
      const value = serving[key];
      return typeof value === 'number' || (typeof value === 'string' && value.trim())
        ? Number(value) * 100 / amount
        : null;
    });
    const result = parseBarcodeProduct({
      status: 1,
      product: {
        product_name: food.food_name,
        brands: food.brand_name,
        nutrition_data_per: unit === 'ml' ? '100ml' : '100g',
        nutriments: Object.fromEntries(
          ['energy-kcal_100g', 'proteins_100g', 'carbohydrates_100g', 'fat_100g']
            .map((key, index) => [key, values[index]])
        ),
      },
    }, '');
    if (result) return ['fatsecret-' + code, ...result.slice(1, 7), 'fatsecret'];
  }
  return null;
}

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw Error(new URL(url).hostname + ' returned HTTP ' + response.status);
  return response.json();
}

async function compare(inputs) {
  const codes = inputs.map(input => {
    const code = normalizeFoodBarcode(input);
    if (!code) throw Error('Invalid barcode: ' + input);
    return code;
  });
  const id = process.env.FATSECRET_CLIENT_ID;
  const secret = process.env.FATSECRET_CLIENT_SECRET;
  if (!id || !secret) throw Error('Configure FATSECRET_CLIENT_ID and FATSECRET_CLIENT_SECRET.');
  const { access_token: token } = await request('https://oauth.fatsecret.com/connect/token', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(id + ':' + secret).toString('base64') },
    body: new URLSearchParams({ grant_type: 'client_credentials', scope: 'premier barcode' }),
  });
  if (!token) throw Error('FatSecret did not return an access token.');
  for (const code of codes) {
    try {
      const offUrl = 'https://world.openfoodfacts.org/api/v2/product/' + code +
        '.json?fields=product_name,product_name_en,brands,nutriments,no_nutrition_data,nutrition_data_per,nutrition_data_prepared_per,serving_quantity_unit,product_quantity_unit';
      const response = await fetch(offUrl, {
        signal: AbortSignal.timeout(10000),
        headers: { 'User-Agent': 'EZPZFitness/1.0 (https://github.com/reimerskasper-creator/Ezpz-trainer)' },
      });
      if (response.status !== 404 && !response.ok) throw Error('Open Food Facts HTTP ' + response.status);
      if (response.ok && parseBarcodeProduct(await response.json(), code)) {
        console.log(code, 'Existing match');
        continue;
      }
      const barcode = fatsecretBarcode(code);
      if (!barcode) {
        console.log(code, 'Unsupported FatSecret GTIN');
        continue;
      }
      const params = new URLSearchParams({ barcode, format: 'json' });
      const data = await request('https://platform.fatsecret.com/rest/food/barcode/find-by-id/v2?' + params, {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (data.error && String(data.error.code) !== '211') throw Error('FatSecret API error ' + data.error.code);
      const food = parseFatSecret(data, code);
      console.log(code, food ? 'Compare with package: ' + food[1] + ' | ' +
        food.slice(2, 6).join('/') + ' kcal/P/C/F per 100 ' + food[6] : 'No usable fallback');
    } catch (error) {
      console.error(code, error.message);
      process.exitCode = 1;
    }
  }
}

if (process.argv[2] === '--self-test') {
  const serving = { metric_serving_amount: '25', metric_serving_unit: 'g',
    calories: '40', protein: '0', carbohydrate: '9', fat: '0' };
  const fixture = entry => ({ food: { food_name: 'Sample', servings: { serving: entry } } });
  assert.deepEqual(parseFatSecret(fixture(serving), '123'), ['fatsecret-123', 'Sample', 160, 0, 36, 0, 'g', 'fatsecret']);
  assert.equal(parseFatSecret(fixture({ ...serving, protein: '' }), '123'), null);
  assert.equal(parseFatSecret(fixture([{ ...serving, metric_serving_unit: 'oz' }, { ...serving, metric_serving_unit: 'ml' }]), '123')[6], 'ml');
  assert.equal(fatsecretBarcode('012345678905'), '0012345678905');
  assert.equal(fatsecretBarcode('10012345678902'), null);
  console.log('FatSecret barcode fixture checks passed');
} else if (process.argv.length > 2) {
  compare(process.argv.slice(2)).catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
} else {
  console.error('Usage: node tests/fatsecret-barcode.cjs --self-test | BARCODE [BARCODE ...]');
  process.exitCode = 1;
}
