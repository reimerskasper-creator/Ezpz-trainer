// Real Chromium mobile checks. Run: npm install --no-save playwright@1.64.1 && node tests/mobile.cjs
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const expectUpgrade=true;
const root=path.resolve(__dirname,'..'),out=path.join(root,'test-results');fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'};
const server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(pathname==='/'?'/fitness.html':pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}fs.readFile(file,(e,b)=>{if(e){res.writeHead(404);res.end('Not found');return}res.setHeader('Content-Type',mime[path.extname(file)]||'text/plain');res.end(b)})});
const key='ezpz-fitness-pilot-1',errors=[],captures=[];
const today=new Date().toLocaleDateString('en-CA',{timeZone:'America/New_York'});
const fixture={profile:{goal:'maintain',level:'Beginner',equipment:'home',days:3,age:35,weight:80,height:180,sex:'male'},logs:Array.from({length:24},(_,i)=>({date:new Date(Date.now()-(24-i)*86400000).toISOString(),workoutId:'push-a',title:'Push Day A',type:'home',setting:'Gym',variant:'A',exercises:[{name:'Barbell Bench Press',unit:'reps',sets:[{reps:'8',kg:'18',done:true}]}]})),weights:[{date:new Date(Date.now()-86400000*7).toISOString(),kg:81},{date:new Date().toISOString(),kg:80}],shopping:['Tomatoes (raw) — 100 g'],checkedShopping:{'Tomatoes (raw)':true},foodLog:[{id:'existing-meal',date:today,name:'Chicken rice bowl',servings:1,macros:[622,55,62,17]}],mealPlan:{[today]:{lunch:1,lunchPortion:1.5,dinner:48,dinnerPortion:1}},mealPlanOffset:0,selectedWorkout:'push-a',workoutDrafts:{'glutes-foundation':{'sr0-0':'12','sd0-0':true},'pull-a':{'sr0-0':'9','sw0-0':'15','sd0-0':true}},draft:{variant:'A',equipment:'home','sr0-0':'8','sd0-0':true},workoutLayoutVersion:2};
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;const browser=await chromium.launch();
try{
 for(const width of [320,390,430]){
  const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,timezoneId:'America/New_York'});
  await context.addInitScript(({key,fixture})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture))},{key,fixture});
  if(expectUpgrade)await context.route('**/exercise-catalog.json',async route=>{await new Promise(r=>setTimeout(r,700));await route.continue()});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  const checkLayout=async(label)=>{assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow: '+width+' '+label)};
  const capture=async(name)=>{await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(out,name+'-'+width+'.jpg'),type:'jpeg',quality:80});if(width===390)captures.push({name,src:'data:image/jpeg;base64,'+fs.readFileSync(path.join(out,name+'-'+width+'.jpg')).toString('base64')})};
  await page.goto(base+'/fitness.html');await page.locator('[data-tab="home"]').waitFor();await checkLayout('Home');await capture('Home');
  await page.locator('[data-tab="eat"]').click();assert.equal(await page.locator('[data-recipe-card]').count(),49);assert.equal(await page.locator('[data-recipe-card] img').count(),49);
  if(width===390){for(const src of await page.locator('[data-recipe-card] img').evaluateAll(xs=>xs.map(x=>x.getAttribute('src')))){const response=await context.request.get(new URL(src,base+'/fitness.html').href);assert.equal(response.status(),200,'Photo '+src);const bytes=await response.body();assert(bytes[0]===255&&bytes[1]===216,'JPEG asset '+src)}}
  await checkLayout('Food');await capture('Food');
  await page.locator('#recipe-search').fill('Chicken potato plate');await page.locator('[data-open-meal="6"]').click();await page.locator('[data-serving="6"]').selectOption('2');assert((await page.locator('[data-ingredients="6"]').innerText()).includes('320 g'));await page.locator('[data-log-food="6"]').click();
  assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).foodLog.length,key),2);
  await page.locator('[data-tab="train"]').click();
  await page.locator('[data-action="open-workouts"]').click();assert.equal(await page.locator('#workout-chooser img').count(),11);
  const coverSources=await page.locator('#workout-chooser img').evaluateAll(xs=>xs.map(x=>x.getAttribute('src')));
  assert.equal(new Set(coverSources).size,11);for(const src of coverSources){const response=await context.request.get(new URL(src,base+'/fitness.html').href);assert.equal(response.status(),200,'Workout photo '+src)}
  await page.locator('#workout-chooser').evaluate(async dialog=>{for(const img of dialog.querySelectorAll('img')){img.loading='eager';await img.decode()}dialog.scrollTop=0});
  await checkLayout('Workout chooser');assert(await page.locator('#workout-chooser').evaluate(x=>x.scrollWidth<=x.clientWidth+1),'Chooser horizontal overflow');
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
   await page.locator('[data-workout-pick="'+id+'"]').click();
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
  await context.close();
 }
 const clean=await browser.newContext({viewport:{width:390,height:844}}),onboarding=await clean.newPage();onboarding.on('pageerror',e=>errors.push(e.message));await onboarding.goto(base+'/fitness.html');await onboarding.locator('[name="age"]').fill('35');await onboarding.locator('[name="weight"]').fill('80');await onboarding.locator('[name="height"]').fill('180');await onboarding.locator('#setup button').click();await onboarding.waitForFunction(()=>document.body.dataset.view==='home');await clean.close();
 if(captures.length){const sheet=await browser.newPage({viewport:{width:2528,height:570},deviceScaleFactor:1});await sheet.setContent('<html><body style="margin:0;display:flex;gap:8px;padding:8px;background:#edf0ee;font:14px sans-serif">'+captures.map(x=>'<figure style="margin:0;width:244px"><figcaption style="height:24px;text-align:center">'+x.name+'</figcaption><img style="width:244px" src="'+x.src+'"></figure>').join('')+'</body></html>');const jpg=await sheet.screenshot({type:'jpeg',quality:85,path:path.join(out,'mobile-overview.jpg')});if(process.env.EZPZ_VISUAL_LOG==='1'){console.log('EZPZ_VISUAL_BEGIN');const b=jpg.toString('base64');for(let i=0;i<b.length;i+=4000)console.log('EZPZ_VISUAL_DATA '+b.slice(i,i+4000));console.log('EZPZ_VISUAL_END')}}
 assert.deepEqual(errors,[],'Browser errors');fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify({passed:true,widths:[320,390,430],recipes:49,workoutPrograms:55,upgradedUI:expectUpgrade,browserErrors:errors},null,2));console.log('PASS: Chromium at 320/390/430px; 49 recipe photos; 55 workout programs; draft persistence; set logging; history; navigation; exercise search; onboarding'+(expectUpgrade?'; complete backup restoration':''));
}finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
