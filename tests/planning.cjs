// Run: node tests/planning.cjs
const fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../fitness.html'),'utf8'),scripts=[...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n');
const screen={innerHTML:''},listeners={},document={body:{dataset:{}},getElementById:id=>id==='screen'?screen:null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:(n,f)=>(listeners[n]??=[]).push(f)};
let stored=JSON.stringify({profile:{goal:'maintain',level:'Beginner',equipment:'home',days:3,age:35,weight:80,height:180,sex:'male'},logs:[],weights:[],workoutLayoutVersion:2});
const api=new Function('document','window','localStorage','fetch','console','alert','confirm',scripts+'\nreturn {home,planner,planWorkout,previewWorkout,workoutBadges,planSettings,scheduleDays,scheduleWorkout,setPlannedRecipe,copyPlannedDay,repeatPlannedWeek,addPlannedShopping,plannedNutrition,nutrition,recipes,foods,cleanCustomWorkouts,restoredState,nextPlannedWorkout,foodDate,validPlanDate,datePlus,workoutTemplates,migratePracticalHiit,safe,get state(){return state},set state(v){state=v}}')(document,{addEventListener(){},scrollTo(){}},{getItem:()=>stored,setItem:(k,v)=>stored=v},()=>new Promise(()=>{}),{error(){}},m=>{throw Error(m)},()=>true);
const assert=(v,m)=>{if(!v)throw Error(m)},equal=(a,b,m)=>assert(JSON.stringify(a)===JSON.stringify(b),m);
assert(api.safe("Kasper's <workout>")==="Kasper&#39;s &lt;workout&gt;",'Custom names escaped');
assert(api.validPlanDate('2028-02-29')&&!api.validPlanDate('2026-02-30'),'Calendar validation');
api.state.plannerStart='2026-10-26';
for(const days of [1,7,14,21,28]){api.state.plannerDays=days;api.state.plannerOffset=days-1;assert(api.scheduleDays().length===days,'Plan length '+days);api.planner();assert(!/undefined|NaN/.test(screen.innerHTML),'Valid planner '+days)}
assert(api.datePlus('2026-10-26',27)==='2026-11-22','Month and daylight-saving boundary');
const start=api.state.plannerStart;api.state.plannerOffset=0;
api.scheduleWorkout(start,'full-body-home');api.scheduleWorkout(api.datePlus(start,1),'rest');
api.setPlannedRecipe(start,'breakfast',0,1.5);api.setPlannedRecipe(start,'lunch',48,2);
const expected=[0,0,0,0];for(const [i,scale] of [[0,1.5],[48,2]])for(const [name,g] of api.recipes[i].ingredients)api.foods[name].forEach((v,k)=>expected[k]+=v*g*scale/100);
const totals=api.plannedNutrition(start);equal(totals,expected.map(Math.round),'Exact planned nutrition from ingredient weights');
const logBefore=JSON.stringify(api.state.foodLog);api.copyPlannedDay(start,api.datePlus(start,2));
equal(api.state.mealPlan[api.datePlus(start,2)],api.state.mealPlan[start],'Day copy includes portions');
assert(api.state.workoutSchedule[api.datePlus(start,2)]==='full-body-home','Day copy includes workout');
api.repeatPlannedWeek();for(const n of [7,14,21]){equal(api.state.mealPlan[api.datePlus(start,n)],api.state.mealPlan[start],'Week repeat meals '+n);assert(api.state.workoutSchedule[api.datePlus(start,n+1)]==='rest','Week repeat rest '+n)}
assert(JSON.stringify(api.state.foodLog)===logBefore,'Planning must not log food');
api.state.shopping=['Olive oil — 5 g'];const dates=api.scheduleDays(),count=api.addPlannedShopping(dates);
assert(count>0&&api.state.shopping[0]==='Olive oil — 5 g','Range shopping preserves existing ingredients');
const expectedEntries=dates.flatMap(date=>{const d=api.state.mealPlan[date]||{};return ['breakfast','lunch','dinner'].flatMap(slot=>Number.isInteger(d[slot])?api.recipes[d[slot]].ingredients.map(([name,g])=>name+' — '+Math.round(g*d[slot+'Portion']*10)/10+' g'):[])});
equal(api.state.shopping.slice(1),expectedEntries,'Shopping covers all dates and exact portion weights');
for(const w of api.workoutTemplates){assert(['Beginner','Intermediate','Advanced'].includes(w.level)&&w.effort&&w.setup,'Metadata '+w.id)}
assert(api.workoutTemplates.find(w=>w.id==='full-body-home').level==='Beginner','Chair squats labeled beginner');
for(const w of api.workoutTemplates.filter(w=>w.category==='HIIT'||w.id==='full-body-hiit'))assert(!/Ski Erg|Bike Intervals|Rowing Intervals|Battle Rope|Sled Push|Elliptical Intervals/.test(w.exercises.map(x=>x.name).join('|')),'Practical interval layout '+w.id);
const custom={id:'custom-test',title:"Kasper's session",category:'Full Body',level:'Intermediate',equipment:'Dumbbells',minutes:'25',exercises:[{name:'Goblet Squat',sets:3,reps:'8–12',unit:'reps',rest:90,side:false}]};
assert(api.cleanCustomWorkouts([custom]).length===1,'Custom workout accepted');
assert(api.cleanCustomWorkouts([{...custom,exercises:[{...custom.exercises[0],sets:999}]}]).length===0,'Invalid custom rejected');
api.state.customWorkouts=[custom];api.state.selectedWorkout=custom.id;api.state.workoutDrafts={[custom.id]:{'sr0-0':'9','sd0-0':true}};api.scheduleWorkout(api.datePlus(start,27),custom.id);
const backup=JSON.parse(JSON.stringify(api.state)),restored=api.restoredState(backup);
for(const key of ['mealPlan','workoutSchedule','plannerStart','plannerDays','plannerOffset','workoutDrafts','selectedWorkout'])equal(restored[key],backup[key],'Restore '+key);
assert(restored.customWorkouts[0].title===custom.title,'Restore custom workout');
const invalid=api.restoredState({...backup,workoutSchedule:{'2026-02-30':'push-a','2026-10-26':'missing-id','2026-10-27':'rest'}});equal(invalid.workoutSchedule,{'2026-10-27':'rest'},'Invalid schedule sanitized');
const today=api.foodDate();api.state.workoutSchedule={[today]:'custom-test'};api.state.logs=[];assert(api.nextPlannedWorkout().workout.id==='custom-test','Next planned workout');
api.state.logs=[{date:new Date().toISOString(),planDate:today,workoutId:'custom-test'}];assert(api.nextPlannedWorkout()===null,'Completed planned workout excluded');
api.state.hiitLayoutVersion=2;api.state.workoutDrafts={'hiit-a':{'sr1-5':'30','sd1-5':true,'sr0-0':'5','sr4-0':'20'},'push-a':{'sr0-0':'8'}};
assert(api.migratePracticalHiit(),'Old HIIT draft migrated');
assert(api.state.workoutDraftArchives['hiit-a'].draft['sr1-5']==='30','Old bike intervals retained in archive');
assert(!api.state.workoutDrafts['hiit-a']['sr1-5'],'Old bike work not mislabeled as standing work');
assert(api.state.workoutDrafts['hiit-a']['sr3-0']==='20','Matching shadow boxing retained at the correct index');
assert(api.state.workoutDraftArchives['hiit-a'].draft['sr0-0']==='5','Previous cycling warm-up retained in archive');
assert(api.state.workoutDrafts['push-a']['sr0-0']==='8','Other workout draft unchanged');
const archived=api.restoredState(JSON.parse(JSON.stringify(api.state)));assert(archived.workoutDraftArchives['hiit-a'].draft['sr1-5']==='30','Archive survives restore');
api.home();assert(screen.innerHTML.includes('Your next workout')&&!screen.innerHTML.includes('Plan your meals'),'New Home preview');
console.log('PASS: 1/7/14/21/28-day planning, calendar boundaries, meal portions, rest days, day/week copy, range shopping, custom workouts, backup restore, difficulty, practical intervals and legacy draft archive');
