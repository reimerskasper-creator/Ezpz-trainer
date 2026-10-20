// Run with: node tests/workouts.cjs
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','fitness.html'),'utf8');
const catalog=JSON.parse(fs.readFileSync(path.join(__dirname,'..','exercise-catalog.json'),'utf8')).exercises;
const profile={goal:'lose',level:'Beginner',equipment:'home',days:3,age:35,weight:80,height:180,sex:'male'};
const original={profile,logs:[{date:'2026-10-20',type:'home',variant:'A',exercises:[{name:'Chair Squat',sets:[{reps:'10',kg:'5',done:true}]}]}],weights:[{kg:80,date:'2026-10-20'}],shopping:['Olive oil — 10 g'],foodLog:[{name:'existing meal'}],workoutDrafts:{'cardio-a':{'sr2-0':'5','sd2-0':true}},draft:{variant:'B',equipment:'home',sr0:'10','sr0-0':'11','sd0-0':true}};
let stored=JSON.stringify(original),fields={};const listeners={};
const screen={innerHTML:''};
const context={console,Date,Math,Number,Map,Set,JSON,Array,Object,Blob,URL,Promise,Error,FormData,alert:m=>{throw Error(m)},confirm:()=>true,setTimeout:()=>{},fetch:()=>new Promise(()=>{}),localStorage:{getItem:()=>stored,setItem:(k,v)=>{assert.equal(k,'ezpz-fitness-pilot-1');stored=v}},window:{addEventListener:()=>{},scrollTo:()=>{}},document:{body:{dataset:{}},getElementById:id=>id==='screen'?screen:null,querySelectorAll:()=>[],querySelector:s=>fields[s]||null,addEventListener:(type,fn)=>(listeners[type]??=[]).push(fn)}};
vm.createContext(context);for(const m of source.matchAll(/<script>([\s\S]*?)<\/script>/g))vm.runInContext(m[1],context);
function run(code){return vm.runInContext(code,context)}
context.catalogFixture=catalog;run('exerciseCatalog=catalogFixture;libraryLoading=false;');
assert.equal(run('workoutTemplates.length'),16);
assert.equal(run('state.workoutDrafts["cardio-a"]["sr7-0"]'),'5');assert.equal(run('state.workoutDrafts["cardio-a"]["sd7-0"]'),true);assert.equal(run('state.workoutDrafts["cardio-a"]["sr2-0"]'),undefined);
assert.equal(run('migrateWorkoutDrafts()'),false);
assert.ok(run('Object.values(programs).concat(Object.values(alternate)).every(w=>w.length>=6)'));
assert.ok(run('workoutTemplates.every(w=>w.exercises.filter(x=>!/Warm-up|Cooldown/.test(x.name)).length>=6)'));
assert.equal(run('new Set(workoutTemplates.map(w=>w.id)).size'),16);
for(const cat of ['Push','Pull','Leg','Core','Mobility','Stability','Cardio','HIIT']){
 const pair=JSON.parse(run(`JSON.stringify(workoutTemplates.filter(w=>w.category===${JSON.stringify(cat)}))`));assert.equal(pair.length,2);assert.notDeepEqual(pair[0].exercises.map(x=>x.name),pair[1].exercises.map(x=>x.name));
}
for(const id of JSON.parse(run('JSON.stringify(workoutTemplates.map(w=>w.id))'))){
 run(`state.selectedWorkout=${JSON.stringify(id)};tab='train';render();`);
 assert.ok(screen.innerHTML.includes('id="workout-select"'));assert.ok(screen.innerHTML.includes(run('workoutTitle()')));
 const plan=JSON.parse(run('JSON.stringify(workoutPlan())'));
 assert.equal((screen.innerHTML.match(/data-set-done=/g)||[]).length,plan.exercises.reduce((n,x)=>n+x.sets,0));
 for(const x of plan.exercises){assert.ok(x.sets>0);assert.ok(['reps','sec','min'].includes(x.unit));assert.ok(run(`exerciseTips(workoutPlan().exercises[${x.index}]).length`)>0)}
 run('instructions()');assert.ok(screen.innerHTML.includes('ACSM'));
}
function change(target){for(const fn of listeners.change||[])fn({target})}
change({id:'workout-select',value:'push-a',dataset:{}});
change({dataset:{setReps:'0-0'},value:'8'});change({dataset:{setWeight:'0-0'},value:'20'});change({dataset:{setDone:'0-0'},checked:true});
change({id:'workout-select',value:'core-b',dataset:{}});change({dataset:{setReps:'1-0'},value:'20'});
change({id:'workout-select',value:'push-a',dataset:{}});assert.equal(run('workoutDraft()["sr0-0"]'),'8');assert.equal(run('workoutDraft()["sw0-0"]'),'20');assert.equal(run('workoutDraft()["sd0-0"]'),true);
assert.equal(run('state.workoutDrafts["core-b"]["sr1-0"]'),'20');assert.equal(run('state.draft["sr0-0"]'),'11');
// Timed sets use duration units, omit weight fields and retain recovery instructions.
change({id:'workout-select',value:'hiit-a',dataset:{}});assert.ok(screen.innerHTML.includes('seconds'));assert.ok(screen.innerHTML.includes('90s'));assert.ok(!screen.innerHTML.includes('data-set-weight='));
// Save one completed interval and check its title, units and history.
fields={'[data-set-reps="1-0"]':{value:'30'},'[data-set-done="1-0"]':{checked:true}};
const finish={dataset:{action:'finish'}};const target={closest:s=>s==='[data-action]'?finish:null};for(const fn of listeners.click||[])fn({target});
assert.equal(run('state.logs.at(-1).workoutId'),'hiit-a');assert.equal(run('state.logs.at(-1).exercises[1].unit'),'sec');assert.equal(run('state.logs.at(-1).exercises[1].sets[0].reps'),'30');assert.ok(screen.innerHTML.includes('30 sec'));
// Preset completion must not advance the original A/B plan or erase other drafts.
run("state.selectedWorkout='full-body'");assert.equal(run('workoutPlan().variant'),'B');assert.equal(run('workoutDraft()["sr0-0"]'),'11');assert.equal(run('state.workoutDrafts["push-a"]["sr0-0"]'),'8');
const saved=JSON.parse(stored);assert.deepEqual(saved.weights,original.weights);assert.deepEqual(saved.shopping,original.shopping);assert.deepEqual(saved.foodLog,original.foodLog);assert.deepEqual(saved.logs[0],original.logs[0]);
run('state=JSON.parse(localStorage.getItem(KEY));state.selectedWorkout="push-a"');assert.equal(run('workoutDraft()["sr0-0"]'),'8');
// Custom chooser keeps native dialog accessibility and routes choices without losing drafts.
run("tab='train';render()");assert.ok(screen.innerHTML.includes('aria-haspopup="dialog"'));assert.ok(screen.innerHTML.includes('<dialog id="workout-chooser"'));assert.ok(screen.innerHTML.includes('aria-label="Choose HIIT Day B"'));assert.ok(!screen.innerHTML.includes('<select id="workout-select"'));
function chooseWorkout(id){const choice={dataset:{workoutPick:id}};for(const fn of listeners.click||[])fn({target:{closest:s=>s==='[data-workout-pick]'?choice:null}})}
chooseWorkout('mobility-b');assert.equal(run('activeWorkoutId()'),'mobility-b');assert.equal(run('state.workoutDrafts["push-a"]["sr0-0"]'),'8');chooseWorkout('not-a-workout');assert.equal(run('activeWorkoutId()'),'mobility-b');
const dialog={open:false,showModal(){this.open=true},close(){this.open=false}};context.document.getElementById=id=>id==='screen'?screen:id==='workout-chooser'?dialog:null;
function clickAction(action){for(const fn of listeners.click||[])fn({target:{closest:s=>s==='[data-action]'?{dataset:{action}}:null}})}
clickAction('open-workouts');assert.equal(dialog.open,true);clickAction('close-workouts');assert.equal(dialog.open,false);
console.log('PASS: every preset and full-body A/B has at least six main exercises; cooldown draft migration is stable; 16 sessions render; custom chooser open/close/selection works; movement cues, units and set counts; isolated draft persistence; interval logging/history; original full-body progression and existing data preserved.');
