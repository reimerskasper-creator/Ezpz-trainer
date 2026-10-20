// Run with: node tests/home.cjs
const fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','fitness.html'),'utf8');

// Home tests exercise the real app script in a minimal document.
const assert=(ok,message)=>{if(!ok)throw Error(message)};
const screen={innerHTML:''},listeners={};
let stored=JSON.stringify({
 profile:{goal:'lose',level:'Beginner',equipment:'home',days:3,age:35,weight:80,height:180,sex:'male'},
 logs:[],weights:[],shopping:[],workoutLayoutVersion:2
});
const document={body:{dataset:{}},getElementById:id=>id==='screen'?screen:null,querySelectorAll:()=>[],querySelector:()=>null,addEventListener:(name,fn)=>(listeners[name]??=[]).push(fn)};
const window={addEventListener(){},scrollTo(){}};
const storage={getItem:()=>stored,setItem:(key,value)=>{assert(key==='ezpz-fitness-pilot-1','Storage key changed');stored=value}};
const scripts=Array.from(source.matchAll(/<script>([\s\S]*?)<\/script>/g),m=>m[1]).join('\n');
const api=new Function('document','window','localStorage','fetch','console','alert','confirm',scripts+'\nreturn {home,homeOverview,render,foodDate,workoutTemplates,workoutPlan,workoutDraft,get state(){return state},set state(value){state=value},setTab(value){tab=value}}')(document,window,storage,()=>new Promise(()=>{}),{error(){}},message=>{throw Error(message)},()=>true);
const initial=JSON.stringify(api.state);api.home();
assert(JSON.stringify(api.state)===initial,'Home changed saved data');
assert(screen.innerHTML.includes('Start workout'),'Empty state must show Start');
assert(screen.innerHTML.includes('0 meals logged'),'Empty nutrition state');
assert(screen.innerHTML.includes('Add weigh-in'),'Missing weight should invite entry');
assert(screen.innerHTML.includes('Your next workout')&&screen.innerHTML.includes('data-go="planner"'),'Next workout and planner shortcut');
assert(!screen.innerHTML.includes('undefined')&&!screen.innerHTML.includes('NaN'),'Broken home content');
assert(screen.innerHTML.includes('id="workout-chooser"'),'Home must contain workout chooser');
api.state.selectedWorkout='push-a';
api.state.workoutDrafts={'push-a':{'sr0-0':'8','sw0-0':'20','sd0-0':true}};
api.home();let overview=api.homeOverview();
assert(overview.hasDraft&&overview.doneSets===1,'Selected workout draft not counted');
assert(screen.innerHTML.includes('Resume workout'),'Resume action missing');
assert(screen.innerHTML.includes('Push Day A'),'Selected workout name missing');
api.state.selectedWorkout='core-b';api.home();
assert(!api.homeOverview().hasDraft,'Draft leaked across workouts');
api.state.selectedWorkout='push-a';api.home();
assert(api.state.workoutDrafts['push-a']['sr0-0']==='8','Switching lost draft');
const now=new Date(),earlier=new Date(now);earlier.setMinutes(earlier.getMinutes()-1);
api.state.logs=[{date:earlier.toISOString(),workoutId:'push-a',type:'home'},{date:earlier.toISOString(),workoutId:'pull-a',type:'home'}];
api.state.workoutDrafts['push-a']={};api.home();overview=api.homeOverview();
assert(overview.weekly.length===2&&overview.trainingDays.size===1,'Two same-day sessions must count as one training day');
assert(screen.innerHTML.includes('LOGGED TODAY')&&screen.innerHTML.includes('Open workout'),'Completed state missing');
api.state.foodLog=[{date:api.foodDate(),macros:[450,35,45,12],name:'Test meal',servings:1},{date:'2001-01-01',macros:[999,90,90,90],name:'Old meal'}];
api.state.weights=[{kg:80,date:earlier.toISOString()},{kg:79.5,date:now.toISOString()}];
api.state.shopping=['Olive oil — 10 g','Olive oil — 5 g','Broccoli (cooked) — 150 g'];api.state.checkedShopping={'Olive oil':true};
api.home();overview=api.homeOverview();
assert(overview.food.totals.join(',')==='450,35,45,12','Nutrition must include today only');
assert(overview.delta===-.5,'Weight delta incorrect');
assert(overview.shoppingTotal===2&&overview.shoppingLeft===1,'Shopping must merge duplicate ingredients and respect checkmarks');
assert(screen.innerHTML.includes('450')&&screen.innerHTML.includes('1 meal logged'),'Nutrition labels incorrect');
const before=JSON.stringify(api.state);api.home();assert(JSON.stringify(api.state)===before,'Rendering mutated history/drafts');
for(const w of api.workoutTemplates){api.state.selectedWorkout=w.id;api.home();assert(!screen.innerHTML.includes('undefined')&&!screen.innerHTML.includes('NaN'),'Invalid home for '+w.id)}
// Existing workout pages must still render the correct set counts.
for(const w of api.workoutTemplates){api.state.selectedWorkout=w.id;api.setTab('train');api.render();assert((screen.innerHTML.match(/data-set-done=/g)||[]).length===w.exercises.reduce((sum,x)=>sum+x.sets,0),'Workout set count changed for '+w.id);api.setTab('instructions');api.render();assert(screen.innerHTML.includes(w.title),'Instructions changed for '+w.id)}
api.setTab('home');
// Test shortcut routing into existing food log and weigh-in form.
let scrolled=false,focused=false;const section={open:false,scrollIntoView(){scrolled=true},querySelector(){return {focus(){focused=true}}}};
document.querySelector=()=>section;
function clickFocus(homeFocus){for(const fn of listeners.click)fn({target:{closest:selector=>selector==='[data-home-focus]'?{dataset:{homeFocus}}:null}})}
clickFocus('diary');assert(section.open&&scrolled&&document.body.dataset.view==='eat','Food-log shortcut failed');
scrolled=false;clickFocus('weight');assert(scrolled&&focused&&document.body.dataset.view==='progress','Weight shortcut failed');
console.log('PASS: empty/populated home, all 16 workouts, resume/completed states, today-only nutrition, unique training days, weight delta, merged shopping counts, useful shortcuts and unchanged saved data.');
