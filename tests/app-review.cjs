// Run: node tests/app-review.cjs
const fs=require('node:fs'),path=require('node:path'),source=fs.readFileSync(path.join(__dirname,'../fitness.html'),'utf8');
const catalogue=JSON.parse(fs.readFileSync(path.join(__dirname,'../exercise-catalog.json'),'utf8')).exercises;
const scripts=[...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n');
const screen={innerHTML:''},listeners={},fields={},nav=['home','train','eat','progress','more'].map(tab=>({dataset:{tab},setAttribute(k,v){this[k]=v}}));
let writes=0,stored=JSON.stringify({profile:{goal:'maintain',level:'Beginner',equipment:'home',days:3,age:35,weight:80,height:180,sex:'male'},logs:[],weights:[],workoutLayoutVersion:2});
const document={body:{dataset:{}},getElementById:id=>id==='screen'?screen:null,querySelector:sel=>fields[sel]||null,querySelectorAll:sel=>sel==='[data-tab]'?nav:[],addEventListener:(n,f)=>(listeners[n]??=[]).push(f)};
const api=new Function('document','window','localStorage','fetch','console','alert','confirm',scripts+'\nreturn {train,more,progress,progressData,restoredState,previousSetText,render,recipes,workoutPlan,workoutTemplates,approvedExerciseImage,setTab(v){tab=v},setCatalog(v){exerciseCatalog=v},get state(){return state},set state(v){state=v}}')(document,{addEventListener(){},scrollTo(){}},{getItem:()=>stored,setItem:(k,v)=>{stored=v;writes++}},()=>new Promise(()=>{}),{error(){}},m=>{throw Error(m)},()=>true);
const assert=(v,m)=>{if(!v)throw Error(m)};
api.setCatalog(catalogue);
for(const workout of api.workoutTemplates){api.state.selectedWorkout=workout.id;api.train();assert((screen.innerHTML.match(/class="session-exercise"/g)||[]).length>=6,'Exercise cards '+workout.id);assert(screen.innerHTML.includes('session-footer'),'Persistent finish action');assert((screen.innerHTML.match(/data-set-reps=/g)||[]).length===api.workoutPlan().exercises.reduce((n,x)=>n+x.sets,0),'Set count '+workout.id);assert(!screen.innerHTML.includes('Verified images pending'),'Placeholder in workout')}
assert(api.previousSetText({unit:'reps',sets:[{reps:'8',kg:'20',done:true}]},0,{unit:'reps'})==='8 × 20 kg','Previous set');
assert(api.previousSetText({unit:'reps',sets:[{reps:'8',kg:'20',done:false}]},0,{unit:'reps'})==='—','Incomplete set must not be previous performance');
assert(api.previousSetText({unit:'min',sets:[{reps:'5',done:true}]},0,{unit:'sec'})==='—','Do not mix minutes and seconds');
const now=new Date('2026-10-20T12:00:00'),base=JSON.parse(stored);
base.logs=Array.from({length:25},(_,i)=>({date:new Date(now.getTime()-i*3600000).toISOString(),title:'Push Day A',exercises:[{name:'Barbell Bench Press',sets:[{reps:'8',kg:'20',done:true},{reps:'',kg:'',done:false}]}]}));base.weights=[{date:'2026-10-12',kg:81},{date:'2026-10-19',kg:80}];api.state=base;
const before=JSON.stringify(api.state),d=api.progressData(now);assert(d.logs.length===25&&d.sets===25,'Workout and completed set totals');assert(d.weeks[3].days<=2,'Multiple sessions do not inflate training days');assert(d.delta===-1,'Weight trend');
api.progress();assert((screen.innerHTML.match(/class="history-session"/g)||[]).length===12,'Initial history page');
for(const fn of listeners.click||[])fn({target:{closest:s=>s==='[data-action]'?{dataset:{action:'more-history'}}:null}});
assert((screen.innerHTML.match(/class="history-session"/g)||[]).length===24,'More workout history');
api.more();assert(!screen.innerHTML.includes('data-go="library"')&&screen.innerHTML.includes('data-go="shopping"')&&screen.innerHTML.includes('id="data-tools"'),'More destinations');
for(const dest of ['shopping','library']){api.setTab(dest);api.render();assert(nav.find(x=>x.dataset.tab==='more')['aria-current']==='page','More selected for '+dest)}
assert(JSON.stringify(api.state)===before,'Browsing mutated saved data');
const backup={...base,shopping:['Tomatoes (raw) — 100 g'],checkedShopping:{'Tomatoes (raw)':true},foodLog:[{id:'meal-1',date:'2026-10-20',name:'Chicken rice bowl',servings:1.5,macros:[933,83,93,26]}],mealPlan:{'2026-10-20':{breakfast:0,breakfastPortion:1,lunch:1,lunchPortion:1.5,dinner:48,dinnerPortion:2}},mealPlanOffset:2,draft:{variant:'A',equipment:'home','sr0-0':'10','sd0-0':true},selectedWorkout:'pull-a',workoutDrafts:{'pull-a':{'sr0-0':'8','sw0-0':'15','sd0-0':true}},workoutLayoutVersion:2};
const restored=api.restoredState(backup);for(const k of ['profile','logs','weights','shopping','checkedShopping','foodLog','mealPlan','mealPlanOffset','draft','selectedWorkout','workoutDrafts','workoutLayoutVersion'])assert(JSON.stringify(restored[k])===JSON.stringify(backup[k]),'Backup loses '+k);
assert(!api.approvedExerciseImage(catalogue[0],'start'),'Unreviewed exercise image exposed');
assert(writes===0,'Read-only review wrote storage');
console.log('PASS: 16 workouts, 5-column logging, previous-set units, full history, truthful progress, More navigation and complete backup state');
