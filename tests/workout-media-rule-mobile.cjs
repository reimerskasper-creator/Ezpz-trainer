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
  assert(await page.locator('.home-workout-empty').isVisible());
  await page.evaluate(()=>{tab='library';render()});
  assert.equal(await page.locator('.library-tile').count(),143);
  assert.equal(await page.locator('.library-tile img').count(),143);
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
  assert(await page.locator('.home-workout-empty').isVisible());
  await page.evaluate(()=>{tab='planner';render()});
  await page.locator('[data-open-plan-picker="workout"]').click();
  const plannerPicker=page.locator('#planner-picker');
  const pullCover=plannerPicker.locator('[data-plan-picker-category="Pull"]');
  assert(await pullCover.locator('img').isVisible());
  assert(await pullCover.locator('.recap-anatomy').isVisible());
  await pullCover.click();
  for(const level of ['Intermediate','Advanced']){
   await plannerPicker.locator('[data-plan-picker-level="'+level+'"]').click();
   assert.equal(await plannerPicker.locator('.picker-workout').count(),1);
   assert(await plannerPicker.locator('.picker-choice .anatomy-primary').first().isVisible());
  }
  await plannerPicker.locator('[data-plan-picker-action="close"]').click();
  await page.evaluate(()=>{tab='home';render()});
  await page.locator('[data-overview-workout]').click();
  const chooser=page.locator('#workout-chooser');
  assert(await chooser.isVisible());
  await chooser.locator('[data-workout-category="Core"]').click();
  assert.equal(await chooser.locator('[data-workout-pick][aria-pressed=true]').count(),0);
  await chooser.locator('[data-workout-pick="guided-home-core-a"]').click();
  assert((await page.locator('.home-workout').innerText()).includes('Core A'));
  assert.equal(await page.evaluate(()=>state.workoutSchedule[foodDate()]),undefined);
  await page.locator('[data-home-start]').click();
  const quickSwap=page.locator('.trainer-photo-swap[data-compact-swap="0"]');
  await quickSwap.click();
  const swapDialog=page.locator('#trainer-swap-0');
  assert(await swapDialog.isVisible());
  await swapDialog.getByRole('searchbox').fill('Dead Bug Heel Taps');
  await swapDialog.locator('[data-exercise-name="Dead Bug Heel Taps"]').click();
  assert((await page.getByRole('heading',{name:'Dead Bug Heel Taps',exact:true}).innerText()).includes('Dead Bug Heel Taps'));
  await page.evaluate(()=>{state.selectedWorkout='guided-home-legs-a';tab='train';render();focusTrainingExercise(3)});
  await page.locator('.trainer-photo-swap[data-compact-swap="3"]').click();
  const calfSwap=page.locator('#trainer-swap-3');
  await calfSwap.getByRole('searchbox').fill('Seated Calf Raise');
  await calfSwap.locator('[data-exercise-name="Seated Calf Raise"]').click();
  assert(await page.getByRole('heading',{name:'Seated Calf Raise',exact:true}).isVisible());
  await page.evaluate(()=>{state.workoutDrafts={};tab='home';render()});

  await page.evaluate(()=>{
   state.homeWorkoutChoice.date=datePlus(foodDate(),-1);
   state.workoutSchedule={[foodDate()]:'guided-home-legs-a'};
   state.planName='Scheduled plan';tab='home';render();
  });
  assert((await page.locator('.home-workout').innerText()).includes('Legs A'));
  await page.evaluate(()=>{tab='planner';render()});
  await page.getByRole('button',{name:'Clear current plan',exact:true}).click();
  await page.locator('[data-confirm-plan]').click();
  await page.evaluate(()=>{tab='home';render()});
  assert(await page.locator('.home-workout-empty').isVisible());
  await page.evaluate(()=>{state.workoutSchedule={[foodDate()]:'rest'};render()});
  assert((await page.locator('.home-workout').innerText()).includes('Make room for recovery'));
  await page.evaluate(()=>{
   state.workoutSchedule={};
   state.selectedWorkout='guided-home-legs-a';
   state.workoutDrafts={'guided-home-legs-a':{'sr0-0':'8'}};
   render();
  });
  assert(await page.locator('.overview-actions').getByRole('button',{name:'Resume workout'}).isVisible());
  await page.evaluate(()=>{
   state.workoutDrafts={};state.workoutSchedule={};
   state.selectedWorkout='guided-home-full-body-a';
   state.homeWorkoutChoice={id:state.selectedWorkout,date:foodDate()};
   state.homePanels={...state.homePanels,todayWorkout:true};
   tab='home';render();
  });
  await page.locator('[data-edit-workout-exercises]').click();
  const editor=page.locator('#workout-edit-dialog');
  await editor.locator('[data-edit-index="0"]').click();
  await editor.locator('[data-edit-swap]').click();
  await editor.locator('#workout-edit-search').fill('Glute');
  const bridge=editor.getByRole('button',{name:/^Glute Bridge\b/});
  assert(await bridge.isDisabled());
  assert((await bridge.innerText()).includes('Already in this workout'));
  await editor.getByRole('button',{name:/^Dumbbell Romanian Deadlift\b/}).click();
  await editor.getByRole('button',{name:'Save change'}).click();
  assert((await page.locator('.home-workout').innerText()).includes('Dumbbell Romanian Deadlift'));
  await page.evaluate(()=>{
   nutritionMode='calculator';nutritionStep=2;nutritionDraft={units:'metric',sex:'male',age:35,weight:80,height:180,context:'standard',goal:'maintain',pace:'gentle',activity:'moderate'};
   tab='nutrition-targets';render();
  });
  await page.locator('#nutrition-result-protein').fill('280');
  assert((await page.locator('[data-adjusted-carbs]').innerText()).includes('Carbs with this choice:'));
  await page.locator('#nutrition-result button[type=submit]').click();
  assert.equal(await page.evaluate(()=>state.nutritionTargets.protein),280);
  await page.evaluate(()=>{state.workoutSchedule={};state.workoutDrafts={}});
  const sameMuscle=/Seated Leg Curl|Slider Hamstring Curl|Standing Single-Leg Machine Leg Curl/;
  async function checkSwapRow(row){
   assert.match(await row.innerText(),sameMuscle);
   assert.match(await row.innerText(),/Shared primary muscle/);
   const contrast=await row.evaluate(button=>{
    const rgb=text=>text.match(/[\d.]+/g).slice(0,3).map(Number);
    const luminance=text=>rgb(text).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4)
     .reduce((total,x,i)=>total+x*[.2126,.7152,.0722][i],0);
    const style=getComputedStyle(button),foreground=luminance(style.color),background=luminance(style.backgroundColor);
    return (Math.max(foreground,background)+.05)/(Math.min(foreground,background)+.05);
   });
   assert(contrast>=4.5,'Swap option contrast: '+contrast);
  }
  for(const appearance of [{mode:'dark',accent:'emerald'},{mode:'light',accent:'emerald'},{mode:'dark',accent:'lavender'}]){
   await page.evaluate(theme=>{
    state.appAppearance=theme;
    state.selectedWorkout='guided-gym-legs-a';tab='train';render();focusTrainingExercise(4);
   },appearance);
   await page.locator('.trainer-photo-swap[data-compact-swap="4"]').click();
   const trainerPicker=page.locator('#trainer-swap-4');
   await checkSwapRow(trainerPicker.locator('[data-exercise-name]').first());
   await trainerPicker.getByRole('searchbox').fill('hamstring curl');
   assert(await trainerPicker.locator('[data-exercise-name="Slider Hamstring Curl"]').isVisible());
   await trainerPicker.getByRole('button',{name:'Close',exact:true}).click();

   await page.evaluate(()=>{
    state.homeWorkoutChoice={id:state.selectedWorkout,date:foodDate()};tab='home';render();
   });
   await page.locator('[data-edit-workout-exercises]').click();
   const planEditor=page.locator('#workout-edit-dialog');
   await planEditor.locator('[data-edit-index="4"]').click();
   await planEditor.locator('[data-edit-swap]').click();
   await checkSwapRow(planEditor.locator('[data-edit-results] button').first());
   await planEditor.getByRole('button',{name:'Close exercise editor'}).click();

   await page.evaluate(()=>startBuilder('guided-gym-legs-a'));
   const exerciseRows=page.locator('.builder-exercise');
   assert(await exerciseRows.count()>=5);
   for(let i=0;i<4;i++){
    assert.equal(await exerciseRows.nth(i).evaluate(row=>row.open),false);
    assert(await exerciseRows.nth(i).locator('.builder-exercise-summary img').isVisible());
   }
   await exerciseRows.nth(4).locator('.builder-exercise-summary').click();
   await page.locator('[data-builder-picker="4"]').click();
   const builderPicker=page.locator('#builder-exercise-picker');
   await checkSwapRow(builderPicker.locator('[data-builder-movement]').first());
   await builderPicker.getByRole('button',{name:'Close exercise picker'}).click();
  }
  await page.evaluate(()=>startBuilder(null));
  const cover=page.locator('.own-cover-preview .personal-workout-anatomy');
  const chest=cover.locator('.anatomy-primary[data-anatomy-region="chest"]');
  await page.locator('#builder-name-0').fill('Dumbbell Bench Press');
  assert(await chest.isVisible());
  await page.locator('#builder-name-0').fill('Unknown exercise');
  assert.equal(await cover.locator('[data-anatomy-region]').count(),0);
  await page.locator('#builder-name-0').fill('Dead Bug');
  assert(await cover.locator('.anatomy-primary[data-anatomy-region="core"]').isVisible());
  await page.locator('#builder-title').fill('My anatomy workout');
  await page.locator('[data-destination="saved"]').click();
  const savedCover=page.locator('.own-saved-workout').filter({hasText:'My anatomy workout'});
  assert(await savedCover.locator('.personal-workout-anatomy .anatomy-primary[data-anatomy-region="core"]').isVisible());
  assert.deepEqual(failures,[]);
  console.log('PASS: covered library, personal workout blocked until photo and video, and persistent workout-only reset.');
 }finally{await browser.close();server.close()}
}
verify().catch(error=>{console.error(error);server.close();process.exitCode=1});
