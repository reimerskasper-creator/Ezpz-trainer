/* Zone activities are optional. Only an explicit check-in changes the Zone ring. */
(()=>{
'use strict';
zoneAffirmationIndex=1;
const prompts=['What is one small thing you appreciated today?','What can you leave until tomorrow?','What would make tomorrow a little lighter?','What do you want to make room for?','What went well, however small?','What can you be gentle with today?'];
const icons={book:'<path d="M24 12c-5-5-12-6-19-4v29c8-2 14-1 19 3 5-4 11-5 19-3V8c-7-2-14-1-19 4ZM24 12v28M10 4v27c5-1 9 0 14 4 5-4 9-5 14-4V4"/>',history:'<circle cx="24" cy="24" r="17"/><path d="m16 24 6 6 12-14"/>',leaf:'<path d="M24 42V22M24 32C10 32 7 21 8 17c11-1 17 5 16 15ZM24 26C23 14 33 8 41 8c1 12-6 22-17 22ZM24 22c-8-4-10-12-6-18 7 4 10 11 6 18Z"/>',breathe:'<circle cx="24" cy="24" r="17"/>',clear:'<path d="M4 19q10-12 20 0t20 0M4 30q10-12 20 0t20 0"/>',reflect:'<path d="M30 8H8v34h27V28M14 18h12M14 26h8M27 32l4-10L41 12l5 5-10 10Z"/>'};
const icon=key=>'<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+icons[key]+'</svg>';
const oldZone=zonePage;
zonePage=function(){
 oldZone();const root=screen.querySelector('.zone-dashboard');if(!root)return;root.classList.add('zone-space');
 const heading=root.querySelector('.rest-photo-heading');heading.querySelector('p').textContent='A little space for yourself.';if(heading.style.backgroundImage)heading.style.setProperty('background-image','linear-gradient(0deg,#082d22ed 0%,#082d224d 35%,#082d2200 68%),'+heading.style.backgroundImage.slice(heading.style.backgroundImage.indexOf('url(')),'important');
 const date=foodDate(),done=cleanZoneLog(state.zoneLog)[date]===true,card=root.querySelector('.rest-today-card');
 card.className='zone-checkin-strip'+(done?' is-checked':'');
 card.innerHTML='<button type="button" class="zone-check-button" data-zone-today="check" data-zone-today-date="'+date+'" aria-pressed="'+done+'"><span class="zone-check-target" aria-hidden="true">'+(done?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5L20 6"/></svg>':'')+'</span><span class="zone-check-copy"><strong>'+(done?'You made time today':'I made time today')+'</strong><small>'+(done?'A moment for yourself, recorded.':'Tap to check in')+'</small></span></button>'+(done?'<button type="button" class="zone-check-undo" data-zone-today="undo" data-zone-today-date="'+date+'">Undo</button>':'')+'<p class="zone-page-status" role="status"></p>';
 const space=cleanZoneSpace(state.zoneSpace);
 const activities=document.createElement('section');activities.className='zone-activities';activities.setAttribute('aria-labelledby','zone-need');
 activities.innerHTML='<h3 id="zone-need">What do you need right now?</h3><div class="zone-activity-choices">'+[['breathe','Breathe'],['clear','Clear my head'],['reflect','Reflect']].map(([key,label])=>'<button type="button" data-zone-activity="'+key+'">'+icon(key)+'<span>'+label+'</span></button>').join('')+'</div>';
 root.querySelector('.zone-summary-hero').after(card);card.after(activities);
 const flower=root.querySelector('.affirmation-orbit').outerHTML,thought=root.querySelector('.zone-affirmation-card');thought.classList.add('zone-daily-thought');thought.innerHTML='<span class="zone-eyebrow">TODAY’S THOUGHT</span>'+flower+'<p id="zone-affirmation" class="affirmation-copy" aria-live="polite">'+safe(zoneAffirmations[zoneAffirmationIndex])+'</p><p class="zone-reflection-prompt">'+prompts[zoneAffirmationIndex%prompts.length]+'</p><button class="primary" data-zone-activity="reflect">'+icon('reflect')+' Write a thought</button><button class="affirmation-next" data-next-affirmation>Another thought ↻</button>';
 activities.after(thought);
 const week=root.querySelector('.zone-moments');week.querySelector('h3').textContent='Your week of moments';week.querySelector('small').textContent=zonePageData().count+' moments · Last 7 days';
 const stats=root.querySelector('.rest-dashboard-stats');const detail=document.createElement('details');detail.className='zone-week-details';detail.innerHTML='<summary>Weekly details</summary>';detail.append(stats);week.append(detail);
 const past=document.createElement('details');past.className='rest-collapse zone-reflections';past.innerHTML='<summary>'+icon('book')+'<span class="zone-summary-label">Past reflections</span><span class="zone-reflection-count">'+space.entries.length+'</span></summary><p class="note">Saved with your app data, including backups and account sync when enabled.</p>'+(space.entries.length?space.entries.slice().reverse().map(e=>'<article class="zone-reflection-entry"><small>'+safe(planDayLabel(e.date))+' · '+(e.kind==='clear'?'Clear my head':'Reflect')+'</small><p>'+safe(e.text)+'</p><div><button data-zone-edit="'+e.id+'">Edit</button><button data-zone-delete="'+e.id+'">Delete</button></div></article>').join(''):'<p>Your saved thoughts will appear here.</p>');
 week.after(past);
 const recent=[...root.querySelectorAll('details.rest-collapse')].find(el=>el.querySelector('summary')?.textContent==='Recent check-ins');
 if(recent){recent.classList.add('zone-recent-moments');recent.querySelector('summary').innerHTML=icon('history')+'<span>Recent check-ins</span>';const note=recent.querySelector('.note');if(note)note.textContent='Time for yourself, not a measure of calm.'}
 const ideas=[...root.querySelectorAll('details.rest-collapse')].find(el=>el.querySelector('summary')?.textContent==='Ideas for a pause');
 if(ideas){ideas.classList.add('zone-pause-ideas');ideas.querySelector('summary').innerHTML=icon('leaf')+'<span>Ideas for a pause</span>'}

 const scene=document.createElement('section');scene.className='zone-botanical-panel';scene.setAttribute('aria-label','Zone activities and today’s thought');activities.before(scene);scene.append(activities,thought);
};
let activity=null,tick=null,audio=null,sound=false,opener=null;
function stopTick(){if(tick)clearInterval(tick);tick=null;if(audio?.state==='running')audio.suspend().catch(()=>{})}
function pauseBreathing(){if(!activity||activity.kind!=='breathe'||!activity.running)return;activity.elapsed+=Math.max(0,performance.now()-activity.started);activity.running=false;stopTick();updateBreathing()}
function tone(){if(!sound||!audio||audio.state!=='running')return;const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=396;gain.gain.setValueAtTime(0,audio.currentTime);gain.gain.linearRampToValueAtTime(.035,audio.currentTime+.1);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.8);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.85)}
function elapsed(){return Math.min(activity.duration*60000,activity.elapsed+(activity.running?Math.max(0,performance.now()-activity.started):0))}
function updateBreathing(){
 const dialog=document.getElementById('zone-activity-dialog');if(!dialog||activity?.kind!=='breathe')return;
 const ms=elapsed(),complete=ms>=activity.duration*60000,phase=ms%10000<4000?'Breathe in':'Breathe out',cycle=Math.floor(ms/10000),phaseKey=cycle+'-'+phase;
 if(complete){activity.elapsed=activity.duration*60000;activity.running=false;stopTick()}
 if(activity.running&&activity.phase!==phaseKey){activity.phase=phaseKey;tone()}
 const circle=dialog.querySelector('.zone-breath-circle');circle.classList.toggle('is-in',activity.running&&phase==='Breathe in');circle.classList.toggle('is-out',activity.running&&phase==='Breathe out');
 const phaseEl=dialog.querySelector('[data-breath-phase]'),label=complete?'A moment for you':activity.running?phase:ms?'Paused':'Find your rhythm';if(phaseEl.textContent!==label)phaseEl.textContent=label;
 const remaining=Math.max(0,Math.ceil((activity.duration*60000-ms)/1000));dialog.querySelector('[data-breath-time]').textContent=Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0');
 const start=dialog.querySelector('[data-breath-start]');start.textContent=complete?'Start again':activity.running?'Pause':ms?'Resume':'Start breathing';
 dialog.querySelector('[data-breath-finish]').hidden=!complete;dialog.querySelector('.zone-breath-help').textContent=complete?'You made a little space. You can record this moment below.':'Breathe comfortably. Follow your own rhythm; stop whenever you need.';
 dialog.querySelectorAll('[data-breath-duration]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.breathDuration)===activity.duration)));
}
function closeActivity(force=false){const dialog=document.getElementById('zone-activity-dialog');if(!dialog)return;const text=dialog.querySelector('textarea');if(!force&&text&&text.value!==activity.original&&!confirm('Discard this unsaved thought?'))return;stopTick();if(audio){audio.close().catch(()=>{});audio=null}sound=false;dialog.close();dialog.remove();activity=null;opener?.focus({preventScroll:true})}
function openActivity(kind,id=''){
 if(!['breathe','clear','reflect'].includes(kind))return;const entry=cleanZoneSpace(state.zoneSpace).entries.find(e=>e.id===id);if(id&&!entry)return;
 opener=document.activeElement;const dialog=document.createElement('dialog');dialog.id='zone-activity-dialog';dialog.className='zone-activity-dialog';dialog.dataset.zoneKind=kind;dialog.setAttribute('aria-labelledby','zone-activity-title');
 activity={kind,id,date:entry?.date||foodDate(),original:entry?.text||'',duration:1,elapsed:0,running:false,started:0,phase:''};sound=false;
 const title=kind==='breathe'?'Take a quiet minute':kind==='clear'?'Clear your head':'A thought for yourself';
 dialog.innerHTML='<div class="zone-dialog-heading"><span>ZONE · A MOMENT FOR YOU</span><button type="button" data-zone-activity-close aria-label="Close activity">×</button></div><h2 id="zone-activity-title">'+title+'</h2>'+(kind==='reflect'?'<div class="zone-dialog-sprout" aria-hidden="true">'+icon('leaf')+'</div>':'')+(kind==='breathe'?'<div class="zone-breath-circle"><span data-breath-phase role="status" aria-live="polite">Find your rhythm</span></div><p class="zone-breath-clock" data-breath-time>1:00</p><div class="zone-duration-choices" aria-label="Duration">'+[1,3,5].map(n=>'<button type="button" data-breath-duration="'+n+'" aria-pressed="'+(n===1)+'">'+n+' min</button>').join('')+'</div><button type="button" class="zone-sound" data-breath-sound aria-pressed="false">Sound off</button><p class="zone-breath-help">Breathe comfortably. Follow your own rhythm; stop whenever you need.</p><button class="primary" data-breath-start>Start breathing</button><button class="primary" data-breath-finish hidden>I made time today →</button>':'<form id="zone-reflection-form"><label for="zone-thought-input">'+(kind==='clear'?'What’s on your mind?':prompts[zoneAffirmationIndex%prompts.length])+'</label><textarea id="zone-thought-input" name="thought" maxlength="2000" rows="7" placeholder="Write whatever’s on your mind…" required>'+safe(entry?.text||'')+'</textarea><p class="zone-writing-count">'+(entry?.text.length||0)+' / 2,000</p><p class="note zone-writing-notice">Saved with your app data. Write & discard saves nothing.</p><details class="zone-saving-details"><summary>How saving works</summary><p>Your saved reflections are included in backups and account sync when enabled. Writing and discarding saves nothing.</p></details><div class="zone-writing-actions"><button class="primary" type="submit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/></svg>Save privately</button><button type="button" data-zone-discard><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/></svg>Write & discard</button></div></form>')+'<p class="zone-activity-status" role="status"></p>';
 document.body.append(dialog);dialog.addEventListener('cancel',e=>{e.preventDefault();closeActivity()});dialog.showModal();dialog.querySelector('[data-zone-activity-close]').focus();
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseBreathing()});window.addEventListener('pagehide',pauseBreathing);
document.addEventListener('input',e=>{if(e.target.id==='zone-thought-input')document.querySelector('.zone-writing-count').textContent=e.target.value.length+' / 2,000'});
document.addEventListener('submit',e=>{if(e.target.id!=='zone-reflection-form')return;e.preventDefault();const text=e.target.elements.thought.value;if(!saveZoneReflection(activity.date,text,activity.kind,activity.id)){document.querySelector('.zone-activity-status').textContent='Could not save. Keep this window open and check storage. Up to 200 reflections can be saved.';return}closeActivity(true);zonePage();const message=document.querySelector('.zone-page-status');if(message)message.textContent='Your thought is saved. Record a moment whenever you’re ready.'});
document.addEventListener('click',e=>{
 const button=e.target.closest('button');if(!button)return;
 if(button.hasAttribute('data-zone-activity')){openActivity(button.dataset.zoneActivity);return}
 if(button.hasAttribute('data-zone-edit')){const entry=cleanZoneSpace(state.zoneSpace).entries.find(x=>x.id===button.dataset.zoneEdit);if(entry)openActivity(entry.kind,entry.id);return}
 if(button.hasAttribute('data-zone-delete')){if(confirm('Delete this reflection?')&&deleteZoneReflection(button.dataset.zoneDelete)){zonePage();document.querySelector('.zone-reflections').open=true}return}
 if(button.hasAttribute('data-zone-today')){
  const date=button.dataset.zoneTodayDate,undo=button.dataset.zoneToday==='undo';
  if(date!==foodDate()){zonePage();document.querySelector('.zone-page-status').textContent='A new day has started. Tap to check in for today.';return}
  if(!undo&&cleanZoneLog(state.zoneLog)[date]===true)return;
  if(!saveZone(date,!undo)){document.querySelector('.zone-page-status').textContent='Could not save. Your previous check-in was kept. Please try again.';return}
  const y=window.scrollY;zonePage();window.scrollTo(0,y);document.querySelector('.zone-check-button')?.focus({preventScroll:true});return
 }
 if(button.hasAttribute('data-next-affirmation')){const p=document.querySelector('.zone-reflection-prompt');if(p)p.textContent=prompts[zoneAffirmationIndex%prompts.length];return}
 if(button.hasAttribute('data-zone-activity-close')){closeActivity();return}
 if(button.hasAttribute('data-zone-discard')){closeActivity(true);return}
 if(button.hasAttribute('data-breath-duration')){pauseBreathing();activity.duration=Number(button.dataset.breathDuration);activity.elapsed=0;activity.phase='';updateBreathing();return}
 if(button.hasAttribute('data-breath-sound')){sound=!sound;if(sound){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){sound=false;document.querySelector('.zone-activity-status').textContent='Sound is unavailable on this device.'}else{try{audio=audio||new Audio();audio.resume().catch(()=>{});tone()}catch{sound=false}}}else if(audio)audio.suspend().catch(()=>{});button.setAttribute('aria-pressed',String(sound));button.textContent=sound?'Sound on':'Sound off';return}
 if(button.hasAttribute('data-breath-start')){if(activity.running){pauseBreathing();return}if(elapsed()>=activity.duration*60000)activity.elapsed=0;activity.started=performance.now();activity.running=true;activity.phase='';if(sound&&audio)audio.resume().catch(()=>{});updateBreathing();tick=setInterval(updateBreathing,200);return}
 if(button.hasAttribute('data-breath-finish')){if(activity?.kind!=='breathe'||elapsed()<activity.duration*60000)return;if(activity.date!==foodDate()){document.querySelector('.zone-activity-status').textContent='A new day has started. Close this activity to check in for today.';return}if(saveZone(foodDate(),true)){closeActivity(true);zonePage()}return}
});
})();
