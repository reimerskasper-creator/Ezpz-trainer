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
(()=>{
 const preview=previewIngredientAmount;
 previewIngredientAmount=function(){
  preview();const panel=document.getElementById('ingredient-amount-preview'),input=document.getElementById('ingredient-amount');
  if(!panel||!input||!ingredientSelected)return;panel.classList.remove('has-macro-ring');
  const totals=ingredientTotals([{food:ingredientSelected,grams:Number(input.value)}]);if(!totals)return;
  const result=foodMacroShares(...totals.slice(1));if(!result)return;
  const labels=['Carbs','Protein','Fat'],colors=['#d8b75e','#9bcce2','#91dbb2'];let offset=0;
  const circles=result.shares.map((share,i)=>{const circle='<circle cx="50" cy="50" r="39" pathLength="100" fill="none" stroke="'+colors[i]+'" stroke-width="12" stroke-dasharray="'+(share*100)+' '+(100-share*100)+'" stroke-dashoffset="'+(-offset)+'" transform="rotate(-90 50 50)"/>';offset+=share*100;return circle}).join('');
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('class','food-macro-ring');svg.setAttribute('role','img');svg.setAttribute('aria-label','Estimated macro energy split: '+labels.map((label,i)=>label+' '+result.percent[i]+'%').join(', '));svg.innerHTML=circles+'<text x="50" y="47" text-anchor="middle">Macro<tspan x="50" dy="13">split</tspan></text>';
  panel.append(svg);panel.classList.add('has-macro-ring');
  panel.querySelectorAll(':scope>div>span').forEach((tile,i)=>{const percent=document.createElement('small');percent.className='food-macro-percent';percent.textContent=result.percent[i]+'%';tile.append(percent)});
 };
})();

// Use the product name only. Brand names and uncertain matches use the neutral plate.
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
 return illustrations.find(([, pattern]) => pattern.test(product))?.[0] || 'plate';
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
  split.innerHTML = '<section class="scanned-food-card" aria-labelledby="scanned-food-title">' +
   '<h4 id="scanned-food-title">Food</h4><img class="scanned-food-art" alt="" width="144" height="112">' +
   '</section>';
  const art = split.querySelector('img');
  const illustration = imageRoot + scannedFoodIllustration(food[1]) + '.webp';
  const barcode = scannedFoodBarcode(food);
  if (barcode) {
   art.insertAdjacentHTML('afterend', '<div class="personal-photo-controls scanned-photo-controls" data-photo-kind="scanned-food">' +
    '<label class="scanned-photo-picker"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
    '<path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="3"/></svg>' +
    '<input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" aria-label="Add food photo" data-personal-photo-input></label>' +
    '<button type="button" aria-label="Remove food photo" data-remove-personal-photo>×</button>' +
    '<p class="personal-photo-status" role="status"></p></div>');
   const controls = split.querySelector('.scanned-photo-controls');
   controls.dataset.photoItem = barcode;
   const refresh = () => {
    const photo = personalPhoto(scannedFoodPhoto(food));
    art.src = photo || illustration;
    art.classList.toggle('scanned-user-photo', Boolean(photo));
    controls.querySelector('input').setAttribute('aria-label', photo ? 'Change food photo' : 'Add food photo');
    controls.querySelector('button').hidden = !photo;
   };
   controls.addEventListener('scanned-photo-saved', refresh);
   refresh();
  } else {
   art.src = illustration;
  }

  amountCard.insertAdjacentElement('beforebegin', split);
  split.firstElementChild.append(panel.querySelector('#ingredient-amount-preview'));
  split.append(amountCard);
  const field = document.createElement('div');
  field.className = 'scanned-amount-field';
  field.innerHTML = '<img class="scanned-measure-art" alt="" width="144" height="112">' +
   '<span class="scanned-amount-unit" aria-hidden="true">' + unit + '</span>';
  field.querySelector('img').src = imageRoot + (unit === 'mL' ? 'jug' : 'scale') + '.webp';
  input.before(field);
  field.append(input);
  input.setAttribute('aria-label', 'Amount in ' + (unit === 'mL' ? 'milliliters' : 'grams'));
  amountCard.querySelector('label').textContent = 'Amount';
  previewIngredientAmount();
 };

 previewIngredientAmount = function() {
  const split = document.querySelector('.scanned-food-split');
  if (!split || !ingredientSelected) return preview();
  const input = split.querySelector('#ingredient-amount');
  const output = split.querySelector('#ingredient-amount-preview');
  const amount = input.valueAsNumber;
  const valid = Number.isFinite(amount) && amount > 0 && amount <= 10000;
  const totals = ingredientTotals([{food: ingredientSelected, grams: valid ? amount : 100}]);
  const unit = split.dataset.unit;
  output.innerHTML = '<small class="food-nutrition-basis">' + (valid ? 'For this amount' : 'Per 100 ' + unit) +
   '</small><strong>' + totals[0] + ' kcal</strong><div>' +
   [['Protein', 1, 'protein'], ['Carbs', 2, 'carbs'], ['Fat', 3, 'fat']].map(([label, index, icon]) =>
    '<span>' + foodNutrientIcon(icon) + label + '<b>' + totals[index] + ' g</b></span>'
   ).join('') + '</div>';
  const error = document.getElementById('ingredient-amount-error');
  error.textContent = input.value && !valid ? 'Enter an amount over 0 and up to 10,000 ' + unit + '.' : '';
 };
})();
