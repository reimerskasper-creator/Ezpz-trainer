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
