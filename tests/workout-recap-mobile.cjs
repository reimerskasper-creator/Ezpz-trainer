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
   await page.evaluate(width=>applyAppAppearance({mode:width===390?'light':'dark',accent:width===430?'ocean':'emerald'}),width);
   await page.evaluate(()=>{window.testProfile=state.profile;state.profile=null;render()});
   const backupIcon=page.locator('#fitness-account-panel .account-backup>summary>svg');
   assert.equal(await backupIcon.evaluate(icon=>icon.getBoundingClientRect().width),24);
   for(const [name,option,value] of [['goal','Build muscle','gain'],['level','Advanced','Advanced'],['equipment','At a gym','gym'],['days','5','5'],['sex','Female formula','female']]){
    await page.locator('#setup-'+name+'-picker').click();
    const picker=page.locator('.ez-choice-dialog[open]');
    const choice=picker.getByRole('button',{name:option,exact:true});
    assert(await choice.isVisible());
    assert(await choice.evaluate(button=>{
     const style=getComputedStyle(button);
     const light=color=>color.match(/\d+/g).slice(0,3).map(channel=>{
      const v=Number(channel)/255;
      return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;
     }).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],.05);
     const foreground=light(style.color),background=light(style.backgroundColor);
     return Math.max(foreground,background)/Math.min(foreground,background)>=4.5;
    }));
    await choice.click();
    await picker.waitFor({state:'hidden'});
    assert.equal(await page.locator('#setup-'+name).inputValue(),value);
   }
   await page.locator('#setup-days-picker').click();
   await page.keyboard.press('Escape');
   await page.locator('.ez-choice-dialog').waitFor({state:'detached'});
   assert.equal(await page.locator('#setup-days').inputValue(),'5');
   await page.evaluate(()=>{state.profile=window.testProfile;render()});
   await page.getByRole('button',{name:'Manage workouts'}).click();
   const chooser=page.locator('#workout-chooser');
   assert(await chooser.isVisible());
   const categoryCards=chooser.locator('.category-tile');
   assert.equal(await categoryCards.count(),10);
   const first=await categoryCards.first().boundingBox(),second=await categoryCards.nth(1).boundingBox();
   assert(first&&second&&first.x===second.x&&first.width===second.width&&second.y>=first.y+first.height);
   for(const card of await categoryCards.all()){
    assert.equal(await card.locator('.category-anatomy-panel .recap-anatomy').count(),1);
    assert.match(await card.evaluate(el=>getComputedStyle(el).backgroundImage),/radial-gradient/);
   }
   const pull=chooser.locator('[data-workout-category="Pull"]');
   assert.equal(await pull.locator('[data-anatomy-region="traps"].anatomy-primary').count(),1);
   assert.equal(await pull.locator('[data-anatomy-region="triceps"].anatomy-supporting').count(),1);
   assert.equal(await chooser.locator('[data-workout-category="Leg"] .category-anatomy-front [data-anatomy-region="calves"].anatomy-primary').count(),1);
   await chooser.getByRole('button',{name:'Explore Push workouts'}).click();
   assert(await chooser.locator('.program-photo .hybrid-workout-cover').count()>0);
   const program=chooser.locator('.program-card').first();
   const grid=program.locator('.program-photo + .program-exercise-grid');
   assert(await grid.locator('li').count()>0);
   assert.equal(await grid.evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),3);
   assert(await grid.locator('img').count()>0);
   assert(await grid.getByRole('link',{name:/Watch .* demo/}).count()>0);
   assert.equal(await program.getByText('See exercises',{exact:true}).count(),0);
   await program.locator('.program-details>summary').click();
   assert(await program.getByText('Training notes',{exact:true}).isVisible());
   await chooser.getByRole('button',{name:'Close workout chooser'}).click();
   await page.getByRole('button',{name:'Start workout',exact:true}).click();
   assert.equal(await page.locator('body').getAttribute('data-view'),'train');
   assert.equal(await page.locator('.workout-countdown').count(),0);
   assert.equal(await page.locator('#workout-elapsed-clock').count(),0);
   assert(await page.locator('.session-footer .footer-rest').isVisible());
   assert(await page.locator('.session-footer [data-action="finish"]').isVisible());
   await page.evaluate(()=>render());
   assert.equal(await page.locator('#workout-elapsed-clock').count(),0);
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
   assert.deepEqual(metrics,['6','39:00','612 kg']);
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
   await page.evaluate(width=>applyAppAppearance({mode:width===390?'light':'dark',accent:width===430?'ocean':'emerald'}),width);
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
   const timing = selectedRow.locator('.own-exercise-options');
   const remove = selectedRow.getByRole('button',{name:'Remove exercise 1'});
   const timingBox = await timing.boundingBox(), removeBox = await remove.boundingBox();
   assert(timingBox.width >= 120 && timingBox.height <= 72,'Timing label has room for a compact footer');
   assert(timingBox.x + timingBox.width <= removeBox.x,'Remove stays alongside timing options');
   await timing.locator('summary').click();
   assert(await timing.evaluate(el=>el.open));
   assert((await timing.boundingBox()).width > timingBox.width,'Expanded timing uses the full footer width');
   await timing.locator('summary').click();

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
