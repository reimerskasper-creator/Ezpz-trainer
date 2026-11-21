/* Device-only reminders for a specific scheduled workout and day slot. */
(()=>{
 const native=window.Capacitor?.Plugins?.EzpzWorkoutReminder;
 if(!native?.sync)return;
 const originalPlanner=planner,originalSave=save;
 let scheduled=null,queue=Promise.resolve();
 const key=(date,slot)=>date+'/'+slot;
 const reminders=()=>state.workoutReminders||{};
 const assigned=(date,slot)=>slot==='main'?state.workoutSchedule?.[date]:dayExtraWorkouts(date).find(x=>x.slot===slot)?.workoutId;
 const completed=(date,slot,id)=>(state.logs||[]).some(log=>log.workoutId===id&&
  (log.planDate||(log.date?new Date(log.date).toLocaleDateString('en-CA'):''))===date&&
  (log.planItemSlot||'main')===slot&&(isCompletionOnly(log)||log.exercises?.some(x=>x.sets?.some(set=>set.done&&validSetValue(set.reps)))));
 const timeLabel=time=>new Date('2000-01-01T'+time).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});
 function current(item){
  return item&&validPlanDate(item.date)&&item.date>=foodDate()&&(item.slot==='main'||validExtraSlot(item.slot))&&
   knownWorkout(item.id)&&assigned(item.date,item.slot)===item.id&&!completed(item.date,item.slot,item.id);
 }
 function payload(item){
  if(!current(item)||!['before','same'].includes(item.mode)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time))return null;
  const day=item.mode==='before'?datePlus(item.date,-1):item.date;
  return {date:item.date,slot:item.slot,id:item.id,mode:item.mode,when:day+'T'+item.time,title:workoutTitle(planWorkout(item.id)).slice(0,100)};
 }
 function sync(){
  const items=Object.values(reminders()).map(payload).filter(Boolean);
  const signature=JSON.stringify(items);
  if(signature===scheduled)return queue;
  scheduled=signature;
  const transfer=queue.catch(()=>{}).then(()=>native.sync({items}));
  queue=transfer.catch(error=>{if(scheduled===signature)scheduled=null;throw error});
  return queue;
 }
 save=function(){
  const previous=state.workoutReminders;
  if(previous)state.workoutReminders=Object.fromEntries(Object.entries(previous).filter(([,item])=>payload(item)));
  const ok=originalSave();
  if(!ok)state.workoutReminders=previous;
  else if(previous||scheduled!==null)sync().catch(()=>{});
  return ok;
 };
 function addControl(card,date,slot){
  const item={date,slot,id:assigned(date,slot)};
  if(!card||!current(item))return;
  const saved=reminders()[key(date,slot)],b=document.createElement('button');
  b.type='button';
  b.className='workout-reminder-trigger';
  b.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0"/></svg>';
  const label=saved&&payload(saved)?(saved.mode==='before'?'Day before · ':'')+timeLabel(saved.time):'Remind me';
  b.append(label);
  b.onclick=()=>edit(item,b);
  card.after(b);
 }
 planner=function(){
  originalPlanner();
  const date=planSettings().date, view=screen.querySelector('.planner-day-view');
  if(!view||plannerFoodOnly)return;
  addControl(view.querySelector('.plan-workout'),date,'main');
  for(const card of view.querySelectorAll('.extra-workout-card')){
   const slot=card.querySelector('[data-flex-start]')?.dataset.flexStart;
   if(slot)addControl(card,date,slot);
  }
 };
 function edit(item,opener){
  const id=key(item.date,item.slot),saved=reminders()[id],d=document.createElement('dialog');
  const canRemindBefore=item.date>foodDate();
  const mode=canRemindBefore?(saved?.mode||'before'):'same';
  d.className='workout-reminder-sheet';
  d.setAttribute('aria-labelledby','workout-reminder-title');
  d.innerHTML='<form><div class="workout-reminder-heading"><h2 id="workout-reminder-title">Remind me</h2><button type="button" data-close-reminder aria-label="Close">×</button></div>'+
   '<p>'+safe(workoutTitle(planWorkout(item.id)))+'</p><fieldset aria-label="Reminder day">'+
   (canRemindBefore?'<label><input type="radio" name="mode" value="before" '+(mode==='before'?'checked':'')+'> Evening before</label>':'')+
   '<label><input type="radio" name="mode" value="same" '+(mode==='same'||item.date===foodDate()?'checked':'')+'> On workout day</label></fieldset>'+
   '<label class="reminder-time">Time <input type="time" name="time" required value="'+safe(saved?.time||(mode==='before'?'20:00':'08:00'))+'"></label>'+
   '<p role="alert" class="reminder-error" hidden></p><button class="primary" type="submit">Save reminder</button>'+
   (saved?'<button type="button" data-remove-reminder>Remove reminder</button>':'')+'</form>';
  document.body.append(d);
  d.addEventListener('close',()=>{d.remove();if(opener.isConnected)opener.focus({preventScroll:true})},{once:true});
  const error=message=>{const el=d.querySelector('.reminder-error');el.textContent=message;el.hidden=false};
  d.querySelector('[data-close-reminder]').onclick=()=>d.close();
  const form=d.querySelector('form');
  form.onchange=e=>{
   if(e.target.name==='mode'&&(!saved||form.elements.time.value===saved.time))
    form.elements.time.value=e.target.value==='before'?'20:00':'08:00';
  };
  let busy=false;
  async function apply(next){
   if(busy)return;
   busy=true;
   try{
    if(next){
     const data=payload(next);
     if(!data||new Date(data.when).getTime()<=Date.now()){error('Choose a reminder time in the future.');return}
     if(!(await native.enable()).enabled){error('Allow EZPZ Fitness notifications in Android settings to use reminders.');return}
     if(!current(next)){error('This workout is no longer on your plan.');return}
    }
    const before=state.workoutReminders;
    state.workoutReminders={...reminders()};
    if(next)state.workoutReminders[id]=next;else delete state.workoutReminders[id];
    if(!save()){state.workoutReminders=before;return}
    try{await sync()}
    catch{
     state.workoutReminders=before;
     save();
     error('The reminder could not be updated. Try again.');
     return;
    }
    d.close();
    if(tab==='planner')planner();
   }catch{error('The reminder could not be updated. Try again.')}
   finally{busy=false}
  }
  form.onsubmit=e=>{e.preventDefault();apply({...item,mode:form.elements.mode.value,time:form.elements.time.value})};
  d.querySelector('[data-remove-reminder]')?.addEventListener('click',()=>apply(null));
  d.showModal();
 }
 function open(item){
  if(!state.profile||!current(item))return;
  if(!navigatePlannerDate(item.date))return;
  for(const dialog of document.querySelectorAll('dialog[open]'))dialog.close();
  plannerMode='day';
  plannerFoodOnly=false;
  previewReturnTo='planner';
  previewWorkoutId=item.id;
  previewWorkoutDate=item.date;
  previewWorkoutSlot=item.slot;
  tab='preview';
  render();
  window.scrollTo(0,0);
 }
 Promise.resolve(native.addListener('openWorkout',open)).then(()=>native.getPending()).then(open).catch(()=>{});
 sync().catch(()=>{});
 if(tab==='planner')planner();
})();
