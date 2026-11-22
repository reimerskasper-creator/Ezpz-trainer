const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),web=fs.existsSync(path.join(root,'native/www/index.html'))?path.join(root,'native/www'):root;
const server=http.createServer((req,res)=>{const f=path.resolve(web,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(web+path.sep)){res.writeHead(403);return res.end()}fs.readFile(f,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':f.endsWith('.html')?'text/html':f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'image/jpeg'});res.end(e?'Missing':b)})});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();try{for(const width of [320,390,430]){const page=await browser.newPage({viewport:{width,height:900}});await page.addInitScript(()=>{localStorage.setItem('ezpz-fitness-pilot-1',JSON.stringify({profile:{goal:'maintain',level:'Beginner',equipment:'gym',days:3,age:35,weight:80,height:180,sex:'male'},logs:[],weights:[],foodLog:[],workoutLayoutVersion:2}))});await page.goto('http://127.0.0.1:'+server.address().port+'/'+(web===root?'fitness.html':'index.html'));await page.waitForFunction(()=>window.EZPZFlexibleDay);await page.evaluate(()=>{tab='planner';render()});
assert(await page.locator('.day-logged, .day-detail-tools').count());
assert(await page.locator('.plan-library-entry + .day-detail-tools').isVisible());

assert.equal(await page.locator('#screen [data-plan-settings], #screen .plan-workout-options, #screen .plan-repeat').count(),0);
for(const selector of ['.day-return','.plan-nutrition-details>summary','.day-date-options>summary','.plan-settings>summary','[data-flex-add]']){
 assert(await page.locator('#screen '+selector).isVisible(),selector);
}

await page.locator('#planned-workout').click();
assert(await page.locator('#planner-picker .own-category-tile .own-anatomy-cover .recap-anatomy').isVisible());
await page.locator('[data-plan-picker-category="Leg"]').click();
const legs=page.locator('[data-plan-pick-workout="guided-gym-legs-a"]');
const pickerCover=await page.locator('.program-card').filter({has:legs}).locator('.program-photo .hybrid-workout-cover').innerHTML();
await legs.click();
assert.equal(await page.locator('#planned-workout .hybrid-workout-cover').innerHTML(),pickerCover);
await page.locator('[data-flex-add]').click();
await page.locator('[data-flex-add-kind="workout"]').click();
await page.locator('[data-plan-picker-category="Leg"]').click();
await page.locator('[data-plan-pick-workout="guided-gym-legs-b"]').click();
assert(await page.locator('.extra-workout-card .hybrid-workout-cover .recap-anatomy').isVisible());
await page.locator('#planner-breakfast').click();await page.locator('[data-plan-pick-meal="0"]').click();const img=page.locator('#planner-breakfast img');assert((await img.evaluate(e=>getComputedStyle(e).maskImage)).includes('linear-gradient'));assert(await img.evaluate(e=>e.getBoundingClientRect().width/e.closest('button').getBoundingClientRect().width>.4));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(width===390){fs.mkdirSync(path.join(root,'test-results'),{recursive:true});await page.screenshot({path:path.join(root,'test-results/day-card-polish.jpg')})}await page.evaluate(()=>{state.foodLog.push({id:'polish-meal',date:foodDate(),recipe:0,name:recipes[0].name,servings:1,macros:nutrition(recipes[0].ingredients)});tab='eat';render();applyAppAppearance({mode:'dark',accent:'emerald'})});assert.equal(await page.locator('.eat-diary-help').count(),0);assert(await page.locator('.food-log-actions summary svg').isVisible());await page.locator('.food-log-actions summary').click();await page.locator('[data-edit-food="polish-meal"]').click();assert(await page.locator('.food-edit-form').isVisible());await page.locator('[data-cancel-food-edit]').click();const tile=page.locator('.meal-focus-grid button[aria-pressed=true]');assert.equal(await tile.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(33, 90, 66)');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(width===390)await page.screenshot({path:path.join(root,'test-results/day-card-polish-eat.jpg'),fullPage:true});await page.evaluate(()=>{clearCurrentPlan();resetWorkoutSetup();tab='home';render()});
assert.equal(await page.locator('#home-workouts-content .upcoming-row').count(),0);
assert(await page.locator('#home-workouts-content .upcoming-empty').isVisible());
assert.equal(await page.locator('.home-next .compact-upcoming-copy strong').textContent(),'No workouts planned');
await page.reload();
assert.equal(await page.locator('#home-workouts-content .upcoming-row').count(),0);
await page.close();console.log('PASS day photo fade, original photo, diary edit and selected contrast '+width)}}finally{await browser.close();server.close()}})().catch(e=>{console.error(e);server.close();process.exitCode=1});
