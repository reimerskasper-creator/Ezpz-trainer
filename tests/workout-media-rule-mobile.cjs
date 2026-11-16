const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const web=fs.existsSync(path.join(root,'native/www/index.html'))?path.join(root,'native/www'):root;
const server=http.createServer((request,response)=>{
 const file=path.resolve(web,'.'+new URL(request.url,'http://localhost').pathname);
 if(!file.startsWith(web+path.sep)){response.writeHead(403);response.end();return}
 fs.readFile(file,(error,data)=>{
  response.writeHead(error?404:200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'}[path.extname(file)]||'application/octet-stream'});
  response.end(error?'Missing':data);
 });
});
async function verify(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch();
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const failures=[];
  page.on('pageerror',error=>failures.push(error.message));
  page.on('dialog',dialog=>dialog.dismiss());
  await page.addInitScript(()=>{
   const key='ezpz-fitness-pilot-1';
   if(localStorage.getItem(key))return;
   const legacy={id:'custom-old',title:'Old personal workout',category:'Core',level:'Beginner',equipment:'Mat',minutes:'15',exercises:[{name:'Personal core drill',sets:2,reps:'10',unit:'reps',rest:60,side:false}]};
   localStorage.setItem(key,JSON.stringify({
    profile:{goal:'maintain',equipment:'home',level:'Beginner',days:3,age:35,weight:80,height:180,sex:'male'},
    selectedWorkout:legacy.id,customWorkouts:[legacy],workoutLayoutVersion:2,logs:[],weights:[],foodLog:[],
   }));
  });
  await page.goto('http://127.0.0.1:'+server.address().port+'/'+(web===root?'fitness.html':'index.html'));
  await page.waitForFunction(()=>window.EZPZPlans&&window.EZPZTrainerSpace);
  assert((await page.locator('.home-workout').innerText()).includes('Full Body A'));
  await page.evaluate(()=>{tab='library';render()});
  assert.equal(await page.locator('.library-tile').count(),41);
  assert.equal(await page.locator('.library-tile img').count(),41);
  await page.locator('[data-library-id="Goblet Squat"]').click();
  await page.locator('.strict-demo img').evaluate(img=>img.decode());
  assert.match(await page.getByRole('link',{name:'Watch demo'}).getAttribute('href'),/^https:\/\/www.youtube.com\/watch/);
  await page.evaluate(()=>{tab='train';render()});
  assert.equal(await page.locator('.workout-media-repair').count(),1);
  assert.equal(await page.locator('[data-set-reps]').count(),0);
  await page.locator('[data-trainer-video="0"]').click();
  await page.locator('#trainer-video-url').fill('https://www.youtube.com/watch?v=bxn9FBrt4-A');
  await page.locator('#trainer-video-form button[type=submit]').click();
  assert.equal(await page.locator('[data-set-reps]').count(),0);
  await page.locator('[data-trainer-photo="0"]').click();
  await page.locator('[data-trainer-file]').first().setInputFiles(path.join(root,'fitness-app/exercise-media/deadbug.jpg'));
  await page.waitForFunction(()=>!document.querySelector('.workout-media-repair')&&!document.querySelector('#trainer-dialog'));
  assert(await page.locator('[data-set-reps="0-0"]').isVisible());
  await page.evaluate(()=>{
   state.workoutSchedule={[foodDate()]:'custom-old'};
   state.workoutDrafts={'custom-old':{'sr0-0':'8'}};
   state.logs=[{date:new Date().toISOString(),workoutId:'custom-old',title:'Completed training',exercises:[]}];
   state.mealPlan={[foodDate()]:{breakfast:0,breakfastPortion:1}};
   state.foodLog=[];
   save();tab='device-data';render();
  });
  const other=await page.evaluate(()=>JSON.stringify([state.profile,state.logs,state.mealPlan,state.foodLog]));
  await page.getByRole('button',{name:'Start fresh with workouts'}).click();
  await page.getByRole('button',{name:'Reset workouts',exact:true}).click();
  const result=await page.evaluate(()=>({id:state.selectedWorkout,workouts:state.customWorkouts,schedule:state.workoutSchedule,drafts:state.workoutDrafts,media:state.trainerMedia}));
  assert.deepEqual(result,{id:'guided-home-full-body-a',workouts:[],schedule:{},drafts:{},media:{}});
  assert.equal(await page.evaluate(()=>JSON.stringify([state.profile,state.logs,state.mealPlan,state.foodLog])),other);
  await page.reload();
  assert((await page.locator('.home-workout').innerText()).includes('Full Body A'));
  assert.deepEqual(failures,[]);
  console.log('PASS: covered library, personal workout blocked until photo and video, and persistent workout-only reset.');
 }finally{await browser.close();server.close()}
}
verify().catch(error=>{console.error(error);server.close();process.exitCode=1});
