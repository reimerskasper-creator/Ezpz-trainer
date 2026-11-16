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
   await page.locator('[data-home-start]').click();
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
      {name:'My custom lift',sets:[{reps:7,kg:0,done:true}]},
      {name:'Lying Machine Leg Curl',sets:[{reps:0,kg:25,done:true}]},
     ]
    };state.logs.push(lastSessionRecap);tab='progress';render();
   });
   const metrics=await page.locator('.workout-recap .recap-numbers strong').allTextContents();
   assert.deepEqual(metrics,['5','39 min','512 kg']);
   assert.equal(await page.locator('[data-muscle-region="hamstrings"]').count(),0);
   assert((await page.locator('.recap-muscle-note').first().textContent()).includes('1 completed exercise'));
   await page.locator('[data-recap-muscle="glutes"]').click();
   assert.equal(await page.locator('[data-muscle-region]:not([hidden])').count(),1);
   await page.locator('[data-recap-muscle="glutes"]').click();
   assert(await page.locator('[data-muscle-region]:not([hidden])').count()>1);
   await page.locator('.recap-completed summary').click();
   assert.equal(await page.locator('.recap-completed li').count(),5);
   assert.equal(await page.locator('.recap-completed img').first().getAttribute('src'),custom);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(width===390)await page.locator('.workout-recap').screenshot({path:'/tmp/ezpz-recap-mobile-test.jpg'});
   await page.close();
   console.log('PASS workout recap, photo precedence and muscle selection at '+width);
  }
 }finally{await browser.close();server.close()}
})().catch(error=>{console.error(error);server.close();process.exitCode=1});
