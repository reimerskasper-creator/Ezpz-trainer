/* Food flow presentation only: drafts, nutrition calculations and explicit saves remain owned by the existing handlers. */
(()=>{
 let baseline=Math.max(innerHeight,window.visualViewport?.height||0),width=innerWidth,frame=0,dock=null;
 const dockObserver=typeof ResizeObserver==='function'?new ResizeObserver(schedule):null;
 function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(update)}
 function update(){
  const root=document.getElementById('food-flow'),active=document.body.dataset.view==='custom-food'&&!!root;
  if(!active){document.body.classList.remove('food-keyboard');document.body.style.removeProperty('--food-keyboard-inset');dockObserver?.disconnect();dock=null;return}
  const vv=window.visualViewport,height=vv?.height||innerHeight;
  if(Math.abs(innerWidth-width)>100){width=innerWidth;baseline=innerHeight}
  baseline=Math.max(baseline,innerHeight,height);
  const editable=document.activeElement?.matches('input:not([type=hidden]),textarea,[contenteditable=true]');
  const keyboard=baseline-height>140&&(editable||document.body.classList.contains('food-keyboard'));
  document.body.classList.toggle('food-keyboard',keyboard);
  const inset=keyboard?Math.max(0,innerHeight-height-(vv?.offsetTop||0)):0;
  document.body.style.setProperty('--food-keyboard-inset',inset+'px');
  const nav=document.querySelector('.nav'),navHeight=keyboard?0:nav?.getBoundingClientRect().height||86;
  root.style.setProperty('--food-nav-height',navHeight+'px');
  const next=root.dataset.mode==='find'?root.querySelector('.food-meal-tray'):root.dataset.mode==='amount'?root.querySelector('.food-amount-actions'):null;
  if(dock!==next){dockObserver?.disconnect();dock=next;if(dock)dockObserver?.observe(dock)}
  root.style.setProperty('--food-dock-height',(dock?.getBoundingClientRect().height||0)+'px');
 }
 const screen=document.getElementById('screen');if(screen)new MutationObserver(schedule).observe(screen,{childList:true,subtree:true,attributes:true,attributeFilter:['data-mode']});
 window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);
 window.addEventListener('resize',schedule);document.addEventListener('focusin',schedule);document.addEventListener('focusout',schedule);
 schedule();
})();

// Estimated macro energy shares, not a replacement for labelled calories or daily targets.
function foodMacroShares(protein,carbs,fat){
 const energy=[carbs*4,protein*4,fat*9];
 if(energy.some(v=>!Number.isFinite(v)||v<0))return null;
 const total=energy.reduce((a,b)=>a+b,0);if(!total)return null;
 const exact=energy.map(v=>v/total*100),percent=exact.map(Math.floor);
 const order=exact.map((v,i)=>({i,remainder:v-percent[i]})).sort((a,b)=>b.remainder-a.remainder||a.i-b.i);
 const left=100-percent.reduce((a,b)=>a+b,0);for(let n=0;n<left;n++)percent[order[n].i]++;
 return {shares:energy.map(v=>v/total),percent};
}
function foodMacroRing(totals,showLabel=true){
 const result=foodMacroShares(...totals.slice(1));if(!result)return;
 const labels=['Carbs','Protein','Fat'],colors=['#d8b75e','#9bcce2','#91dbb2'];
 const segmented=result.shares.filter(Boolean).length>1;
 let offset=0;
 const circles=result.shares.map((share,i)=>{
  if(!share)return '';
  const length=share*100,gap=segmented?Math.min(.7,length*.4):0,start=offset+gap/2;
  offset+=length;
  return '<circle cx="50" cy="50" r="42" pathLength="100" fill="none" stroke="'+colors[i]+'" stroke-width="9" stroke-dasharray="'+(length-gap)+' '+(100-length+gap)+'" stroke-dashoffset="'+(-start)+'" transform="rotate(-90 50 50)"/>';
 }).join('');
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('class','food-macro-ring');svg.setAttribute('role','img');svg.setAttribute('aria-label','Estimated macro energy split: '+labels.map((label,i)=>label+' '+result.percent[i]+'%').join(', '));svg.innerHTML=circles+(showLabel?'<text x="50" y="47" text-anchor="middle">Macro<tspan x="50" dy="13">split</tspan></text>':'');
 return {svg,percent:result.percent};
}
(()=>{
 const preview=previewIngredientAmount;
 previewIngredientAmount=function(){
  preview();const panel=document.getElementById('ingredient-amount-preview'),input=document.getElementById('ingredient-amount');
  if(!panel||!input||!ingredientSelected)return;panel.classList.remove('has-macro-ring');
  const totals=ingredientTotals([{food:ingredientSelected,grams:input.valueAsNumber}]);if(!totals)return;
  const ring=foodMacroRing(totals);if(!ring)return;
  const {svg,percent:shares}=ring;
  panel.append(svg);panel.classList.add('has-macro-ring');
  panel.querySelectorAll(':scope>div>span').forEach((tile,i)=>{const percent=document.createElement('small');percent.className='food-macro-percent';percent.textContent=shares[i]+'%';tile.append(percent)});
 };
})();

// Use the product name only. Uncertain matches offer a photo upload.
function scannedFoodIllustration(name) {
 const product = name.split(' · ')[0].trim().toLowerCase();
 const illustrations = [
  ['pizza', /^(?:classic crust )?pepperoni pizza$/],
  ['yogurt', /^(?:plain greek yogurt|greek yogurt[, -]+plain)$/],
  ['penne', /^(?:(?:dry|uncooked) )?penne(?: pasta)?$/],
  ['water', /^(?:(?:plain|unflavored) )?(?:sparkling|carbonated) (?:mineral )?water$/],
  ['apple', /^(?:fresh )?(?:red |gala |fuji )?apples?$/],
  ['banana', /^(?:fresh )?bananas?$/],
  ['bread', /^(?:white|whole wheat|wheat|sourdough) bread$/],
  ['eggs', /^(?:(?:large|fresh) )?(?:white |brown )?eggs?$/],
  ['oats', /^(?:plain )?(?:old fashioned |rolled )oats$/],
  ['cheese', /^(?:mild |sharp )?cheddar cheese$/],
  ['nuts', /^(?:unsalted )?mixed nuts$/],
  ['milk', /^(?:whole|skim|2%|1%) milk$/],
  ['orange', /^(?:fresh |navel )?oranges?$/],
 ];
 return illustrations.find(([, pattern]) => pattern.test(product))?.[0] || '';
}

(() => {
 const show = showIngredientAmount;
 const preview = previewIngredientAmount;
 const imageRoot = './fitness-app/food-details/';

 showIngredientAmount = function(food) {
  show(food);
  if (food[7] !== 'off') return;

  const panel = document.getElementById('ingredient-amount-panel');
  if (!panel) return;
  const amountCard = panel.querySelector('.food-amount-card');
  const input = panel.querySelector('#ingredient-amount');
  const unit = food[6] === 'ml' ? 'mL' : 'g';

  const split = document.createElement('div');
  split.className = 'scanned-food-split';
  split.dataset.unit = unit;
  const barcode = scannedFoodBarcode(food);
  const illustration = scannedFoodIllustration(food[1]);
  if (barcode) {
   const controls = document.createElement('div');
   controls.className = 'personal-photo-controls scanned-photo-controls';
   controls.dataset.photoKind = 'scanned-food';
   controls.dataset.photoItem = barcode;
   controls.innerHTML = '<button type="button" class="scanned-photo-tile" aria-haspopup="dialog">' +
    '<img class="scanned-food-art" alt="" hidden>' +
    '<span class="scanned-photo-prompt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="3"/></svg><span>Add photo</span></span></button>' +
    '<dialog class="personal-photo-dialog scanned-photo-menu" aria-label="Food photo"><h2>Food photo</h2>' +
    '<div class="personal-photo-actions"><button type="button" data-photo-source="camera">Take photo</button>' +
    '<button type="button" data-photo-source="gallery">Choose from Photos</button>' +
    '<button type="button" data-remove-personal-photo>Remove food photo</button>' +
    '<button type="button" data-photo-source="cancel">Cancel</button></div></dialog>' +
    '<input type="file" hidden accept="image/*" capture="environment" aria-label="Take food photo" data-personal-photo-input>' +
    '<input type="file" hidden accept="image/jpeg,image/png,image/webp,image/heic,image/heif" aria-label="Choose food photo" data-personal-photo-input>' +
    '<p class="personal-photo-status" role="status"></p>';
   const tile=controls.querySelector('.scanned-photo-tile'),menu=controls.querySelector('dialog'),art=controls.querySelector('img');
   const refresh=()=>{
    const photo=personalPhoto(scannedFoodPhoto(food)),url=photo||(illustration?imageRoot+illustration+'.webp':'');
    if(url)art.src=url;else art.removeAttribute('src');
    art.hidden=!url;
    tile.querySelector('.scanned-photo-prompt').hidden=Boolean(url);
    tile.setAttribute('aria-label',photo?'Change food photo':'Add food photo');
    menu.querySelector('[data-remove-personal-photo]').hidden=!photo;
   };
   tile.onclick=()=>menu.showModal();
   menu.addEventListener('click',event=>{
    const source=event.target.closest('[data-photo-source]')?.dataset.photoSource;
    if(!source)return;
    menu.close();
    if(source!=='cancel')controls.querySelector(source==='camera'?'input[capture]':'input:not([capture])').click();
   });
   controls.addEventListener('scanned-photo-saved',()=>{if(menu.open)menu.close();refresh()});
   refresh();
   split.append(controls);
  }

  amountCard.before(split);
  split.append(amountCard);
  const field = document.createElement('div');
  field.className = 'scanned-amount-field';
  field.innerHTML = '<span class="scanned-amount-unit" aria-hidden="true">' + unit + '</span>';
  input.before(field);
  field.append(input);
  input.setAttribute('aria-label', 'Amount in ' + (unit === 'mL' ? 'milliliters' : 'grams'));
  amountCard.querySelector('label').textContent = 'Amount';
  const portion=Number.isFinite(food[9])?food[9]:100;
  const shortcut=document.createElement('button');
  shortcut.type='button';
  shortcut.className='scanned-portion';
  shortcut.textContent=portion+' '+unit;
  if(portion!==100)shortcut.setAttribute('aria-label','Label portion, '+portion+' '+unit);
  shortcut.onclick=()=>{input.value=portion;previewIngredientAmount()};
  const controls=document.createElement('div');
  controls.className='scanned-portion-controls';
  controls.append(amountCard.querySelector('.food-basis-toggle'),shortcut);
  amountCard.append(controls);
  const nutrition=panel.querySelector('#ingredient-amount-preview');
  nutrition.classList.replace('food-macro-preview','scanned-nutrition-preview');
  split.after(nutrition);
  window.scrollTo(0,0);
  previewIngredientAmount();
 };

 previewIngredientAmount = function() {
  const split = document.querySelector('.scanned-food-split');
  if (!split || !ingredientSelected) return preview();
  const input = split.querySelector('#ingredient-amount');
  const output = document.getElementById('ingredient-amount-preview');
  const amount = input.valueAsNumber;
  const valid = Number.isFinite(amount) && amount > 0 && amount <= 10000;
  const totals = ingredientTotals([{food: ingredientSelected, grams: valid ? amount : 100}]);
  const unit = split.dataset.unit;
  output.innerHTML = '<small class="food-nutrition-basis">' + (valid ? 'For this amount' : 'Per 100 ' + unit) +
   '</small><div class="scanned-nutrition-body"><div class="scanned-energy"><span><strong>' + totals[0] + '</strong> <small>kcal</small></span></div><div class="scanned-nutrients">' +
   [['Protein', 1, 'protein'], ['Carbs', 2, 'carbs'], ['Fat', 3, 'fat']].map(([label, index, icon]) =>
    '<span>' + foodNutrientIcon(icon) + label + '<b>' + totals[index] + ' g</b></span>'
   ).join('') + '</div></div>';
  const ring=foodMacroRing(totals,false);
  if(ring)output.querySelector('.scanned-energy').prepend(ring.svg);
  const error = document.getElementById('ingredient-amount-error');
  error.textContent = input.value && !valid ? 'Enter an amount over 0 and up to 10,000 ' + unit + '.' : '';
 };
})();

// Project the complete draft meal using the same portions and diary date as the logger.
function renderFoodDayProjection(){
 const panel=document.getElementById('ingredient-amount-panel');
 const input=panel?.querySelector('#ingredient-amount');
 const card=panel?.querySelector('.food-day-projection');
 if(!card||!input||!ingredientSelected)return;

 const draft=ingredientTotals([...ingredientRows,{food:ingredientSelected,grams:input.valueAsNumber}]);
 const date=diaryDay();
 card.hidden=!draft||Boolean(customMealPlanContext);
 if(card.hidden)return;

 const summary=foodSummary(date),goals=target();
 const rows=[
  ['Calories',0,'calories','kcal'],['Protein',1,'protein','g'],
  ['Carbs',2,'carbs','g'],['Fat',3,'fat','g']
 ];
 const format=new Intl.NumberFormat(undefined,{maximumFractionDigits:1});
 card.querySelector('h4').textContent=date===foodDate()?'Today after adding':'After adding · '+date;
 card.querySelector('.food-day-rows').innerHTML=rows.map(([label,index,key,unit])=>{
  const logged=summary.entries.reduce((sum,entry)=>{
   const amount=entry.macros?.[index];
   return Number.isFinite(amount)?sum+amount:sum;
  },0);
  const goal=goals[key],projected=logged+draft[index];
  const before=goal>0?Math.min(100,logged/goal*100):0;
  const added=goal>0?Math.min(100-before,draft[index]/goal*100):0;
  return '<div class="food-day-row food-day-'+key+'"><span>'+label+'</span>'+
   '<div class="food-day-track" aria-hidden="true"><span style="width:'+before+'%"></span>'+
   '<span style="width:'+added+'%"></span></div><span class="food-day-value"><b>'+
   (summary.missing[index]?'≥':'')+format.format(projected)+'</b>'+
   (goal>0?' / '+format.format(goal):'')+' '+unit+'</span></div>';
 }).join('');
}

(()=>{
 const show=showIngredientAmount,preview=previewIngredientAmount;
 showIngredientAmount=function(food){
  show(food);
  const actions=document.querySelector('#ingredient-amount-panel .food-amount-actions');
  actions?.insertAdjacentHTML('beforebegin','<section class="food-glass food-day-projection" aria-labelledby="food-day-title" hidden><h4 id="food-day-title">Today after adding</h4><div class="food-day-rows" aria-live="polite"></div></section>');
  renderFoodDayProjection();
 };
 previewIngredientAmount=function(){
  preview();
  renderFoodDayProjection();
 };
})();
