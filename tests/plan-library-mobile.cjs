const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');const root=path.resolve(__dirname,'..'),key='ezpz-fitness-pilot-1';
const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)){res.writeHead(403);return res.end()}fs.readFile(f,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':f.endsWith('.svg')?'image/svg+xml':f.endsWith('.html')?'text/html':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.json')?'application/json':f.endsWith('.png')?'image/png':'image/jpeg'});res.end(e?'':b)})});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();try{for(const width of [320,390,430]){const context=await browser.newContext({viewport:{width,height:900},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());await context.addInitScript(({key})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({profile:{goal:'maintain',level:'Beginner',equipment:'home',days:3,age:35,weight:80,height:180,sex:'male'},logs:[],weights:[],foodLog:[],workoutLayoutVersion:2}))},{key});await page.goto('http://127.0.0.1:'+server.address().port+'/fitness.html');await page.waitForFunction(()=>window.EZPZPlans);await page.evaluate(()=>{state.plannerStart=foodDate();state.plannerDays=14;state.workoutSchedule=Object.fromEntries([0,2,4,7,9,11].map(n=>[datePlus(foodDate(),n),'push-a']));state.mealPlan=Object.fromEntries(Array.from({length:14},(_,i)=>[datePlus(foodDate(),i),{breakfast:0,lunch:1,dinner:2}]));state.logs=[{date:new Date().toISOString(),workoutId:'push-a',title:'Logged workout',completionOnly:true,exercises:[]}];window.firstPlanId=saveNamedPlan('Kasper 2 week plan');window.testPlan=capturePlanPackage('Back to basics',true);window.secondPlanId=storeReceivedPlan(window.testPlan);storeReceivedPlan({...window.testPlan,name:'My next chapter'});tab='planner';render()});const history=await page.evaluate(()=>JSON.stringify([state.logs,state.weights,state.foodLog])),firstId=await page.evaluate(()=>window.firstPlanId),secondId=await page.evaluate(()=>window.secondPlanId),d=()=>page.locator('#plan-manager-dialog');await page.locator('.plan-library-open').click();assert.equal(await d().locator('.plan-library-card').count(),3);assert.equal(await d().locator('.plan-library-badge').filter({hasText:'Active'}).count(),1);assert((await d().locator('.plan-library-card').first().textContent()).includes('6 workouts · 42 meals'));assert(await d().evaluate(e=>e.scrollWidth<=e.clientWidth+1));
// Cover upload uses the real shared cropper and survives reload/export.
await d().locator('[data-plan-manage="cover:'+firstId+'"]').click();await d().locator('[data-personal-photo-input]').first().setInputFiles(path.join(root,'home-images/nutrition.jpg'));await page.locator('.personal-photo-dialog').waitFor();await page.locator('[data-photo-apply]').click();await page.waitForFunction(()=>!!state.savedPlans.find(p=>p.id===window.firstPlanId).coverPhotoId);assert.equal(await page.locator('.personal-photo-dialog').count(),0);assert((await d().locator('.plan-library-card img').first().getAttribute('src')).startsWith('data:image/jpeg'));const cover=await page.evaluate(()=>state.savedPlans.find(p=>p.id===window.firstPlanId).coverPhotoId);assert(await page.evaluate(id=>!!restoredState(JSON.parse(localStorage.getItem('ezpz-fitness-pilot-1'))).personalPhotos[id],cover));if(width===390){fs.mkdirSync('test-results',{recursive:true});await d().screenshot({path:'test-results/plan-library.jpg'})}
await d().locator('[data-plan-manage="open:'+firstId+'"]').click();assert.equal(await d().locator('.plan-preview-name').textContent(),'Kasper 2 week plan');assert((await d().locator('.plan-preview-counts').textContent()).includes('6 workouts · 42 meals'));await d().locator('.plan-inside>summary').first().click();assert.equal(await d().locator('.plan-inside').first().locator('li').count(),6);await d().locator('.plan-inside>summary').first().click();await d().locator('[data-plan-manage="rename:'+firstId+'"]').click();await page.locator('#plan-library-name').fill('Kasper two weeks');await d().locator('button[type=submit]').click();assert.equal(await d().locator('.plan-preview-name').textContent(),'Kasper two weeks');if(width===390)await d().screenshot({path:'test-results/plan-library-preview.jpg'});
// Explicit date-conflict review, optional old-plan archive, and rollback on failed saves.
const before=await page.evaluate(()=>JSON.stringify(state));await page.locator('#plan-import-start').fill(await page.evaluate(()=>foodDate()));await d().locator('button[type=submit]').click();assert((await d().locator('.plan-dialog-status').textContent()).includes('Confirm replacement'));assert.equal(await page.evaluate(()=>JSON.stringify(state)),before);await page.locator('#plan-import-replace').check();await page.locator('#plan-save-before').check();await page.evaluate(()=>{window.realSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw Error('quota')}});await d().locator('button[type=submit]').click();assert.equal(await page.evaluate(()=>JSON.stringify(state)),before);await page.evaluate(()=>Storage.prototype.setItem=window.realSetItem);await d().locator('button[type=submit]').click();assert.equal(await d().count(),0);assert.equal(await page.evaluate(()=>state.activeSavedPlanId),firstId);assert.equal(await page.evaluate(()=>state.savedPlans.length),4);assert.equal(await page.evaluate(()=>JSON.stringify([state.logs,state.weights,state.foodLog])),history);const workoutCount=await page.evaluate(()=>state.customWorkouts.length);
// Re-activation reuses definitions and media rather than adding duplicate workouts.
await page.locator('.plan-library-open').click();await d().locator('[data-plan-manage="open:'+firstId+'"]').click();await page.locator('#plan-import-replace').check();await d().locator('button[type=submit]').click();assert.equal(await page.evaluate(()=>state.customWorkouts.length),workoutCount);
// Received plans can be stored without activating or modifying the current schedule.
await page.locator('.plan-library-open').click();await d().locator('[data-plan-manage=import]').click();const schedule=await page.evaluate(()=>JSON.stringify([state.workoutSchedule,state.mealPlan,state.activeSavedPlanId]));const pack=await page.evaluate(()=>{const p=planPackageWithPhotos(state.savedPlans.find(x=>x.id===window.firstPlanId));p.name='Received for later';const c=document.createElement('canvas');c.width=40;c.height=30;c.getContext('2d').fillRect(0,0,40,30);p.photos[p.coverPhotoId]=c.toDataURL('image/jpeg',.7);return p});await page.locator('#plan-import-file').setInputFiles({name:'received.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(pack))});assert.equal(await d().locator('.plan-preview-cover>img').getAttribute('src'),pack.photos[pack.coverPhotoId],'Received preview uses file cover even when a local photo ID matches');await d().locator('[data-plan-save-received]').click();assert.equal(await page.evaluate(()=>JSON.stringify([state.workoutSchedule,state.mealPlan,state.activeSavedPlanId])),schedule);assert.equal(await d().locator('.plan-library-card').count(),5);
await d().locator('[data-plan-manage="open:'+secondId+'"]').click();await d().locator('[data-plan-manage="delete:'+secondId+'"]').click();await page.locator('[data-confirm-plan]').click();assert.equal(await d().locator('.plan-library-card').count(),4);assert.equal(await page.evaluate(()=>JSON.stringify([state.logs,state.weights,state.foodLog])),history);await page.keyboard.press('Escape');await page.reload();await page.evaluate(()=>{tab='planner';render()});await page.locator('.plan-library-open').click();assert.equal(await d().locator('.plan-library-card').count(),4);assert((await d().locator('.plan-library-card img').first().getAttribute('src')).startsWith('data:image/jpeg'));await page.keyboard.press('Escape');assert(await page.locator('.plan-library-open').evaluate(e=>document.activeElement===e));for(const mode of ['dark','light']){await page.evaluate(mode=>{state.appAppearance={mode,accent:'emerald'};applyAppAppearance(state.appAppearance);tab='planner';render()},mode);await page.locator('.plan-library-open').click();assert(await d().evaluate(e=>e.scrollWidth<=e.clientWidth+1));assert.equal(await d().locator('.plan-library-card-open').first().evaluate(e=>getComputedStyle(e).color),mode==='dark'?'rgb(241, 255, 245)':'rgb(23, 56, 43)');await page.keyboard.press('Escape')}
// Create, edit, export and activate through the same library on each phone width.
const activeSchedule=()=>page.evaluate(()=>JSON.stringify([state.workoutSchedule,state.mealPlan,state.extraWorkouts,state.plannerStart,state.plannerDays,state.planName,state.activeSavedPlanId,state.logs]));
await page.evaluate(()=>{
 state.customWorkouts=[...state.customWorkouts,{id:'custom-library-test',title:'My saved session',category:'Full Body',level:'Beginner',equipment:'Mat',minutes:'25',exercises:[{name:'Push-up',sets:3,reps:'8',unit:'reps',rest:60,side:false}]}];
 state.customFoods=[...(state.customFoods||[]),{id:'cf-library-test',name:'My saved bowl',macros:[300,20,30,10],photoKey:'yogurt'}];
});
const activeBefore=await activeSchedule();
await page.locator('.plan-library-open').click();
await d().locator('[data-plan-manage=create]').click();
await d().locator('#library-draft-name').fill('Client strength plan');
await d().locator('#library-draft-days').fill('3');
await d().getByRole('button',{name:'Build plan'}).click();
assert(await d().evaluate(e=>e.scrollWidth<=e.clientWidth+1));
const picker=d().locator('.plan-draft-picker');
const chooseWorkout=()=>d().locator('[data-draft-add=workout]').click();
await chooseWorkout();
await page.keyboard.press('Escape');
await picker.waitFor({state:'detached'});
assert(await d().locator('[data-draft-day]').isVisible());
await chooseWorkout();
assert.equal(await picker.getByRole('button',{name:'My workouts'}).getAttribute('aria-pressed'),'true');
await picker.getByRole('searchbox').fill('saved session');
await picker.getByRole('button',{name:'My saved session'}).click();
await chooseWorkout();
await picker.getByRole('button',{name:'EZPZ workouts'}).click();
await picker.locator('[data-picker-item=push-a]').click();
const chooseMeal=()=>d().locator('[data-draft-add=meal]').click();
await chooseMeal();
assert.equal(await picker.getByRole('button',{name:'My meals'}).getAttribute('aria-pressed'),'true');
await picker.getByRole('searchbox').fill('saved bowl');
await picker.getByRole('button',{name:'My saved bowl'}).click();
await picker.getByRole('button',{name:'Increase portions'}).click();
await picker.getByRole('button',{name:'Add to Day 1'}).click();
await d().locator('[data-draft-day]').selectOption('2');
await chooseMeal();
await picker.getByRole('button',{name:'EZPZ recipes'}).click();
await picker.locator('[data-picker-item="1"]').click();
await picker.getByText('Extra meal',{exact:true}).click();
await picker.getByRole('button',{name:'Add to Day 3'}).click();
assert.equal(await activeSchedule(),activeBefore);
await d().locator('[data-draft-save]').click();
const draftId=await page.evaluate(()=>state.savedPlans.find(p=>p.name==='Client strength plan').id);
await d().locator('[data-plan-manage="open:'+draftId+'"]').click();
assert.match(await d().locator('.plan-preview-counts').textContent(),/3 days · 2 workouts · 2 meals/);
await d().locator('[data-plan-manage="edit:'+draftId+'"]').click();
await d().locator('#library-draft-days').fill('4');
await d().getByRole('button',{name:'Edit days'}).click();
await d().locator('[data-portion-slot=breakfast]').getByRole('button',{name:'Increase portions'}).click();
await d().locator('[data-draft-save]').click();
assert.equal(await activeSchedule(),activeBefore);
await d().locator('[data-plan-manage="open:'+draftId+'"]').click();
await d().locator('[data-plan-manage="export:'+draftId+'"]').click();
const download=page.waitForEvent('download');
await d().locator('[data-plan-export-confirm]').click();
const exported=JSON.parse(fs.readFileSync(await (await download).path(),'utf8'));
assert.equal(exported.days,4);
assert(exported.workouts.some(w=>w.title==='My saved session'));
assert(exported.meals.some(m=>m.food?.name==='My saved bowl'));
assert.equal(exported.entries[0].meals.breakfast.portion,2);
assert.equal(exported.entries[0].extraWorkouts.length,1);
assert.equal(Object.keys(exported.entries[1].meals).length,0);
assert.equal(Object.keys(exported.entries[2].meals).length,1);
assert.equal(await activeSchedule(),activeBefore);
await page.keyboard.press('Escape');
await page.locator('.plan-library-open').click();
await d().locator('[data-plan-manage="open:'+draftId+'"]').click();
const start=await page.evaluate(()=>datePlus(foodDate(),200));
await d().locator('#plan-import-start').fill(start);
await d().getByRole('button',{name:'Activate plan'}).click();
assert.equal(await page.evaluate(()=>state.activeSavedPlanId),draftId);
assert(await page.evaluate(date=>!!state.workoutSchedule[date],start));
assert.equal(await page.evaluate(date=>plannedMeals()[date].breakfastPortion,start),2);
assert.deepEqual(errors,[]);await context.close();console.log('PASS plan library '+width+': covers/crop/reload, real counts/contents, rename, conflict review, atomic archive/activation/quota rollback, no duplicates, received save-only, delete, themes and retained history')}}finally{await browser.close();server.close()}})().catch(e=>{console.error(e);server.close();process.exitCode=1});
