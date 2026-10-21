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
  const methodBefore=await page.evaluate(key=>localStorage.getItem(key),key);
  await page.locator('[data-ezpz-method="open"]').click();
  assert(await page.locator('#ezpz-method').evaluate(d=>d.open),'Method opens as a modal');
  assert.deepEqual(await page.locator('.method-pillar h3').allTextContents(),['Eat','Sleep','Progression','Zone']);
  assert(await page.locator('#ezpz-method').evaluate(d=>d.scrollWidth<=d.clientWidth+1),'Method fits phone width');
  assert((await page.locator('.method-explainer').first().innerText()).includes('Each pillar supports the others'));
  assert((await page.locator('.method-system').innerText()).includes('reduces the decisions'));
  if(width===390){await page.screenshot({path:path.join(out,'ezpz-method.jpg'),type:'jpeg',quality:85})}
  await page.keyboard.press('Escape');assert.equal(await page.locator('#ezpz-method').evaluate(d=>d.open),false);
  assert(await page.locator('[data-ezpz-method="open"]').evaluate(b=>document.activeElement===b),'Method restores trigger focus');
  await page.locator('[data-ezpz-method="open"]').click();await page.locator('.method-done').click();
  assert.equal(await page.locator('#ezpz-method').evaluate(d=>d.open),false);
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),methodBefore,'Reading the method preserves saved data');
  if(width===390){for(const [selector,file] of [['.home-nutrition','nutrition'],['.home-week-card','consistency'],['.home-next','planning'],['.home-weight-row','weight']]){const image=await page.locator(selector).evaluate(el=>getComputedStyle(el).backgroundImage);assert(image.includes('/home-images/'+file+'.jpg'),'Relevant Home background '+file);const response=await context.request.get(base+'/home-images/'+file+'.jpg');assert.equal(response.status(),200,'Home photo available '+file);}}
  const homeStorageBefore=await page.evaluate(key=>localStorage.getItem(key),key);
  assert.equal(await page.locator('.home-energy-ring').count(),1);assert.equal(await page.locator('.home-macro-row progress').count(),3);
  for(const [selector,name] of [['.home-nutrition','Home nutrition'],['.home-week-card','Home week'],['.home-next','Home next'],['.home-weight-row','Home weight']]){await page.locator(selector).evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));await checkLayout(name);if(width===390){const jpg=await page.locator(selector).screenshot({type:'jpeg',quality:85,path:path.join(out,name.replaceAll(' ','-')+'-'+width+'.jpg')});captures.push({name,src:'data:image/jpeg;base64,'+jpg.toString('base64')});}}
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),homeStorageBefore,'Home visual inspection must not write data');

  await page.locator('[data-tab="eat"]').click();assert.equal(await page.locator('[data-recipe-card]').count(),157);assert.equal(await page.locator('[data-recipe-card] img').count(),157);
  for(const focus of ['protein','carbs','fat','balanced']){await page.locator('[data-meal-focus="'+focus+'"]').click();assert.equal(await page.locator('[data-recipe-card]:visible').count(),focus==='balanced'?64:31);await checkLayout('meal section '+focus);await capture('Meals-'+focus)}
  for(const [focus,index] of [['protein',76],['carbs',86],['fat',96]]){await page.locator('[data-meal-focus="'+focus+'"]').click();await page.locator('[data-open-meal="'+index+'"]').click();await checkLayout('added meal '+index);for(const portion of ['0.5','2']){await page.locator('[data-serving="'+index+'"]').selectOption(portion==='0.5'?'.5':portion);const expected=await page.evaluate(({index,portion})=>nutrition(recipes[index].ingredients,Number(portion)),{index,portion});assert.equal(Number(await page.locator('[data-kcal="'+index+'"]').textContent()),expected[0]);}await page.locator('[data-go="eat"]').click();}
  for(const [focus,index] of [['balanced',97],['protein',112],['carbs',127],['fat',142]]){await page.locator('[data-meal-focus="'+focus+'"]').click();await page.locator('#recipe-search').fill('kiwi');assert.equal(await page.locator('[data-recipe-card]:visible').count(),2);await page.locator('[data-open-meal="'+index+'"]').click();await checkLayout('new photographed meal '+index);for(const portion of ['.5','2']){await page.locator('[data-serving="'+index+'"]').selectOption(portion);const expected=await page.evaluate(({index,portion})=>nutrition(recipes[index].ingredients,Number(portion)),{index,portion});assert.equal(Number(await page.locator('[data-kcal="'+index+'"]').textContent()),expected[0]);}await page.locator('[data-go="eat"]').click();}
  await page.locator('[data-meal-focus="protein"]').click();await page.locator('#recipe-search').fill('fajita');assert.equal(await page.locator('[data-recipe-card]:visible').count(),1);await page.locator('[data-meal-filter="dinner"]').click();assert.equal(await page.locator('[data-recipe-card]:visible').count(),1);
  await page.locator('[data-meal-focus="balanced"]').click();await page.locator('[data-meal-filter="all"]').click();await page.locator('#recipe-search').fill('');
  if(width===390){for(const src of await page.locator('[data-recipe-card] img').evaluateAll(xs=>xs.map(x=>x.getAttribute('src')))){const response=await context.request.get(new URL(src,base+'/fitness.html').href);assert.equal(response.status(),200,'Photo '+src);const bytes=await response.body();assert(bytes[0]===255&&bytes[1]===216,'JPEG asset '+src)}}
  await checkLayout('Food');await capture('Food');
  await page.locator('#recipe-search').fill('Chicken potato plate');await page.locator('[data-open-meal="6"]').click();await page.locator('[data-serving="6"]').selectOption('2');assert((await page.locator('[data-ingredients="6"]').innerText()).includes('320 g'));await page.locator('[data-log-food="6"]').click();
  assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).foodLog.length,key),2);
  await page.locator('[data-home-diary]').evaluate(x=>x.open=true);
  await checkLayout('Logged food');
  const loggedPhoto=page.locator('.food-log-photo[data-open-meal="6"] img');await loggedPhoto.evaluate(img=>img.decode());
  assert.equal(await loggedPhoto.getAttribute('src'),await page.evaluate(()=>recipes[6].photo),'Logged thumbnail matches exact recipe');
  assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).foodLog.at(-1).recipeIndex,key),6);
  const logBefore=await page.evaluate(key=>JSON.stringify(JSON.parse(localStorage.getItem(key)).foodLog),key);
  await page.reload();await page.locator('[data-tab="eat"]').click();await page.locator('[data-home-diary]').evaluate(x=>x.open=true);
  assert.equal(await page.locator('.food-log-photo[data-open-meal="6"] img').getAttribute('src'),await page.evaluate(()=>recipes[6].photo),'Logged photo survives reload');
  assert.equal(await page.evaluate(key=>JSON.stringify(JSON.parse(localStorage.getItem(key)).foodLog),key),logBefore,'Opening diary preserves saved log');
  if(width===390){const diary=page.locator('[data-home-diary]');await diary.scrollIntoViewIfNeeded();const jpg=await diary.screenshot({type:'jpeg',quality:85,path:path.join(out,'food-log-photos.jpg')});captures.push({name:'Food log photos',src:'data:image/jpeg;base64,'+jpg.toString('base64')})}
  await page.locator('.food-log-photo[data-open-meal="6"]').click();assert.equal(await page.locator('body').getAttribute('data-view'),'meal');assert((await page.locator('.meal-detail h2').innerText()).includes('Chicken potato plate'));await page.locator('[data-go="eat"]').click();await page.locator('[data-home-diary]').evaluate(x=>x.open=true);

  assert(await page.locator('.food-diary progress').evaluate(x=>{const p=x.parentElement,style=getComputedStyle(p);return Math.abs(x.getBoundingClientRect().width-(p.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)))<2}),'Food progress fills diary');
  for(const entry of await page.locator('.food-log-entry').all()){
   assert(await entry.evaluate(x=>{const name=x.querySelector('.food-log-copy'),detail=name.querySelector('small'),button=x.querySelector('[data-remove-food]'),a=name.getBoundingClientRect(),b=button.getBoundingClientRect();return getComputedStyle(detail).display==='block'&&a.right<=b.left&&b.height>=44}),'Meal details separated and Remove button aligned');
  }
  await page.locator('[data-home-diary]').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,'Logged-food-'+width+'.jpg'),type:'jpeg',quality:85});

  await page.locator('[data-tab="train"]').click();
  assert.equal(await page.locator('.training-facts>span').count(),3,'Three clear session summary tiles');
  assert.equal(await page.locator('.training-header .workout-trigger-copy>small').count(),0,'No repeated exercise/time line');
  assert((await page.locator('.training-facts').innerText()).includes('TOTAL SETS'));
  const summaryColors=await page.locator('.training-facts>span').evaluateAll(xs=>xs.map(x=>getComputedStyle(x).backgroundColor));assert.equal(new Set(summaryColors).size,3,'Green, gold and blue summary tiles');
  const controlColors=await page.locator('#training-exercise-0 .exercise-logging-tools>button').evaluateAll(xs=>xs.map(x=>getComputedStyle(x).backgroundColor));assert.equal(new Set(controlColors).size,3,'Distinct colored exercise actions');
  assert.equal(await page.locator('.training-format').count(),1);assert.equal(await page.locator('.session-setting .training-detail-icon').count(),1);
  await checkLayout('Train color harmony');
  await page.locator('[data-action="open-workouts"]').click();assert.equal(await page.locator('#workout-chooser img').count(),13);
  const coverSources=await page.locator('#workout-chooser img').evaluateAll(xs=>xs.map(x=>x.getAttribute('src')));
  assert.equal(new Set(coverSources).size,12);for(const src of coverSources){const response=await context.request.get(new URL(src,base+'/fitness.html').href);assert.equal(response.status(),200,'Workout photo '+src)}
  await page.locator('#workout-chooser').evaluate(async dialog=>{for(const img of dialog.querySelectorAll('img')){img.loading='eager';await img.decode()}dialog.scrollTop=0});
  await checkLayout('Workout chooser');assert(await page.locator('#workout-chooser').evaluate(x=>x.scrollWidth<=x.clientWidth+1&&x.getBoundingClientRect().left>=-1&&x.getBoundingClientRect().right<=document.documentElement.clientWidth+1),'Chooser fits phone viewport');
  if(width===390){const buffer=await page.screenshot({path:path.join(out,'Workout-chooser-390.jpg'),type:'jpeg',quality:85});captures.push({name:'Workout chooser',src:'data:image/jpeg;base64,'+buffer.toString('base64')})}
  await page.locator('[data-action="close-workouts"]').click();
  if(expectUpgrade){await page.locator('[data-set-reps="0-0"]').fill('7');await page.waitForFunction(()=>Array.isArray(exerciseCatalog));assert.equal(await page.locator('[data-set-reps="0-0"]').inputValue(),'7','Catalogue refresh discarded unblurred input');await page.locator('[data-set-reps="0-0"]').fill('')}

  const programIds=await page.evaluate(()=>['full-body',...workoutTemplates.map(w=>w.id)]);
  assert.equal(programIds.length,65);
  for(const id of programIds){
   const info=await page.evaluate(id=>{const p=workoutTemplates.find(w=>w.id===id);return {category:p?.category||'Full Body',photo:workoutCover(p||'Full Body').src}},id);
   await page.locator('[data-action="open-workouts"]').click();
   try{await page.locator('[data-workout-category="'+info.category+'"]').click({timeout:5000})}catch(error){
    console.log('CHOOSER_DIAGNOSTIC',JSON.stringify(await page.evaluate(()=>({scrollY,innerWidth,innerHeight,dialog:document.getElementById('workout-chooser').getBoundingClientRect().toJSON(),items:[...document.querySelectorAll('[data-workout-category]')].slice(0,3).map(e=>{const r=e.getBoundingClientRect();return {category:e.dataset.workoutCategory,rect:r.toJSON(),hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.outerHTML.slice(0,250)}})}))));
    const jpg=await page.screenshot({type:'jpeg',quality:80});const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_VISUAL_DATA '+b.slice(i,i+4000));throw error
   }
   assert.equal(await page.locator('[data-workout-pick]').count(),info.category==='Kettlebell'?10:5);
   const cardPhotos=await page.locator('.program-card .program-photo img').evaluateAll(xs=>xs.map(x=>x.getAttribute('src')));assert.equal(new Set(cardPhotos).size,cardPhotos.length,'Each '+info.category+' program has a distinct cover');
   const selectedPhoto=page.locator('.program-card').filter({has:page.locator('[data-workout-pick="'+id+'"]')}).locator('.program-photo img');assert.equal(await selectedPhoto.getAttribute('src'),info.photo,'Program card uses the assigned cover '+id);
   if(width===390){await selectedPhoto.evaluate(async x=>{x.loading='eager';await x.decode()});}
   if(id==='full-body-balanced'&&width===390){
    await page.locator('#workout-chooser').evaluate(async d=>{for(const img of d.querySelectorAll('img')){img.loading='eager';await img.decode()}});
    const buffer=await page.screenshot({path:path.join(out,'Full-body-programs.jpg'),type:'jpeg',quality:85});captures.push({name:'Full Body programs',src:'data:image/jpeg;base64,'+buffer.toString('base64')});
    await page.locator('[data-action="workout-categories"]').click();assert.equal(await page.locator('[data-workout-category]').count(),12);await page.locator('[data-workout-category="Full Body"]').click();
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
   assert((await page.locator('.training-header').evaluate(el=>getComputedStyle(el).backgroundImage)).includes(info.photo.replace('./','/')),'Photo header follows '+id);
   const photos=await page.locator('.training-exercise').evaluateAll(xs=>xs.map(x=>x.style.getPropertyValue('--exercise-cover')));
   assert.equal(new Set(photos).size,photos.length,'Distinct exercise photos '+id);
   if(id==='kb-foundations'&&width===390){await capture('Kettlebell foundations')}
   if(id==='kb-conditioning')assert.equal(await page.locator('[data-set-weight]').count(),12,'Timed kettlebell sets support kg logging');
   assert(await page.locator('[data-exercise-jump]').evaluateAll(xs=>xs.every(x=>getComputedStyle(x).backgroundImage.includes('url('))),'Exercise shortcut photos render '+id);
   await checkLayout(id);
  }
  // New programs preserve their own draft alongside existing A/B drafts.
  await page.locator('[data-set-reps="0-0"]').fill('11');await page.locator('[data-set-done="0-0"]').check();
  await page.reload();await page.locator('[data-tab="train"]').click();assert.equal(await page.locator('[data-set-reps="0-0"]').inputValue(),'11');
  await page.locator('[data-tab="home"]').click();assert.equal(await page.locator('.home-workout>img').getAttribute('src'),'./program-images/kb-double-strength.jpg');await page.locator('.home-workout>img').evaluate(x=>x.decode());await capture('Selected workout');await page.locator('[data-tab="train"]').click();
  await page.locator('[data-action="open-workouts"]').click();await page.locator('[data-workout-category="Push"]').click();await page.locator('[data-workout-pick="push-a"]').click();
  await page.locator('[data-set-reps="0-0"]').fill('10');await page.locator('[data-set-weight="0-0"]').fill('20');await page.locator('[data-set-done="0-0"]').check();await capture('Train');
  assert((await page.locator('.training-header').evaluate(el=>getComputedStyle(el).backgroundImage)).includes('/workout-images/push.jpg'),'Train hero follows chosen workout');
  if(width===390){const storageBefore=await page.evaluate(key=>localStorage.getItem(key),key);for(const [selector,name] of [['.training-header','Train photo header'],['.workout-progress-card','Train photo progress'],['.training-rest','Train photo rest'],['.training-exercise[open]','Train photo logger'],['.session-footer','Train photo footer']]){const el=page.locator(selector).first();await el.evaluate(x=>x.scrollIntoView({block:'start',behavior:'instant'}));await checkLayout(name);const jpg=await el.screenshot({type:'jpeg',quality:85,path:path.join(out,name.replaceAll(' ','-')+'-'+width+'.jpg')});captures.push({name,src:'data:image/jpeg;base64,'+jpg.toString('base64')});}assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),storageBefore,'Train photo review must preserve drafts');}
  await page.reload();await page.locator('[data-tab="train"]').click();assert.equal(await page.locator('[data-set-reps="0-0"]').inputValue(),'10');assert(await page.locator('[data-set-done="0-0"]').isChecked());
  if(expectUpgrade){await page.waitForFunction(()=>{const b=document.querySelector('[data-set-done="0-0"]')?.getBoundingClientRect();return b&&b.width>=44&&b.height>=44});assert((await page.locator('.set-previous').first().innerText()).includes('18 kg'),'Previous set comparison');const finish=await page.locator('.session-footer').boundingBox(),nav=await page.locator('.nav').boundingBox();assert(finish.y+finish.height<=nav.y+1,'Finish bar overlaps navigation')}
  await page.locator('[data-action="finish"]').click();await page.waitForFunction(()=>document.body.dataset.view==='progress');assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).logs.length,key),25);await checkLayout('Progress');await capture('Progress');
  const progressBefore=await page.evaluate(key=>localStorage.getItem(key),key);
  const summaryPhotos=await page.locator('.progress-summary>section').evaluateAll(xs=>xs.map(x=>getComputedStyle(x).backgroundImage));assert.equal(new Set(summaryPhotos).size,3,'Distinct relevant Progress metric photos');assert(summaryPhotos.every(x=>x.includes('url(')),'Progress metrics have photos');
  assert((await page.locator('.history-session').first().evaluate(x=>getComputedStyle(x.querySelector('summary')).backgroundImage)).includes('/workout-images/push.jpg'),'History photo matches the logged workout');
  if(width===390){
   for(const [selector,name] of [['.progress-summary','Progress photo metrics'],['.consistency-card','Progress photo consistency'],['.weight-trend-card','Progress photo weight'],['.history-session','Progress photo history']]){const el=page.locator(selector).first();await el.scrollIntoViewIfNeeded();const jpg=await el.screenshot({type:'jpeg',quality:85});captures.push({name,src:'data:image/jpeg;base64,'+jpg.toString('base64')})}
  }
  const progressState=await page.evaluate(()=>JSON.stringify(state));
  for(const entries of [0,1]){
   await page.evaluate(n=>{state.weights=state.weights.slice(0,n);state.logs=[];progress()},entries);await checkLayout('Progress photo empty state '+entries);assert.equal(await page.locator('.trend-chart').count(),0);assert(await page.locator('#weightform').count());
   if(width===390&&entries===0)await capture('Progress photo empty');
  }
  await page.evaluate(saved=>{state=JSON.parse(saved);progress()},progressState);
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),progressBefore,'Visual rendering preserves saved data');
  if(expectUpgrade){assert.equal(await page.locator('.history-session').count(),12);await page.locator('[data-action="more-history"]').click();assert.equal(await page.locator('.history-session').count(),24);await page.locator('[data-action="more-history"]').click();assert.equal(await page.locator('.history-session').count(),25)}
  const moreTab=expectUpgrade?'more':'shopping';await page.locator('[data-tab="'+moreTab+'"]').click();await checkLayout('More');await capture('More');
  await page.locator('.more-reference>summary').click();await page.locator('[data-go="library"]').click();await page.locator('.library-tile').first().waitFor();assert.equal(await page.locator('.library-tile').count(),100);if(expectUpgrade){const tile=page.locator('.library-tile').first(),icon=await tile.locator('.workout-category-icon').boundingBox(),title=await tile.locator('strong').boundingBox();assert(title.x>=icon.x+icon.width+8,'Exercise library must use horizontal rows');assert((await tile.boundingBox()).height<=110,'Library row too tall')}await checkLayout('Library');await capture('Library');
  await page.locator('#library-search').fill('bench');assert(await page.locator('.library-tile').count()>0);await page.locator('.library-tile').first().click();await checkLayout('Exercise guide');assert((await page.locator('#screen').innerText()).includes('Lie'));
  if(expectUpgrade){await page.locator('[data-tab="more"]').click();await page.locator('.more-backups>summary').click();await page.locator('.data-tools summary').click();await page.locator('#restore-file').setInputFiles({name:'ezpz-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});await page.locator('[data-action="restore"]').click();await page.waitForFunction(()=>document.body.dataset.view==='home');const restored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);assert.deepEqual(restored.foodLog,fixture.foodLog);assert.deepEqual(restored.mealPlan,fixture.mealPlan);assert.deepEqual(restored.checkedShopping,fixture.checkedShopping);assert.deepEqual(restored.draft,fixture.draft);assert.deepEqual(restored.workoutDrafts,fixture.workoutDrafts);assert.equal(restored.logs.length,24)}

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
  await page.locator('[data-tab="more"]').click();await page.locator('.more-backups>summary').click();await page.locator('.data-tools summary').click();
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
  assert.equal(await page.locator('.plan-picker-categories img').count(),13);
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
  assert.equal(await page.locator('#planned-workout img').getAttribute('src'),'./program-images/full-body-home.jpg');
  await page.locator('[data-open-meal-picker="breakfast"]').click();
  await page.locator('[data-plan-picker-filter="all"]').click();
  assert.equal(await page.locator('[data-plan-pick-meal]').count(),157);
  assert.equal(await page.locator('[data-plan-pick-meal] img').count(),157);
  await checkLayout('Recipe photo picker');
  assert.equal(await page.locator('[data-plan-picker-filter="all"]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('[data-plan-picker-filter="breakfast"]').getAttribute('aria-pressed'),'false');
  await page.locator('[data-plan-pick-meal] img').evaluateAll(async imgs=>{for(const x of imgs){x.loading='eager';await x.decode()}});
  const mealPickerJpg=await page.screenshot({path:path.join(out,'Planner-meal-picker-'+width+'.jpg'),type:'jpeg',quality:85});
  if(width===390)captures.push({name:'Planner meal picker',src:'data:image/jpeg;base64,'+mealPickerJpg.toString('base64')});
  await page.locator('#planner-picker-search').fill('zzzz-no-recipe');
  assert.equal(await page.locator('[data-plan-pick-meal]').count(),0);assert((await page.locator('.picker-empty').innerText()).includes('No recipes'));
  await page.locator('[data-plan-picker-action="reset"]').click();assert.equal(await page.locator('[data-plan-pick-meal]').count(),157);
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

 // Custom foods use the same diary and persist their chosen photo independently of saved favourites.
 for(const width of [320,390,430]){
  const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,timezoneId:'America/New_York'});
  const initial={...fixture,foodLog:[],customFoods:[]};await context.addInitScript(({key,initial})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(initial))},{key,initial});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/fitness.html');
  const openCustom=async()=>{await page.locator('[data-tab="eat"]').click();await page.locator('[data-home-diary]').evaluate(x=>x.open=true);await page.locator('.custom-food-open').click();assert.equal(await page.locator('body').getAttribute('data-view'),'custom-food');assert.equal(await page.locator('[data-tab="eat"]').getAttribute('aria-current'),'page')};
  const fits=async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'Custom food horizontal layout '+width);
  await openCustom();await fits();assert((await page.locator('#custom-food-form').evaluate(x=>getComputedStyle(x).backgroundImage)).includes('url('),'Custom form photo backdrop');const back=await page.locator('.back-link').boundingBox(),hero=await page.locator('.custom-food-hero').boundingBox();assert(back.y+back.height<=hero.y,'Back button must not overlap hero');
  await page.locator('#custom-food-name').fill('My yogurt snack');await page.locator('#custom-food-protein').fill('20.5');await page.locator('#custom-food-carbs').fill('30');await page.locator('#custom-food-fat').fill('10');
  assert.equal(await page.locator('#custom-food-calorie-output').innerText(),'292 kcal');
  await page.locator('.custom-food-submit').click();assert.equal(await page.locator('body').getAttribute('data-view'),'custom-food','Photo is required');assert.equal(await page.evaluate(()=>foodEntries().length),0);
  await page.locator('.custom-food-calorie-option>summary').click();await page.locator('#custom-food-calories').fill('315.5');assert.equal(await page.locator('#custom-food-calorie-output').innerText(),'315.5 kcal');assert.equal(await page.locator('#custom-food-calorie-source').innerText(),'Using your label calories');
  await page.locator('.custom-food-photo-grid label:has(input[value="yogurt"])').click();
  await page.locator('#custom-food-fat').fill('-1');await page.locator('.custom-food-submit').click();assert.equal(await page.evaluate(()=>foodEntries().length),0,'Negative macros cannot log');await page.locator('#custom-food-fat').fill('10');
  for(const img of await page.locator('.custom-food-photo-grid img').all())await img.evaluate(x=>x.decode());
  assert(await page.locator('#custom-food-name,#custom-food-protein,#custom-food-carbs,#custom-food-fat,#custom-food-calories').evaluateAll(xs=>{const lum=rgb=>{const c=rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4});return c[0]*.2126+c[1]*.7152+c[2]*.0722};return xs.every(x=>{const st=getComputedStyle(x),a=lum(st.color),b=lum(st.backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5})}),'Custom food input text contrast');
  if(width===390){const jpg=await page.screenshot({type:'jpeg',quality:85,fullPage:true,path:path.join(out,'custom-food-form.jpg')});captures.push({name:'Custom food form',src:'data:image/jpeg;base64,'+jpg.toString('base64')})}
  await page.locator('.custom-food-submit').click();assert.equal(await page.locator('body').getAttribute('data-view'),'eat');assert(await page.locator('[data-home-diary]').evaluate(x=>x.open));
  assert.deepEqual(await page.evaluate(()=>foodEntries()[0].macros),[315.5,20.5,30,10]);assert.deepEqual(await page.evaluate(()=>foodSummary().totals),[316,21,30,10]);assert.equal(await page.evaluate(()=>cleanCustomFoods(state.customFoods).length),1);
  assert.equal(await page.locator('.food-log-entry img').getAttribute('src'),'./meal-images/meal-0.jpg');assert((await page.locator('.food-log-copy').innerText()).includes('Custom food'));
  await page.reload();await page.locator('[data-tab="eat"]').click();await page.locator('[data-home-diary]').evaluate(x=>x.open=true);assert.equal(await page.locator('.food-log-entry img').getAttribute('src'),'./meal-images/meal-0.jpg');
  await openCustom();await page.locator('.custom-food-saved>summary').click();await page.locator('[data-custom-portions]').fill('.5');await fits();await page.locator('[data-log-custom]').click();
  assert.equal(await page.locator('.food-log-entry').count(),2);assert.deepEqual(await page.evaluate(()=>foodEntries()[1].macros),[157.8,10.3,15,5]);assert.equal(await page.locator('.food-log-entry img').nth(1).getAttribute('src'),'./meal-images/meal-0.jpg');
  if(width===390){await page.locator('[data-home-diary]').scrollIntoViewIfNeeded();const jpg=await page.locator('[data-home-diary]').screenshot({type:'jpeg',quality:85,path:path.join(out,'custom-food-diary.jpg')});captures.push({name:'Custom food diary',src:'data:image/jpeg;base64,'+jpg.toString('base64')})}
  await openCustom();await page.locator('.custom-food-saved>summary').click();await page.locator('[data-delete-custom]').click();assert.equal(await page.evaluate(()=>state.customFoods.length),0);assert.equal(await page.evaluate(()=>foodEntries().length),2);
  await page.locator('#custom-food-name').fill('Greek yogurt berry bowl');await page.locator('#custom-food-protein').fill('10');await page.locator('#custom-food-carbs').fill('20');await page.locator('#custom-food-fat').fill('5');await page.locator('.custom-food-photo-grid label:has(input[value="oats"])').click();await page.locator('[name="remember"]').uncheck();await page.locator('.custom-food-submit').click();
  assert.equal(await page.evaluate(()=>state.customFoods.length),0);assert.equal(await page.locator('.food-log-entry').count(),3);const last=page.locator('.food-log-entry').last();assert.equal(await last.locator('img').getAttribute('src'),'./meal-images/recipe-23.jpg');assert.equal(await last.locator('[data-open-meal]').count(),0,'Custom names never open a library recipe');
  const firstId=await page.evaluate(()=>foodEntries()[0].id);await page.locator('[data-remove-food="'+firstId+'"]').click();assert.equal(await page.evaluate(()=>foodEntries().length),2);await page.locator('[data-home-diary]').evaluate(x=>x.open=true);await fits();
  const backup=await page.evaluate(()=>{const restored=restoredState(JSON.parse(JSON.stringify(state)));return restored.foodLog.map(f=>({custom:f.custom,photoKey:f.photoKey}))});assert.deepEqual(backup,[{custom:true,photoKey:'yogurt'},{custom:true,photoKey:'oats'}]);
  await context.close();
 }

 // Nutrition entry points are above the recipe library; manual and guided targets share one source.
 for(const width of [320,390,430]){
  const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,timezoneId:'America/New_York'});
  await context.addInitScript(({key,fixture})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture))},{key,fixture});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/fitness.html');
  const fits=async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'Nutrition layout '+width);
  const snapshot=async(name,full=false)=>{if(width!==390)return;await page.evaluate(()=>scrollTo(0,0));const jpg=await page.screenshot({type:'jpeg',quality:85,fullPage:full,path:path.join(out,name.replaceAll(' ','-')+'.jpg')});captures.push({name,src:'data:image/jpeg;base64,'+jpg.toString('base64')})};
  await page.locator('[data-tab="eat"]').click();await fits();const log=await page.locator('.eat-custom-open').boundingBox(),diary=await page.locator('[data-home-diary]').boundingBox(),search=await page.locator('#recipe-search').boundingBox();assert(log.y>=0&&log.y+log.height<500,'Custom logging visible at top');assert(diary.y<search.y,'Diary precedes recipe search');assert(log.y<search.y,'Custom food precedes library');await snapshot('Nutrition Eat top');
  const foodBefore=await page.evaluate(()=>JSON.stringify(state.foodLog));await page.locator('.eat-targets-open').click();assert.equal(await page.locator('[data-tab="eat"]').getAttribute('aria-current'),'page');await fits();
  for(const key of ['protein','carbs','fat'])await page.locator('#target-'+key).fill('0');await page.locator('#nutrition-manual button[type="submit"]').click();assert((await page.locator('#nutrition-manual-error').innerText()).includes('1,000'));
  for(const [key,value] of [['protein','190'],['carbs','230'],['fat','80']])await page.locator('#target-'+key).fill(value);assert.equal(await page.locator('#nutrition-manual-energy').innerText(),'2400 kcal');assert.equal(await page.locator('#nutrition-manual-error').innerText(),'');await snapshot('Nutrition manual targets',true);
  await page.locator('#nutrition-manual button[type="submit"]').click();assert.deepEqual(await page.evaluate(()=>target()),{calories:2400,protein:190,fat:80,carbs:230});assert.equal(await page.evaluate(()=>JSON.stringify(state.foodLog)),foodBefore);
  await page.locator('[data-tab="home"]').click();assert((await page.locator('.home-nutrition').innerText()).includes('2,400'));await page.reload();assert.equal(await page.evaluate(()=>target().calories),2400);
  await page.locator('[data-tab="eat"]').click();await page.locator('.eat-targets-open').click();await page.locator('[data-nutrition-mode="calculator"]').click();await fits();
  await page.locator('#nutrition-units').selectOption('imperial');assert(Math.abs(Number(await page.locator('#nutrition-weight').inputValue())-176.4)<.1);assert((await page.locator('#nutrition-height-label').innerText()).includes('in'));await page.locator('[data-nutrition-mode=manual]').click();await page.locator('[data-nutrition-mode=calculator]').click();assert.equal(await page.locator('#nutrition-units').inputValue(),'imperial');assert(Math.abs(Number(await page.locator('#nutrition-weight').inputValue())-176.4)<.1,'Unit values survive tab changes');await page.locator('#nutrition-units').selectOption('metric');
  await page.locator('#nutrition-age').fill('35');await page.locator('#nutrition-weight').fill('80');await page.locator('#nutrition-height').fill('180');await page.locator('#nutrition-sex').selectOption('male');await snapshot('Nutrition body questionnaire',true);
  await page.locator('#nutrition-body button[type="submit"]').click();await page.locator('.nutrition-activity label:has(input[value="moderate"])').click();await page.locator('#nutrition-goal').selectOption('lose');await page.locator('#nutrition-pace').selectOption('gentle');await fits();await snapshot('Nutrition activity questionnaire',true);
  await page.locator('[data-nutrition-back="0"]').click();assert.equal(await page.locator('#nutrition-weight').inputValue(),'80');await page.locator('#nutrition-body button[type="submit"]').click();assert(await page.locator('input[name="activity"][value="moderate"]').isChecked());assert.equal(await page.locator('#nutrition-goal').inputValue(),'lose');
  await page.locator('#nutrition-routine button[type="submit"]').click();await fits();assert((await page.locator('#nutrition-result h3').innerText()).includes('2450'));assert((await page.locator('.nutrition-result').innerText()).includes('starting')||(await page.locator('.nutrition-result').innerText()).includes('STARTING'));await snapshot('Nutrition estimate result',true);
  assert.equal(await page.evaluate(()=>state.nutritionTargets.source),'manual','Reviewing estimate does not save');await page.locator('#nutrition-result button[type="submit"]').click();assert.equal(await page.evaluate(()=>target().calories),2450);assert.equal(await page.evaluate(()=>state.nutritionTargets.source),'calculator');assert.equal(await page.evaluate(()=>JSON.stringify(state.foodLog)),foodBefore);
  await page.reload();assert.equal(await page.evaluate(()=>target().calories),2450);assert.equal(await page.evaluate(()=>state.nutritionAssessment.activity),'moderate');
  await page.locator('[data-tab="eat"]').click();await page.locator('.eat-targets-open').click();await page.locator('[data-nutrition-mode="calculator"]').click();await page.locator('#nutrition-context').selectOption('pregnancy');await page.locator('#nutrition-body button[type="submit"]').click();await page.locator('#nutrition-routine button[type="submit"]').click();assert.equal(await page.locator('#nutrition-result').count(),0);assert((await page.locator('.nutrition-result').innerText()).includes('pregnancy'));assert.equal(await page.evaluate(()=>target().calories),2450,'Unsupported situation cannot overwrite targets');
  const backup=await page.evaluate(()=>restoredState(JSON.parse(JSON.stringify(state))));assert.equal(backup.nutritionTargets.calories,2450);assert.equal(backup.nutritionAssessment.weight,80);await context.close();
 }

 // My Plan photographic surfaces follow real selections, including empty and rest-day states.
 for(const width of [320,390,430]){
  const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,timezoneId:'America/New_York'});
  const initial={...fixture,plannerStart:today,plannerDays:28,plannerOffset:0,workoutSchedule:{[today]:'pull-a'},mealPlan:{[today]:{breakfast:0,breakfastPortion:1.5,lunch:48,lunchPortion:2,dinner:36,dinnerPortion:1}},nutritionTargets:{protein:190,carbs:230,fat:80,calories:2400,source:'manual'}};
  await context.addInitScript(({key,initial})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(initial))},{key,initial});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.goto(base+'/fitness.html');await page.locator('[data-go="planner"]').first().click();
  const fits=async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'My Plan layout '+width);
  const picture=async selector=>page.locator(selector).first().evaluate(x=>getComputedStyle(x).backgroundImage);
  await fits();const before=await page.evaluate(key=>localStorage.getItem(key),key);
  assert((await picture('.planner-hero')).includes('/home-images/planning.jpg'));assert((await picture('.plan-controls')).includes('/train-images/guide.jpg'));assert((await picture('.plan-days')).includes('/home-images/consistency.jpg'));assert((await picture('.plan-workout')).includes('/workout-images/pull.jpg'));
  for(const [slot,index]of [['breakfast',0],['lunch',48],['dinner',36]]){const photo=await page.evaluate(i=>recipes[i].photo||(i<6?'./meal-images/meal-'+i+'.jpg':null),index);assert((await picture('#planner-'+slot)).includes(photo.replace('./','/')),'Meal backdrop matches '+slot);assert.equal(await page.locator('#planner-'+slot+' img').getAttribute('src'),photo)}
  assert((await page.locator('.plan-nutrients').innerText()).includes('2400'));assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),before,'Photographic planner rendering preserves saved plans');
  if(width===390){await page.evaluate(()=>scrollTo(0,0));const jpg=await page.screenshot({type:'jpeg',quality:85,path:path.join(out,'my-plan-top.jpg')});captures.push({name:'My Plan top',src:'data:image/jpeg;base64,'+jpg.toString('base64')});for(const [selector,name]of [['.plan-workout','My Plan workout'],['.plan-meals','My Plan meals'],['.plan-repeat','My Plan actions']]){const el=page.locator(selector);await el.scrollIntoViewIfNeeded();const jpg=await el.screenshot({type:'jpeg',quality:85});captures.push({name,src:'data:image/jpeg;base64,'+jpg.toString('base64')})}}
  await page.locator('[data-planner-offset="1"]').click();await fits();assert.equal(await page.locator('.plan-portion-row').count(),0);for(const slot of ['breakfast','lunch','dinner'])assert((await picture('#planner-'+slot)).includes('url('),'Empty slot photo '+slot);
  if(width===390){await page.locator('.plan-meals').scrollIntoViewIfNeeded();const jpg=await page.locator('.plan-meals').screenshot({type:'jpeg',quality:85});captures.push({name:'My Plan empty meals',src:'data:image/jpeg;base64,'+jpg.toString('base64')})}
  await page.locator('#planned-workout').click();assert((await picture('.plan-picker-head')).includes('/home-images/planning.jpg'));await page.locator('[data-plan-picker-action="close"]').click();
  await page.locator('#planner-lunch').click();assert((await picture('.plan-picker-head')).includes('/home-images/nutrition.jpg'));await page.locator('[data-plan-picker-action="close"]').click();await fits();
  await page.evaluate(()=>{const date=planSettings().date;state.workoutSchedule[date]='rest';planner()});assert((await picture('.plan-workout')).includes('/home-images/consistency.jpg'));assert((await page.locator('#planned-workout').innerText()).includes('Rest / recovery day'));await fits();
  await context.close();
 }

 // The visible planner back button returns to its entry section; More uses distinct related photos.
 for(const width of [320,390,430]){
  const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,timezoneId:'America/New_York'});await context.addInitScript(({key,fixture})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture))},{key,fixture});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/fitness.html');
  const fits=async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'More / planner back layout '+width);
  for(const origin of ['home','train','eat','more']){
   await page.locator('[data-tab="'+origin+'"]').click();if(origin==='eat')await page.locator('.eat-planner').evaluate(x=>x.open=true);
   const before=await page.evaluate(key=>localStorage.getItem(key),key);await page.locator('[data-go="planner"]').first().click();assert.equal(await page.locator('body').getAttribute('data-view'),'planner');const back=page.locator('.planner-back'),rect=await back.boundingBox();assert(rect.y>=0&&rect.y+rect.height<150,'Back is visible at the top');assert(rect.height>=44,'Back touch target');assert.equal(await back.getAttribute('data-go'),origin,'Back returns to entry section');await fits();
   if(width===390&&origin==='more'){const jpg=await page.screenshot({type:'jpeg',quality:85,path:path.join(out,'planner-back.jpg')});captures.push({name:'More My Plan back',src:'data:image/jpeg;base64,'+jpg.toString('base64')})}
   await back.click();assert.equal(await page.locator('body').getAttribute('data-view'),origin);assert.equal(await page.evaluate(()=>scrollY),0);assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),before,'Back navigation preserves saved data');
  }
  await fits();const backgrounds=await page.locator('.more-link').evaluateAll(xs=>xs.map(x=>getComputedStyle(x).backgroundImage));assert.equal(backgrounds.length,4);assert.equal(new Set(backgrounds).size,4,'More tools have different related backgrounds');assert(backgrounds.every(x=>x.includes('url(')));assert((await page.locator('.data-tools').evaluate(x=>getComputedStyle(x).backgroundImage)).includes('/train-images/guide.jpg'));
  if(width===390){await page.evaluate(()=>scrollTo(0,0));const jpg=await page.screenshot({type:'jpeg',quality:85,path:path.join(out,'more-page-top.jpg')});captures.push({name:'More top',src:'data:image/jpeg;base64,'+jpg.toString('base64')});await page.locator('.more-backups>summary').click();for(const [selector,name]of [['.more-group','More tools'],['.data-tools','More backup']]){const el=page.locator(selector);await el.scrollIntoViewIfNeeded();const jpg=await el.screenshot({type:'jpeg',quality:85});captures.push({name,src:'data:image/jpeg;base64,'+jpg.toString('base64')})}}
  for(const [destination,expected]of [['library','library'],['shopping','shopping'],['progress','progress']]){if(destination!=='shopping')await page.locator('.more-reference>summary').click();await page.locator('.more-link[data-go="'+destination+'"]').click();assert.equal(await page.locator('body').getAttribute('data-view'),expected);await page.locator('[data-tab="more"]').click()}
  await page.locator('.more-backups>summary').click();await page.locator('.data-tools details>summary').click();assert(await page.locator('#restore-file').isVisible());await fits();await context.close();
 }

 // Weekly training, today's macro completion and manual sleep.
 for(const width of [320,390,430]){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,timezoneId:'America/New_York'});
  await context.addInitScript(({key,fixture})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture))},{key,fixture});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/fitness.html');
  assert.equal(await page.locator('.habit-rings .habit-item').count(),4);assert.equal(await page.locator('.overall-ring').count(),1);assert.equal(await page.locator('.sleep-open').count(),0);assert.equal(await page.locator('.home-week-days,.home-week-meter').count(),0);
  const prior=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  assert.deepEqual(await page.locator('.habit-rings .habit-item>strong').allTextContents(),['Eat','Sleep','Train','Zone']);
  assert.equal(await page.locator('.foundation-paths').count(),0);
  assert(await page.locator('.foundation-map').evaluate(map=>{const items=[...map.querySelectorAll('.habit-rings>.habit-item')].map(x=>x.getBoundingClientRect()),overall=map.querySelector('.overall-ring .habit-ring').getBoundingClientRect();return items.every(x=>Math.abs(x.top-items[0].top)<1)&&overall.top>=Math.max(...items.map(x=>x.bottom))&&Math.abs((overall.left+overall.right)/2-(map.getBoundingClientRect().left+map.getBoundingClientRect().right)/2)<2}),'Four in one row with Overall centered below');

  assert(await page.locator('.foundation-map').evaluate(map=>{const rings=[...map.querySelectorAll('.habit-ring')].map(r=>r.getBoundingClientRect());return rings.every((a,i)=>rings.every((b,j)=>i===j||a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top))}),'Five ring visuals do not overlap');
  assert(await page.locator('.foundation-map .habit-rings>.habit-item').evaluateAll(bs=>bs.every(b=>{const r=b.getBoundingClientRect();return r.width>=44&&r.height>=44})),'Corner touch targets');

  await page.locator('[data-zone="open"]').click();assert(await page.locator('#zone-checkin').evaluate(d=>d.open));
  assert(await page.locator('#zone-checkin').evaluate(d=>d.scrollWidth<=d.clientWidth+1));
  await page.locator('[data-zone="save"]').click();assert((await page.locator('[data-zone="open"]').getAttribute('aria-label')).includes('Time for yourself ✓'));
  await page.reload();assert((await page.locator('[data-zone="open"]').getAttribute('aria-label')).includes('Time for yourself ✓'));
  await page.locator('[data-zone="open"]').click();await page.locator('[data-zone="undo"]').click();
  assert((await page.locator('[data-zone="open"]').getAttribute('aria-label')).includes('Take a moment'));
  const zoneAfter=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);for(const name of ['logs','foodLog','weights','workoutDrafts','mealPlan'])assert.deepEqual(zoneAfter[name],prior[name],'Zone preserves '+name);

  await page.locator('.habit-rings [data-go="sleep"]').click();await page.locator('#sleep-hours').fill('3');await page.locator('#sleep-minutes').fill('30');await page.locator('#sleep-goal-hours').fill('7');await page.locator('#sleep-goal-minutes').fill('0');
  assert(await page.locator('#sleep-form').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
  if(width===390){await page.locator('.sleep-hero').scrollIntoViewIfNeeded();const jpg=await page.screenshot({type:'jpeg',quality:80,path:path.join(out,'sleep-form.jpg')});const b=jpg.toString('base64');if(process.env.EZPZ_VISUAL_LOG==='1')for(let i=0;i<b.length;i+=4000)console.log('EZPZ_SLEEP_FORM_DATA '+b.slice(i,i+4000))}
  await page.locator('#sleep-form button').click();assert.equal(await page.locator('.habit-rings .habit-item').nth(1).locator('b').innerText(),'50%');
  await page.reload();assert.equal(await page.locator('.habit-rings .habit-item').nth(1).locator('b').innerText(),'50%');
  await page.locator('.habit-rings .habit-item').nth(1).click();await page.locator('#sleep-hours').fill('7');await page.locator('#sleep-minutes').fill('0');await page.locator('#sleep-form button').click();
  assert.equal(await page.locator('.habit-rings .habit-item').nth(1).locator('b').innerText(),'100%');
  const after=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);for(const name of ['logs','foodLog','weights','workoutDrafts','mealPlan'])assert.deepEqual(after[name],prior[name],'Sleep preserves '+name);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(width===390){await page.locator('.home-week-card').scrollIntoViewIfNeeded();const jpg=await page.locator('.home-week-card').screenshot({type:'jpeg',quality:85,path:path.join(out,'weekly-habits.jpg')});const b=jpg.toString('base64');if(process.env.EZPZ_VISUAL_LOG==='1')for(let i=0;i<b.length;i+=4000)console.log('EZPZ_HABITS_DATA '+b.slice(i,i+4000))}
  await page.locator('.habit-rings .habit-item').nth(0).click();assert.equal(await page.locator('body').getAttribute('data-view'),'eat');
  await context.close();
 }


 // Explore the three habits without changing saved data.
 for(const width of [320,390,430]){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,timezoneId:'America/New_York'});
  const habitFixture={...fixture,sleepGoal:420,sleepLog:{[today]:210}};
  await context.addInitScript(({key,fixture})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture))},{key,fixture:habitFixture});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/fitness.html');await page.locator('[data-tab="progress"]').click();
  const before=await page.evaluate(key=>localStorage.getItem(key),key);
  for(const metric of ['training','macros','sleep']){
   await page.locator('[data-habit-metric="'+metric+'"]').click();assert.equal(await page.locator('[data-habit-metric="'+metric+'"]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('.habit-progress .consistency-week').count(),4);
   assert((await page.locator('.habit-metric-heading').innerText()).toLowerCase().includes(metric));
   assert(await page.locator('.habit-progress').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
   assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),before);
   if(width===390&&metric!=='training'){await page.locator('.habit-progress').evaluate(el=>el.scrollIntoView({block:'start'}));const jpg=await page.locator('.habit-progress').screenshot({type:'jpeg',quality:85,path:path.join(out,'habit-progress-'+metric+'.jpg')});const b=jpg.toString('base64');if(process.env.EZPZ_VISUAL_LOG==='1')for(let i=0;i<b.length;i+=4000)console.log('EZPZ_HABIT_'+metric.toUpperCase()+'_DATA '+b.slice(i,i+4000))}
  }
  await page.locator('.habit-progress [data-go="sleep"]').click();await page.locator('#sleep-form').waitFor({state:'visible'});
  await context.close();
 }


 // Weight display is optional and never deletes measurements.
 for(const width of [320,390,430]){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,timezoneId:'America/New_York'});
  await context.addInitScript(({key,fixture})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture))},{key,fixture});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/fitness.html');
  const before=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  await page.locator('.home-weight-card [data-hide-weight]').click();assert.equal(await page.locator('.home-weight-row').count(),0);
  await page.reload();assert.equal(await page.locator('.home-weight-row').count(),0);await page.getByRole('button',{name:'Show weight',exact:true}).click();assert.equal(await page.locator('.home-weight-row').count(),1);await page.locator('.home-weight-card [data-hide-weight]').click();
  await page.locator('[data-tab="progress"]').click();assert.equal(await page.locator('.weight-trend-card').count(),0);assert.equal(await page.locator('.progress-summary section').count(),2);
  await page.locator('[data-tab="more"]').click();assert.equal(await page.locator('.weight-preferences button').getAttribute('aria-pressed'),'false');
  assert(await page.locator('.weight-preferences').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
  if(width===390){await page.locator('.weight-preferences').scrollIntoViewIfNeeded();const jpg=await page.locator('.weight-preferences').screenshot({type:'jpeg',quality:85,path:path.join(out,'weight-preferences.jpg')});const b=jpg.toString('base64');if(process.env.EZPZ_VISUAL_LOG==='1')for(let i=0;i<b.length;i+=4000)console.log('EZPZ_WEIGHT_PREFERENCE_DATA '+b.slice(i,i+4000))}
  await page.locator('.weight-preferences button').click();assert.equal(await page.locator('.weight-preferences button').getAttribute('aria-pressed'),'true');
  await page.locator('[data-tab="progress"]').click();assert.equal(await page.locator('.progress-summary section').count(),3);await page.locator('.weight-trend-card [data-hide-weight]').click();assert.equal(await page.locator('.weight-trend-card').count(),0);await page.getByRole('button',{name:'Show weight',exact:true}).click();assert.equal(await page.locator('.weight-trend-card').count(),1);
  const after=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);for(const name of ['weights','logs','foodLog','mealPlan','workoutDrafts'])assert.deepEqual(after[name],before[name]);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await context.close();
 }


 // Daily diary/calendar, favourites, corrections and exercise charts.
 for(const width of [320,390,430]){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,timezoneId:'America/New_York'});
  await context.addInitScript(({key,fixture})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture))},{key,fixture});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',dialog=>dialog.accept());await page.goto(base+'/fitness.html');await page.locator('[data-tab="eat"]').click();await page.locator('[data-home-diary]>summary').click();
  const yesterday=await page.evaluate(()=>datePlus(foodDate(),-1));
  await page.locator('#diary-date').fill(yesterday);await page.locator('#diary-date').press('Tab');
  assert.equal(await page.locator('.food-log-entry').count(),0);
  await page.locator('[data-recipe-card][data-open-meal="0"]').click();await page.locator('[data-favourite-recipe="0"]').click();assert.equal(await page.locator('[data-favourite-recipe="0"]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#meal-log-date').inputValue(),yesterday);await page.locator('#meal-log-date').fill('2999-01-01');await page.locator('[data-log-food="0"]').click();assert.equal(await page.locator('body').getAttribute('data-view'),'meal');await page.locator('#meal-log-date').fill(yesterday);await page.locator('[data-log-food="0"]').click();
  assert.equal(await page.locator('.food-log-entry').count(),1);await page.locator('[data-edit-food]').click();await page.locator('.food-edit-form [name="servings"]').fill('1.5');await page.locator('.food-edit-form button.primary').click();assert.equal(await page.evaluate(()=>foodEntries().find(e=>e.date===diaryDay()).servings),1.5);
  if(width===390){const jpg=await page.locator('.food-diary').screenshot({type:'jpeg',quality:82,path:path.join(out,'daily-diary.jpg')});const b=jpg.toString('base64');if(process.env.EZPZ_VISUAL_LOG==='1')for(let i=0;i<b.length;i+=4000)console.log('EZPZ_DAILY_DIARY_DATA '+b.slice(i,i+4000))}
  await page.locator('[data-remove-food]').click();assert.equal(await page.locator('.food-log-entry').count(),0);await page.locator('[data-undo-removal]').click();assert.equal(await page.locator('.food-log-entry').count(),1);
  await page.locator('.quick-meals>summary').click();await page.locator('[data-quick-view="favourites"]').click();
  if(width===390){const jpg=await page.locator('.quick-meals').screenshot({type:'jpeg',quality:82,path:path.join(out,'daily-favourites.jpg')});const b=jpg.toString('base64');if(process.env.EZPZ_VISUAL_LOG==='1')for(let i=0;i<b.length;i+=4000)console.log('EZPZ_DAILY_FAVOURITES_DATA '+b.slice(i,i+4000))}
  await page.locator('[data-quick-recipe="0"]').click();assert.equal(await page.locator('.food-log-entry').count(),2);
  await page.locator('.custom-food-open').click();await page.locator('#custom-food-name').fill('Past day snack');for(const [key,value] of [['protein','30'],['carbs','40'],['fat','10']])await page.locator('#custom-food-'+key).fill(value);await page.locator('[name="photoKey"][value="yogurt"]').check();await page.locator('.custom-food-submit').click();assert.equal(await page.locator('.food-log-entry').count(),3);const snackId=await page.evaluate(()=>foodEntries().at(-1).id);assert.equal(await page.evaluate(()=>foodEntries().at(-1).date),yesterday);
  await page.locator('[data-diary-today]').click();assert.equal(await page.locator('.food-log-entry').count(),1);
  await page.reload();await page.locator('[data-tab="eat"]').click();await page.locator('.quick-meals>summary').click();await page.locator('[data-quick-view="favourites"]').click();assert.equal(await page.locator('[data-quick-recipe="0"]').count(),1);await page.locator('[data-quick-view="recent"]').click();await page.locator('[data-repeat-food="'+snackId+'"]').click();assert.equal(await page.evaluate(()=>foodEntries().at(-1).date),today);
  await page.locator('[data-tab="progress"]').click();assert.equal(await page.locator('.macro-history').count(),3);assert.equal(await page.locator('#progress-exercise').count(),1);await page.locator('#progress-exercise-metric').selectOption('reps');assert.equal(await page.locator('.exercise-chart').count(),1);
  if(width===390){for(const [selector,marker] of [['.macro-progress-card','MACROS'],['.exercise-progress-card','EXERCISE']]){const jpg=await page.locator(selector).screenshot({type:'jpeg',quality:82,path:path.join(out,'daily-'+marker+'.jpg')});const b=jpg.toString('base64');if(process.env.EZPZ_VISUAL_LOG==='1')for(let i=0;i<b.length;i+=4000)console.log('EZPZ_DAILY_'+marker+'_DATA '+b.slice(i,i+4000))}}
  await page.locator('.history-session').first().locator('summary').click();await page.locator('[data-edit-history]').first().click();assert.equal(await page.locator('[data-tab="progress"]').getAttribute('aria-current'),'page');await page.locator('#history-edit-form [name="r0-0"]').fill('11');await page.locator('#history-edit-form [name="w0-0"]').fill('21');
  if(width===390){const jpg=await page.locator('#history-edit-form').screenshot({type:'jpeg',quality:82,path:path.join(out,'daily-history-editor.jpg')});const b=jpg.toString('base64');if(process.env.EZPZ_VISUAL_LOG==='1')for(let i=0;i<b.length;i+=4000)console.log('EZPZ_DAILY_HISTORY_DATA '+b.slice(i,i+4000))}
  await page.locator('#history-edit-form button.primary').click();assert(await page.evaluate(()=>state.logs.some(l=>l.exercises.some(e=>e.sets.some(z=>z.reps==='11'&&z.kg==='21')))));
  await page.locator('.weight-records>summary').click();await page.locator('[data-weight-edit="0"] [name="kg"]').fill('78.5');await page.locator('[data-weight-edit="0"] button').first().click();assert.equal(await page.evaluate(()=>state.weights[0].kg),78.5);await page.locator('.weight-records>summary').click();await page.locator('[data-delete-weight="0"]').click();assert.equal(await page.evaluate(()=>state.weights.length),1);await page.locator('[data-undo-removal]').click();assert.equal(await page.evaluate(()=>state.weights.length),2);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await context.close();
 }

 const clean=await browser.newContext({viewport:{width:390,height:844}}),onboarding=await clean.newPage();onboarding.on('pageerror',e=>errors.push(e.message));await onboarding.goto(base+'/fitness.html');await onboarding.locator('[name="age"]').fill('35');await onboarding.locator('[name="weight"]').fill('80');await onboarding.locator('[name="height"]').fill('180');await onboarding.locator('#setup button').click();await onboarding.waitForFunction(()=>document.body.dataset.view==='home');await clean.close();
 if(captures.length){const sheet=await browser.newPage({viewport:{width:2528,height:570},deviceScaleFactor:1});await sheet.setContent('<html><body style="margin:0;display:flex;gap:8px;padding:8px;background:#edf0ee;font:14px sans-serif">'+captures.map(x=>'<figure style="margin:0;width:244px"><figcaption style="height:24px;text-align:center">'+x.name+'</figcaption><img style="width:244px" src="'+x.src+'"></figure>').join('')+'</body></html>');const jpg=await sheet.screenshot({type:'jpeg',quality:85,path:path.join(out,'mobile-overview.jpg')});if(process.env.EZPZ_VISUAL_LOG==='1'){console.log('EZPZ_VISUAL_BEGIN');const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_VISUAL_DATA '+b.slice(i,i+4000));console.log('EZPZ_VISUAL_END')}}

 const planningCaptures=captures.filter(x=>['Four-week-plan','Workout-builder'].includes(x.name));
 if(planningCaptures.length){const sheet=await browser.newPage({viewport:{width:800,height:900},deviceScaleFactor:1});await sheet.setContent('<html><body style="margin:0;display:flex;gap:10px;padding:10px;background:#edf0ee;font:14px sans-serif">'+planningCaptures.map(x=>'<figure style="margin:0;width:380px"><figcaption style="height:25px;text-align:center">'+x.name+'</figcaption><img style="width:380px" src="'+x.src+'"></figure>').join('')+'</body></html>');const jpg=await sheet.screenshot({type:'jpeg',quality:85,path:path.join(out,'planning-overview.jpg')});if(process.env.EZPZ_VISUAL_LOG==='1'){console.log('EZPZ_PLAN_BEGIN');const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_PLAN_DATA '+b.slice(i,i+4000));console.log('EZPZ_PLAN_END')}}

 // Welcome styling and personal name flow for new and existing users.
 for(const width of [320,390,430]){
  const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,timezoneId:'America/New_York'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/fitness.html');
  assert.equal(await page.locator('.setup-panel').count(),3);assert((await page.locator('.setup-hero').evaluate(x=>getComputedStyle(x).backgroundImage)).includes('/home-images/planning.jpg'));
  const colors=await page.locator('.setup-panel').evaluateAll(xs=>xs.map(x=>getComputedStyle(x).backgroundColor));assert.equal(new Set(colors).size,3);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Setup fits '+width);
  if(width===390)await page.screenshot({type:'jpeg',quality:85,fullPage:true,path:path.join(out,'personal-welcome-setup.jpg')});
  await page.locator('#setup-first-name').fill('Kasper');await page.locator('#setup-age').fill('35');await page.locator('#setup-weight').fill('80');await page.locator('#setup-height').fill('180');await page.locator('#setup-goal').selectOption('maintain');await page.locator('#body-units').selectOption('imperial');
  assert.equal(await page.locator('#setup-first-name').inputValue(),'Kasper');assert.equal(await page.locator('#setup-goal').inputValue(),'maintain');assert(Math.abs(Number(await page.locator('#setup-weight').inputValue())-176.37)<.001);await page.locator('#body-units').selectOption('metric');
  await page.locator('#setup button').click();await page.locator('.home-greeting').waitFor();assert.equal(await page.locator('.home-greeting').innerText(),'Kasper, you’ve got this!');assert.equal(await page.evaluate(()=>scrollY),0);assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).firstName,key),'Kasper');
  await page.reload();assert.equal(await page.locator('.home-greeting').innerText(),'Kasper, you’ve got this!');if(width===390)await page.screenshot({type:'jpeg',quality:85,path:path.join(out,'personal-welcome-home.jpg')});
  const before=await page.evaluate(key=>{const x=JSON.parse(localStorage.getItem(key));return {profile:x.profile,logs:x.logs,weights:x.weights,foodLog:x.foodLog}},key);
  await page.locator('[data-tab="more"]').click();assert.equal(await page.locator('#preferred-name').inputValue(),'Kasper');await page.locator('#preferred-name').fill('Søren');await page.locator('#name-preferences-form button').click();assert((await page.locator('#name-save-status').innerText()).includes('Name saved'));await page.locator('[data-tab="home"]').click();assert.equal(await page.locator('.home-greeting').innerText(),'Søren, you’ve got this!');
  await page.locator('[data-tab="more"]').click();await page.locator('#preferred-name').fill('A'.repeat(40));await page.locator('#name-preferences-form button').click();await page.locator('[data-tab="home"]').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Long greeting fits '+width);
  await page.locator('[data-tab="more"]').click();await page.locator('#preferred-name').fill('');await page.locator('#name-preferences-form button').click();await page.locator('[data-tab="home"]').click();assert.equal(await page.locator('.home-greeting').innerText(),'You’ve got this!');
  assert.deepEqual(await page.evaluate(key=>{const x=JSON.parse(localStorage.getItem(key));return {profile:x.profile,logs:x.logs,weights:x.weights,foodLog:x.foodLog}},key),before);await context.close();
 }

 // Training usability: unit switching, conservative suggestions, session-only swaps and recap.
 for(const width of [320,390,430]){
  const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const initial=JSON.parse(JSON.stringify(fixture));initial.logs=Array.from({length:2},(_,i)=>({date:new Date(Date.now()-(2-i)*86400000).toISOString(),workoutId:'push-a',title:'Push',exercises:[{name:'Barbell Bench Press',unit:'reps',sets:Array.from({length:3},()=>({reps:'12',kg:'40',done:true}))}]}));initial.workoutDrafts={};initial.units='imperial';initial.workoutSchedule={[new Date(Date.now()+86400000).toLocaleDateString('en-CA')]:'leg-a'};
  await context.addInitScript(({key,initial})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(initial))},{key,initial});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/fitness.html');await page.locator('[data-tab="train"]').click();
  assert((await page.locator('#training-exercise-0 .progression-hint').innerText()).includes('last two sessions'));assert((await page.locator('#training-exercise-0 .progression-hint').innerText()).includes('lb'));
  await page.locator('#training-exercise-0 .exercise-swap>summary').click();await page.locator('#swap-0').selectOption('Dumbbell Bench Press');assert.equal(await page.locator('#exercise-name-0').innerText(),'Dumbbell Bench Press');
  await page.locator('[data-set-reps="0-0"]').fill('10');await page.locator('[data-set-weight="0-0"]').fill('100');await page.locator('[data-set-done="0-0"]').check();
  let saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);assert(Math.abs(Number(saved.workoutDrafts['push-a']['sw0-0'])-45.359237)<1e-6);assert(saved.workoutDrafts['push-a'].startedAt>0);
  await page.reload();await page.locator('[data-tab="train"]').click();assert.equal(await page.locator('#exercise-name-0').innerText(),'Dumbbell Bench Press');assert.equal(await page.locator('[data-set-weight="0-0"]').inputValue(),'100');assert(await page.locator('#swap-0').isDisabled());
  await page.locator('[data-tab="more"]').click();assert.equal(await page.locator('.more-reference[open]').count(),0);assert.equal(await page.locator('.more-backups[open]').count(),0);await page.locator('#body-units').selectOption('metric');await page.locator('[data-tab="train"]').click();assert(Math.abs(Number(await page.locator('[data-set-weight="0-0"]').inputValue())-45.359237)<1e-6);
  await page.locator('[data-tab="more"]').click();await page.locator('#body-units').selectOption('imperial');await page.locator('[data-tab="train"]').click();assert.equal(await page.locator('[data-set-weight="0-0"]').inputValue(),'100');
  await page.locator('[data-action="finish"]').click();await page.locator('.session-recap').waitFor();assert((await page.locator('.session-recap').innerText()).includes('sets completed'));assert((await page.locator('.recap-next').innerText()).includes('Leg'));assert(await page.locator('.session-recap').isVisible());
  saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);assert.equal(saved.logs.length,3);assert.equal(saved.logs[2].exercises[0].name,'Dumbbell Bench Press');assert(Math.abs(Number(saved.logs[2].exercises[0].sets[0].kg)-45.359237)<1e-6);assert(!saved.workoutDrafts['push-a']);
  await page.locator('[data-dismiss-recap]').click();assert.equal(await page.locator('.session-recap').count(),0);await page.locator('[data-tab="train"]').click();assert.equal(await page.locator('#exercise-name-0').innerText(),'Barbell Bench Press');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await context.close();
 }

 const trainingCaptures=captures.filter(x=>['Upcoming workouts','Train overview','Focused training'].includes(x.name));
 if(trainingCaptures.length){const sheet=await browser.newPage({viewport:{width:1200,height:920},deviceScaleFactor:1});await sheet.setContent('<html><body style="margin:0;display:flex;gap:10px;padding:10px;background:#edf0ee;font:14px sans-serif">'+trainingCaptures.map(x=>'<figure style="margin:0;width:380px"><figcaption style="height:25px;text-align:center">'+x.name+'</figcaption><img style="width:380px" src="'+x.src+'"></figure>').join('')+'</body></html>');const jpg=await sheet.screenshot({type:'jpeg',quality:85,path:path.join(out,'training-overview.jpg')});if(process.env.EZPZ_VISUAL_LOG==='1'){console.log('EZPZ_TRAIN_BEGIN');const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_TRAIN_DATA '+b.slice(i,i+4000));console.log('EZPZ_TRAIN_END')}}


 const pickerCaptures=captures.filter(x=>['Planner workout categories','Planner workout choices','Planner meal picker'].includes(x.name));
 if(pickerCaptures.length){const sheet=await browser.newPage({viewport:{width:1200,height:920},deviceScaleFactor:1});await sheet.setContent('<html><body style="margin:0;display:flex;gap:10px;padding:10px;background:#edf0ee;font:14px sans-serif">'+pickerCaptures.map(x=>'<figure style="margin:0;width:380px"><figcaption style="height:25px;text-align:center">'+x.name+'</figcaption><img style="width:380px" src="'+x.src+'"></figure>').join('')+'</body></html>');const jpg=await sheet.screenshot({type:'jpeg',quality:85,path:path.join(out,'planner-picker-overview.jpg')});if(process.env.EZPZ_VISUAL_LOG==='1'){console.log('EZPZ_PICKER_BEGIN');const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_PICKER_DATA '+b.slice(i,i+4000));console.log('EZPZ_PICKER_END')}}


 const ownCaptures=captures.filter(x=>['Create your own','Your saved workouts','Train your own'].includes(x.name));
 if(ownCaptures.length){const sheet=await browser.newPage({viewport:{width:1200,height:920},deviceScaleFactor:1});await sheet.setContent('<html><body style="margin:0;display:flex;gap:10px;padding:10px;background:#edf0ee;font:14px sans-serif>'+ownCaptures.map(x=>'<figure style="margin:0;width:380px"><figcaption style="height:25px;text-align:center">'+x.name+'</figcaption><img style="width:380px" src="'+x.src+'"></figure>').join('')+'</body></html>');const jpg=await sheet.screenshot({type:'jpeg',quality:85,path:path.join(out,'own-workouts-overview.jpg')});if(process.env.EZPZ_VISUAL_LOG==='1'){const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_OWN_DATA '+b.slice(i,i+4000));}}


 const mealCaptures=captures.filter(x=>x.name.startsWith('Meals-'));
 if(mealCaptures.length){const sheet=await browser.newPage({viewport:{width:1200,height:720},deviceScaleFactor:1});await sheet.setContent('<html><body style="margin:0;display:flex;gap:8px;padding:8px;background:#edf0ee;font:12px sans-serif">'+mealCaptures.map(x=>'<figure style="margin:0;width:288px"><figcaption style="height:22px;text-align:center">'+x.name+'</figcaption><img style="width:288px" src="'+x.src+'"></figure>').join('')+'</body></html>');const jpg=await sheet.screenshot({type:'jpeg',quality:75,path:path.join(out,'meal-sections-overview.jpg')});const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_MEALS_DATA '+b.slice(i,i+4000))}

 const homeCaptures=captures.filter(x=>['Home','Home nutrition','Home week','Home next','Home weight'].includes(x.name));
 if(homeCaptures.length){const sheet=await browser.newPage({viewport:{width:1560,height:760},deviceScaleFactor:1});await sheet.setContent('<html><body style="margin:0;display:flex;gap:8px;padding:8px;background:#edf1ed;font:12px sans-serif">'+homeCaptures.map(x=>'<figure style="margin:0;width:300px"><figcaption style="height:22px;text-align:center">'+x.name+'</figcaption><img style="width:300px" src="'+x.src+'"></figure>').join('')+'</body></html>');const jpg=await sheet.screenshot({type:'jpeg',quality:82,path:path.join(out,'home-visual-overhaul.jpg')});const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_HOME_DATA '+b.slice(i,i+4000))}

 const trainPhotoCaptures=captures.filter(x=>x.name.startsWith('Train photo')||x.name==='Kettlebell foundations');
 if(trainPhotoCaptures.length){const sheet=await browser.newPage({viewport:{width:1860,height:1100},deviceScaleFactor:1});await sheet.setContent('<html><body style="margin:0;display:flex;gap:8px;padding:8px;background:#edf2ee;font:12px sans-serif">'+trainPhotoCaptures.map(x=>'<figure style="margin:0;width:300px"><figcaption style="height:22px;text-align:center">'+x.name+'</figcaption><img style="width:300px" src="'+x.src+'"></figure>').join('')+'</body></html>');const jpg=await sheet.screenshot({type:'jpeg',quality:83,path:path.join(out,'train-photo-overview.jpg')});const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_TRAIN_PHOTO_DATA '+b.slice(i,i+4000))}
 const moreCaptures=captures.filter(x=>x.name.startsWith('More '));
 if(moreCaptures.length){const sheet=await browser.newPage({viewport:{width:1450,height:1100},deviceScaleFactor:1});await sheet.setContent('<html><body style="margin:0;display:flex;gap:10px;padding:10px;background:#edf2ee;font:12px sans-serif">'+moreCaptures.map(x=>'<figure style="margin:0;width:350px"><figcaption style="height:24px">'+x.name+'</figcaption><img style="width:350px" src="'+x.src+'"></figure>').join('')+'</body></html>');const jpg=await sheet.screenshot({type:'jpeg',quality:85,path:path.join(out,'more-visual-overhaul.jpg')});const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_MORE_PHOTO_DATA '+b.slice(i,i+4000))}
 const myPlanCaptures=captures.filter(x=>x.name.startsWith('My Plan '));
 if(myPlanCaptures.length){const sheet=await browser.newPage({viewport:{width:1710,height:1600},deviceScaleFactor:1});await sheet.setContent('<html><body style="margin:0;display:flex;gap:10px;padding:10px;background:#edf2ee;font:12px sans-serif">'+myPlanCaptures.map(x=>'<figure style="margin:0;width:330px"><figcaption style="height:24px">'+x.name+'</figcaption><img style="width:330px" src="'+x.src+'"></figure>').join('')+'</body></html>');const jpg=await sheet.screenshot({type:'jpeg',quality:85,path:path.join(out,'my-plan-visual-overhaul.jpg')});const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_MY_PLAN_DATA '+b.slice(i,i+4000))}
 const nutritionCaptures=captures.filter(x=>x.name.startsWith('Nutrition '));
 if(nutritionCaptures.length){const sheet=await browser.newPage({viewport:{width:1808,height:1600},deviceScaleFactor:1});await sheet.setContent('<html><body style="margin:0;display:flex;gap:10px;padding:10px;background:#edf2ee;font:12px sans-serif">'+nutritionCaptures.map(x=>'<figure style="margin:0;width:350px"><figcaption style="height:24px">'+x.name+'</figcaption><img style="width:350px" src="'+x.src+'"></figure>').join('')+'</body></html>');const jpg=await sheet.screenshot({type:'jpeg',quality:85,path:path.join(out,'nutrition-controls-overview.jpg')});const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_NUTRITION_TARGETS_DATA '+b.slice(i,i+4000))}
 const customPhotos=captures.filter(x=>x.name.startsWith('Custom food'));
 if(customPhotos.length){const sheet=await browser.newPage({viewport:{width:820,height:1500},deviceScaleFactor:1});await sheet.setContent('<html><body style="margin:0;display:flex;gap:10px;padding:10px;background:#edf2ee;font:12px sans-serif">'+customPhotos.map(x=>'<figure style="margin:0;width:390px"><figcaption style="height:24px">'+x.name+'</figcaption><img style="width:390px" src="'+x.src+'"></figure>').join('')+'</body></html>');const jpg=await sheet.screenshot({type:'jpeg',quality:85,path:path.join(out,'custom-food-overview.jpg')});const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_CUSTOM_FOOD_DATA '+b.slice(i,i+4000))}
 const foodLogPhotos=captures.filter(x=>x.name==='Food log photos');
 if(foodLogPhotos.length){const sheet=await browser.newPage({viewport:{width:430,height:1000},deviceScaleFactor:1});await sheet.setContent('<html><body style="margin:0;padding:12px;background:#edf2ee">'+foodLogPhotos.map(x=>'<img style="width:406px" src="'+x.src+'">').join('')+'</body></html>');const jpg=await sheet.screenshot({type:'jpeg',quality:85,path:path.join(out,'food-log-review.jpg')});const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_FOOD_LOG_DATA '+b.slice(i,i+4000))}
 const progressPhotos=captures.filter(x=>x.name.startsWith('Progress photo'));
 if(progressPhotos.length){const sheet=await browser.newPage({viewport:{width:1648,height:1000},deviceScaleFactor:1});await sheet.setContent('<html><body style="margin:0;display:flex;gap:8px;padding:8px;background:#edf2ee;font:12px sans-serif">'+progressPhotos.map(x=>'<figure style="margin:0;width:320px"><figcaption style="height:24px;text-align:center">'+x.name+'</figcaption><img style="width:320px" src="'+x.src+'"></figure>').join('')+'</body></html>');const jpg=await sheet.screenshot({type:'jpeg',quality:85,path:path.join(out,'progress-photos.jpg')});const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_PROGRESS_PHOTO_DATA '+b.slice(i,i+4000))}
 assert.deepEqual(errors,[],'Browser errors');fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify({passed:true,widths:[320,390,430],recipes:157,workoutPrograms:65,upgradedUI:expectUpgrade,browserErrors:errors},null,2));console.log('PASS: Chromium at 320/390/430px; 157 recipe photos; 65 workout programs; draft persistence; set logging; history; navigation; exercise search; onboarding'+(expectUpgrade?'; complete backup restoration':''));
}finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});







