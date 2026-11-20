const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..'),key='ezpz-fitness-pilot-1',out=path.join(root,'test-results');
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}fs.readFile(file,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.html')?'text/html':file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.png')?'image/png':'image/jpeg'});res.end(e?'':b)})});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch();
 try{
  for(const width of [320,390,430]){
   const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await context.addInitScript(key=>{
    if(localStorage.getItem(key))return;
    const id='guided-gym-pull-a';
    localStorage.setItem(key,JSON.stringify({
     profile:{goal:'maintain',level:'Beginner',equipment:'gym',days:3,age:35,weight:80,height:180,sex:'male'},
     logs:[],weights:[],foodLog:[],workoutLayoutVersion:2,selectedWorkout:id,
     workoutDrafts:{[id]:{'sr0-0':'10','sd0-0':true}},
    }));
   },key);
   await page.goto('http://127.0.0.1:'+server.address().port+'/fitness.html');
   const card=page.locator('.home-workout'),hero=card.locator('.home-workout-hero');
   const toggle=card.locator('[data-home-panel=todayWorkout]'),details=card.locator('.home-workout-details');
   const cover=hero.locator('.hybrid-workout-cover');
   const headerPhoto=await hero.boundingBox(),expand=await toggle.boundingBox();
   assert(expand.y>=headerPhoto.y+headerPhoto.height,'Expansion control stays below the cover');
   const primaryPaint=el=>getComputedStyle(el).backgroundImage;
   assert.equal(await card.locator('.home-change-workout').evaluate(primaryPaint),await page.locator('.overview-actions>.primary').evaluate(primaryPaint));
   const photo=await cover.locator('img').getAttribute('src');
   const anatomy=await cover.locator('[data-anatomy-region]').evaluateAll(layers=>layers.map(layer=>layer.outerHTML));
   assert(anatomy.length>0);
   const live=await page.evaluate(()=>homeOverview().plan.exercises.map(x=>x.name));
   assert.deepEqual(await details.locator('.home-exercise-name').allTextContents(),live);
   assert.equal(await details.locator('.home-exercise-prescription').count(),live.length);
   assert.equal(await details.locator('.exercise-thumbnail').count(),live.length);
   assert((await card.locator('.home-session-progress').textContent()).includes('1 / '));
   assert((await details.boundingBox()).y>=(await hero.boundingBox()).y+(await hero.boundingBox()).height-1);
   const height=(await card.boundingBox()).height;
   const before=await page.evaluate(()=>JSON.stringify(state.workoutDrafts));
   await card.locator('.home-change-workout').click();
   await page.locator('[data-workout-category="Pull"]').click();
   const pickerCover=page.locator('.program-card').filter({has:page.locator('[data-workout-pick="guided-gym-pull-a"]')}).locator('.program-photo');
   assert.equal(await pickerCover.locator('img').getAttribute('src'),photo);
   assert.deepEqual(await pickerCover.locator('[data-anatomy-region]').evaluateAll(layers=>layers.map(layer=>layer.outerHTML)),anatomy);
   await page.keyboard.press('Escape');
   if(width===390){fs.mkdirSync(out,{recursive:true});await card.screenshot({path:path.join(out,'home-workout-banner-expanded.jpg')})}
   await toggle.click();
   assert.equal(await toggle.getAttribute('aria-expanded'),'false');
   assert((await toggle.boundingBox()).y>=(await hero.boundingBox()).y+(await hero.boundingBox()).height,'Collapsed cover remains clear');
   assert(!await details.isVisible());
   assert(await cover.locator('.recap-anatomy').isVisible());
   assert.equal(await cover.locator('img').getAttribute('src'),photo);
   assert.deepEqual(await cover.locator('[data-anatomy-region]').evaluateAll(layers=>layers.map(layer=>layer.outerHTML)),anatomy);
   assert(await card.locator('.home-change-workout').isVisible());
   assert(await card.locator('.home-change-workout').evaluate(button=>{
    const icon=button.querySelector('svg').getBoundingClientRect();
    const label=button.querySelector('span').getBoundingClientRect();
    return icon.left>=label.right&&Math.abs((icon.top+icon.height/2)-(label.top+label.height/2))<2;
   }));
   assert((await card.boundingBox()).height<Math.min(260,height/1.5));
   assert.equal(await page.evaluate(()=>JSON.stringify(state.workoutDrafts)),before);
   if(width===390)await card.screenshot({path:path.join(out,'home-workout-banner-minimized.jpg')});
   await page.reload();
   assert.equal(await toggle.getAttribute('aria-expanded'),'false');
   assert((await toggle.boundingBox()).y>=(await hero.boundingBox()).y+(await hero.boundingBox()).height,'Collapsed cover remains clear');
   await toggle.focus();
   await page.keyboard.press('Enter');
   assert(await details.isVisible());
   assert(await toggle.evaluate(el=>document.activeElement===el));
   await page.evaluate(()=>{
    const c=document.createElement('canvas');c.width=80;c.height=60;
    const ctx=c.getContext('2d');ctx.fillStyle='#466c54';ctx.fillRect(0,0,80,60);
    state.personalPhotos={'photo-home-workout-test':c.toDataURL('image/jpeg')};
    state.homeBannerBackgrounds={todayWorkout:{photoId:'photo-home-workout-test',x:48,y:52,zoom:1.2,dim:.25}};
    home();
   });
   assert.match(await hero.getAttribute('style'),/data:image\/jpeg/);
   assert.equal(await cover.locator('img').evaluate(el=>getComputedStyle(el).visibility),'hidden');
   assert(await cover.locator('.recap-anatomy').isVisible());
   await page.evaluate(()=>{delete state.homeBannerBackgrounds;state.workoutDrafts={};state.workoutSchedule={[foodDate()]:'rest'};home()});
   assert(await card.locator('.home-recovery-details').isVisible());
   assert.equal(await card.locator('.home-workout-hero').count(),0);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   assert.deepEqual(errors,[]);
   await context.close();
   console.log('PASS Home cover '+width+': picker artwork parity, open and closed anatomy, exercise rows, banner photo override and recovery');
  }
 }finally{await browser.close();server.close()}
})().catch(error=>{console.error(error);server.close();process.exitCode=1});
