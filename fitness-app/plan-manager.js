/* Small, general-purpose plan tools. No client account or coach dashboard. */
(()=>{
 const originalPlanner=planner,originalDataTools=dataTools;let sequence=0,busy=false,coverReturn='library';
 const range=()=>{const p=planSettings();return planDayLabel(p.start)+' – '+planDayLabel(datePlus(p.start,p.days-1))};
 const action=(id,label)=>'<button type="button" data-plan-manage="'+id+'">'+label+'</button>';
 function tools(){return '<details class="card plan-management"><summary>Current plan &amp; sharing</summary><p class="note">'+safe(state.planName||'My plan')+' · '+planSettings().days+' days · '+safe(range())+'</p><div class="plan-management-actions">'+action('save','Save current plan')+action('new','Start a new plan')+action('export','Export current plan')+action('import','Import a plan')+'</div><div class="plan-clear">'+action('clear','Clear current plan')+'<p>Remove scheduled meals and workouts from this plan. Logged history and saved content stay.</p></div></details>'}
 planner=function(){originalPlanner();if(builderDraft)return;const hero=screen.querySelector('.planner-hero');if(hero){const tag=document.createElement('p');tag.className='plan-current-name';tag.textContent=state.planName||'Build your routine · up to 3 months';hero.append(tag)}const anchor=screen.querySelector('.plan-settings');if(anchor){anchor.insertAdjacentHTML('beforebegin','<section class="plan-library-entry" aria-label="Plan library"><button type="button" class="plan-library-open" data-plan-manage="library">Plan library →</button><p>Save, browse and activate plans. My plan shows your current schedule.</p></section>');anchor.insertAdjacentHTML('afterend',tools())}window.EzpzAppearance?.refresh()};
 dataTools=function(){return originalDataTools()+'<section class="card plan-share-tools"><h3>Share a plan</h3><p>Meals, workouts, exercise photos and video links. Personal logs and connected accounts stay on your device.</p><div class="plan-management-actions">'+action('export','Export current plan')+action('import','Import a plan')+'</div></section>'};
 function close(){sequence++;const d=document.getElementById('plan-manager-dialog');const trigger=d?._opener;if(d){d.close();d.remove()}if(trigger?.isConnected)trigger.focus({preventScroll:true})}
 function dialog(title,body,trigger){close();const d=document.createElement('dialog');d.id='plan-manager-dialog';d._opener=trigger;d.setAttribute('aria-labelledby','plan-manager-title');d.innerHTML='<div class="plan-dialog-heading"><h2 id="plan-manager-title">'+safe(title)+'</h2><button type="button" data-plan-dialog-close aria-label="Close">×</button></div>'+body+'<p class="plan-dialog-status" role="status" aria-live="polite"></p>';d.addEventListener('cancel',e=>{if(e.target!==d)return;e.preventDefault();if(!busy){if(d._discard)d._discard();else close()}});document.body.append(d);d.showModal();return d}
 const status=(d,text)=>{if(d?.isConnected)d.querySelector('.plan-dialog-status').textContent=text};
 function refreshed(message){plannerNotice=message;render()}
 function naming(kind,trigger,back=false){const fresh=kind==='new',d=dialog(fresh?'Start a new plan':'Save current plan','<p>'+safe(range())+' · '+planSettings().days+' days</p><p>'+(fresh?'Your current plan will be saved first. The scheduled meals and workouts in these dates will be cleared. Completed logs and saved content stay.':'Save a reusable copy of these dates, including the exercise photos and links.')+'</p><form><label for="plan-name">Plan name</label><input id="plan-name" maxlength="80" required value="'+safe(fresh?'':state.planName||'My plan')+'" placeholder="e.g. 12-week strength"><div class="plan-dialog-actions"><button type="button" data-plan-dialog-close>Cancel</button><button class="primary" type="submit">'+(fresh?'Save old & start new':'Save plan')+'</button></div></form>',trigger);d.querySelector('form').onsubmit=e=>{e.preventDefault();try{const name=d.querySelector('input').value.trim();if(fresh)startNewNamedPlan(name);else saveNamedPlan(name);close();refreshed(fresh?'Previous plan saved. Your new plan is empty and ready to build.':'Plan saved with its exercise photos and links.');if(back)library(document.querySelector('[data-plan-manage=library]'))}catch(error){status(d,error.message)}}}
 function confirmAction(kind,id,trigger){const saved=cleanSavedPlans(state.savedPlans).find(p=>p.id===id),isDelete=kind==='delete';if(isDelete&&!saved)return;const d=dialog(isDelete?'Delete saved plan?':'Clear current plan?',isDelete?'<p>Delete “'+safe(saved.name)+'” from saved plans? The active schedule and completed logs stay.</p>':'<p>Remove all scheduled meals and workouts in this plan: <strong>'+safe(range())+'</strong>?</p><p>This includes past and upcoming planned entries within these dates. Plan dates, completed workout and food logs, measurements, saved plans, saved meals/workouts, exercise photos and links stay.</p><p>To keep a copy of the current schedule, cancel and choose Save current plan first.</p>',trigger);d._opener=trigger;const row=document.createElement('div');row.className='plan-dialog-actions';row.innerHTML='<button type="button" data-plan-dialog-close>Cancel</button><button type="button" data-confirm-plan class="primary">'+(isDelete?'Delete saved plan':'Clear plan')+'</button>';d.insertBefore(row,d.querySelector('.plan-dialog-status'));row.querySelector('[data-confirm-plan]').onclick=()=>{try{if(isDelete)deleteNamedPlan(id);else clearCurrentPlan();close();refreshed(isDelete?'Saved plan deleted.':'Current plan cleared. These dates are empty and ready to build again.');if(isDelete)library(document.querySelector('[data-plan-manage=library]'))}catch(error){status(d,error.message)}}}
 async function exportPlan(id,trigger){const d=dialog('Export plan','<p>Includes scheduled meals, workouts, exercise photos, backgrounds and video links. Personal logs, measurements, nutrition targets and connected accounts are excluded.</p><button type="button" data-plan-export-confirm class="primary">Save plan file</button>',trigger);d.querySelector('[data-plan-export-confirm]').onclick=async e=>{if(busy)return;busy=true;e.target.disabled=true;try{const saved=id&&cleanSavedPlans(state.savedPlans).find(p=>p.id===id),pack=saved?planPackageWithPhotos(saved):capturePlanPackage(state.planName||'My plan',true),json=JSON.stringify(pack),fileName='ezpz-plan-'+pack.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)+'.json',bridge=nativeBackupBridge();if(new TextEncoder().encode(json).length>2000000)throw Error('This plan file is too large. Use fewer photos or a shorter date range.');if(bridge){status(d,'Choose where to save your plan file.');const result=await bridge.exportPlan({json,fileName});if(result?.cancelled){status(d,'Save cancelled.');return}if(!result?.saved||!result.verified||result.bytes!==new TextEncoder().encode(json).length)throw Error('The plan file was not confirmed. Try saving again.');status(d,'Plan saved and verified: '+result.fileName)}else{const url=URL.createObjectURL(new Blob([json],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=fileName;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status(d,'Plan download requested. Check that the file was saved.')}e.target.textContent='Save another copy'}catch(error){status(d,error.message)}finally{busy=false;if(e.target.isConnected)e.target.disabled=false}}}
 function counts(p){return {workouts:p.entries.reduce((n,e)=>n+(e.workout&&e.workout!=='rest'?1:0)+(e.extraWorkouts?.length||0),0),meals:p.entries.reduce((n,e)=>n+Object.keys(e.meals).length,0)}}
 function cover(p){return p.photos?.[p.coverPhotoId]||personalPhoto(p.coverPhotoId)||p.workouts.map(w=>p.photos?.[w.photoId]||personalPhoto(w.photoId)).find(Boolean)||(counts(p).workouts?'./workout-images/neutral-full-body-3.jpg':'./home-images/nutrition.jpg')}
 function cameraButton(id){return '<button type="button" class="plan-cover-button" data-plan-manage="cover:'+safe(id)+'" aria-label="Change cover photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 6h4l2-3h4l2 3h4v14H4Z"/><circle cx="12" cy="12" r="4"/></svg></button>'}
 function library(trigger){const plans=cleanSavedPlans(state.savedPlans),d=dialog('Plan library','<button type="button" class="primary plan-create" data-plan-manage="create">+ Create a plan</button><div class="plan-management-actions">'+action('save','Save current plan')+action('import','Import a plan')+'</div><div class="plan-library-list">'+plans.map(p=>{const n=counts(p),active=state.activeSavedPlanId===p.id;return '<article class="plan-library-card"><button type="button" class="plan-library-card-open" data-plan-manage="open:'+safe(p.id)+'"><img src="'+safe(cover(p))+'" alt="" width="360" height="230"><span class="plan-card-copy">'+(active?'<small class="plan-library-badge">Active</small>':p.origin==='imported'?'<small class="plan-library-badge">Imported</small>':'')+'<strong>'+safe(p.name)+'</strong><span>'+p.days+' days</span><span>'+n.workouts+' workouts · '+n.meals+' meals</span></span><span class="plan-card-arrow" aria-hidden="true">›</span></button>'+cameraButton(p.id)+'</article>'}).join('')+'</div>'+(plans.length?'<p class="note">Tap a plan to preview it.</p>':'<div class="plan-library-empty"><h3>Your plans live here</h3><p>Create a plan, save your current schedule, or import a plan you received.</p></div>'),trigger);d.classList.add('plan-library-dialog');window.EzpzAppearance?.refresh()}
 function planEditorSettings(trigger,saved){
  const d=dialog(saved?'Edit plan':'Create a plan','<form><label for="library-draft-name">Plan name</label><input id="library-draft-name" name="name" maxlength="80" required value="'+safe(saved?.name||'')+'" placeholder="e.g. Two-week strength"><label for="library-draft-days">Length in days</label><input id="library-draft-days" name="days" type="number" min="1" max="93" required value="'+(saved?.days||14)+'"><div class="plan-dialog-actions">'+action(saved?'open:'+saved.id:'library','Back')+'<button class="primary" type="submit">'+(saved?'Edit days':'Build plan')+'</button></div></form>',trigger);
  d.querySelector('form').onsubmit=e=>{
   e.preventDefault();
   const fields=new FormData(e.target),name=String(fields.get('name')).trim(),days=Number(fields.get('days'));
   if(!name||!Number.isInteger(days)||days<1||days>93){status(d,'Enter a name and a length from 1 to 93 days.');return}
   if(saved?.entries.slice(days).some(entry=>entry.workout||entry.extraWorkouts?.length||Object.keys(entry.meals).length)&&!confirm('Remove the meals and workouts after Day '+days+' from this draft?'))return;
   const pack=saved?validatePlanPackage(saved):{format:'ezpz-plan',entries:[],workouts:[],meals:[],media:{},backgrounds:{}};
   Object.assign(pack,{version:2,name,days,entries:Array.from({length:days},(_,i)=>pack.entries[i]||{meals:{}})});
   editPlanDays(pack,saved?.id,trigger);
  };
 }
 function editPlanDays(pack,id,trigger){
  let day=0,owner=state;
  const {addWorkout,addMeal}=planPackageCatalog(pack);
  const d=dialog(pack.name,'<div class="plan-draft-days"><button type="button" data-draft-shift="-1" aria-label="Previous day">‹</button><label>Plan day<select data-draft-day>'+pack.entries.map((_,i)=>'<option value="'+i+'">Day '+(i+1)+' of '+pack.days+'</option>').join('')+'</select></label><button type="button" data-draft-shift="1" aria-label="Next day">›</button></div><div data-draft-content></div><div class="plan-dialog-actions"><button type="button" data-plan-dialog-close>Discard</button><button type="button" class="primary" data-draft-save>Save to library</button></div>',trigger);
  d.classList.add('plan-draft-dialog');
  d._discard=()=>{if(!confirm('Discard changes to this plan?'))return;library(document.querySelector('[data-plan-manage=library]')||trigger)};
  const daySelect=d.querySelector('[data-draft-day]'),content=d.querySelector('[data-draft-content]');
  const savedWorkouts=cleanCustomWorkouts(state.customWorkouts).map(w=>[w.id,workoutTitle(w)]);
  const savedMeals=cleanCustomFoods(state.customFoods).map(f=>[f.id,f.name]);
  const portionControl=(value,slot='')=>'<div class="plan-portion" role="group" aria-label="Portions" data-portion-slot="'+safe(slot)+'"><button type="button" data-portion-step="-0.5" aria-label="Decrease portions" '+(value<=.5?'disabled':'')+'>−</button><output aria-live="polite">'+value+'</output><button type="button" data-portion-step="0.5" aria-label="Increase portions" '+(value>=3?'disabled':'')+'>+</button></div>';
  function changePortion(button){
   const control=button.closest('.plan-portion'),output=control.querySelector('output');
   const value=Math.min(3,Math.max(.5,Number(output.value)+Number(button.dataset.portionStep)));
   output.value=value;
   control.firstElementChild.disabled=value===.5;
   control.lastElementChild.disabled=value===3;
   return value;
  }
  const slotId=()=> 'extra-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);
  const remove=(kind,slot)=>'<button type="button" data-draft-remove="'+kind+':'+safe(slot)+'">Remove</button>';
  function showDay(){
   const entry=pack.entries[day],extras=entry.extraWorkouts||[];
   const title=wid=>wid==='rest'?'Recovery day':pack.workouts.find(w=>w.id===wid)?.title;
   const mealName=id=>{const meal=pack.meals.find(item=>item.id===id);return meal.kind==='recipe'?recipes[meal.index].name:meal.food.name};
   daySelect.value=day;
   d.querySelector('[data-draft-shift="-1"]').disabled=day===0;
   d.querySelector('[data-draft-shift="1"]').disabled=day===pack.days-1;
   const workouts=[...(entry.workout?[['main',entry.workout,'']]:[]),...extras.map(x=>[x.slot,x.workout,x.label])];
   content.innerHTML='<section class="plan-draft-section"><h3>Workouts</h3>'+workouts.map(([slot,wid,label])=>'<div class="plan-draft-item"><strong>'+safe((label?label+' · ':'')+title(wid))+'</strong>'+remove('workout',slot)+'</div>').join('')+
    (extras.length>=10?'':'<button type="button" data-draft-add="workout">+ Add workout</button>')+
    '</section><section class="plan-draft-section"><h3>Meals</h3>'+planMealSlots(entry.meals).filter(slot=>entry.meals[slot]).map(slot=>{const meal=entry.meals[slot];return '<div class="plan-draft-item"><div><strong>'+safe(planSlotLabel(slot,{[slot+'Label']:meal.label})+' · '+mealName(meal.id))+'</strong>'+portionControl(meal.portion,slot)+'</div>'+remove('meal',slot)+'</div>'}).join('')+
    (Object.keys(entry.meals).length>=23?'':'<button type="button" data-draft-add="meal">+ Add meal</button>')+'</section>';
  }
  function pick(kind,opener){
   const meal=kind==='meal',entry=pack.entries[day],mine=meal?savedMeals:savedWorkouts;
   const builtIn=meal?recipes.map((r,i)=>[i,r.name]):[['full-body',planWorkout('full-body').programName],...workoutTemplates.filter(w=>w.id!=='full-body').map(w=>[w.id,workoutTitle(w)])];
   const sources=[mine,builtIn];
   let source=mine.length?0:1,selected=null;
   const picker=document.createElement('dialog');
   picker.className='plan-draft-picker';
   picker.setAttribute('aria-labelledby','plan-draft-picker-title');
   picker.innerHTML='<div class="plan-dialog-heading"><h2 id="plan-draft-picker-title">Add '+kind+' · Day '+(day+1)+'</h2><button type="button" data-picker-close aria-label="Close picker">×</button></div><div data-picker-body></div><p class="plan-dialog-status" role="status"></p>';
   d.append(picker);
   const body=picker.querySelector('[data-picker-body]'),message=picker.querySelector('[role=status]');
   function browse(){
    selected=null;
    body.innerHTML='<div class="plan-picker-sources" role="group" aria-label="Source"><button type="button" data-picker-source="0">'+(meal?'My meals':'My workouts')+'</button><button type="button" data-picker-source="1">'+(meal?'EZPZ recipes':'EZPZ workouts')+'</button></div><label>Search '+(meal?'meals':'workouts')+'<input type="search" data-picker-search></label><div class="plan-picker-results" data-picker-results></div>'+(!meal&&!entry.workout&&!entry.extraWorkouts?.length?'<button type="button" data-picker-rest>Recovery day</button>':'');
    results();
   }
   function results(){
    const query=body.querySelector('[data-picker-search]').value.trim().toLowerCase();
    const items=sources[source].filter(([,name])=>name.toLowerCase().includes(query));
    body.querySelectorAll('[data-picker-source]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.pickerSource)===source)));
    body.querySelector('[data-picker-results]').innerHTML=items.map(([id,name])=>'<button type="button" data-picker-item="'+safe(id)+'">'+safe(name)+'</button>').join('')||'<p>'+(query?'No matches.':meal?'No saved meals yet.':'No saved workouts yet.')+'</p>';
   }
   function add(item,slot,portion){
    if(owner!==state){message.textContent='Your app data changed. Reopen the plan to continue.';return}
    try{
     if(meal){
      if(entry.meals[slot]&&!confirm('Replace the planned '+slot+' on Day '+(day+1)+'?'))return;
      entry.meals[slot==='extra'?slotId():slot]={id:addMeal(item),portion,...(slot==='extra'?{label:'Extra meal'}:{})};
     }else{
      const workout=addWorkout(item);
      if(!entry.workout||entry.workout==='rest')entry.workout=workout;
      else (entry.extraWorkouts??=[]).push({slot:slotId(),workout,label:'Extra workout'});
     }
     picker.close();showDay();content.querySelector('[data-draft-add="'+kind+'"]')?.focus({preventScroll:true});
    }catch(error){message.textContent=error.message}
   }
   picker.addEventListener('close',()=>{picker.remove();if(opener.isConnected)opener.focus({preventScroll:true})});
   picker.addEventListener('input',e=>{if(e.target.matches('[data-picker-search]'))results()});
   picker.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-picker-close'))picker.close();
    if(b.hasAttribute('data-picker-back')){browse();body.querySelector('[data-picker-search]').focus()}
    if(b.hasAttribute('data-picker-source')){source=Number(b.dataset.pickerSource);results()}
    if(b.hasAttribute('data-picker-rest'))add('rest');
    if(b.hasAttribute('data-portion-step'))changePortion(b);
    if(b.hasAttribute('data-picker-item')){
     selected=sources[source].find(([id])=>String(id)===b.dataset.pickerItem);
     if(!meal){add(selected[0]);return}
     const slots=['breakfast','lunch','dinner',...(Object.keys(entry.meals).filter(validExtraSlot).length<20?['extra']:[])];
     const initial=slots.find(slot=>!entry.meals[slot])||slots[0];
     body.innerHTML='<button type="button" data-picker-back>← Choose another meal</button><h3>'+safe(selected[1])+'</h3><fieldset><legend>Meal slot</legend><div class="plan-picker-slots">'+slots.map(slot=>'<label><input type="radio" name="draft-meal-slot" value="'+slot+'" '+(slot===initial?'checked':'')+'><span>'+(slot==='extra'?'Extra meal':planSlotLabel(slot))+'</span></label>').join('')+'</div></fieldset><p>Portions</p>'+portionControl(1)+'<button class="primary" type="button" data-picker-add>Add to Day '+(day+1)+'</button>';
     body.querySelector('input:checked').focus({preventScroll:true});
    }
    if(b.hasAttribute('data-picker-add'))add(selected[0],body.querySelector('input:checked').value,Number(body.querySelector('output').value));
   });
   browse();picker.showModal();body.querySelector('[data-picker-source="'+source+'"]').focus({preventScroll:true});
  }
  daySelect.onchange=()=>{day=Number(daySelect.value);status(d,'');showDay()};
  d.addEventListener('click',e=>{
   if(e.target.closest('.plan-draft-picker'))return;
   const add=e.target.closest('[data-draft-add]'),step=e.target.closest('[data-portion-step]');
   if(add){pick(add.dataset.draftAdd,add);return}
   if(step){pack.entries[day].meals[step.closest('.plan-portion').dataset.portionSlot].portion=changePortion(step);return}
   const shift=e.target.closest('[data-draft-shift]'),removed=e.target.closest('[data-draft-remove]');
   if(shift){day+=Number(shift.dataset.draftShift);status(d,'');showDay()}
   if(removed){
    const [kind,slot]=removed.dataset.draftRemove.split(':'),entry=pack.entries[day];
    if(kind==='meal')delete entry.meals[slot];
    else if(slot==='main'){
     delete entry.workout;
     if(entry.extraWorkouts?.length)entry.workout=entry.extraWorkouts.shift().workout;
    }else entry.extraWorkouts=entry.extraWorkouts.filter(workout=>workout.slot!==slot);
    showDay();
   }
   if(e.target.closest('[data-draft-save]')){
    if(owner!==state){status(d,'Your app data changed. Reopen the plan to continue.');return}
    try{saveLibraryPlanDraft(pack,id);library(document.querySelector('[data-plan-manage=library]')||trigger)}
    catch(error){owner=state;status(d,error.message)}
   }
  });
  showDay();window.EzpzAppearance?.refresh();
 }
 function planContents(p,kind){const names=new Map((kind==='workouts'?p.workouts:p.meals).map(x=>[x.id,kind==='workouts'?x.title:x.kind==='recipe'?recipes[x.index].name:x.food.name]));return p.entries.map((e,i)=>{const items=kind==='workouts'?[...(e.workout?[e.workout==='rest'?'Recovery day':names.get(e.workout)]:[]),...(e.extraWorkouts||[]).map(x=>names.get(x.workout))]:Object.values(e.meals).map(x=>(names.get(x.id)||'Meal')+' · '+x.portion+' '+(x.portion===1?'portion':'portions'));return items.length?'<li><strong>Day '+(i+1)+'</strong><span>'+items.map(safe).join('<br>')+'</span></li>':''}).join('')||'<li>No '+kind+' scheduled.</li>'}
 function importPreview(pack,trigger,savedId=''){const n=counts(pack),saved=savedId&&cleanSavedPlans(state.savedPlans).find(p=>p.id===savedId),d=dialog('Plan preview','<div class="plan-preview-cover"><img src="'+safe(cover(pack))+'" alt="Plan cover" width="720" height="400">'+(savedId?cameraButton(savedId):'')+'</div><h3 class="plan-preview-name">'+safe(pack.name)+'</h3><p class="plan-preview-counts">'+pack.days+' days · '+n.workouts+' workouts · '+n.meals+' meals</p><h4 class="plan-inside-heading">Inside this plan</h4><details class="plan-inside"><summary>'+homeIcon('workout')+'<span>Workouts<small>Sessions and recovery days</small></span></summary><ul>'+planContents(pack,'workouts')+'</ul></details><details class="plan-inside"><summary>'+homeIcon('food')+'<span>Meals<small>Daily meals and portions</small></span></summary><ul>'+planContents(pack,'meals')+'</ul></details><form><label for="plan-import-start">Start date</label><input id="plan-import-start" type="date" value="'+foodDate()+'" required><p class="plan-import-range"></p><p class="plan-import-conflicts"></p><label class="plan-replace-choice"><input type="checkbox" id="plan-import-replace"> Replace scheduled entries in these dates, including blank days</label><label class="plan-replace-choice"><input type="checkbox" id="plan-save-before"> Save a copy of my current plan before switching</label><div class="plan-dialog-actions"><button type="button" '+(savedId?'data-plan-manage="library"':'data-plan-save-received')+'>'+(savedId?'Back to library':'Save to library')+'</button><button type="submit" class="primary">Activate plan →</button></div></form>'+(savedId?'<div class="plan-preview-actions">'+action('edit:'+safe(savedId),'Edit plan')+action('rename:'+safe(savedId),'Rename')+action('export:'+safe(savedId),'Export')+action('delete:'+safe(savedId),'Delete')+'</div>':'')+'<p class="note">Your logged history stays.</p>',trigger);d.classList.add('plan-preview-dialog');const input=d.querySelector('#plan-import-start'),choice=d.querySelector('#plan-import-replace');function update(){if(!validPlanDate(input.value))return;const count=planImportConflicts(pack,input.value);d.querySelector('.plan-import-range').textContent=planDayLabel(input.value)+' – '+planDayLabel(datePlus(input.value,pack.days-1));d.querySelector('.plan-import-conflicts').textContent=count?count+' dates already have planned entries. Review and confirm replacement below.':'These dates have no planned entries.';choice.closest('label').hidden=!count;if(!count)choice.checked=false}input.onchange=update;update();d.querySelector('[data-plan-save-received]')?.addEventListener('click',()=>{try{storeReceivedPlan(pack);close();refreshed('Received plan saved to your library. Your schedule was not changed.');library(document.querySelector('[data-plan-manage=library]'))}catch(error){status(d,error.message)}});d.querySelector('form').onsubmit=e=>{e.preventDefault();try{const saveBefore=d.querySelector('#plan-save-before').checked;if(savedId)activateSavedPlan(savedId,input.value,choice.checked,saveBefore);else applyPlanPackage(pack,input.value,choice.checked,{saveBefore,saveIncoming:true});close();plannerFoodOnly=false;tab='planner';refreshed('Plan activated. Follow each day and log your own progress.');window.scrollTo(0,0)}catch(error){status(d,error.message)}};window.EzpzAppearance?.refresh()}
 function rename(id,trigger){const p=cleanSavedPlans(state.savedPlans).find(x=>x.id===id);if(!p)return;const d=dialog('Rename plan','<form><label for="plan-library-name">Plan name</label><input id="plan-library-name" maxlength="80" required value="'+safe(p.name)+'"><div class="plan-dialog-actions"><button type="button" data-plan-manage="open:'+safe(id)+'">Cancel</button><button type="submit" class="primary">Save name</button></div></form>',trigger);d.querySelector('form').onsubmit=e=>{e.preventDefault();try{renameLibraryPlan(id,d.querySelector('input').value);refreshed('Plan renamed.');const updated=cleanSavedPlans(state.savedPlans).find(x=>x.id===id);importPreview(planPackageWithPhotos(updated),document.querySelector('[data-plan-manage=library]'),id)}catch(error){status(d,error.message)}}}
 function editCover(id,trigger){const p=cleanSavedPlans(state.savedPlans).find(x=>x.id===id);if(!p)return;coverReturn=trigger.closest('.plan-preview-dialog')?id:'library';dialog('Plan cover',personalPhotoControls('saved-plan',id,p.coverPhotoId)+'<button type="button" data-plan-manage="'+(coverReturn==='library'?'library':'open:'+safe(id))+'">Back</button>',trigger)}
 function importFile(trigger){const native=window.Capacitor?.isNativePlatform?.(),d=dialog('Import a plan','<p>Choose an EZPZ plan file. You will preview it and choose a start date before anything changes.</p><label for="plan-import-file">Plan file</label>'+(native?'<button type="button" id="plan-import-file">Choose plan file</button>':'<input id="plan-import-file" type="file" accept="application/json,.json">')+'<p class="note">For a full personal backup, use Restore backup instead.</p>',trigger),token=sequence,owner=state;
 const read=async e=>{try{let text;if(native){const result=await nativeBackupBridge().importDocument({kind:'plan'});if(result?.cancelled){status(d,'Selection cancelled.');return}text=result?.text}else{const file=e.target.files?.[0];if(!file)return;if(file.size>2000000)throw Error('Choose an EZPZ plan file up to 2 MB.');text=await file.text()}
 if(token!==sequence||!d.isConnected||owner!==state)return;
 const data=JSON.parse(validateImportText(text,2000000));
 if(Array.isArray(data?.logs)&&Array.isArray(data?.weights))throw Error('This is a personal backup. Use Restore backup instead.');
 const pack=validatePlanPackage(data,true);importPreview(pack,trigger)}catch(error){status(d,error instanceof SyntaxError?'This file is not a readable EZPZ plan.':error.message)}};
 const chooser=d.querySelector('#plan-import-file');if(native)chooser.onclick=async e=>{if(busy)return;busy=true;chooser.disabled=true;try{await read(e)}finally{busy=false;if(chooser.isConnected)chooser.disabled=false}};else chooser.onchange=read;
 }
 document.addEventListener('click',e=>{if(e.target.closest('[data-plan-dialog-close]')){if(!busy){const d=document.getElementById('plan-manager-dialog');if(d?._discard)d._discard();else close()}return}const b=e.target.closest('[data-plan-manage]');if(!b)return;e.preventDefault();const [kind,id]=b.dataset.planManage.split(':');try{if(kind==='library')library(b);else if(kind==='create')planEditorSettings(b);else if(kind==='edit'){const saved=cleanSavedPlans(state.savedPlans).find(p=>p.id===id);if(saved)planEditorSettings(b,saved)}else if(kind==='cover')editCover(id,b);else if(kind==='rename')rename(id,b);else if(kind==='save'||kind==='new')naming(kind,b,!!b.closest('.plan-library-dialog'));else if(kind==='clear'||kind==='delete')confirmAction(kind,id,b);else if(kind==='export')exportPlan(id,b);else if(kind==='import')importFile(b);else if(kind==='open'){const p=cleanSavedPlans(state.savedPlans).find(p=>p.id===id);if(p)importPreview(planPackageWithPhotos(p),b,id)}}catch(error){const d=dialog('Plan could not be opened','',b);status(d,error.message)}});
 window.EZPZPlans={refresh:()=>{if(tab==='planner')planner()},setCover:(id,photo)=>{try{setLibraryPlanCover(id,photo);refreshed('Plan cover saved.');const trigger=document.querySelector('[data-plan-manage=library]');if(coverReturn==='library')library(trigger);else{const p=cleanSavedPlans(state.savedPlans).find(x=>x.id===id);importPreview(planPackageWithPhotos(p),trigger,id)}return true}catch(error){status(document.getElementById('plan-manager-dialog'),error.message);return false}}};
})();
