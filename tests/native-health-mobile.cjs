const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..'),out=path.join(root,'test-results');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}fs.readFile(file,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':file.endsWith('.html')?'text/html':file.endsWith('.json')?'application/json':file.endsWith('.png')?'image/png':'image/jpeg'});res.end(e?'':b)})});
const key='ezpz-fitness-pilot-1',fixture={profile:{goal:'maintain',level:'Beginner',equipment:'home',days:3,age:35,weight:80,height:180,sex:'male'},logs:[],weights:[],foodLog:[],workoutLayoutVersion:2};
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();try{for(const width of [320,390,430]){const context=await browser.newContext({viewport:{width,height:844},timezoneId:'America/New_York',isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await context.addInitScript(({key,fixture})=>{
 if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture));window.testAllowed=[];window.testRead=0;
 const bridge={status:async()=>({available:true,metrics:window.testAllowed}),requestPermissions:async()=>({available:true,metrics:window.testAllowed}),openSettings:async()=>{},sync:async(options)=>{window.testSource=options.source;window.testRead++;return window.testPayload}};
 window.Capacitor={isNativePlatform:()=>true,isPluginAvailable:()=>true,registerPlugin:()=>bridge};
},{key,fixture});await page.goto('http://127.0.0.1:'+server.address().port+'/fitness.html');
await page.evaluate(()=>{tab='connected-apps';render()});
await page.locator('.native-health-details > summary').click();
await page.locator('[data-native-health="permissions"]').click();await page.waitForFunction(()=>document.getElementById('native-health-status').textContent.includes('No EZPZ access'));
await page.locator('[data-native-health="sync"]').click();await page.waitForFunction(()=>document.getElementById('native-health-status').textContent.includes('Tap Allow'));assert.equal(await page.evaluate(()=>window.testRead),0);
await page.evaluate(()=>{window.testAllowed=['steps'];const date=foodDate();window.testPayload={version:1,from:date,through:date,metrics:['steps'],records:[{metric:'steps',value:4200,date,source:'whoop-health-connect',externalId:'native-test-'+date,unit:'count',updatedAt:new Date().toISOString()}]}});
await page.locator('[data-native-health="sync"]').click();await page.waitForFunction(()=>document.getElementById('native-health-status').textContent.includes('Imported 1'));
assert.equal(await page.evaluate(()=>selectedWellnessRecord('steps',foodDate()).value),4200);
await page.locator('[data-native-health="sync"]').click();await page.waitForFunction(()=>!nativeHealthBusy);assert((await page.locator('#native-health-status').innerText()).includes('No new records'));assert.equal(await page.evaluate(()=>state.wellnessRecords.length),1);
for(const source of ['samsung-health-connect','fitbit-health-connect']){
 await page.selectOption('#native-tracker-source',source);
 await page.evaluate(source=>{const date=foodDate(),stamp=new Date().toISOString();window.testAllowed=['steps','sleep','workouts'];window.testPayload={version:1,source,from:date,through:date,metrics:window.testAllowed,records:[{metric:'steps',value:12000,date,source,externalId:'steps-'+date,unit:'count',updatedAt:stamp},{metric:'sleep',value:450,date,source,externalId:'sleep-'+date,unit:'minutes',updatedAt:stamp}],workouts:[{source,externalId:'run-'+date,date,start:date+'T04:00:00Z',end:date+'T04:30:00Z',durationMinutes:30,title:'Morning run',updatedAt:stamp}]}},source);
 await page.locator('[data-native-health="sync"]').click();await page.waitForFunction(()=>!nativeHealthBusy);
 assert.equal(await page.evaluate(()=>window.testSource),source);
 assert.equal(await page.evaluate(()=>selectedWellnessRecord('steps',foodDate()).value),12000);
 assert.equal(await page.evaluate(()=>effectiveSleepLog()[foodDate()]),450);
 assert.equal(await page.evaluate(()=>activeImportedWorkouts().length),1);
 assert.equal(await page.evaluate(()=>dailyTrainingSummary().percent),100);
}
await page.reload();await page.evaluate(()=>{tab='connected-apps';render()});assert.equal(await page.locator('#native-tracker-source').inputValue(),'fitbit-health-connect');
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);if(width===390)await page.screenshot({path:path.join(out,'native-health-connected.jpg'),type:'jpeg',quality:85});await context.close()}
console.log('PASS: native permission denial, read gating, WHOOP/Samsung/Fitbit imports, tracker persistence, workout completion, repeated sync and responsive controls at 320/390/430px');}finally{await browser.close();await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exitCode=1});
