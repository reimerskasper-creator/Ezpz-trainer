/* Overview photo changes stay in a dialog draft until Save background. */
(()=>{
 let dialog=null,draft=null,opener=null,category=null;const temporary=new Set();
 const defaultPhoto='./home-images/zone-woodland.jpg';
 function preview(){
  if(!dialog)return;const b=cleanHomeBackground(draft),src=personalPhoto(b.photoId)||(category?progressDefaultPhoto(category):defaultPhoto),el=dialog.querySelector('.home-background-preview');
  el.style.backgroundImage='linear-gradient(105deg,#062b20d9,#062b20b8),url("'+src+'")';el.style.backgroundPosition=b.x+'% '+b.y+'%';el.style.backgroundSize=b.zoom===1?'cover':(b.zoom*100)+'% auto';
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
 function clean(value){const list=Array.isArray(value)?value:[];return [...new Set(list.filter(id=>ids.includes(id))),...ids.filter(id=>!list.includes(id))]}
 let editing=false,draft=null,drag=null,frame=0;
 const originalHome=home,originalMore=more;
 function items(){return sections.map(([id,selector,label])=>({id,label,node:screen.querySelector(selector)})).filter(x=>x.node?.parentElement===screen)}
 function arrange(order){const cards=items(),anchor=screen.querySelector('.home-edit-plan');if(!anchor)return;for(const id of clean(order)){const item=cards.find(x=>x.id===id);if(item)screen.insertBefore(item.node,anchor)}}
 function announce(message){const live=screen.querySelector('.home-arrange-status');if(live)live.textContent=message}
 function current(){const nodes=Array.from(screen.children);return items().sort((a,b)=>nodes.indexOf(a.node)-nodes.indexOf(b.node)).map(x=>x.id)}
 function move(id,to){const order=clean(draft),from=order.indexOf(id);if(from<0||to<0||to>=order.length||from===to)return;order.splice(from,1);order.splice(to,0,id);draft=order;arrange(draft);announce(sections.find(s=>s[0]===id)[2]+' moved to position '+(to+1))}
 function decorate(){
  screen.classList.toggle('home-arranging',editing);if(!editing)return;
  const bar=document.createElement('section');bar.className='home-arrange-toolbar';bar.setAttribute('aria-label','Arrange homepage');bar.innerHTML='<div><strong>Arrange homepage</strong><small>Hold a handle to move a section</small></div><button type="button" data-home-arrange-cancel>Cancel</button><button type="button" class="primary" data-home-arrange-done>Done</button><p class="home-arrange-status" role="status" aria-live="polite"></p>';
  screen.querySelector('.home-heading')?.after(bar);
  for(const item of items()){item.node.dataset.homeOrderId=item.id;const handle=document.createElement('button');handle.type='button';handle.className='home-arrange-handle';handle.dataset.homeArrangeHandle=item.id;handle.setAttribute('aria-label','Move '+item.label+'. Hold and drag, or use the up and down arrow keys.');handle.innerHTML='<span aria-hidden="true">⠿</span><span>Move '+item.label+'</span>';if(item.node.tagName==='BUTTON'){item.node.before(handle);handle.dataset.homeArrangeStandalone=item.id}else item.node.prepend(handle)}
 }
 // Keep the standalone hidden-weight control with its existing button when moved.
 const reorder=arrange;arrange=function(order){reorder(order);for(const handle of screen.querySelectorAll('[data-home-arrange-standalone]')){const item=items().find(x=>x.id===handle.dataset.homeArrangeStandalone);if(item)item.node.before(handle)}};
 home=function(){stopDrag(false);originalHome();if(state.homeSectionOrder||editing)arrange(editing?draft:state.homeSectionOrder);decorate()};
 more=function(){editing=false;draft=null;stopDrag(false);screen.classList.remove('home-arranging');originalMore();const group=screen.querySelector('.more-daily');if(group){const button=document.createElement('button');button.type='button';button.className='more-link';button.dataset.homeArrangeOpen='';button.innerHTML=homeIcon('settings')+'<span><strong>Arrange homepage</strong><small>Move your existing sections</small></span><b aria-hidden="true">›</b>';group.append(button)}};
 function finish(commit){stopDrag(false);if(commit){const had=Object.hasOwn(state,'homeSectionOrder'),before=state.homeSectionOrder;state.homeSectionOrder=clean(draft);if(!save()){if(had)state.homeSectionOrder=before;else delete state.homeSectionOrder;announce('Could not save. Your previous order is kept. Try again or Cancel.');return}}editing=false;draft=null;home();scrollTo(0,0)}
 function stopDrag(rollback){if(!drag)return;clearTimeout(drag.timer);cancelAnimationFrame(frame);if(rollback&&drag.active){draft=drag.before;arrange(draft)}drag.node?.classList.remove('home-section-moving');drag=null;document.body.classList.remove('home-section-dragging')}
 function tick(){if(!drag?.active)return;const edge=90,dy=drag.y<edge?-Math.ceil((edge-drag.y)/3):drag.y>innerHeight-edge?Math.ceil((drag.y-innerHeight+edge)/3):0;if(dy)scrollBy(0,Math.max(-18,Math.min(18,dy)));const target=items().filter(x=>x.id!==drag.id).find(x=>{const r=x.node.getBoundingClientRect();return drag.y<r.top+r.height/2});const visible=current().filter(id=>id!==drag.id),to=target?visible.indexOf(target.id):visible.length;const next=[...visible];next.splice(to,0,drag.id);const order=clean(next);if(JSON.stringify(order)!==JSON.stringify(clean(draft))){draft=order;arrange(draft)}frame=requestAnimationFrame(tick)}
 document.addEventListener('click',event=>{
  if(event.target.closest('[data-home-arrange-open]')){editing=true;draft=clean(state.homeSectionOrder);tab='home';render();scrollTo(0,0);screen.querySelector('[data-home-arrange-done]')?.focus();return}
  if(event.target.closest('[data-home-arrange-done]'))return finish(true);
  if(event.target.closest('[data-home-arrange-cancel]'))return finish(false);
  if(event.target.closest('[data-home-arrange-handle]')){event.preventDefault();event.stopImmediatePropagation();return}
  if(editing&&event.target.closest('[data-tab],[data-go]')){stopDrag(false);editing=false;draft=null;screen.classList.remove('home-arranging')}
 },true);
 document.addEventListener('keydown',event=>{const handle=event.target.closest('[data-home-arrange-handle]');if(!editing||!handle||!['ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();move(handle.dataset.homeArrangeHandle,clean(draft).indexOf(handle.dataset.homeArrangeHandle)+(event.key==='ArrowUp'?-1:1));handle.focus({preventScroll:true})});
 document.addEventListener('pointerdown',event=>{const handle=event.target.closest('[data-home-arrange-handle]');if(!editing||!handle||event.button!==0)return;stopDrag(false);const item=items().find(x=>x.id===handle.dataset.homeArrangeHandle);if(!item)return;drag={id:item.id,node:item.node,pointer:event.pointerId,x:event.clientX,y:event.clientY,startY:event.clientY,before:clean(draft),active:false};drag.timer=setTimeout(()=>{if(!drag)return;drag.active=true;drag.node.classList.add('home-section-moving');document.body.classList.add('home-section-dragging');announce('Moving '+item.label);frame=requestAnimationFrame(tick)},250)});
 document.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.pointer)return;if(!drag.active&&Math.hypot(event.clientX-drag.x,event.clientY-drag.startY)>12){stopDrag(false);return}drag.y=event.clientY;if(drag.active)event.preventDefault()},{passive:false});
 document.addEventListener('pointerup',event=>{if(drag&&event.pointerId===drag.pointer){if(drag.active)announce('Section moved. Tap Done to save.');stopDrag(false)}});
 document.addEventListener('pointercancel',()=>stopDrag(true));
 window.addEventListener('blur',()=>stopDrag(true));
})();
// The core page can render before this enhancement loads.
if(tab==='home'&&state.profile&&state.homeSectionOrder)home();
