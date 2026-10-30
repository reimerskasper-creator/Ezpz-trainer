Warning: truncated output (original token count: 29644)
Total output lines: 725

// Real Chromium mobile checks. Run: npm install --no-save playwright@1.64.1 && node tests/mobile.cjs
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const expectUpgrade=true;
const root=path.resolve(__dirname,'..'),out=path.join(root,'test-results');fs.mkdirSync(out,{recursive:true});
const mime={'.js':'application/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'};
const server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(pathname==='/'?'/fitness.html':pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}fs.readFile(file,(e,b)=>{if(e){res.writeHead(404);res.end('Not found');return}res.setHeader('Content-Type',mime[path.extname(file)]||'text/plain');res.end(b)})});
const key='ezpz-fitness-pilot-1',errors=[],captures=[];
const today=new Date().toLocaleDateString('en-CA',{timeZone:'America/New_York'});
const fixture={profile:{goal:'maintain',level:'Beginner',equipment:'home',days:3,age:35,weight:80,height:180,sex:'male'},logs:Array.from({length:24},(_,i)=>({date:new Date(Date.now()-(24-i)*86400000).toISOString(),workoutId:'push-a',title:'Push Day A',type:'home',setting:'Gym',variant:'A',exercises:[{name:'Barbell Bench Press',unit:'reps',sets:[{reps:'8',kg:'18',done:true}]}]})),weights:[{date:new Date(Date.now()-86400000*7).toISOString(),kg:81},{date:new Date().toISOString(),kg:80}],shopping:['Tomatoes (raw) — 100 g'],checkedShopping:{'Tomatoes (raw)':true},foodLog:[{id:'existing-meal',date:today,name:'Chicken rice bowl',servings:1,macros:[622,55,62,17]}],mealPlan:{[today]:{lunch:1,lunchPortion:1.5,dinner:48,dinnerPortion:1}},mealPlanOffset:0,selectedWorkout:'push-a',workoutDrafts:{'glutes-foundation':{'sr0-0':'12','sd0-0':true},'pull-a':{'sr0-0':'9','sw0-0':'15','sd0-0':true}},draft:{variant:'A',equipment:'home','sr0-0':'8','sd0-0':true},workoutLayoutVersion:2};

async function choosePlannedWorkout(page,id){
 if(await page.locator('[data-plan-mode=day]').isVisible())await page.locator('[data-plan-mode=day]').click();
 await page.locator('#planned-workout').click();await page.locator('#planner-picker').waitFor({state:'visible'});
 if(id==='rest'||id===''){await page.locator('[data-plan-picker-action="'+(id==='rest'?'rest':'clear')+'"]').click();return}
 await page.locator('#planner-picker-search').fill(id);await page.locator('[data-plan-pick-workout="'+id+'"]').click();
 await page.locator('#planner-picker').waitFor({state:'hidden'});
}
async function choosePlannedMeal(page,slot,index){
 if(await page.locator('[data-plan-mode=day]').isVisible())await page.locator('[data-plan-mode=day]').click();
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
  assert(await page.locator('.home-week-card').evaluate(el=>!!(el.compareDocumentPosition(document.querySelector('.home-workout'))&Node.DOCUMENT_POSITION_FOLLOWING)),'Overview precedes workout');
  assert(await page.locator('.home-week-card .habit-rings').evaluate(el=>el.getBoundingClientRect().bottom<=innerHeight-80),'Four rings visible on opening');
  await page.locator('.overview-actions [data-go="custom-food"]').click();assert.equal(await page.locator('body').getAttribute('data-view'),'custom-food');
  await page.locator('[data-tab="home"]').click();await page.locator('[data-overview-workout]').click();assert.equal(await page.locator('body').getAttribute('data-view'),'train');
  await page.locator('[data-tab="home"]').click();
  assert(await page.locator('.overview-foundations').isVisible(),'Foundations discoverable beside overview');
  assert(await page.locator('.overview-foundations').evaluate(el=>{const a=el.getBoundingClientRect(),b=document.querySelector('[data-home-panel=overview]').getBoundingClientRect();return a.right<=b.left+1&&a.width>=44&&a.height>=44}),'Overview controls fit without overlap');
  const mealPlanBefore=await page.evaluate(()=>JSON.stringify({plan:state.mealPlan,food:state.foodLog}));
  assert.equal(await page.locator('.home-meals .meal-upcoming-row').count(),2);
  assert((await page.locator('.home-meals .meal-upcoming-row').first().innerText()).includes('Lunch'));
  await page.locator('[data-home-meals="week"]').click();assert.equal(await page.locator('.meal-upcoming-day').count(),7);
  await page.locator('.home-meals .meal-upcoming-row').first().click();assert.equal(await page.locator('body').getAttribute('data-view'),'planner');
  assert.equal(await page.locator('[data-schedule-portion="lunch"]').inputValue(),'1.5');
  assert.equal(await page.evaluate(()=>JSON.stringify({plan:state.mealPlan,food:state.foodLog})),mealPlanBefore,'Opening upcoming meal preserves plan and food diary');
  await page.locator('[data-tab="home"]').click();await page.locator('[data-home-meals="next"]').click();await checkLayout('Upcoming meals');
  if(width===390)await page.locator('.home-meals').screenshot({path:path.join(out,'home-next-meals.jpg'),type:'jpeg',quality:85});
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
  if(width===390){for(const [selector,file] of [['.home-nutrition','nutrition'],['.home-week-card','zone-woodland'],['.home-next','planning'],['.home-weight-row','weight']]){const image=await page.locator(selector).evaluate(el=>getComputedStyle(el).backgroundImage);assert(image.includes('/home-images/'+file+'.jpg'),'Relevant Home background '+file);const response=await context.request.get(base+'/home-images/'+file+'.jpg');assert.equal(response.status(),200,'Home photo available '+file);}}
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

  assert(await page.locator('.food-diary-overview>progress').evaluate(x=>{const p=x.parentElement,style=getComputedStyle(p);return Math.abs(x.getBoundingClientRect().width-(p.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)))<2}),'Food progress fills diary');
  for(const entry of await page.locator('.food-log-entry').all()){
   assert(await entry.evaluate(x=>{const name=x.querySelector('.food-log-copy'),detail=name.querySelector('small'),button=x.querySelector('.food-log-actions>summary'),a=name.getBoundingClientRect(),b=button.getBoundingClientRect();return getComputedStyle(detail).display==='block'&&a.right<=b.left&&b.height>=44}),'Meal details separated and action menu aligned');
  }
  await page.locator('[data-home-diary]').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,'Logged-food-'+width+'.jpg'),type:'jpeg',quality:85});

  await page.evaluate(()=>{tab='train';render()});
  assert.equal(await page.locator('.training-options[open]').count(),0,'Secondary controls start closed');
  assert.equal(await page.locator('.exercise-jump-list').count(),0,'Exercise picker replaces the carousel');
  assert(await page.locator('[data-set-reps="0-0"]').isVisible(),'Current exercise is directly usable');
  assert((await page.locator('.compact-training-meta').innerText()).includes('exercises'));
  await checkLayout('Train color harmony');
  if(await page.locator('.training-options').count()&&!await page.locator('[data-action="open-workouts"]').isVisible())await page.locator('.training-options>summary').click();await page.locator('[data-action="open-workouts"]').click();assert.equal(await page.locator('#workout-chooser .category-grid img').count(),13);
  const coverSources=await page.locator('#workout-chooser .category-grid img').evaluateAll(xs=>xs.map(x=>x.getAttribute('src')));
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
   if(await page.locator('.training-options').count()&&!await page.locator('[data-action="open-workouts"]').isVisible())await page.locator('.training-options>summary').click();await page.locator('[data-action="open-workouts"]').click();
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
    await page.locator('[data-action="workout-categories"]').click();assert.equal(await page.locator('[data-workout-category]:not([data-workout-category=mine])').count(),12);await page.locator('[data-workout-category="Full Body"]').click();
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
   await page.waitForFunction(id=>JSON.parse(localStorage.getItem('ezpz-fitness-pilot-1')).selectedWorkout===id,id);if(await page.locator('body').getAttribute('data-view')==='home')await page.locator('[data-home-start]').click();
   assert(await page.locator('[data-set-reps]').count()>=6,'Workout fields '+id);
   assert.equal(await page.locator('.workout-trigger-photo img').getAttribute('src'),info.photo,'Selected training photo '+id);
   assert((await page.locator('.training-header').evaluate(el=>getComputedStyle(el).backgroundImage)).includes(info.photo.replace('./','/')),'Photo header follows '+id);
   const photos=await page.locator('.training-exercise').evaluateAll(xs=>xs.map(x=>x.style.getPropertyValue('--exercise-cover')));
   assert.equal(new Set(photos).size,photos.length,'Distinct exercise photos '+id);
   if(id==='kb-foundations'&&width===390){await capture('Kettlebell foundations')}
   if(id==='kb-conditioning')assert.equal(await page.locator('[data-set-weight]').count(),12,'Timed kettlebell sets support kg logging');
   assert.equal(await page.locator('[data-exercise-pick]').count(),photos.length,'Every exercise is in the compact selector '+id);
   await checkLayout(id);
  }
  // New programs preserve their own draft alongside existing A/B drafts.
  await page.locator('[data-set-reps="0-0"]').fill('11');await page.locator('[data-set-done="0-0"]').check();
  await page.reload();await page.evaluate(()=>{tab='train';render()});assert.equal(await page.locator('[data-set-reps="0-0"]').inputValue(),'11');
  await page.locator('[data-tab="home"]').click();assert.equal(await page.locator('.home-workout>img').getAttribute('src'),'./workout-images/neutral-kettlebell-2.jpg');await page.locator('.home-workout>img').evaluate(x=>x.decode());await capture('Selected workout');await page.evaluate(()=>{tab='train';render()});
  if(await page.locator('.training-options').count()&&!await page.locator('[data-action="open-workouts"]').isVisible())await page.locator('.training-options>summary').click();await page.locator('[data-action="open-workouts"]').click();await page.locator('[data-workout-category="Push"]').click();await page.locator('[data-workout-pick="push-a"]').click();
  await page.locator('[data-set-reps="0-0"]').fill('10');await page.locator('[data-set-weight="0-0"]').fill('20');await page.locator('[data-set-done="0-0"]').check();await capture('Train');
  assert((await page.locator('.training-header').evaluate(el=>getComputedStyle(el).backgroundImage)).includes('/workout-images/neutral-push-1.jpg'),'Train hero follows chosen workout');
  if(width===390){const storageBefore=await page.evaluate(key=>localStorage.getItem(key),key);for(const [selector,name] of [['.training-header','Train photo header'],['.workout-progress-card','Train photo progress'],['.training-exercise[open]','Train photo logger'],['.session-footer','Train photo footer']]){const el=page.locator(selector).first();await el.evaluate(x=>x.scrollIntoView({block:'start',behavior:'instant'}));await checkLayout(name);const jpg=await el.screenshot({type:'jpeg',quality:85,path:path.join(out,name.replaceAll(' ','-')+'-'+width+'.jpg')});captures.push({name,src:'data:image/jpeg;base64,'+jpg.toString('base64')});}assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),storageBefore,'Train photo review must preserve drafts');}
  await page.reload();await page.evaluate(()=>{tab='train';render()});assert.equal(await page.locator('[data-set-reps="0-0"]').inputValue(),'10');assert(await page.locator('[data-set-done="0-0"]').isChecked());
  if(expectUpgrade){await page.waitForFunction(()=>{const b=document.querySelector('[data-set-done="0-0"]')?.getBoundingClientRect();return b&&b.width>=44&&b.height>=44});await page.locator('#exercise-tools-0>summary').click();assert((await page.locator('#exercise-tools-0 .previous-results').innerText()).includes('18 kg'),'Previous set comparison');await page.locator('#exercise-tools-0>summary').click();const finish=await page.locator('.session-footer').boundingBox(),nav=await page.locator('.nav').boundingBox();assert(finish.y+finish.height<=nav.y+1,'Finish bar overlaps navigation')}
  await page.locator('[data-action="finish"]').click();await page.waitForFunction(()=>document.body.dataset.view==='progress');assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).logs.length,key),25);await checkLayout('Progress');await capture('Progress');await page.locator('.progress-archive>summary').click();
  const progressBefore=await page.evaluate(key=>localStorage.getItem(key),key);
  const summaryPhotos=await page.locator('.progress-summary>section').evaluateAll(xs=>xs.map(x=>getComputedStyle(x).backgroundImage));assert(summaryPhotos.every(x=>x==='none'),'Progress metrics use approved forest cards');
  assert((await page.locator('.history-session').first().evaluate(x=>getComputedStyle(x.querySelector('summary')).backgroundImage)).includes('/workout-images/neutral-push-1.jpg'),'History photo matches the logged workout');
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
  if(expectUpgrade){const openArchive=()=>page.locator('.progress-archive').evaluate(el=>{el.open=true;el.dispatchEvent(new Event('toggle'))});assert.equal(await page.locator('.history-session').count(),12);await openArchive();await page.locator('[data-action="more-history"]').click();assert.equal(await page.locator('.history-session').count(),24);await openArchive();await page.locator('[data-action="more-history"]').click();assert.equal(await page.locator('.history-session').count(),25)}
  const moreTab=expectUpgrade?'more':'shopping';await page.locator('[data-tab="'+moreTab+'"]').click();await checkLayout('More');await capture('More');
  assert.equal(await page.locator('.more-reference').count(),0);await page.evaluate(()=>{tab='train';render()});await page.locator('.training-options>summary').click();await page.locator('.training-options [data-go="library"]').click();await page.locator('.library-tile').first().waitFor();assert.equal(await page.locator('.library-tile').count(),100);if(expectUpgrade){const tile=page.locator('.library-tile').first(),icon=await tile.locator('.workout-category-icon').boundingBox(),title=await tile.locator('strong').boundingBox();assert(title.x>=icon.x+icon.width+8,'Exercise library must use horizontal rows');assert((await tile.boundingBox()).height<=110,'Library row too tall')}await checkLayout('Library');await capture('Library');
  await page.locator('#library-search').fill('bench');assert(await page.locator('.library-tile').count()>0);await page.locator('.library-tile').first().click();await checkLayout('Exercise guide');assert((await page.locator('#screen').innerText()).includes('Lie'));
  if(expectUpgrade){await page.locator('[data-tab="more"]').click();await page.locator('.profile-preferences').evaluate(x=>x.open=true);await page.locator('.more-backups>summary').click();await page.locator('.data-tools summary').click();await page.locator('#restore-file').setInputFiles({name:'ezpz-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});await page.locator('[data-action="restore"]').click();await page.waitForFunction(()=>document.body.dataset.view==='home');const restored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);assert.deepEqual(restored.foodLog,fixture.foodLog);assert.deepEqual(restored.mealPlan,fixture.mealPlan);assert.deepEqual(restored.checkedShopping,fixture.checkedShopping);assert.deepEqual(restored.draft,fixture.draft);assert.deepEqual(restored.workoutDrafts,fixture.workoutDrafts);assert.equal(restored.logs.length,24)}

  // Plan single days through four weeks using the real UI.
  await page.locator('[data-tab="more"]').click();await page.locator('.profile-preferences').evaluate(x=>x.open=true);await page.locator('[data-go="planner"]').click();if(await page.locator('[data-plan-mode=day]').isVisible())await page.locator('[data-plan-mode=day]').click();
  for(const span of [1,7,14,21,28]){
   await page.locator('#planner-span').evaluate(el=>{for(let d=el.parentElement;d;d=d.parentElement)if(d.tagName==="DETAILS")d.open=true});await page.locator('#planner-span').selectOption(String(span));
   assert.equal(await page.locator('[data-planner-offset]').count(),Math.min(7,span));
   assert.equal(await page.locator('[data-plan-week]').count(),span>7?span/7:0);
   await checkLayout('Planner '+span);
  }
  await page.locator('#planner-start').evaluate(el=>{for(let d=el.parentElement;d;d=d.parentElement)if(d.tagName==="DETAILS")d.open=true});await page.locator('#planner-start').fill(today);await page.locator('#planner-start').dispatchEvent('change');
  await choosePlannedWorkout(page,'full-body-home');
  assert((await page.locator('.planned-workout-preview').innerText()).includes('Beginner'));
  await choosePlannedMeal(page,'breakfast',0);
  await page.locator('[data-schedul…13644 tokens truncated…
  const habitFixture={...fixture,sleepGoal:420,sleepLog:{[today]:210}};
  await context.addInitScript(({key,fixture})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture))},{key,fixture:habitFixture});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/fitness.html');await page.locator('[data-tab="home"]').click();await page.locator('[data-go="progress"]').first().click();await page.locator('.progress-archive').evaluate(el=>{el.open=true;el.dispatchEvent(new Event('toggle'))});
  const before=await page.evaluate(key=>localStorage.getItem(key),key);
  for(const metric of ['training','macros','sleep']){
   await page.locator('[data-habit-metric="'+metric+'"]').click();assert.equal(await page.locator('[data-habit-metric="'+metric+'"]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('.habit-progress .consistency-week').count(),4);
   assert((await page.locator('.habit-metric-heading').innerText()).toLowerCase().includes(metric));
   assert(await page.locator('.habit-progress').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
   assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),before);
   if(width===390&&metric!=='training'){await page.locator('.habit-progress').evaluate(el=>el.scrollIntoView({block:'start'}));const jpg=await page.locator('.habit-progress').screenshot({type:'jpeg',quality:85,path:path.join(out,'habit-progress-'+metric+'.jpg')});const b=jpg.toString('base64');if(process.env.EZPZ_VISUAL_LOG==='1')for(let i=0;i<b.length;i+=4000)console.log('EZPZ_HABIT_'+metric.toUpperCase()+'_DATA '+b.slice(i,i+4000))}
  }
  await page.locator('.habit-progress [data-go="sleep"]').click();assert.equal(await page.locator('#sleep-form').isVisible(),false);await page.locator('[data-open-sleep-editor]').click();await page.locator('#sleep-form').waitFor({state:'visible'});
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
  await page.locator('[data-tab="home"]').click();await page.locator('[data-go="progress"]').first().click();await page.locator('.progress-archive').evaluate(el=>{el.open=true;el.dispatchEvent(new Event('toggle'))});assert.equal(await page.locator('.weight-trend-card').count(),0);assert.equal(await page.locator('.progress-summary section').count(),2);
  await page.locator('[data-tab="more"]').click();await page.locator('.profile-preferences').evaluate(x=>x.open=true);assert.equal(await page.locator('.weight-preferences button').getAttribute('aria-pressed'),'false');
  assert(await page.locator('.weight-preferences').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
  if(width===390){await page.locator('.weight-preferences').scrollIntoViewIfNeeded();const jpg=await page.locator('.weight-preferences').screenshot({type:'jpeg',quality:85,path:path.join(out,'weight-preferences.jpg')});const b=jpg.toString('base64');if(process.env.EZPZ_VISUAL_LOG==='1')for(let i=0;i<b.length;i+=4000)console.log('EZPZ_WEIGHT_PREFERENCE_DATA '+b.slice(i,i+4000))}
  await page.locator('.weight-preferences button').click();assert.equal(await page.locator('.weight-preferences button').getAttribute('aria-pressed'),'true');
  await page.locator('[data-tab="home"]').click();await page.locator('[data-go="progress"]').first().click();await page.locator('.progress-archive').evaluate(el=>{el.open=true;el.dispatchEvent(new Event('toggle'))});assert.equal(await page.locator('.progress-summary section').count(),3);await page.locator('.weight-trend-card [data-hide-weight]').click();assert.equal(await page.locator('.weight-trend-card').count(),0);await page.getByRole('button',{name:'Show weight',exact:true}).click();assert.equal(await page.locator('.weight-trend-card').count(),1);
  const after=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);for(const name of ['weights','logs','foodLog','mealPlan','workoutDrafts'])assert.deepEqual(after[name],before[name]);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await context.close();
 }


 // Daily diary/calendar, favourites, corrections and exercise charts.
 for(const width of [320,390,430]){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,timezoneId:'America/New_York'});
  await context.addInitScript(({key,fixture})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture))},{key,fixture});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',dialog=>dialog.accept());await page.goto(base+'/fitness.html');await page.locator('[data-tab="eat"]').click();await page.locator('[data-home-diary]').evaluate(x=>x.open=true);
  const yesterday=await page.evaluate(()=>datePlus(foodDate(),-1));
  await page.locator('#diary-date').fill(yesterday);await page.locator('#diary-date').press('Tab');
  assert.equal(await page.locator('.food-log-entry').count(),0);
  await page.locator('[data-recipe-card][data-open-meal="0"]').click();await page.locator('[data-favourite-recipe="0"]').click();assert.equal(await page.locator('[data-favourite-recipe="0"]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#meal-log-date').inputValue(),yesterday);await page.locator('#meal-log-date').fill('2999-01-01');await page.locator('[data-log-food="0"]').click();assert.equal(await page.locator('body').getAttribute('data-view'),'meal');await page.locator('#meal-log-date').fill(yesterday);await page.locator('[data-log-food="0"]').click();
  assert.equal(await page.locator('.food-log-entry').count(),1);await page.locator('[data-edit-food]').evaluate(el=>{const menu=el.closest('details.food-log-actions');if(menu&&!menu.open)menu.querySelector('summary').click()});await page.locator('[data-edit-food]').evaluate(el=>{const menu=el.closest('details.food-log-actions');if(menu&&!menu.open)menu.querySelector('summary').click()});await page.locator('[data-edit-food]').click();await page.locator('.food-edit-form [name="servings"]').fill('1.5');await page.locator('.food-edit-form button.primary').click();assert.equal(await page.evaluate(()=>foodEntries().find(e=>e.date===diaryDay()).servings),1.5);
  if(width===390){const jpg=await page.locator('.food-diary').screenshot({type:'jpeg',quality:82,path:path.join(out,'daily-diary.jpg')});const b=jpg.toString('base64');if(process.env.EZPZ_VISUAL_LOG==='1')for(let i=0;i<b.length;i+=4000)console.log('EZPZ_DAILY_DIARY_DATA '+b.slice(i,i+4000))}
  await page.locator('[data-remove-food]').evaluate(el=>{const menu=el.closest('details.food-log-actions');if(menu&&!menu.open)menu.querySelector('summary').click()});await page.locator('[data-remove-food]').evaluate(el=>{const menu=el.closest('details.food-log-actions');if(menu&&!menu.open)menu.querySelector('summary').click()});await page.locator('[data-remove-food]').click();assert.equal(await page.locator('.food-log-entry').count(),0);await page.locator('[data-undo-removal]').click();assert.equal(await page.locator('.food-log-entry').count(),1);
  await page.locator('.quick-meals>summary').click();await page.locator('[data-quick-view="favourites"]').click();
  if(width===390){const jpg=await page.locator('.quick-meals').screenshot({type:'jpeg',quality:82,path:path.join(out,'daily-favourites.jpg')});const b=jpg.toString('base64');if(process.env.EZPZ_VISUAL_LOG==='1')for(let i=0;i<b.length;i+=4000)console.log('EZPZ_DAILY_FAVOURITES_DATA '+b.slice(i,i+4000))}
  await page.locator('[data-quick-recipe="0"]').click();assert.equal(await page.locator('.food-log-entry').count(),2);
  await page.locator('.diary-log-next').click();await page.locator('.manual-food-entry').evaluate(e=>e.open=true);await page.locator('#custom-food-name').fill('Past day snack');for(const [key,value] of [['protein','30'],['carbs','40'],['fat','10']])await page.locator('#custom-food-'+key).fill(value);await page.locator('.custom-food-photo-choice').evaluate(x=>x.open=true);await page.locator('[name="photoKey"][value="yogurt"]').check();await page.locator('.custom-food-submit').click();assert.equal(await page.locator('.food-log-entry').count(),3);const snackId=await page.evaluate(()=>foodEntries().at(-1).id);assert.equal(await page.evaluate(()=>foodEntries().at(-1).date),yesterday);
  await page.locator('[data-diary-today]').click();assert.equal(await page.locator('.food-log-entry').count(),1);
  await page.reload();await page.locator('[data-tab="eat"]').click();await page.locator('.quick-meals>summary').click();await page.locator('[data-quick-view="favourites"]').click();assert.equal(await page.locator('[data-quick-recipe="0"]').count(),1);await page.locator('[data-quick-view="recent"]').click();await page.locator('[data-repeat-food="'+snackId+'"]').click();assert.equal(await page.evaluate(()=>foodEntries().at(-1).date),today);
  await page.locator('[data-tab="home"]').click();await page.locator('[data-go="progress"]').first().click();await page.locator('.progress-archive').evaluate(el=>{el.open=true;el.dispatchEvent(new Event('toggle'))});assert.equal(await page.locator('.macro-history').count(),3);assert.equal(await page.locator('#progress-exercise').count(),1);await page.locator('#progress-exercise-metric').selectOption('reps');assert.equal(await page.locator('.exercise-chart').count(),1);
  if(width===390){for(const [selector,marker] of [['.macro-progress-card','MACROS'],['.exercise-progress-card','EXERCISE']]){const jpg=await page.locator(selector).screenshot({type:'jpeg',quality:82,path:path.join(out,'daily-'+marker+'.jpg')});const b=jpg.toString('base64');if(process.env.EZPZ_VISUAL_LOG==='1')for(let i=0;i<b.length;i+=4000)console.log('EZPZ_DAILY_'+marker+'_DATA '+b.slice(i,i+4000))}}
  await page.locator('.history-session').first().locator('summary').click();await page.locator('[data-edit-history]').first().click();assert.equal(await page.locator('body').getAttribute('data-view'),'history-edit');await page.locator('#history-edit-form [name="r0-0"]').fill('11');await page.locator('#history-edit-form [name="w0-0"]').fill('21');
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
  const colors=await page.locator('.setup-panel').evaluateAll(xs=>xs.map(x=>getComputedStyle(x).backgroundColor));assert(colors.every(x=>x==='rgb(21, 61, 45)'),'Setup uses shared forest cards');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Setup fits '+width);
  if(width===390)await page.screenshot({type:'jpeg',quality:85,fullPage:true,path:path.join(out,'personal-welcome-setup.jpg')});
  await page.locator('#setup-first-name').fill('Kasper');await page.locator('#setup-age').fill('35');await page.locator('#setup-weight').fill('80');await page.locator('#setup-height').fill('180');await page.locator('#setup-goal').selectOption('maintain');await page.locator('#body-units').selectOption('imperial');
  assert.equal(await page.locator('#setup-first-name').inputValue(),'Kasper');assert.equal(await page.locator('#setup-goal').inputValue(),'maintain');assert(Math.abs(Number(await page.locator('#setup-weight').inputValue())-176.37)<.001);await page.locator('#body-units').selectOption('metric');
  await page.locator('#setup button').click();await page.locator('.home-greeting').waitFor();assert.equal(await page.locator('.home-greeting').innerText(),'Kasper, you’ve got this!');assert.equal(await page.evaluate(()=>scrollY),0);assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).firstName,key),'Kasper');
  await page.reload();assert.equal(await page.locator('.home-greeting').innerText(),'Kasper, you’ve got this!');if(width===390)await page.screenshot({type:'jpeg',quality:85,path:path.join(out,'personal-welcome-home.jpg')});
  const before=await page.evaluate(key=>{const x=JSON.parse(localStorage.getItem(key));return {profile:x.profile,logs:x.logs,weights:x.weights,foodLog:x.foodLog}},key);
  await page.locator('[data-tab="more"]').click();await page.locator('.profile-preferences').evaluate(x=>x.open=true);assert.equal(await page.locator('#preferred-name').inputValue(),'Kasper');await page.locator('#preferred-name').fill('Søren');await page.locator('#name-preferences-form button').click();assert((await page.locator('#name-save-status').innerText()).includes('Name saved'));await page.locator('[data-tab="home"]').click();assert.equal(await page.locator('.home-greeting').innerText(),'Søren, you’ve got this!');
  await page.locator('[data-tab="more"]').click();await page.locator('.profile-preferences').evaluate(x=>x.open=true);await page.locator('#preferred-name').fill('A'.repeat(40));await page.locator('#name-preferences-form button').click();await page.locator('[data-tab="home"]').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Long greeting fits '+width);
  await page.locator('[data-tab="more"]').click();await page.locator('.profile-preferences').evaluate(x=>x.open=true);await page.locator('#preferred-name').fill('');await page.locator('#name-preferences-form button').click();await page.locator('[data-tab="home"]').click();assert.equal(await page.locator('.home-greeting').innerText(),'You’ve got this!');
  assert.deepEqual(await page.evaluate(key=>{const x=JSON.parse(localStorage.getItem(key));return {profile:x.profile,logs:x.logs,weights:x.weights,foodLog:x.foodLog}},key),before);await context.close();
 }

 // Training usability: unit switching, conservative suggestions, session-only swaps and recap.
 for(const width of [320,390,430]){
  const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const initial=JSON.parse(JSON.stringify(fixture));initial.logs=Array.from({length:2},(_,i)=>({date:new Date(Date.now()-(2-i)*86400000).toISOString(),workoutId:'push-a',title:'Push',exercises:[{name:'Barbell Bench Press',unit:'reps',sets:Array.from({length:3},()=>({reps:'12',kg:'40',done:true}))}]}));initial.workoutDrafts={};initial.units='imperial';initial.workoutSchedule={[new Date(Date.now()+86400000).toLocaleDateString('en-CA')]:'leg-a'};
  await context.addInitScript(({key,initial})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(initial))},{key,initial});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/fitness.html');await page.evaluate(()=>{tab='train';render()});
  await page.locator('#exercise-tools-0>summary').click();assert((await page.locator('#training-exercise-0 .progression-hint').innerText()).includes('last two sessions'));assert((await page.locator('#training-exercise-0 .progression-hint').innerText()).includes('lb'));
  await page.locator('#training-exercise-0 .exercise-swap>summary').click();await page.locator('#swap-0').selectOption('Dumbbell Bench Press');assert.equal(await page.locator('#exercise-name-0').innerText(),'Dumbbell Bench Press');
  await page.locator('[data-set-reps="0-0"]').fill('10');await page.locator('[data-set-weight="0-0"]').fill('100');await page.locator('[data-set-done="0-0"]').check();
  let saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);assert(Math.abs(Number(saved.workoutDrafts['push-a']['sw0-0'])-45.359237)<1e-6);assert(saved.workoutDrafts['push-a'].startedAt>0);
  await page.reload();await page.evaluate(()=>{tab='train';render()});assert.equal(await page.locator('#exercise-name-0').innerText(),'Dumbbell Bench Press');assert.equal(await page.locator('[data-set-weight="0-0"]').inputValue(),'100');assert(await page.locator('#swap-0').isDisabled());
  await page.locator('[data-tab="more"]').click();await page.locator('.profile-preferences').evaluate(x=>x.open=true);assert.equal(await page.locator('.more-reference[open]').count(),0);assert.equal(await page.locator('.more-backups[open]').count(),0);await page.locator('#body-units').selectOption('metric');await page.evaluate(()=>{tab='train';render()});assert(Math.abs(Number(await page.locator('[data-set-weight="0-0"]').inputValue())-45.359237)<1e-6);
  await page.locator('[data-tab="more"]').click();await page.locator('.profile-preferences').evaluate(x=>x.open=true);await page.locator('#body-units').selectOption('imperial');await page.evaluate(()=>{tab='train';render()});assert.equal(await page.locator('[data-set-weight="0-0"]').inputValue(),'100');
  await page.locator('[data-action="finish"]').click();await page.locator('.session-recap').waitFor();assert((await page.locator('.session-recap').innerText()).includes('sets completed'));assert((await page.locator('.recap-next').innerText()).includes('Leg'));assert(await page.locator('.session-recap').isVisible());
  saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);assert.equal(saved.logs.length,3);assert.equal(saved.logs[2].exercises[0].name,'Dumbbell Bench Press');assert(Math.abs(Number(saved.logs[2].exercises[0].sets[0].kg)-45.359237)<1e-6);assert(!saved.workoutDrafts['push-a']);
  await page.locator('[data-dismiss-recap]').click();assert.equal(await page.locator('.session-recap').count(),0);await page.evaluate(()=>{tab='train';render()});assert.equal(await page.locator('#exercise-name-0').innerText(),'Barbell Bench Press');
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







