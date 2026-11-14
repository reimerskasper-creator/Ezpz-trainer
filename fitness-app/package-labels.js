/* Free package-label corrections. OCR drafts require explicit review; no label images are stored or uploaded. */
function labelBarcode(code){const valid=normalizeFoodBarcode(code);return valid?valid.replace(/^0+/,'').padStart(13,'0'):null}
function cleanBarcodeLabels(value){const out={};if(!value||typeof value!=='object'||Array.isArray(value))return out;for(const [key,row] of Object.entries(value).slice(0,500)){const code=labelBarcode(key);if(!code||!row||typeof row!=='object'||!['g','ml'].includes(row.unit)||typeof row.name!=='string'||!row.name.trim()||row.name.length>180||!Array.isArray(row.macros)||row.macros.length!==4||row.macros.some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0)||row.macros[0]>1000||row.macros.slice(1).some(v=>v>100)||row.macros.slice(1).reduce((a,b)=>a+b,0)>105)continue;out[code]={name:row.name,unit:row.unit,macros:[...row.macros],...(Number.isFinite(row.amount)&&row.amount>0&&row.amount<=10000?{amount:row.amount}:{})}}return out}
function parsePackageLabel(text){
 const s=String(text||'').slice(0,20000).replace(/\r/g,'').replace(/\u00a0/g,' '),result={amount:null,unit:'g',calories:null,protein:null,carbs:null,fat:null};
 // Multiple nutrition columns cannot be assigned safely from text alone.
 const headers=s.match(/\bper\s*(?:100\s*(?:g|ml)|portion|serving|\d+(?:[.,]\d+)?\s*(?:g|ml))\b/gi)||[];
 if(headers.some(h=>/100\s*(?:g|ml)/i.test(h))&&headers.length>1)return result;
 const serving=s.match(/(?:serving\s*size|portion\s*size)[\s\S]{0,90}?\b(\d+(?:[.,]\d+)?)\s*(g|ml)\b/i)||s.match(/\bper\s*(100)\s*(g|ml)\b/i);
 if(serving){result.amount=Number(serving[1].replace(',','.'));result.unit=serving[2].toLowerCase()}
 const value=re=>{const m=s.match(re);return m?Number(m[1].replace(',','.')):null};
 result.calories=value(/(?:^|\n)\s*calories\s*(?:per\s*serving\s*)?[: ]*\s*(\d+(?:[.,]\d+)?)\b/i);
 if(result.calories===null)result.calories=value(/(?:^|\n)\s*energy[^\n]{0,40}?\b(\d+(?:[.,]\d+)?)\s*kcal\b/i);
 result.protein=value(/(?:^|\n)\s*protein\s*[: ]*\s*(\d+(?:[.,]\d+)?)\s*g\b/i);
 result.carbs=value(/(?:^|\n)\s*(?:total\s*)?carbohydrates?\s*[: ]*\s*(\d+(?:[.,]\d+)?)\s*g\b/i);
 result.fat=value(/(?:^|\n)\s*(?:total\s+fat|fat)\s*[: ]*\s*(\d+(?:[.,]\d+)?)\s*g\b/i);
 return result;
}
function packageLabelValues(raw){const amount=Number(raw.amount),values=['calories','protein','carbs','fat'].map(k=>String(raw[k]??'').trim()===''?NaN:Number(raw[k]));if(String(raw.amount??'').trim()===''||!Number.isFinite(amount)||amount<=0||amount>10000||!['g','ml'].includes(raw.unit)||values.some(v=>!Number.isFinite(v)||v<0))return null;const macros=values.map(v=>v*100/amount);if(macros[0]>1000||macros.slice(1).some(v=>v>100)||macros.slice(1).reduce((a,b)=>a+b,0)>105)return null;return {unit:raw.unit,macros}}
(()=>{
 const builtin={
  '0096619896622':{name:'Alaskan Smoked Sockeye Salmon · Kirkland Signature',amount:56,values:[70,12,1,2]},
  '0894697002184':{name:'Organic Power Fuel Crunchy · NuttZo',amount:33,values:[180,6,8,15]},
  '0011110998361':{name:'Genoa Salami · Private Selection',amount:57,values:[230,10,2,20]}
 };
 function foodForBarcode(raw){const code=labelBarcode(raw);if(!code)return null;const own=cleanBarcodeLabels(state.barcodeLabels)[code],known=builtin[code],row=own||known&&{name:known.name,unit:'g',amount:known.amount,macros:known.values.map(v=>v*100/known.amount)};return row?['off-'+code,row.name,...row.macros,row.unit,'off','package-label',row.amount]:null}
 function saveLabel(code,row){const key=labelBarcode(code),clean=cleanBarcodeLabels({[key]:row});if(!key||!clean[key])return false;const before=state.barcodeLabels,had=Object.hasOwn(state,'barcodeLabels'),rows=cleanBarcodeLabels(before);if(!rows[key]&&Object.keys(rows).length>=500)return false;state.barcodeLabels={...rows,...clean};if(save())return true;if(had)state.barcodeLabels=before;else delete state.barcodeLabels;return false}
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

 const lookup=lookupFoodBarcode;
 lookupFoodBarcode=async function(raw){
  if(barcodeBusy)return;
  document.querySelector('[data-label-unknown]')?.remove();
  const food=foodForBarcode(raw);
  if(food){stopBarcodeCamera();showIngredientAmount(food);return}
  const pending=lookup(raw),session=barcodeSession;
  await pending;
  const code=labelBarcode(raw),panel=document.getElementById('barcode-panel');
  const current=()=>session===barcodeSession&&panel?.isConnected&&!panel.hidden;
  if(!code||!current())return;
  const status=document.getElementById('barcode-status');
  const rawCode=normalizeFoodBarcode(raw);
  const missed=/^(Product not found|This product has incomplete)/.test(status?.textContent||'');
  if(missed&&rawCode&&!(rawCode.length===14&&!rawCode.startsWith('0'))&&window.Capacitor?.isNativePlatform?.()&&window.EzpzFatSecretLookup){
   const abort=new AbortController();
   barcodeAbort=abort;
   barcodeBusy=true;
   const timeout=setTimeout(()=>abort.abort(),8000);
   try{
    const result=parseFatSecret(await window.EzpzFatSecretLookup(code,abort.signal),code);
    if(!current())return;
    if(result){
     status.textContent=result[1]+' · '+result[2]+' kcal · Protein '+result[3]+' g · Carbs '+result[4]+' g · Fat '+result[5]+' g per 100 '+(result[6]==='ml'?'mL':'g')+'. Compare with the package and scan the nutrition label to log it. ';
     const credit=document.createElement('a');
     credit.href='https://www.fatsecret.com/';
     credit.target='_blank';
     credit.rel='noopener noreferrer';
     credit.textContent='Powered by fatsecret';
     status.append(credit);
    }
   }catch{if(current())barcodeStatus('Backup lookup unavailable. Scan the nutrition label or use food search.')}
   finally{
    clearTimeout(timeout);
    if(barcodeAbort===abort){barcodeAbort=null;barcodeBusy=false}
   }
  }
  if(!current())return;
  const button=document.createElement('button');
  button.type='button';
  button.dataset.labelUnknown='';
  button.textContent='📷 Scan nutrition label';
  button.onclick=()=>openEditor(['off-'+code,'',0,0,0,0,'g','off'],button,true,true);
  status?.after(button);
 };
 const restore=restoredState;restoredState=function(data){const result=restore(data);if(Object.hasOwn(data||{},'barcodeLabels'))result.barcodeLabels=cleanBarcodeLabels(data.barcodeLabels);return result};
 function reader(){const cap=window.Capacitor;return cap?.isNativePlatform?.()?cap.Plugins?.EzpzLabelReader||cap.registerPlugin?.('EzpzLabelReader'):null}
 const show=showIngredientAmount;showIngredientAmount=function(food){show(food);if(food[7]!=='off')return;const hero=document.querySelector('#ingredient-amount-panel .food-detail-hero');if(!hero)return;hero.parentElement.querySelectorAll('[data-ingredient-basis]').forEach(button=>{button.disabled=button.dataset.ingredientBasis!==food[6];if(button.disabled)button.title='No weight-to-volume conversion is available. Use the label unit or correct the package label.'});const summary=hero.querySelector('.food-source-info>summary');if(summary)summary.textContent=food[8]==='package-label'?'Package label ⓘ':'Database · unchecked ⓘ';const button=document.createElement('button');button.type='button';button.className='package-label-open';button.textContent='📷 Scan nutrition label';button.onclick=()=>openEditor(food,button,false,true);const details=hero.parentElement.querySelector('.scanned-nutrition-preview');if(details)details.after(button);else hero.querySelector('.food-identity-copy').append(button)};
 function openEditor(food,trigger,unknown=false,autoCapture=false){
  const code=labelBarcode(food[0].replace(/^off-/,''));if(!code)return;document.getElementById('package-label-dialog')?.remove();
  const d=document.createElement('dialog');d.id='package-label-dialog';d.setAttribute('aria-labelledby','package-label-title');
  d.innerHTML='<form method="dialog"><div class="package-label-heading"><h2 id="package-label-title">Your package label</h2><button type="button" data-label-close aria-label="Close label editor">×</button></div><p>Use the nutrition label on your package. Read a photo or enter the values below.</p><button type="button" data-label-camera>📷 Scan nutrition label</button><button type="button" data-label-photo>Choose existing photo</button><input id="package-label-photo" type="file" accept="image/jpeg,image/png,image/webp" hidden><p class="note">Photos are read on this phone. Check every value before saving.</p><label>Product name<input name="name" maxlength="180" required></label><div class="package-label-grid"><label>Label amount<input name="amount" type="number" min="0.1" max="10000" step="any" inputmode="decimal" required value="100"></label><label>Unit<select name="unit"><option value="g">g</option><option value="ml">mL</option></select></label></div><p>Nutrition for that label amount:</p><div class="package-label-grid">'+[['calories','Calories (kcal)'],['protein','Protein (g)'],['carbs','Carbs (g)'],['fat','Fat (g)']].map(([key,title])=>'<label>'+title+'<input name="'+key+'" type="number" min="0" step="any" inputmode="decimal" required></label>').join('')+'</div><label class="package-label-confirm"><input type="checkbox" name="checked" required>I checked these values against my package.</label><p class="package-label-error" role="status"></p><button type="button" class="primary" data-label-save>Save for this barcode</button><button type="button" data-label-close>Cancel</button></form>';
  const form=d.querySelector('form'),status=d.querySelector('.package-label-error');form.elements.name.value=food[1];form.elements.unit.value=food[6]||'g';form.elements.amount.value=food[9]||100;['calories','protein','carbs','fat'].forEach((key,i)=>form.elements[key].value=unknown?'':Math.round(food[i+2]*(food[9]||100))/100);
  const priorAmount=document.getElementById('ingredient-amount')?.value||'';let generation=0,busy=false;
  function close(){generation++;d.close();d.remove();if(trigger.isConnected)trigger.focus()}
  d.querySelectorAll('[data-label-close]').forEach(b=>b.onclick=close);d.addEventListener('cancel',e=>{e.preventDefault();close()});form.onsubmit=e=>e.preventDefault();form.oninput=()=>{form.elements.checked.checked=false};
  // Checking the confirmation box is itself not an edit.
  form.elements.checked.oninput=e=>e.stopPropagation();
  function applyReading(result){
    const fields=parsePackageLabel(result.text);for(const key of ['amount','calories','protein','carbs','fat'])form.elements[key].value=fields[key]===null?'':fields[key];form.elements.unit.value=fields.unit;form.elements.checked.checked=false;
    status.textContent=Object.values(fields).includes(null)?'Some values could not be read safely. Enter the missing values and check them against the label.':'Values read. Check the serving size and every number against your package.';
  }
  d.querySelector('[data-label-camera]').onclick=async()=>{
   if(busy)return;const native=reader();if(!native?.capture){status.textContent='Direct camera scanning needs the updated Android app. Choose an existing photo or enter the label values.';return}
   const token=++generation;busy=true;status.textContent='Take a clear close-up of the nutrition label…';d.querySelector('[data-label-save]').disabled=true;
   try{const result=await native.capture();if(token!==generation||!d.isConnected)return;applyReading(result)}
   catch(error){if(token===generation&&d.isConnected)status.textContent=error?.code==='CAMERA_CANCELLED'?'Photo cancelled. Your values were kept.':error?.code==='CAMERA_DENIED'?'Allow camera access to scan a label, or choose an existing photo.':'Could not scan the label. Try again or choose an existing photo.'}
   finally{if(token===generation){busy=false;d.querySelector('[data-label-save]').disabled=false}}
  };
  d.querySelector('[data-label-photo]').onclick=()=>{if(!reader()){status.textContent='Photo reading is available in the updated Android app. You can enter package values here.';return}d.querySelector('#package-label-photo').click()};
  d.querySelector('#package-label-photo').onchange=async e=>{
   const file=e.target.files?.[0];e.target.value='';if(!file||busy)return;if(file.size>20000000||!/^image\/(jpeg|png|webp)$/.test(file.type)){status.textContent='Choose a JPEG, PNG or WebP photo up to 20 MB.';return}
   const token=++generation;busy=true;status.textContent='Reading label on this phone…';d.querySelector('[data-label-save]').disabled=true;
   try{const url=URL.createObjectURL(file);let image;try{image=new Image();image.src=url;await image.decode()}finally{URL.revokeObjectURL(url)}if(token!==generation)return;
    const canvas=document.createElement('canvas'),scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);const photo=canvas.toDataURL('image/jpeg',.82).split(',')[1];
    const result=await reader().recognize({image:photo});if(token!==generation||!d.isConnected)return;
    applyReading(result);
   }catch{if(token===generation&&d.isConnected)status.textContent='Could not read this photo. Try a clear close-up of one nutrition column, or enter the package values.'}
   finally{if(token===generation){busy=false;d.querySelector('[data-label-save]').disabled=false}}
  };
  d.querySelector('[data-label-save]').onclick=()=>{
   if(busy)return;if(!form.reportValidity())return;const raw=Object.fromEntries(new FormData(form)),values=packageLabelValues(raw),name=String(raw.name||'').trim();if(!values||!name){status.textContent='Check the label amount, unit and all four nutrition values.';return}
   if(!form.elements.checked.checked){status.textContent='Check the values against your package first.';return}
   if(!saveLabel(code,{name,...values,amount:Number(raw.amount)})){status.textContent='Could not save this correction. Your previous values were kept. Check available storage and try again.';return}
   close();if(unknown){stopBarcodeCamera();showIngredientAmount(foodForBarcode(code))}else if(ingredientSelected?.[0]===food[0]&&document.getElementById('ingredient-amount')){showIngredientAmount(foodForBarcode(code));if(values.unit===food[6]&&priorAmount){document.getElementById('ingredient-amount').value=priorAmount;previewIngredientAmount()}}
  };
  document.body.append(d);d.showModal();if(autoCapture)d.querySelector('[data-label-camera]').click();
 }
 window.EZPZLabels={foodForBarcode,saveLabel,parsePackageLabel,cleanBarcodeLabels,packageLabelValues};
})();
