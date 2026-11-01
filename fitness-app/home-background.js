/* Overview photo changes stay in a dialog draft until Save background. */
(()=>{
 let dialog=null,draft=null,opener=null,category=null;const temporary=new Set();
 const defaultPhoto='./home-images/zone-woodland.jpg';
 function preview(){
  if(!dialog)return;const b=cleanHomeBackground(draft),src=personalPhoto(b.photoId)||(category?progressDefaultPhoto(category):defaultPhoto),el=dialog.querySelector('.home-background-preview');
  el.style.backgroundImage=(category?'linear-gradient(105deg,#062b20d9,#062b20b8),url("':'linear-gradient(105deg,#08261bb8,#08261ba6),url("')+src+'")';el.style.backgroundPosition=b.x+'% '+b.y+'%';el.style.backgroundSize=b.zoom===1?'cover':(b.zoom*100)+'% auto';
  dialog.querySelector('[data-background-crop]').hidden=!b.photoId;
 }
 function close(){if(!dialog)return;const old=dialog;dialog=null;old.close();old.remove();for(const id of temporary)delete pendingPersonalPhotos[id];temporary.clear();draft=null;opener?.focus({preventScroll:true})}
 function open(button){
  if(dialog)return;opener=button;category=button.dataset.progressBackground||null;draft=cleanHomeBackground(category?cleanProgressBackgrounds(state.progressBackgrounds)[category]:state.homeBackground);dialog=document.createElement('dialog');dialog.id='home-background-dialog';dialog.setAttribute('aria-labelledby','home-background-title');
  dialog.innerHTML='<span class="sheet-handle" aria-hidden="true"></span><div class="home-background-heading"><h2 id="home-background-title">Overview background</h2><button type="button" data-background-close aria-label="Close background settings">×</button></div><p class="home-background-help">Your photo. Your daily view.</p><div class="home-background-preview"><strong>Today’s overview</strong><span>White text stays readable</span></div><div class="personal-photo-controls" data-photo-kind="home"><label class="home-background-upload">↑ Upload photo<input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" data-personal-photo-input></label><p class="personal-photo-status" role="status"></p></div><details data-background-crop><summary>Adjust crop</summary><label>Zoom<input type="range" data-background-field="zoom" min="1" max="2" step="0.05"></label><label>Move left / right<input type="range" data-background-field="x" min="0" max="100" step="1"></label><label>Move up / down<input type="range" data-background-field="y" min="0" max="100" step="1"></label></details><p class="home-background-status" role="status"></p><div class="home-background-actions"><button type="button" data-background-default>Restore default</button><button type="button" class="primary" data-background-save>Save background</button></div>';
  if(category){dialog.querySelector('#home-background-title').textContent='Your photo';dialog.querySelector('.home-background-preview strong').textContent=progressPhotoLabel(category);dialog.querySelector('.personal-photo-controls').dataset.photoKind='progress'}
  if(category)dialog.querySelector('.home-background-help').textContent='Changes apply to this photo only.';
  document.body.append(dialog);resetSliders();preview();dialog.addEventListener('cancel',event=>{event.preventDefault();close()});
  dialog.addEventListener('input',event=>{const field=event.target.dataset.backgroundField;if(!field)return;draft[field]=Number(event.target.value);preview()});
  dialog.addEventListener('click',event=>{
   if(event.target.closest('[data-background-close]'))return close();
   if(event.target.closest('[data-background-default]')){draft=cleanHomeBackground(null);resetSliders();preview();return}
   if(!event.target.closest('[data-background-save]'))return;
   if(!(category?saveProgressBackground(category,draft):saveHomeBackground(draft))){dialog.querySelector('.home-background-status').textContent='Could not save. Your previous background is kept.';return}
   const scroll=window.scrollY,wasProgress=category;close();if(wasProgress){if(tab==='progress')progress();else render();window.scrollTo(0,scroll);document.querySelector('[data-progress-background="'+wasProgress+'"]')?.focus({preventScroll:true})}else if(tab==='home'){home();window.scrollTo(0,scroll);document.querySelector('[data-home-background]')?.focus({preventScroll:true})}
  });dialog.showModal();
 }
 function resetSliders(){dialog.querySelectorAll('[data-background-field]').forEach(input=>{input.value=draft[input.dataset.backgroundField]})}
 window.EZPZHomeBackground={select(id){if(!dialog?.isConnected)return false;if(id&&!personalPhoto(id))return false;if(pendingPersonalPhotos[id])temporary.add(id);draft=cleanHomeBackground({photoId:id});resetSliders();preview();return true}};
 window.EZPZProgressBackground={select(id){if(!category)return false;return window.EZPZHomeBackground.select(id)}};
 document.addEventListener('click',event=>{const button=event.target.closest('[data-home-background],[data-progress-background]');if(button)open(button)});
})();

/* Arrange the existing Home nodes; their contents and actions stay owned by Home. */
(()=>{
 const sections=[['todayWorkout','.home-workout','Today’s workout'],['nutrition','.home-nutrition','Today’s nutrition'],['steps','.home-steps-panel','Steps'],['workouts','.home-next','Your next workouts'],['meals','.home-meals','Your next meals'],['week','.foundation-week','Your week'],['weight','.home-weight-card,.weight-show','Bodyweight']];
 const ids=sections.map(s=>s[0]);
 function clean(value){const list=Array.isArray(value)?[...value]:[];return [...new Set(list.filter(id=>ids.includes(id))),...ids.filter(id=>!list.includes(id))]}
 let editing=false,draft=null,drag=null,frame=0;
 const originalHome=home,originalMore=more;
 function items(){const children=Array.from(screen.children);return sections.map(([id,selector,label])=>({id,label,node:screen.querySelector(selector)})).filter(x=>x.node?.parentElement===screen).sort((a,b)=>children.indexOf(a.node)-children.indexOf(b.node))}
 function arrange(order){const cards=items(),anchor=screen.querySelector('.home-edit-plan');if(!anchor)return;for(const id of clean(order)){const item=cards.find(x=>x.id===id);if(item)screen.insertBefore(item.node,anchor)}}
 function announce(message){const live=screen.querySelector('.home-arrange-status');if(live)live.textContent=message}
 function current(){const nodes=Array.from(screen.children);return items().sort((a,b)=>nodes.indexOf(a.node)-nodes.indexOf(b.node)).map(x=>x.id)}
 function move(id,to){const order=clean(draft),from=order.indexOf(id);if(from<0||to<0||to>=order.length||from===to)return;order.splice(from,1);order.splice(to,0,id);draft=order;arrange(draft);announce(sections.find(s=>s[0]===id)[2]+' moved to position '+(to+1))}
 function decorate(){
  screen.classList.toggle('home-arranging',editing);if(!editing)return;
  const bar=document.createElement('section');bar.className='home-arrange-toolbar';bar.setAttribute('aria-label','Arrange homepage');bar.innerHTML='<div><strong>Edit homepage</strong><small>Hold a handle to move a section</small></div><button type="button" data-home-arrange-cancel>Cancel</button><button type="button" class="primary" data-home-arrange-done>Done</button><p class="home-arrange-status" role="status" aria-live="polite"></p>';
  screen.querySelector('.home-heading')?.after(bar);
  window.EZPZHomeEditor?.decorate();
  for(const item of items()){item.node.dataset.homeOrderId=item.id;const handle=document.createElement('button');handle.type='button';handle.className='home-arrange-handle';handle.dataset.homeArrangeHandle=item.id;handle.setAttribute('aria-label','Move '+item.label+'. Hold and drag, or use the up and down arrow keys.');handle.innerHTML='<span aria-hidden="true">⠿</span><span>Move '+item.label+'</span>';if(item.node.tagName==='BUTTON'){item.node.before(handle);handle.dataset.homeArrangeStandalone=item.id}else item.node.prepend(handle)}
 }
 // Keep the standalone hidden-weight control with its existing button when moved.
 const reorder=arrange;arrange=function(order){reorder(order);for(const handle of screen.querySelectorAll('[data-home-arrange-standalone]')){const item=items().find(x=>x.id===handle.dataset.homeArrangeStandalone);if(item)item.node.before(handle)}};
 home=function(){stopDrag(false);originalHome();window.EZPZHomeEditor?.paint();if(state.homeSectionOrder||editing)arrange(editing?draft:state.homeSectionOrder);decorate()};
 more=function(){window.EZPZHomeEditor?.cancel();editing=false;draft=null;stopDrag(false);screen.classList.remove('home-arranging');originalMore();const group=screen.querySelector('.more-daily');if(group){const button=document.createElement('button');button.type='button';button.className='more-link';button.dataset.homeArrangeOpen='';button.innerHTML=homeIcon('settings')+'<span><strong>Edit homepage</strong><small>Arrange sections, rings & photos</small></span><b aria-hidden="true">›</b>';group.append(button)}};
 function finish(commit){stopDrag(false);if(commit){const had=Object.hasOwn(state,'homeSectionOrder'),before=state.homeSectionOrder;const appearanceBefore=state.homeAppearance,appearanceHad=Object.hasOwn(state,'homeAppearance');state.homeSectionOrder=clean(draft);window.EZPZHomeEditor?.stage();if(!save()){if(had)state.homeSectionOrder=before;else delete state.homeSectionOrder;if(appearanceHad)state.homeAppearance=appearanceBefore;else delete state.homeAppearance;announce('Could not save. Your previous order is kept. Try again or Cancel.');return}}window.EZPZHomeEditor?.cancel();editing=false;draft=null;home();scrollTo(0,0)}
 function stopDrag(rollback){if(!drag)return;clearTimeout(drag.timer);cancelAnimationFrame(frame);if(rollback&&drag.active){draft=drag.before;arrange(draft)}drag.node?.classList.remove('home-section-moving');drag=null;document.body.classList.remove('home-section-dragging')}
 function tick(){if(!drag?.active)return;const edge=90,dy=drag.y<edge?-Math.ceil((edge-drag.y)/3):drag.y>innerHeight-edge?Math.ceil((drag.y-innerHeight+edge)/3):0;if(dy)scrollBy(0,Math.max(-18,Math.min(18,dy)));const target=items().filter(x=>x.id!==drag.id).find(x=>{const r=x.node.getBoundingClientRect();return drag.y<r.top+r.height/2});const visible=current().filter(id=>id!==drag.id),to=target?visible.indexOf(target.id):visible.length;const next=[...visible];next.splice(to,0,drag.id);const order=clean(next);if(JSON.stringify(order)!==JSON.stringify(clean(draft))){draft=order;arrange(draft)}frame=requestAnimationFrame(tick)}
 document.addEventListener('click',event=>{
  if(event.target.closest('[data-home-arrange-open]')){window.EZPZHomeEditor?.begin();editing=true;draft=clean(state.homeSectionOrder);tab='home';render();scrollTo(0,0);screen.querySelector('[data-home-arrange-done]')?.focus({preventScroll:true});return}
  if(event.target.closest('[data-home-arrange-done]'))return finish(true);
  if(event.target.closest('[data-home-arrange-cancel]'))return finish(false);
  if(event.target.closest('[data-home-arrange-handle]')){event.preventDefault();event.stopImmediatePropagation();return}
  if(editing&&!event.target.closest('.ring-canvas')&&event.target.closest('[data-tab],[data-go]')){stopDrag(false);window.EZPZHomeEditor?.cancel();editing=false;draft=null;screen.classList.remove('home-arranging')}
 },true);
 document.addEventListener('keydown',event=>{const handle=event.target.closest('[data-home-arrange-handle]');if(!editing||!handle||!['ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();move(handle.dataset.homeArrangeHandle,clean(draft).indexOf(handle.dataset.homeArrangeHandle)+(event.key==='ArrowUp'?-1:1));handle.focus({preventScroll:true})});
 document.addEventListener('contextmenu',event=>{if(editing&&event.target.closest('.home-arranging'))event.preventDefault()});
 document.addEventListener('selectstart',event=>{if(editing&&event.target.closest('.home-arranging'))event.preventDefault()});
 document.addEventListener('pointerdown',event=>{const handle=event.target.closest('[data-home-arrange-handle]');if(!editing||!handle||event.button!==0)return;stopDrag(false);const item=items().find(x=>x.id===handle.dataset.homeArrangeHandle);if(!item)return;event.preventDefault();window.getSelection()?.removeAllRanges();drag={id:item.id,node:item.node,pointer:event.pointerId,x:event.clientX,y:event.clientY,startY:event.clientY,before:clean(draft),active:false};drag.timer=setTimeout(()=>{if(!drag)return;drag.active=true;drag.node.classList.add('home-section-moving');document.body.classList.add('home-section-dragging');announce('Moving '+item.label);frame=requestAnimationFrame(tick)},250)});
 document.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.pointer)return;if(!drag.active&&Math.hypot(event.clientX-drag.x,event.clientY-drag.startY)>12){stopDrag(false);return}drag.y=event.clientY;if(drag.active)event.preventDefault()},{passive:false});
 document.addEventListener('pointerup',event=>{if(drag&&event.pointerId===drag.pointer){if(drag.active)announce('Section moved. Tap Done to save.');stopDrag(false)}});
 document.addEventListener('pointercancel',()=>stopDrag(true));
 window.addEventListener('blur',()=>stopDrag(true));
})();
// The core page can render before this enhancement loads.
if(tab==='home'&&state.profile&&state.homeSectionOrder)home();

/* Overview appearance is a single draft shared with the section-order editor. */
(()=>{
 let draft=null,mode='together',selected='overall',drag=null,groupSize=1;
 const keys=['eat','sleep','train','zone','steps','overall'];
 const prefs=()=>draft||cleanHomeAppearance(state.homeAppearance);
 const frame=()=>screen.querySelector('.home-week-card .foundation-map');
 function nodes(){const f=frame();return f?Array.from(f.querySelectorAll('.habit-item')):[]}
 function geometry(id,p=prefs()){
  const f=frame(),w=f.clientWidth,h=f.clientHeight,r=p.rings[id],diameter=Math.max(44,w*(id==='overall'?.32:.175)*r.size),height=diameter+(id==='overall'?29:p.details?44:24),width=diameter+4;
  return {width,height,diameter,x:Math.max(width/2,Math.min(w-width/2,w*r.x/100)),y:Math.max(height/2,Math.min(h-height/2,h*r.y/100))};
 }
 function paint(){
  if(tab!=='home')return;
  const f=frame(),p=prefs();if(!f)return;
  const expanded=f.closest('.home-week-card').dataset.folded!=='true';f.classList.toggle('ring-canvas',expanded);f.classList.toggle('ring-editing',!!draft&&!!screen.querySelector('[data-ring-controls][open]'));
  screen.querySelector('.home-heading').hidden=!p.greeting&&!draft;
  f.classList.toggle('ring-details-hidden',!p.details);
  nodes().forEach((node,i)=>{
   const id=keys[i];node.dataset.ringId=id;if(!expanded){for(const field of ['left','top','width','height','--ring-diameter','--ring-number'])node.style.removeProperty(field);return}const g=geometry(id,p);
   Object.assign(node.style,{left:g.x+'px',top:g.y+'px',width:g.width+'px',height:g.height+'px'});node.style.setProperty('--ring-diameter',g.diameter+'px');node.style.setProperty('--ring-number',Math.max(14,g.diameter*.29)+'px');
   node.classList.toggle('ring-selected',!!draft&&(mode==='together'||selected===id));
   if(draft){node.setAttribute('aria-label',id+'. Drag or use arrow keys to move.');node.setAttribute('aria-pressed',String(mode==='together'||selected===id))}
  });
  const card=f.closest('.home-week-card'),b=cleanHomeBackground(state.homeBackground),src=personalPhoto(b.photoId)||'./home-images/zone-woodland.jpg';
  // Keep default photo/crop markup untouched until an appearance preference is saved.
  if(draft||state.homeAppearance){card.style.backgroundImage='linear-gradient(rgba(4,28,20,'+p.dim+'),rgba(4,28,20,'+p.dim+')),url("'+src+'")';card.style.backgroundPosition='center,'+b.x+'% '+b.y+'%';card.style.backgroundSize='cover,'+(b.zoom===1?'cover':(b.zoom*100)+'% auto')}
 }
 function controls(){
  const panel=screen.querySelector('.home-appearance-panel');if(!panel)return;
  panel.querySelectorAll('[data-ring-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ringMode===mode)));
  panel.querySelector('[data-ring-size]').value=mode==='together'?groupSize:draft.rings[selected].size;
  panel.querySelector('[data-ring-size-label]').textContent=mode==='together'?'Group size':selected[0].toUpperCase()+selected.slice(1)+' size';
  panel.querySelector('[data-home-dim]').value=draft.dim;
  panel.querySelector('[data-home-details]').checked=draft.details;
  panel.querySelector('[data-home-greeting]').checked=draft.greeting;
 }
 function decorate(){
  if(!draft)return;
  const f=frame();if(!f)return;f.closest('.home-week-card').dataset.folded='false';
  const panel=document.createElement('section');panel.className='home-appearance-panel';panel.setAttribute('aria-label','Homepage appearance');
  panel.innerHTML='<details data-ring-controls><summary>Arrange rings</summary><div class="ring-mode" role="group" aria-label="Move rings"><button type="button" data-ring-mode="together">Together</button><button type="button" data-ring-mode="individual">Individually</button></div><p>Drag to move · Tap a ring to select</p><label><span data-ring-size-label>Group size</span><input type="range" data-ring-size min="0.8" max="1.4" step="0.05" aria-label="Ring size"></label><button type="button" data-ring-reset>Reset rings</button></details><details><summary>Photo</summary><button type="button" data-home-background>Change photo & crop</button><label>Photo dimming<input type="range" data-home-dim min="0.2" max="0.85" step="0.05" aria-label="Photo dimming"></label></details><details><summary>Display</summary><label class="home-display-toggle">Show ring details<input type="checkbox" data-home-details></label><label class="home-display-toggle">Show greeting<input type="checkbox" data-home-greeting></label></details>';
  f.closest('.home-week-card').after(panel);controls();paint();
  panel.querySelector('[data-ring-controls]').addEventListener('toggle',paint);
 }
 function translate(ids,dx,dy,base){
  const f=frame(),gs=ids.map(id=>geometry(id,base));
  dx=Math.max(Math.max(...gs.map(g=>g.width/2-g.x)),Math.min(Math.min(...gs.map(g=>f.clientWidth-g.width/2-g.x)),dx));
  dy=Math.max(Math.max(...gs.map(g=>g.height/2-g.y)),Math.min(Math.min(...gs.map(g=>f.clientHeight-g.height/2-g.y)),dy));
  ids.forEach((id,i)=>{draft.rings[id].x=(gs[i].x+dx)/f.clientWidth*100;draft.rings[id].y=(gs[i].y+dy)/f.clientHeight*100});paint();
 }
 function stop(rollback=false){if(!drag)return;if(rollback){draft=drag.before;paint()}drag=null}
 window.EZPZHomeEditor={begin(){draft=cleanHomeAppearance(state.homeAppearance);mode='together';selected='overall';groupSize=1},cancel(){stop();draft=null},stage(){if(draft&&JSON.stringify(draft)!==JSON.stringify(cleanHomeAppearance(state.homeAppearance)))state.homeAppearance=cleanHomeAppearance(draft)},paint,decorate};
 // Section order wrapper has already rendered before this module is defined.
 if(tab==='home'&&state.profile)paint();
 window.addEventListener('resize',()=>{stop(true);paint()});window.addEventListener('load',paint);
 document.addEventListener('click',event=>{
  const b=event.target.closest('[data-ring-mode]');if(b&&draft){mode=b.dataset.ringMode;controls();paint();return}
  if(event.target.closest('[data-ring-reset]')&&draft){draft.rings=cleanHomeAppearance(null).rings;groupSize=1;controls();paint();return}
  if(event.target.closest('[data-home-sync]')){
   const dialog=document.createElement('dialog');dialog.className='home-sync-dialog';dialog.setAttribute('aria-label','Tracker sync');dialog.innerHTML='<h2>Tracker sync</h2>'+homeTrackerStatus()+'<p data-home-sync-result role="status"></p><button type="button" data-home-refresh>Refresh now</button><button type="button" data-home-sync-close>Done</button>';const opener=event.target.closest('button');let refreshed=false;document.body.append(dialog);dialog.querySelector('[data-home-sync-close]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{dialog.remove();if(refreshed&&tab==='home'){const y=scrollY;home();scrollTo(0,y);screen.querySelector('[data-home-sync]')?.focus({preventScroll:true})}else opener?.focus({preventScroll:true})});dialog.querySelector('[data-home-refresh]').onclick=async()=>{const button=dialog.querySelector('[data-home-refresh]');button.disabled=true;button.textContent='Refreshing…';try{const ok=await refreshConnectedData('tracker');refreshed=refreshed||ok;dialog.querySelector('.home-tracker-note').outerHTML=homeTrackerStatus();dialog.querySelector('[data-home-sync-result]').textContent=ok?'Updated. See sync time above.':nativeHealthLastMessage||'Could not refresh. Try again.'}catch{dialog.querySelector('[data-home-sync-result]').textContent='Could not refresh. Try again.'}finally{button.disabled=false;button.textContent='Refresh now'}};dialog.showModal();return;
  }
  if(draft&&event.target.closest('.ring-canvas .habit-item')){event.preventDefault();event.stopImmediatePropagation();selected=event.target.closest('[data-ring-id]').dataset.ringId;screen.querySelector('[data-ring-controls]').open=true;controls();paint()}
 },true);
 document.addEventListener('input',event=>{
  if(!draft)return;const e=event.target;
  if(e.matches('[data-ring-size]')){const size=Number(e.value);if(mode==='together'){const ratio=size/groupSize;for(const r of Object.values(draft.rings)){r.size=Math.min(1.4,Math.max(.8,r.size*ratio));r.x=50+(r.x-50)*ratio;r.y=60+(r.y-60)*ratio}groupSize=size}else draft.rings[selected].size=size;paint()}
  if(e.matches('[data-home-dim]')){draft.dim=Number(e.value);paint()}
  if(e.matches('[data-home-details]')){draft.details=e.checked;paint()}
  if(e.matches('[data-home-greeting]')){draft.greeting=e.checked;paint()}
 });
 document.addEventListener('pointerdown',event=>{
  const node=event.target.closest('.ring-editing [data-ring-id]');if(!draft||!node||event.button!==0)return;
  event.preventDefault();selected=node.dataset.ringId;controls();paint();node.focus({preventScroll:true});node.setPointerCapture(event.pointerId);drag={pointer:event.pointerId,x:event.clientX,y:event.clientY,before:cleanHomeAppearance(draft),ids:mode==='together'?keys:[selected]};
 });
 document.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.pointer)return;event.preventDefault();translate(drag.ids,event.clientX-drag.x,event.clientY-drag.y,drag.before)},{passive:false});
 document.addEventListener('pointerup',()=>stop());document.addEventListener('pointercancel',()=>stop(true));window.addEventListener('blur',()=>stop(true));
 document.addEventListener('keydown',event=>{if(!draft||!event.target.closest('.ring-editing [data-ring-id]')||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();event.stopImmediatePropagation();selected=event.target.closest('[data-ring-id]').dataset.ringId;translate(mode==='together'?keys:[selected],event.key==='ArrowLeft'?-4:event.key==='ArrowRight'?4:0,event.key==='ArrowUp'?-4:event.key==='ArrowDown'?4:0,cleanHomeAppearance(draft));controls()},true);
})();
