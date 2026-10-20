// Real Chromium mobile checks. Run: npm install --no-save playwright@1.64.1 && node tests/mobile.cjs
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const expectUpgrade=true;
const root=path.resolve(__dirname,'..'),out=path.join(root,'test-results');fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'};
const server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(pathname==='/'?'/fitness.html':pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}fs.readFile(file,(e,b)=>{if(e){res.writeHead(404);res.end('Not found');return}res.setHeader('Content-Type',mime[path.extname(file)]||'text/plain');res.end(b)})});
const key='ezpz-fitness-pilot-1',errors=[],captures=[];
const today=new Date().toLocaleDateString('en-CA',{timeZone:'America/New_York'});
const fixture={profile:{goal:'maintain',level:'Beginner',equipment:'home',days:3,age:35,weight:80,height:180,sex:'male'},logs:Array.from({length:24},(_,i)=>({date:new Date(Date.now()-(24-i)*86400000).toISOString(),workoutId:'push-a',title:'Push Day A',type:'home',setting:'Gym',variant:'A',exercises:[{name:'Barbell Bench Press',unit:'reps',sets:[{reps:'8',kg:'18',done:true}]}]})),weights:[{date:new Date(Date.now()-86400000*7).toISOString(),kg:81},{date:new Date().toISOString(),kg:80}],shopping:['Tomatoes (raw) — 100 g'],checkedShopping:{'Tomatoes (raw)':true},foodLog:[{id:'existing-meal',date:today,name:'Chicken rice bowl',servings:1,macros:[622,55,62,17]}],mealPlan:{[today]:{lunch:1,lunchPortion:1.5,dinner:48,dinnerPortion:1}},mealPlanOffset:0,selectedWorkout:'push-a',workoutDrafts:{'glutes-foundation':{'sr0-0':'12','sd0-0':true},'pull-a':{'sr0-0':'9','sw0-0':'15','sd0-0':true}},draft:{variant:'A',equipment:'home','sr0-0':'8','sd0-0':true},workoutLayoutVersion:2};

async function choosePlannedWorkout(page,id){
 await page.locator('#planned-workout').click();await page.locator('#planner-picker').waitFor({state:'visible'});
 if(id==='rest'||id===''){await page.locator('[data-plan-picker-action="'+(id==='rest'?'rest':'clear')+'"]').click();return}
 await page.locator('#planner-picker-search').fill(id);await page.locator('[data-plan-pick-workout="'+id+'"]').click();
 await page.locator('#planner-picker').waitFor({state:'hidden'});
}
async function choosePlannedMeal(page,slot,index){
 await page.locator('[data-open-meal-picker="'+slot+'"]').click();await page.locator('#planner-picker').waitFor({state:'visible'});
 if(index===null){await page.locator('[data-plan-picker-action="clear"]').click();return}
 await page.locator('[data-plan-picker-filter="all"]').click();await page.locator('[data-plan-pick-meal="'+index+'"]').click();
 await page.locator('#planner-picker').waitFor({state:'hidden'});
}

(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;const browser=await chromium.launch();
try{
 for(const width of [320,390,430]){
  const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,timezoneId:'America/New_York'});
  await context.addInitScript(({key,fixture})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture))},{key,fixture});
  if(expectUpgrade)await context.route('**/exercise-catalog.json',async route=>{await new Promise(r=>setTimeout(r,700));await route.continue()});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  const checkLayout=async(label)=>{const ok=await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1);if(!ok){console.log('OVERFLOW_DIAGNOSTIC',label,JSON.stringify(await page.evaluate(()=>({innerWidth,clientWidth:document.documentElement.clientWidth,elements:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>document.documentElement.clientWidth+1}).slice(0,25).map(e=>({tag:e.tagName,class:e.className,rect:e.getBoundingClientRect().toJSON(),text:e.textContent.slice(0,100)}))}))));const jpg=await page.screenshot({type:'jpeg',quality:80});const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_VISUAL_DATA '+b.slice(i,i+4000))}assert(ok,'Horizontal overflow: '+width+' '+label)};
  const capture=async(name)=>{await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(out,name+'-'+width+'.jpg'),type:'jpeg',quality:80});if(width===390)captures.push({name,src:'data:image/jpeg;base64,'+fs.readFileSync(path.join(out,name+'-'+width+'.jpg')).toString('base64')})};
  await page.goto(base+'/fitness.html');await page.locator('[data-tab="home"]').waitFor();await checkLayout('Home');await capture('Home');
  await page.locator('[data-tab="eat"]').click();assert.equal(await page.locator('[data-recipe-card]').count(),97);assert.equal(await page.locator('[data-recipe-card] img').count(),97);
  for(const focus of ['protein','carbs','fat','balanced']){await page.locator('[data-meal-focus="'+focus+'"]').click();assert.equal(await page.locator('[data-recipe-card]:visible').count(),focus==='balanced'?49:16);await checkLayout('meal section '+focus);await capture('Meals-'+focus)}
  for(const [focus,index] of [['protein',76],['carbs',86],['fat',96]]){await page.locator('[data-meal-focus="'+focus+'"]').click();await page.locator('[data-open-meal="'+index+'"]').click();await checkLayout('added meal '+index);for(const portion of ['0.5','2']){await page.locator('[data-serving="'+index+'"]').selectOption(portion==='0.5'?'.5':portion);const expected=await page.evaluate(({index,portion})=>nutrition(recipes[index].ingredients,Number(portion)),{index,portion});assert.equal(Number(await page.locator('[data-kcal="'+index+'"]').textContent()),expected[0]);}await page.locator('[data-go="eat"]').click();}
  await page.locator('[data-meal-focus="protein"]').click();await page.locator('#recipe-search').fill('fajita');assert.equal(await page.locator('[data-recipe-card]:visible').count(),1);await page.locator('[data-meal-filter="dinner"]').click();assert.equal(await page.locator('[data-recipe-card]:visible').count(),1);
  await page.locator('[data-meal-focus="balanced"]').click();await page.locator('[data-meal-filter="all"]').click();await page.locator('#recipe-search').fill('');
  if(width===390){for(const src of await page.locator('[data-recipe-card] img').evaluateAll(xs=>xs.map(x=>x.getAttribute('src')))){const response=await context.request.get(new URL(src,base+'/fitness.html').href);assert.equal(response.status(),200,'Photo '+src);const bytes=await response.body();assert(bytes[0]===255&&bytes[1]===216,'JPEG asset '+src)}}
  await checkLayout('Food');await capture('Food');
  await page.locator('#recipe-search').fill('Chicken potato plate');await page.locator('[data-open-meal="6"]').click();await page.locator('[data-serving="6"]').selectOption('2');assert((await page.locator('[data-ingredients="6"]').innerText()).includes('320 g'));await page.locator('[data-log-food="6"]').click();
  assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).foodLog.length,key),2);
  await page.locator('[data-home-diary]').evaluate(x=>x.open=true);
  await checkLayout('Logged food');
  assert(await page.locator('.food-diary progress').evaluate(x=>Math.abs(x.getBoundingClientRect().width-x.parentElement.clientWidth)<2),'Food progress fills diary');
  for(const entry of await page.locator('.food-log-entry').all()){
   assert(await entry.evaluate(x=>{const name=x.querySelector('span'),detail=name.querySelector('small'),button=x.querySelector('button'),a=name.getBoundingClientRect(),b=button.getBoundingClientRect();return getComputedStyle(detail).display==='block'&&a.right<=b.left&&b.height>=44}),'Meal details separated and Remove button aligned');
  }
  await page.locator('[data-home-diary]').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,'Logged-food-'+width+'.jpg'),type:'jpeg',quality:85});

  await page.locator('[data-tab="train"]').click();
  await page.locator('[data-action="open-workouts"]').click();assert.equal(await page.locator('#workout-chooser img').count(),12);
  const coverSources=await page.locator('#workout-chooser img').evaluateAll(xs=>xs.map(x=>x.getAttribute('src')));
  assert.equal(new Set(coverSources).size,11);for(const src of coverSources){const response=await context.request.get(new URL(src,base+'/fitness.html').href);assert.equal(response.status(),200,'Workout photo '+src)}
  await page.locator('#workout-chooser').evaluate(async dialog=>{for(const img of dialog.querySelectorAll('img')){img.loading='eager';await img.decode()}dialog.scrollTop=0});
  await checkLayout('Workout chooser');assert(await page.locator('#workout-chooser').evaluate(x=>x.scrollWidth<=x.clientWidth+1&&x.getBoundingClientRect().left>=-1&&x.getBoundingClientRect().right<=document.documentElement.clientWidth+1),'Chooser fits phone viewport');
  if(width===390){const buffer=await page.screenshot({path:path.join(out,'Workout-chooser-390.jpg'),type:'jpeg',quality:85});captures.push({name:'Workout chooser',src:'data:image/jpeg;base64,'+buffer.toString('base64')})}
  await page.locator('[data-action="close-workouts"]').click();
  if(expectUpgrade){await page.locator('[data-set-reps="0-0"]').fill('7');await page.waitForFunction(()=>Array.isArray(exerciseCatalog));assert.equal(await page.locator('[data-set-reps="0-0"]').inputValue(),'7','Catalogue refresh discarded unblurred input');await page.locator('[data-set-reps="0-0"]').fill('')}

  const programIds=await page.evaluate(()=>['full-body',...workoutTemplates.map(w=>w.id)]);
  assert.equal(programIds.length,55);
  for(const id of programIds){
   const info=await page.evaluate(id=>{const p=workoutTemplates.find(w=>w.id===id);return {category:p?.category||'Full Body',photo:workoutCover(p?.coverCategory||p?.category||'Full Body').src}},id);
   await page.locator('[data-action="open-workouts"]').click();
   try{await page.locator('[data-workout-category="'+info.category+'"]').click({timeout:5000})}catch(error){
    console.log('CHOOSER_DIAGNOSTIC',JSON.stringify(await page.evaluate(()=>({scrollY,innerWidth,innerHeight,dialog:document.getElementById('workout-chooser').getBoundingClientRect().toJSON(),items:[...document.querySelectorAll('[data-workout-category]')].slice(0,3).map(e=>{const r=e.getBoundingClientRect();return {category:e.dataset.workoutCategory,rect:r.toJSON(),hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.outerHTML.slice(0,250)}})}))));
    const jpg=await page.screenshot({type:'jpeg',quality:80});const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_VISUAL_DATA '+b.slice(i,i+4000));throw error
   }
   assert.equal(await page.locator('[data-workout-pick]').count(),5);
   if(id==='full-body-balanced'&&width===390){
    await page.locator('#workout-chooser').evaluate(async d=>{for(const img of d.querySelectorAll('img')){img.loading='eager';await img.decode()}});
    const buffer=await page.screenshot({path:path.join(out,'Full-body-programs.jpg'),type:'jpeg',quality:85});captures.push({name:'Full Body programs',src:'data:image/jpeg;base64,'+buffer.toString('base64')});
    await page.locator('[data-action="workout-categories"]').click();assert.equal(await page.locator('[data-workout-category]').count(),11);await page.locator('[data-workout-category="Full Body"]').click();
   }
   if(id==='arms-balanced'&&width===390){
    await page.locator('.program-card').first().locator('summary').click();assert.equal(await page.locator('.program-card').first().locator('li').count(),6);
    await page.locator('.program-card').first().locator('img').evaluate(x=>x.decode());
    const buffer=await page.screenshot({path:path.join(out,'Arms-programs.jpg'),type:'jpeg',quality:85});captures.push({name:'Arms and preview',src:'data:image/jpeg;base64,'+buffer.toString('base64')});
   }

   try{await page.locator('[data-workout-pick="'+id+'"]').click({timeout:5000})}catch(error){
    console.log('PROGRAM_DIAGNOSTIC',id,JSON.stringify(await page.evaluate(id=>{const e=document.querySelector('[data-workout-pick="'+id+'"]'),r=e.getBoundingClientRect();return {innerWidth,innerHeight,scrollY,rect:r.toJSON(),hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.outerHTML.slice(0,300),dialog:document.getElementById('workout-chooser').getBoundingClientRect().toJSON()}},id)));
    const jpg=await page.screenshot({type:'jpeg',quality:80});const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_VISUAL_DATA '+b.slice(i,i+4000));throw error
   }
   await page.waitForFunction(id=>JSON.parse(localStorage.getItem('ezpz-fitness-pilot-1')).selectedWorkout===id,id);
   assert(await page.locator('[data-set-reps]').count()>=6,'Workout fields '+id);
   assert.equal(await page.locator('.workout-trigger-photo img').getAttribute('src'),info.photo,'Selected training photo '+id);
   await checkLayout(id);
  }
  // New programs preserve their own draft alongside existing A/B drafts.
  await page.locator('[data-set-reps="0-0"]').fill('11');await page.locator('[data-set-done="0-0"]').check();
  await page.reload();await page.locator('[data-tab="train"]').click();assert.equal(await page.locator('[data-set-reps="0-0"]').inputValue(),'11');
  await page.locator('[data-tab="home"]').click();assert.equal(await page.locator('.home-workout>img').getAttribute('src'),'./workout-images/glutes.png');await page.locator('.home-workout>img').evaluate(x=>x.decode());await capture('Selected workout');await page.locator('[data-tab="train"]').click();
  await page.locator('[data-action="open-workouts"]').click();await page.locator('[data-workout-category="Push"]').click();await page.locator('[data-workout-pick="push-a"]').click();
  await page.locator('[data-set-reps="0-0"]').fill('10');await page.locator('[data-set-weight="0-0"]').fill('20');await page.locator('[data-set-done="0-0"]').check();await capture('Train');await page.reload();await page.locator('[data-tab="train"]').click();assert.equal(await page.locator('[data-set-reps="0-0"]').inputValue(),'10');assert(await page.locator('[data-set-done="0-0"]').isChecked());
  if(expectUpgrade){await page.waitForFunction(()=>{const b=document.querySelector('[data-set-done="0-0"]')?.getBoundingClientRect();return b&&b.width>=44&&b.height>=44});assert((await page.locator('.set-previous').first().innerText()).includes('18 kg'),'Previous set comparison');const finish=await page.locator('.session-footer').boundingBox(),nav=await page.locator('.nav').boundingBox();assert(finish.y+finish.height<=nav.y+1,'Finish bar overlaps navigation')}
  await page.locator('[data-action="finish"]').click();await page.waitForFunction(()=>document.body.dataset.view==='progress');assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).logs.length,key),25);await checkLayout('Progress');await capture('Progress');
  if(expectUpgrade){assert.equal(await page.locator('.history-session').count(),12);await page.locator('[data-action="more-history"]').click();assert.equal(await page.locator('.history-session').count(),24);await page.locator('[data-action="more-history"]').click();assert.equal(await page.locator('.history-session').count(),25)}
  const moreTab=expectUpgrade?'more':'shopping';await page.locator('[data-tab="'+moreTab+'"]').click();await checkLayout('More');await capture('More');
  await page.locator('[data-go="library"]').click();await page.locator('.library-tile').first().waitFor();assert.equal(await page.locator('.library-tile').count(),100);if(expectUpgrade){const tile=page.locator('.library-tile').first(),icon=await tile.locator('.workout-category-icon').boundingBox(),title=await tile.locator('strong').boundingBox();assert(title.x>=icon.x+icon.width+8,'Exercise library must use horizontal rows');assert((await tile.boundingBox()).height<=110,'Library row too tall')}await checkLayout('Library');await capture('Library');
  await page.locator('#library-search').fill('bench');assert(await page.locator('.library-tile').count()>0);await page.locator('.library-tile').first().click();await checkLayout('Exercise guide');assert((await page.locator('#screen').innerText()).includes('Lie'));
  if(expectUpgrade){await page.locator('[data-tab="more"]').click();await page.locator('.data-tools summary').click();await page.locator('#restore-file').setInputFiles({name:'ezpz-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});await page.locator('[data-action="restore"]').click();await page.waitForFunction(()=>document.body.dataset.view==='home');const restored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);assert.deepEqual(restored.foodLog,fixture.foodLog);assert.deepEqual(restored.mealPlan,fixture.mealPlan);assert.deepEqual(restored.checkedShopping,fixture.checkedShopping);assert.deepEqual(restored.draft,fixture.draft);assert.deepEqual(restored.workoutDrafts,fixture.workoutDrafts);assert.equal(restored.logs.length,24)}

  // Plan single days through four weeks using the real UI.
  await page.locator('[data-tab="more"]').click();await page.locator('[data-go="planner"]').click();
  for(const span of [1,7,14,21,28]){
   await page.locator('#planner-span').selectOption(String(span));
   assert.equal(await page.locator('[data-planner-offset]').count(),Math.min(7,span));
   assert.equal(await page.locator('[data-plan-week]').count(),span>7?span/7:0);
   await checkLayout('Planner '+span);
  }
  await page.locator('#planner-start').fill(today);await page.locator('#planner-start').dispatchEvent('change');
  await choosePlannedWorkout(page,'full-body-home');
  assert((await page.locator('.planned-workout-preview').innerText()).includes('Beginner'));
  await choosePlannedMeal(page,'breakfast',0);
  await page.locator('[data-schedule-portion="breakfast"]').selectOption('1.5');
  await choosePlannedMeal(page,'lunch',48);
  await page.locator('[data-schedule-portion="lunch"]').selectOption('2');
  const originalLogCount=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).foodLog.length,key);
  await page.locator('[data-planner-offset="1"]').click();await choosePlannedWorkout(page,'rest');
  await page.locator('[data-plan-week="3"]').click();assert.equal(await page.locator('[data-planner-offset="21"]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-action="repeat-plan-week"]').click();
  assert(await page.evaluate(({key,today})=>{const s=JSON.parse(localStorage.getItem(key));return [7,14,21].every(i=>s.workoutSchedule[datePlus(today,i)]==='full-body-home'&&s.workoutSchedule[datePlus(today,i+1)]==='rest'&&s.mealPlan[datePlus(today,i)].breakfastPortion===1.5)},{key,today}));
  assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).foodLog.length,key),originalLogCount,'Planning must not log food');
  await checkLayout('Four-week plan');await capture('Four-week-plan');
  await page.locator('[data-plan-week="0"]').click();
  await page.locator('[data-action="planner-shop-range"]').click();
  assert(await page.locator('.shopping-item').count()>1);await checkLayout('Plan shopping');
  // Build a reusable custom session, preserve fields while adding exercises, and schedule it.
  await page.locator('[data-tab="more"]').click();await page.locator('[data-go="planner"]').click();
  await page.locator('[data-action="new-workout"]').click();
  await page.locator('#builder-title').fill("Kasper's strength & balance");
  await page.locator('.own-workout-settings>summary').click();
  await page.locator('#builder-equipment').fill('Dumbbells and mat');
  await page.locator('#builder-name-0').fill('Goblet Squat');
  await page.locator('[data-action="add-builder-exercise"]').click();
  assert.equal(await page.locator('#builder-title').inputValue(),"Kasper's strength & balance");
  assert.equal(await page.locator('#builder-name-0').inputValue(),'Goblet Squat');
  await page.locator('#builder-name-1').fill('Farmer March');
  await page.locator('.own-exercise-options').nth(1).locator('summary').click();
  await page.locator('#builder-unit-1').selectOption('sec');
  await checkLayout('Workout builder');await capture('Workout-builder');
  await page.locator('#workout-builder button.primary').click();
  const custom=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).customWorkouts.at(-1),key);
  assert(custom.id.startsWith('custom-'));assert.equal(custom.exercises.length,2);
  assert.equal(await page.locator('#planned-workout').getAttribute('data-selected-workout'),custom.id);
  await page.locator('[data-tab="home"]').click();
  assert((await page.locator('.home-next').innerText()).includes("Kasper's strength & balance"));
  assert.equal(await page.locator('.home-shortcuts').count(),0);
  await page.locator('[data-preview-workout="'+custom.id+'"]').click();
  assert.equal(await page.locator('.preview-exercises li').count(),2);
  await page.locator('[data-start-workout="'+custom.id+'"]').click();
  await page.locator('[data-set-reps="0-0"]').fill('8');await page.locator('[data-set-done="0-0"]').check();
  await page.reload();await page.locator('[data-tab="train"]').click();
  assert.equal(await page.locator('[data-set-reps="0-0"]').inputValue(),'8');
  await page.locator('[data-action="finish"]').click();
  const customBackup=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  assert.equal(customBackup.logs.at(-1).workoutId,custom.id);
  // A scheduled start records the date; ordinary preview starts retain normal log semantics.
  await page.locator('[data-tab="more"]').click();await page.locator('.data-tools summary').click();
  await page.locator('#restore-file').setInputFiles({name:'planning-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(customBackup))});
  await page.locator('[data-action="restore"]').click();await page.waitForFunction(()=>document.body.dataset.view==='home');
  const planningRestored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  for(const field of ['mealPlan','workoutSchedule','plannerStart','plannerDays','customWorkouts','selectedWorkout'])assert.deepEqual(planningRestored[field],customBackup[field],'Planning restore '+field);


  // Upcoming workouts: sorted, matching covers, and an honest seven-day view.
  await page.evaluate(({key,today})=>{
   const s=JSON.parse(localStorage.getItem(key)),d=n=>datePlus(today,n);
   Object.assign(s,{selectedWorkout:'push-a',trainingView:'focus',autoRest:false,restTimer:null,workoutSchedule:{[d(6)]:'core-a',[d(4)]:'leg-a',[d(2)]:'pull-a',[today]:'push-a',[d(1)]:'rest'},logs:[{date:new Date(Date.now()-86400000).toISOString(),workoutId:'push-a',type:'home',title:'Push Day A',exercises:[{name:'Barbell Bench Press',unit:'reps',sets:[{reps:'8',kg:'20',done:true},{reps:'8',kg:'20',done:true},{reps:'8',kg:'20',done:true}]}]}]});
   s.workoutDrafts={...s.workoutDrafts,'push-a':{}};localStorage.setItem(key,JSON.stringify(s));
  },{key,today});
  await page.reload();
  assert.equal(await page.locator('.home-next .upcoming-row').count(),3);
  assert.deepEqual(await page.locator('.home-next .upcoming-row').evaluateAll(xs=>xs.map(x=>x.dataset.previewWorkout)),['push-a','pull-a','leg-a']);
  assert.deepEqual(await page.locator('.home-next .upcoming-row img').evaluateAll(xs=>xs.map(x=>x.getAttribute('src'))),['./workout-images/push.jpg','./workout-images/pull.jpg','./workout-images/leg.jpg']);
  const homeBefore=await page.evaluate(key=>localStorage.getItem(key),key);
  await page.locator('[data-home-schedule="week"]').click();
  assert.equal(await page.locator('.upcoming-list>button').count(),7);
  assert((await page.locator('.upcoming-list').innerText()).includes('Rest / recovery'));
  await checkLayout('Seven-day schedule');
  await page.locator('[data-home-schedule="next"]').click();
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),homeBefore,'Home view changes must not write a plan');
  await page.locator('.home-next').scrollIntoViewIfNeeded();
  const upcomingJpg=await page.screenshot({path:path.join(out,'Upcoming-workouts-'+width+'.jpg'),type:'jpeg',quality:85});
  if(width===390)captures.push({name:'Upcoming workouts',src:'data:image/jpeg;base64,'+upcomingJpg.toString('base64')});
  // Focused training, reusable results and truthful progress.
  await page.locator('[data-tab="train"]').click();
  assert.equal(await page.locator('[data-training-card][open]').count(),1);
  assert.equal(await page.locator('[data-training-card="0"]').getAttribute('open'),'');
  await page.locator('[data-copy-previous="0"]').click();
  for(const i of [0,1,2]){assert.equal(await page.locator('[data-set-reps="0-'+i+'"]').inputValue(),'8');assert.equal(await page.locator('[data-set-weight="0-'+i+'"]').inputValue(),'20')}
  assert.equal(await page.locator('[data-set-done]:checked').count(),0,'Copying results must not complete sets');
  await page.locator('[data-set-weight="0-0"]').fill('27.25');
  for(const i of [1,2]){await page.locator('[data-set-reps="0-'+i+'"]').fill('');await page.locator('[data-set-weight="0-'+i+'"]').fill('')}
  await page.locator('[data-repeat-set="0"]').click();await page.locator('[data-repeat-set="0"]').click();
  assert.equal(await page.locator('[data-set-weight="0-1"]').inputValue(),'27.25');
  assert.equal(await page.locator('[data-set-reps="0-2"]').inputValue(),'8');
  await page.locator('[data-set-reps="0-0"]').fill('');await page.locator('[data-set-done="0-0"]').check();
  assert.equal(await page.locator('[data-set-reps="0-0"]').getAttribute('aria-invalid'),'true');
  assert((await page.locator('#workout-progress-label').innerText()).startsWith('0 of'));
  await page.locator('[data-set-reps="0-0"]').fill('8');
  assert((await page.locator('#workout-progress-label').innerText()).startsWith('1 of'));
  assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).restTimer,key),null,'Automatic timer is opt-in');
  await page.locator('.training-rest-options>summary').click();await page.locator('[data-auto-rest]').check();
  await page.locator('[data-set-done="0-1"]').check();
  assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).restTimer.duration,key),120);
  await page.locator('[data-action="pause-rest"]').click();assert(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).restTimer.paused,key));
  await page.locator('[data-action="pause-rest"]').click();assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).restTimer.paused,key),false);
  await page.locator('.rest-presets [data-rest-seconds="30"]').click();assert.equal(await page.locator('.training-rest-options').getAttribute('open'),null);
  await page.reload();await page.locator('[data-tab="train"]').click();
  assert.equal(await page.locator('[data-set-weight="0-1"]').inputValue(),'27.25');
  assert(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).restTimer.duration===30,key));
  assert.notEqual(await page.locator('#rest-clock').innerText(),'0:00');
  await page.locator('[data-exercise-jump="3"]').click();
  assert.equal(await page.locator('[data-training-card="3"]').getAttribute('open'),'');assert.equal(await page.locator('[data-training-card][open]').count(),1);
  await page.locator('[data-set-reps="3-0"]').fill('12');
  await page.locator('[data-training-view="all"]').click();assert.equal(await page.locator('[data-training-card][open]').count(),6);
  await page.locator('[data-training-view="focus"]').click();assert.equal(await page.locator('[data-training-card][open]').count(),1);
  assert.equal(await page.locator('[data-set-reps="3-0"]').inputValue(),'12');
  await page.locator('[data-action="continue-exercise"]').click();
  assert.equal(await page.locator('[data-training-card="0"]').getAttribute('open'),'');
  await page.locator('[data-set-done="0-2"]').check();assert.equal(await page.locator('#exercise-count-0').innerText(),'3/3');
  await page.locator('[data-next-exercise="1"]').click();assert.equal(await page.locator('[data-training-card="1"]').getAttribute('open'),'');
  await checkLayout('Focused training');await capture('Train overview');
  await page.locator('#training-exercise-1').scrollIntoViewIfNeeded();
  const focusedJpg=await page.screenshot({path:path.join(out,'Focused-training-'+width+'.jpg'),type:'jpeg',quality:85});
  if(width===390)captures.push({name:'Focused training',src:'data:image/jpeg;base64,'+focusedJpg.toString('base64')});
  // Dismissing the finish confirmation must preserve entered but unchecked results.
  page.removeAllListeners('dialog');page.once('dialog',d=>{assert(d.message().includes('not checked complete'));return d.dismiss()});
  await page.locator('[data-action="finish"]').click();assert.equal(await page.locator('body').getAttribute('data-view'),'train');
  assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).workoutDrafts['push-a']['sr3-0'],key),'12');
  page.on('dialog',d=>d.accept());await page.locator('[data-action="finish"]').click();
  await page.waitForFunction(()=>document.body.dataset.view==='progress');
  assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).logs.at(-1).exercises[0].sets.filter(s=>s.done).length,key),3);
  assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).restTimer,key),null);
  await page.locator('[data-tab="train"]').click();assert.equal(await page.locator('[data-training-card="0"]').getAttribute('open'),'','A new session starts at the first exercise');


  // Planner photo pickers replace the long native workout/recipe lists.
  await page.locator('[data-tab="more"]').click();await page.locator('[data-go="planner"]').click();
  await page.locator('#planner-start').fill(today);await page.locator('#planner-start').dispatchEvent('change');
  if(await page.locator('[data-plan-week="0"]').count())await page.locator('[data-plan-week="0"]').click();
  await page.locator('[data-planner-offset="3"]').click();
  const pickerBefore=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  assert.equal(await page.locator('select#planned-workout').count(),0);
  assert.equal(await page.locator('select[data-schedule-meal]').count(),0);
  await page.locator('#planned-workout').click();await page.locator('#planner-picker').waitFor({state:'visible'});
  assert.equal(await page.locator('.plan-picker-categories img').count(),12);
  assert.notEqual(await page.evaluate(()=>document.activeElement.id),'planner-picker-search','Opening should not summon the keyboard');
  await checkLayout('Workout photo picker');
  assert(await page.locator('#planner-picker').evaluate(x=>{const r=x.getBoundingClientRect();return r.left>=0&&r.right<=document.documentElement.clientWidth+1&&r.bottom<=innerHeight+1&&x.scrollWidth<=x.clientWidth+1}),'Picker fits screen');
  await page.locator('.plan-picker-categories img').evaluateAll(async imgs=>{for(const x of imgs){x.loading='eager';await x.decode()}});
  const categoryPickerJpg=await page.screenshot({path:path.join(out,'Planner-workout-categories-'+width+'.jpg'),type:'jpeg',quality:85});
  if(width===390)captures.push({name:'Planner workout categories',src:'data:image/jpeg;base64,'+categoryPickerJpg.toString('base64')});
  await page.keyboard.press('Escape');assert.equal(await page.locator('#planner-picker').getAttribute('open'),null);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'planned-workout');
  assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key),pickerBefore,'Cancel leaves saved plan unchanged');
  await page.locator('#planned-workout').click();
  await page.locator('[data-plan-picker-category="Full Body"]').click();
  assert.equal(await page.locator('[data-plan-pick-workout]').count(),6,'Five built-ins plus the saved custom session');
  await page.locator('[data-plan-picker-level="Beginner"]').click();
  assert.equal(await page.locator('[data-plan-pick-workout]').count(),3,'Beginner filter includes the saved custom session');
  await page.locator('.picker-exercises>summary').first().click();
  assert.equal(await page.locator('.picker-exercises').first().locator('li').count(),6);
  await checkLayout('Filtered workout choices');
  assert.equal(await page.locator('[data-plan-picker-level="Beginner"]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('[data-plan-picker-level="all"]').getAttribute('aria-pressed'),'false');
  await page.locator('.picker-choice img').evaluateAll(async imgs=>{for(const x of imgs){x.loading='eager';await x.decode()}});
  const sessionPickerJpg=await page.screenshot({path:path.join(out,'Planner-workout-choices-'+width+'.jpg'),type:'jpeg',quality:85});
  if(width===390)captures.push({name:'Planner workout choices',src:'data:image/jpeg;base64,'+sessionPickerJpg.toString('base64')});
  await page.locator('[data-plan-pick-workout="full-body-home"]').click();
  const pickerDate=await page.evaluate(()=>planSettings().date);
  const afterWorkoutPick=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  assert.equal(afterWorkoutPick.workoutSchedule[pickerDate],'full-body-home');
  assert.equal(afterWorkoutPick.selectedWorkout,pickerBefore.selectedWorkout);
  assert.deepEqual(afterWorkoutPick.workoutDrafts,pickerBefore.workoutDrafts);
  assert.equal(await page.locator('#planned-workout img').getAttribute('src'),'./meal-images/workout-hero.jpg');
  await page.locator('[data-open-meal-picker="breakfast"]').click();
  await page.locator('[data-plan-picker-filter="all"]').click();
  assert.equal(await page.locator('[data-plan-pick-meal]').count(),97);
  assert.equal(await page.locator('[data-plan-pick-meal] img').count(),97);
  await checkLayout('Recipe photo picker');
  assert.equal(await page.locator('[data-plan-picker-filter="all"]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('[data-plan-picker-filter="breakfast"]').getAttribute('aria-pressed'),'false');
  await page.locator('[data-plan-pick-meal] img').evaluateAll(async imgs=>{for(const x of imgs){x.loading='eager';await x.decode()}});
  const mealPickerJpg=await page.screenshot({path:path.join(out,'Planner-meal-picker-'+width+'.jpg'),type:'jpeg',quality:85});
  if(width===390)captures.push({name:'Planner meal picker',src:'data:image/jpeg;base64,'+mealPickerJpg.toString('base64')});
  await page.locator('#planner-picker-search').fill('zzzz-no-recipe');
  assert.equal(await page.locator('[data-plan-pick-meal]').count(),0);assert((await page.locator('.picker-empty').innerText()).includes('No recipes'));
  await page.locator('[data-plan-picker-action="reset"]').click();assert.equal(await page.locator('[data-plan-pick-meal]').count(),97);
  await page.locator('#planner-picker-search').fill('Greek yogurt berry bowl');
  assert.equal(await page.locator('[data-plan-pick-meal]').count(),1);
  await page.locator('[data-plan-pick-meal="0"]').click();
  await page.locator('[data-schedule-portion="breakfast"]').selectOption('1.5');
  await page.locator('[data-open-meal-picker="breakfast"]').click();
  assert((await page.locator('[data-plan-pick-meal="0"]').innerText()).includes('1.5 × serving'));
  await page.locator('[data-plan-pick-meal="0"]').click();
  assert.equal(await page.locator('[data-schedule-portion="breakfast"]').inputValue(),'1.5','Reselecting preserves portion');
  await choosePlannedMeal(page,'lunch',48);await page.locator('[data-schedule-portion="lunch"]').selectOption('2');
  await choosePlannedMeal(page,'breakfast',null);
  const afterMealPick=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  assert.equal(afterMealPick.mealPlan[pickerDate].breakfast,undefined);assert.equal(afterMealPick.mealPlan[pickerDate].lunch,48);assert.equal(afterMealPick.mealPlan[pickerDate].lunchPortion,2);
  assert.deepEqual(afterMealPick.foodLog,pickerBefore.foodLog,'Planning must not change eaten-food log');
  await choosePlannedWorkout(page,'rest');assert((await page.locator('#planned-workout').innerText()).includes('Rest / recovery'));
  await choosePlannedWorkout(page,'');assert.equal(await page.locator('#planned-workout').getAttribute('data-selected-workout'),'');
  assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).workoutSchedule,key),pickerBefore.workoutSchedule,'Clearing preserves all other dates');
  await page.locator('#planned-workout').click();await page.mouse.click(5,5);
  await page.locator('#planner-picker').waitFor({state:'hidden'});
  await page.locator('#planned-workout').click();await page.locator('[data-plan-picker-action="build"]').click();
  await page.locator('#workout-builder').waitFor();await page.locator('[data-action="cancel-builder"]').click();
  await checkLayout('Photo-based planner');


  // Freely named workouts use the same saved-session and training paths.
  await page.locator('[data-tab="train"]').click();
  await page.locator('[data-action="open-workouts"]').click();
  await page.locator('[data-action="create-my-workout"]').click();
  assert.equal(await page.locator('body').getAttribute('data-view'),'builder');
  assert.equal(await page.locator('.own-workout-settings').getAttribute('open'),null);
  assert.equal(await page.locator('#builder-name-0').getAttribute('list'),null);
  await page.locator('#builder-title').fill('My beach strength');
  await page.locator('#builder-name-0').fill('My sandbag march');
  await page.locator('[data-action="add-builder-exercise"]').click();
  await page.locator('#builder-name-1').fill('My towel row');
  await page.locator('.own-workout-settings>summary').click();
  await page.locator('#builder-category').selectOption('Arms');
  await page.locator('.own-workout-settings>summary').click();
  await checkLayout('Own workout builder');await capture('Create your own');
  const beforeOwn=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  await page.locator('[data-destination="saved"]').click();
  const afterOwn=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  assert.deepEqual(afterOwn.workoutSchedule,beforeOwn.workoutSchedule);
  assert.equal(afterOwn.selectedWorkout,beforeOwn.selectedWorkout);
  const own=afterOwn.customWorkouts.find(w=>w.title==='My beach strength');
  assert(own);assert.equal(own.exercises[0].name,'My sandbag march');
  assert((await page.locator('.own-saved-list').innerText()).includes('My beach strength'));
  await checkLayout('Saved own workouts');await capture('Your saved workouts');
  await page.locator('[data-own-start="'+own.id+'"]').click();
  assert.equal(await page.locator('body').getAttribute('data-view'),'train');
  assert((await page.locator('#screen').innerText()).includes('My sandbag march'));
  await page.locator('[data-set-reps="0-0"]').fill('10');
  await page.locator('[data-set-weight="0-0"]').fill('12');
  await page.locator('[data-set-done="0-0"]').check();
  await page.reload();await page.locator('[data-tab="train"]').click();
  assert.equal(await page.locator('[data-set-reps="0-0"]').inputValue(),'10');
  assert.equal(await page.locator('[data-set-weight="0-0"]').inputValue(),'12');
  await capture('Train your own');
  await page.locator('[data-action="finish"]').click();
  await page.locator('[data-tab="train"]').click();
  await page.locator('[data-action="open-workouts"]').click();
  await page.locator('[data-action="create-my-workout"]').click();
  await page.locator('#builder-title').fill('My quick session');
  await page.locator('#builder-name-0').fill('My own movement');
  await page.locator('[data-destination="train"]').click();
  assert.equal(await page.locator('body').getAttribute('data-view'),'train');
  assert((await page.locator('#screen').innerText()).includes('My own movement'));
  await checkLayout('Own workout training');

  await context.close();
 }
 const clean=await browser.newContext({viewport:{width:390,height:844}}),onboarding=await clean.newPage();onboarding.on('pageerror',e=>errors.push(e.message));await onboarding.goto(base+'/fitness.html');await onboarding.locator('[name="age"]').fill('35');await onboarding.locator('[name="weight"]').fill('80');await onboarding.locator('[name="height"]').fill('180');await onboarding.locator('#setup button').click();await onboarding.waitForFunction(()=>document.body.dataset.view==='home');await clean.close();
 if(captures.length){const sheet=await browser.newPage({viewport:{width:2528,height:570},deviceScaleFactor:1});await sheet.setContent('<html><body style="margin:0;display:flex;gap:8px;padding:8px;background:#edf0ee;font:14px sans-serif">'+captures.map(x=>'<figure style="margin:0;width:244px"><figcaption style="height:24px;text-align:center">'+x.name+'</figcaption><img style="width:244px" src="'+x.src+'"></figure>').join('')+'</body></html>');const jpg=await sheet.screenshot({type:'jpeg',quality:85,path:path.join(out,'mobile-overview.jpg')});if(process.env.EZPZ_VISUAL_LOG==='1'){console.log('EZPZ_VISUAL_BEGIN');const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_VISUAL_DATA '+b.slice(i,i+4000));console.log('EZPZ_VISUAL_END')}}

 const planningCaptures=captures.filter(x=>['Four-week-plan','Workout-builder'].includes(x.name));
 if(planningCaptures.length){const sheet=await browser.newPage({viewport:{width:800,height:900},deviceScaleFactor:1});await sheet.setContent('<html><body style="margin:0;display:flex;gap:10px;padding:10px;background:#edf0ee;font:14px sans-serif">'+planningCaptures.map(x=>'<figure style="margin:0;width:380px"><figcaption style="height:25px;text-align:center">'+x.name+'</figcaption><img style="width:380px" src="'+x.src+'"></figure>').join('')+'</body></html>');const jpg=await sheet.screenshot({type:'jpeg',quality:85,path:path.join(out,'planning-overview.jpg')});if(process.env.EZPZ_VISUAL_LOG==='1'){console.log('EZPZ_PLAN_BEGIN');const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_PLAN_DATA '+b.slice(i,i+4000));console.log('EZPZ_PLAN_END')}}

 const trainingCaptures=captures.filter(x=>['Upcoming workouts','Train overview','Focused training'].includes(x.name));
 if(trainingCaptures.length){const sheet=await browser.newPage({viewport:{width:1200,height:920},deviceScaleFactor:1});await sheet.setContent('<html><body style="margin:0;display:flex;gap:10px;padding:10px;background:#edf0ee;font:14px sans-serif">'+trainingCaptures.map(x=>'<figure style="margin:0;width:380px"><figcaption style="height:25px;text-align:center">'+x.name+'</figcaption><img style="width:380px" src="'+x.src+'"></figure>').join('')+'</body></html>');const jpg=await sheet.screenshot({type:'jpeg',quality:85,path:path.join(out,'training-overview.jpg')});if(process.env.EZPZ_VISUAL_LOG==='1'){console.log('EZPZ_TRAIN_BEGIN');const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_TRAIN_DATA '+b.slice(i,i+4000));console.log('EZPZ_TRAIN_END')}}


 const pickerCaptures=captures.filter(x=>['Planner workout categories','Planner workout choices','Planner meal picker'].includes(x.name));
 if(pickerCaptures.length){const sheet=await browser.newPage({viewport:{width:1200,height:920},deviceScaleFactor:1});await sheet.setContent('<html><body style="margin:0;display:flex;gap:10px;padding:10px;background:#edf0ee;font:14px sans-serif">'+pickerCaptures.map(x=>'<figure style="margin:0;width:380px"><figcaption style="height:25px;text-align:center">'+x.name+'</figcaption><img style="width:380px" src="'+x.src+'"></figure>').join('')+'</body></html>');const jpg=await sheet.screenshot({type:'jpeg',quality:85,path:path.join(out,'planner-picker-overview.jpg')});if(process.env.EZPZ_VISUAL_LOG==='1'){console.log('EZPZ_PICKER_BEGIN');const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_PICKER_DATA '+b.slice(i,i+4000));console.log('EZPZ_PICKER_END')}}


 const ownCaptures=captures.filter(x=>['Create your own','Your saved workouts','Train your own'].includes(x.name));
 if(ownCaptures.length){const sheet=await browser.newPage({viewport:{width:1200,height:920},deviceScaleFactor:1});await sheet.setContent('<html><body style="margin:0;display:flex;gap:10px;padding:10px;background:#edf0ee;font:14px sans-serif>'+ownCaptures.map(x=>'<figure style="margin:0;width:380px"><figcaption style="height:25px;text-align:center">'+x.name+'</figcaption><img style="width:380px" src="'+x.src+'"></figure>').join('')+'</body></html>');const jpg=await sheet.screenshot({type:'jpeg',quality:85,path:path.join(out,'own-workouts-overview.jpg')});if(process.env.EZPZ_VISUAL_LOG==='1'){const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_OWN_DATA '+b.slice(i,i+4000));}}


 const mealCaptures=captures.filter(x=>x.name.startsWith('Meals-'));
 if(mealCaptures.length){const sheet=await browser.newPage({viewport:{width:1200,height:720},deviceScaleFactor:1});await sheet.setContent('<html><body style="margin:0;display:flex;gap:8px;padding:8px;background:#edf0ee;font:12px sans-serif">'+mealCaptures.map(x=>'<figure style="margin:0;width:288px"><figcaption style="height:22px;text-align:center">'+x.name+'</figcaption><img style="width:288px" src="'+x.src+'"></figure>').join('')+'</body></html>');const jpg=await sheet.screenshot({type:'jpeg',quality:75,path:path.join(out,'meal-sections-overview.jpg')});const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_MEALS_DATA '+b.slice(i,i+4000))}
 assert.deepEqual(errors,[],'Browser errors');fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify({passed:true,widths:[320,390,430],recipes:97,workoutPrograms:55,upgradedUI:expectUpgrade,browserErrors:errors},null,2));console.log('PASS: Chromium at 320/390/430px; 97 recipe photos; 55 workout programs; draft persistence; set logging; history; navigation; exercise search; onboarding'+(expectUpgrade?'; complete backup restoration':''));
}finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
