const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const packaged=path.join(root,'native/www');
const web=fs.existsSync(path.join(packaged,'index.html'))?packaged:root;
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
 const file=path.resolve(web,'.'+new URL(req.url,'http://localhost').pathname);
 if(!file.startsWith(web+path.sep)){res.writeHead(403);res.end();return}
 fs.readFile(file,(error,bytes)=>{res.writeHead(error?404:200,{'Content-Type':mime[path.extname(file)]||'image/jpeg'});res.end(error?'':bytes)});
});

(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch();
 try{
  for(const width of [320,390,430]){
   const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true});
   await page.addInitScript(()=>localStorage.setItem('ezpz-fitness-pilot-1',JSON.stringify({
    profile:{goal:'maintain',level:'Beginner',equipment:'home',days:3,age:35,weight:80,height:180,sex:'male'},
    logs:[],weights:[],foodLog:[],units:'metric',workoutLayoutVersion:2
   })));
   await page.goto('http://127.0.0.1:'+server.address().port+'/'+(web===root?'fitness.html':'index.html'),{waitUntil:'domcontentloaded'});
   await page.evaluate(()=>{
    const id='guided-home-full-body-a';
    state.selectedWorkout=id;
    state.homeWorkoutChoice={id,date:foodDate()};
    const canvas=document.createElement('canvas');
    canvas.width=64;canvas.height=64;canvas.getContext('2d').fillRect(0,0,64,64);
    window.customThumb=canvas.toDataURL('image/jpeg');
    pendingPersonalPhotos['photo-test-squat']=window.customThumb;
    state.trainerMedia={[id+'|Goblet Squat']:{photoId:'photo-test-squat'}};
    tab='home';render();
   });
   const custom=await page.evaluate(()=>window.customThumb);
   assert.equal(await page.locator('.home-exercise-preview img').count(),6);
   assert.equal(await page.locator('.home-exercise-preview img').first().getAttribute('src'),custom);
   await page.evaluate(()=>{
    window.testSpeech=[];
    const voice={name:'Test English',voiceURI:'test-en',lang:'en-US',localService:true};
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{
     getVoices:()=>[voice],speak:message=>window.testSpeech.push([message.text,message.voice?.voiceURI??null]),cancel:()=>{}
    }});
    window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
   });
   await page.getByRole('button',{name:'Manage workouts'}).click();
   const chooser=page.locator('#workout-chooser');
   assert(await chooser.isVisible());
   assert.equal(await chooser.locator('[data-workout-category="Leg"] [data-anatomy-region="hamstrings"]').count(),1);
   await chooser.getByRole('button',{name:'Explore Push workouts'}).click();
   assert(await chooser.locator('.program-photo .hybrid-workout-cover').count()>0);
   await chooser.getByRole('button',{name:'Close workout chooser'}).click();
   await page.getByRole('button',{name:'Start workout',exact:true}).click();
   assert.equal(await page.locator('body').getAttribute('data-view'),'train');
   assert.equal(await page.locator('.workout-countdown').count(),0);
   const clock=page.locator('#workout-elapsed-clock');
   await page.waitForFunction(()=>document.getElementById('workout-elapsed-clock').textContent!=='0:00');
   const elapsedBeforeRender=await page.evaluate(()=>activeWorkoutElapsed());
   await page.evaluate(()=>render());
   assert(await clock.isVisible());
   assert(await page.evaluate(()=>activeWorkoutElapsed())>=elapsedBeforeRender);
   assert.deepEqual(await page.evaluate(()=>window.testSpeech),[]);
   assert.deepEqual(await page.locator('.set-head').first().locator('span').allTextContents(),['Set','Last time','kg','Reps','Done']);
   const inputOrder=await page.locator('.set-row').first().locator('input').evaluateAll(inputs=>inputs.map(input=>Object.keys(input.dataset)[0]));
   assert.deepEqual(inputOrder,['setWeight','setReps','setDone']);
   await page.locator('[data-rest-options]').click();
   await page.locator('.training-rest-options summary').click();
   await page.locator('[data-open-rest-voices]').click();
   const voices=page.locator('#rest-voice-picker');
   await voices.getByRole('button',{name:'Preview American English · Voice 1'}).click();
   assert.deepEqual(await page.evaluate(()=>window.testSpeech.pop()),['Five seconds left.','test-en']);
   await voices.getByRole('button',{name:'American English · Voice 1',exact:true}).click();
   await page.locator('[data-rest-options-close]').click();
   await page.evaluate(()=>startRestTimer(6));
   await page.waitForFunction(()=>window.testSpeech.some(([text,voice])=>text==='Five seconds left.'&&voice==='test-en'));
   await page.evaluate(()=>{state.restTimer=null;syncRestAudio()});
   await page.locator('.training-options>summary').click();
   await page.locator('[data-open-exercises]').click();
   assert.equal(await page.locator('[data-exercise-pick] img').count(),6);
   assert.equal(await page.locator('[data-exercise-pick] img').first().getAttribute('src'),custom);
   await page.locator('[data-close-exercises]').click();

   await page.evaluate(()=>{
    lastSessionRecap={
     date:new Date().toISOString(),title:'Full Body A · Squat & Press',workoutId:'guided-home-full-body-a',elapsedMinutes:39,
     exercises:[
      {name:'Goblet Squat',sets:[{reps:8,kg:24,done:true},{reps:8,kg:200,done:false}]},
      {name:'Single-Arm Dumbbell Row',prescription:'8 reps / side',sets:[{reps:8,kg:20,done:true}]},
      {name:'Dead Bug',sets:[{reps:8,kg:'',done:true}]},
      {name:'Forearm Plank',unit:'sec',sets:[{reps:45,kg:10,done:true}]},
      {name:'Dumbbell Shrug',sets:[{reps:10,kg:10,done:true}]},
      {name:'My custom lift',sets:[{reps:7,kg:0,done:true}]},
      {name:'Lying Machine Leg Curl',sets:[{reps:0,kg:25,done:true}]},
     ]
    };state.logs.push(lastSessionRecap);tab='progress';render();
   });
   const metrics=await page.locator('.workout-recap .recap-numbers strong').allTextContents();
   assert.deepEqual(metrics,['6','39 min','612 kg']);
   assert.equal(await page.locator('.recap-muscles [data-anatomy-region="hamstrings"]').count(),0);
   assert((await page.locator('.recap-muscle-note').first().textContent()).includes('1 completed exercise'));
   await page.locator('[data-recap-muscle="glutes"]').click();
   assert.equal(await page.locator('.recap-muscles [data-anatomy-region]:not([hidden])').count(),1);
   await page.locator('[data-recap-muscle="glutes"]').click();
   assert(await page.locator('.recap-muscles [data-anatomy-region]:not([hidden])').count()>1);
   await page.locator('[data-recap-muscle="traps"]').click();
   const trapLayer=page.locator('.recap-muscles [data-anatomy-region="traps"].anatomy-primary');
   assert(await trapLayer.isVisible());
   assert((await trapLayer.evaluate(layer=>getComputedStyle(layer).clipPath)).startsWith('polygon('));
   assert.equal(await page.locator('.recap-muscles [data-anatomy-region]:not([hidden])').count(),1);
   await page.locator('[data-recap-muscle="traps"]').click();
   await page.locator('.recap-completed summary').click();
   assert.equal(await page.locator('.recap-completed li').count(),6);
   assert.equal(await page.locator('.recap-completed img').first().getAttribute('src'),custom);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(width===390)await page.locator('.workout-recap').screenshot({path:'/tmp/ezpz-recap-mobile-test.jpg'});
   await page.locator('[data-recap-done]').click();
   assert.equal(await page.locator('body').getAttribute('data-view'),'home');
   assert.equal(await page.locator('.home-exercise-sets').first().textContent(),'3 sets');
   await page.locator('[data-edit-home-exercise="0"]').click();
   await page.locator('[data-edit-swap]').click();
   assert(await page.locator('#workout-edit-search').isVisible());
   await page.keyboard.press('Escape');
   await page.getByRole('button',{name:'Manage workouts'}).click();
   await page.getByRole('button',{name:/^Create your own/}).click();
   const builder=page.locator('#builder-exercise-picker');
   assert(await builder.isVisible());
   assert(await builder.locator('[data-builder-muscle="traps"] [data-anatomy-region="traps"]').isVisible());
   for(const appearance of [{mode:'dark'},{mode:'light'},{mode:'dark',accent:'lavender'}]){
    await page.evaluate(prefs=>applyAppAppearance(prefs),appearance);
    const tile=builder.locator('[data-builder-muscle="chest"]');
    assert.equal(await tile.locator('strong').evaluate(el=>getComputedStyle(el).color),'rgb(243, 255, 247)');
    assert.match(await tile.evaluate(el=>getComputedStyle(el).backgroundImage),/linear-gradient/);
    assert(await tile.locator('.recap-anatomy').evaluate(el=>el.offsetWidth>=el.parentElement.clientWidth-6));
   }
   await builder.locator('[data-builder-muscle="chest"]').click();
   const movement=builder.locator('[data-builder-movement="Dumbbell Bench Press"]');
   for(const appearance of [{mode:'dark'},{mode:'light'},{mode:'dark',accent:'lavender'}]){
    await page.evaluate(prefs=>applyAppAppearance(prefs),appearance);
    const palette=await movement.evaluate(el=>[getComputedStyle(el).backgroundColor,getComputedStyle(el.querySelector('strong')).color]);
    assert.deepEqual(palette,['rgb(35, 75, 56)','rgb(241, 255, 245)']);
   }
   await builder.getByRole('searchbox').fill('dumbbell bench press');
   assert(await movement.locator('img').isVisible());
   assert.equal(await movement.locator('[data-anatomy-region="chest"]').count(),1);
   await movement.click();
   assert.equal(await page.locator('#builder-name-0').inputValue(),'Dumbbell Bench Press');
   const selectedRow=page.locator('.builder-exercise').first();
   assert.equal(await selectedRow.evaluate(el=>el.open),false);
   assert(await selectedRow.locator('summary img').isVisible());
   await selectedRow.locator('.builder-exercise-summary').click();
   assert(await selectedRow.locator('.builder-exercise-fields>img').isVisible());
   await page.locator('[data-builder-picker="0"]').click();
   await builder.getByRole('button',{name:'Type my own exercise'}).click();
   await page.locator('#builder-name-0').fill('My own exercise');
   assert.equal(await page.locator('#builder-name-0').inputValue(),'My own exercise');
   await page.locator('#builder-name-0').clear();
   await page.locator('[data-builder-picker="0"]').click();
   await builder.locator('[data-builder-muscle="forearms"]').click();
   await builder.getByRole('searchbox').fill('dead hang');
   const hang=builder.locator('[data-builder-movement="Dead Hang"]');
   assert.equal(await hang.locator('[data-anatomy-region="forearms"]').count(),1);
   await hang.locator('img').evaluate(img=>img.decode());
   await hang.click();
   assert.equal(await page.locator('#builder-name-0').inputValue(),'Dead Hang');
   assert.equal(await page.locator('[name="unit0"]').inputValue(),'sec');
   assert.equal(await page.locator('[name="reps0"]').inputValue(),'15–30');
   await page.locator('#builder-title').fill('Expansion smoke test');
   await page.getByRole('button',{name:'Save & start workout'}).click();
   assert.equal(await page.locator('body').getAttribute('data-view'),'train');
   assert.equal(await page.locator('.workout-media-repair').count(),0);
   assert(await page.locator('[data-training-card="0"] img').first().isVisible());

   await page.close();
   console.log('PASS workout recap, photo precedence and muscle selection at '+width);
  }
 }finally{await browser.close();server.close()}
})().catch(error=>{console.error(error);server.close();process.exitCode=1});
