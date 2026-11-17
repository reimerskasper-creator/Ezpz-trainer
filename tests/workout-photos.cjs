// Run: node tests/workout-photos.cjs
const fs=require('node:fs'),path=require('node:path'),source=fs.readFileSync(path.join(__dirname,'../fitness.html'),'utf8');
const scripts=[...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).concat(['coach-sample-photos','exercise-media'].map(name=>fs.readFileSync(path.join(__dirname,'../fitness-app/'+name+'.js'),'utf8'))).join('\n'),screen={innerHTML:''};
let writes=0;const initial={profile:{goal:'maintain',level:'Beginner',equipment:'home',days:3,age:35,weight:80,height:180,sex:'male'},logs:[],weights:[],workoutLayoutVersion:2,workoutDrafts:{'pull-b':{'sr0-0':'8','sw0-0':'20','sd0-0':true}}},stored=JSON.stringify(initial);
const document={body:{dataset:{}},getElementById:id=>id==='screen'?screen:null,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){}};
const api=new Function('document','window','localStorage','fetch','console',scripts+'\nreturn {home,train,featuredWorkouts,featuredExerciseSwaps,workoutSetting,plannerPickerItems,restoredState,baseWorkoutPlan,guides:window.EzpzExerciseMedia,workoutChooser,workoutCover,workoutProgramCovers,workoutCovers,workoutTemplates,categoryPrograms,workoutCategories,reviewedMuscleMap,hybridWorkoutCover,setCategory(v){chooserCategory=v},get state(){return state}}')(document,{addEventListener(){},scrollTo(){}},{getItem:()=>stored,setItem(){writes++}},()=>new Promise(()=>{}),{error(){}});
const assert=(v,m)=>{if(!v)throw Error(m)};

const addedGuides=api.guides.names.map(name=>api.guides.get(name)).filter(guide=>guide.prescription);
assert(addedGuides.length===20,'Twenty additional guided exercises');
assert(new Set(addedGuides.map(guide=>guide.photo)).size===20,'One distinct photo per new exercise');
for(const guide of addedGuides){
 assert(fs.existsSync(path.join(__dirname,'..',guide.photo)),'Missing exercise photo for '+guide.name);
 assert(guide.equipment&&guide.category&&new URL(guide.videoUrl).protocol==='https:','Complete references for '+guide.name);
 const map=api.reviewedMuscleMap([guide]);
 assert(map.primary.length>0&&map.unknown===0,'Reviewed muscle highlights for '+guide.name);
 assert(!map.primary.some(key=>map.supporting.includes(key)),'Disjoint muscle roles for '+guide.name);
}
assert(api.guides.get('Barbell RDL').name==='Barbell Romanian Deadlift','Variant-specific alias');
assert(api.guides.get('DB Step-Up').name==='Dumbbell Step-Up','Weighted step-up alias');
assert(api.guides.get('Bodyweight Step-Up').photo!==api.guides.get('DB Step-Up').photo,'Unweighted and loaded step-up each have media');


assert(api.workoutCategories.length===12,'Expected 12 categories');
assert(api.workoutTemplates.length===64,'64 fixed programs plus the existing rotating plan');
assert(new Set(api.workoutTemplates.map(w=>w.id)).size===64,'Duplicate program IDs');
const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/approved-workouts.json'),'utf8'));
for(const old of baseline){const current=api.workoutTemplates.find(w=>w.id===old.id);for(const [key,value] of Object.entries(old))assert(JSON.stringify(current[key])===JSON.stringify(value),'Existing workout changed: '+old.id+' '+key)}
for(const [category,p]of Object.entries(api.workoutCovers)){assert(p.alt&&/\.(jpg|png)$/.test(p.src),'Photo metadata '+category);assert(fs.existsSync(path.join(__dirname,'..',p.src)),'Photo missing '+p.src)}
assert(Object.keys(api.workoutCovers).length===12,'Every category has a related cover');
assert(Object.keys(api.workoutProgramCovers).length===65,'Every built-in choice has an explicit photo');for(const [id,photo]of Object.entries(api.workoutProgramCovers)){assert(photo.alt.length>10,'Descriptive alt '+id);assert(fs.existsSync(path.join(__dirname,'..',photo.src)),'Program photo missing '+id+' '+photo.src)}
assert(new Set([...Object.values(api.workoutCovers),...Object.values(api.workoutProgramCovers)].map(p=>p.src)).size>=58,'Broad equipment photo library');
for(const p of [...Object.values(api.workoutCovers),...Object.values(api.workoutProgramCovers)])assert(p.src.startsWith('./workout-images/neutral-')||p.src.startsWith('./train-images/'),'People-free cover allowlist '+p.src);
const ids=new Set();
for(const setting of ['home','gym']){
 api.state.workoutSetting=setting;
 const choices=api.plannerPickerItems();
 assert(choices.length===10&&choices.every(w=>w.setting===setting),'Ten sessions for '+setting);
 api.setCategory(null);
 assert((api.workoutChooser().match(/data-workout-category="(?!mine")/g)||[]).length===5,'Five visible categories');
 for(const category of ['Full Body','Push','Pull','Leg','Core']){
  const plans=api.categoryPrograms(category);
  assert(plans.map(w=>w.variant).join(',')==='A,B','One A and B per category');
  assert(new Set(plans.map(w=>w.focus)).size===2,'Distinct A and B focus');
  api.setCategory(category);
  for(const plan of plans){
   ids.add(plan.id);
   assert(plan.exercises.length>=6&&new Set(plan.exercises.map(x=>x.name)).size===plan.exercises.length&&plan.equipment&&plan.guide,'Complete program '+plan.id);
   const before=JSON.stringify(api.state);
   for(const exercise of api.baseWorkoutPlan(plan.id).exercises){
    const demo=api.guides.get(exercise.name);
    assert(demo?.photo&&demo?.videoUrl,'Complete media for '+exercise.name);
    assert(api.reviewedMuscleMap([exercise]).primary.length,'Missing guided muscle map for '+exercise.name);
    assert(exercise.sets>=2&&exercise.reps&&exercise.rest>0,'Exercise prescription');
    for(const swap of api.featuredExerciseSwaps(plan,exercise)){
     assert(api.guides.get(swap.name)?.videoUrl&&swap.unit===exercise.unit,'Swap media and unit');
    }
   }
   const markup=api.workoutChooser();
   assert(markup.includes('data-workout-pick="'+plan.id+'"')&&markup.includes(plan.equipment),'Equipment on the card');
   assert(JSON.stringify(api.state)===before,'Browsing changed user data');
  }
 }
}
assert(ids.size===20,'20 unique sessions');
const dates={'2026-11-16':'guided-home-full-body-a','2026-11-17':'pull-b'};
const recovered=api.restoredState({...api.state,workoutSchedule:dates});
assert(JSON.stringify(recovered.workoutSchedule)===JSON.stringify(dates),'New and retired schedule IDs resolve');
assert(api.state.workoutDrafts['pull-b']['sr0-0']==='8','Saved draft lost');
const press=api.reviewedMuscleMap([{name:'Dumbbell Bench Press'}]);
assert(press.primary.join(' ')==='chest'&&press.supporting.join(' ')==='frontDelts triceps','Chest press must distinguish pecs and support');
const changed=api.reviewedMuscleMap([{name:'Lat Pulldown'},{name:'Unreviewed custom movement'}]);
assert(changed.primary.join(' ')==='back'&&changed.unknown===1&&!changed.supporting.includes('chest'),'Map must follow the current exercises');
assert(!api.hybridWorkoutCover('Push',[{name:'Unreviewed custom movement'}]).includes('anatomy-cover-overlay'),'Unknown movements must not inherit category highlights');
assert(writes===0,'Rendering wrote storage');
console.log('PASS: 10 Home + 10 Gym workouts, equipment, demo links in picker, compatible swap media, and legacy schedule/draft retention');
