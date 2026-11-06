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
