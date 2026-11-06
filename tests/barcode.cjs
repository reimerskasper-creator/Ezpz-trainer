const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../fitness.html'),'utf8'),code=html.slice(html.indexOf('function normalizeFoodBarcode('),html.indexOf('function barcodeStatus('));
const {normalizeFoodBarcode:valid,parseBarcodeProduct:parse}=new Function(code+';return {normalizeFoodBarcode,parseBarcodeProduct}')();
for(const c of ['3017620422003','012345678905','96385074','00012345678905'])assert.equal(valid(c),c);for(const c of ['3017620422004','abc','123','https://example.com','00012345678904'])assert.equal(valid(c),null);assert.equal(valid('0 12345-67890 5'),'012345678905');
const product={status:1,product:{product_name:'Test yogurt',brands:'Test brand',nutriments:{'energy-kcal_100g':59,proteins_100g:10.19,carbohydrates_100g:3.6,fat_100g:.39}}};const food=parse(product,'012345678905');assert.deepEqual(food,['off-012345678905','Test yogurt · Test brand',59,10.19,3.6,.39,'g','off']);
for(const k of ['energy-kcal_100g','proteins_100g','carbohydrates_100g','fat_100g']){const d=structuredClone(product);delete d.product.nutriments[k];assert.equal(parse(d,'012345678905'),null)}
for(const v of [null,'',NaN,-1,Infinity,101]){const d=structuredClone(product);d.product.nutriments.proteins_100g=v;assert.equal(parse(d,'012345678905'),null)}
const zero=structuredClone(product);zero.product.nutriments.fat_100g=0;assert.equal(parse(zero,'012345678905')[5],0);assert.equal(parse({status:0},'012345678905'),null);
const kj=structuredClone(product);delete kj.product.nutriments['energy-kcal_100g'];kj.product.nutriments.energy_100g=246.856;assert.equal(parse(kj,'012345678905')[2],59);kj.product.serving_quantity_unit='ml';assert.equal(parse(kj,'012345678905')[6],'ml');
console.log('PASS barcode checksums, product mapping, missing versus zero nutrients, invalid values, kJ conversion and liquid basis');

// Exact photographed package vs the erroneous live OFF response; do not rescale unrelated products.
const salmon={status:1,product:{product_name:'Alaskan Smoked Sockeye Salmon',brands:'Kirkland Signature',nutrition_data_per:'100g',serving_quantity:56,nutriments:{'energy-kcal_100g':223.214285714286,proteins_100g:38.2653061224489,carbohydrates_100g:3.18877551020409,fat_100g:6.37755102040816}}};
for(const code of ['0096619896622','096619896622']){const food=parse(salmon,code);assert.equal(food[8],'package-label');for(const [grams,expected] of [[56,[70,12,1,2]],[112,[140,24,2,4]],[28,[35,6,.5,1]]])assert.deepEqual(food.slice(2,6).map(v=>Math.round(v*grams/100*10)/10),expected);}
assert.equal(parse(salmon,'012345678905')[2],223.21,'Never apply the label correction to another barcode');
console.log('PASS photographed salmon label, UPC/EAN equivalence, full/half/double servings and unrelated barcode isolation');
