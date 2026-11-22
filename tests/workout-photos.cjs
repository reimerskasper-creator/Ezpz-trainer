// Run: node tests/workout-photos.cjs
const fs=require('node:fs'),path=require('node:path'),source=fs.readFileSync(path.join(__dirname,'../fitness.html'),'utf8');
const scripts=[...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).concat(['coach-sample-photos','exercise-media'].map(name=>fs.readFileSync(path.join(__dirname,'../fitness-app/'+name+'.js'),'utf8'))).join('\n'),screen={innerHTML:''};
let writes=0;const initial={profile:{goal:'maintain',level:'Beginner',equipment:'home',days:3,age:35,weight:80,height:180,sex:'male'},logs:[],weights:[],workoutLayoutVersion:2,workoutDrafts:{'pull-b':{'sr0-0':'8','sw0-0':'20','sd0-0':true}}},stored=JSON.stringify(initial);
const document={body:{dataset:{}},getElementById:id=>id==='screen'?screen:null,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){}};
const api=new Function('document','window','localStorage','fetch','console',scripts+'\nreturn {home,train,featuredWorkouts,featuredExerciseSwaps,workoutSetting,plannerPickerItems,restoredState,baseWorkoutPlan,guides:window.EzpzExerciseMedia,workoutChooser,workoutCover,workoutProgramCovers,workoutCovers,workoutTemplates,categoryPrograms,workoutCategories,rankedExerciseSwaps,reviewedMuscleMap,hybridWorkoutCover,setCategory(v){chooserCategory=v},get state(){return state}}')(document,{addEventListener(){},scrollTo(){}},{getItem:()=>stored,setItem(){writes++}},()=>new Promise(()=>{}),{error(){}});
const assert=(v,m)=>{if(!v)throw Error(m)};

const addedGuides=api.guides.names.map(name=>api.guides.get(name)).filter(guide=>guide.prescription);
assert(addedGuides.length===123,'123 additional guided exercises');
assert(new Set(addedGuides.map(guide=>guide.photo)).size===123,'One distinct photo per new exercise');
for(const guide of addedGuides){
 assert(fs.existsSync(path.join(__dirname,'..',guide.photo)),'Missing exercise photo for '+guide.name);
 assert(guide.equipment&&guide.category&&(guide.localVideoUrl ? guide.videoUrl===guide.localVideoUrl&&fs.existsSync(guide.localVideoUrl) : new URL(guide.videoUrl).protocol==='https:'),'Complete references for '+guide.name);
 const map=api.reviewedMuscleMap([guide]);
 assert(map.primary.length>0&&map.unknown===0,'Reviewed muscle highlights for '+guide.name);
 assert(!map.primary.some(key=>map.supporting.includes(key)),'Disjoint muscle roles for '+guide.name);
}
assert(api.guides.get('Barbell RDL').name==='Barbell Romanian Deadlift','Variant-specific alias');
assert(api.guides.get('DB Step-Up').name==='Dumbbell Step-Up','Weighted step-up alias');
assert(api.guides.get('Bodyweight Step-Up').photo!==api.guides.get('DB Step-Up').photo,'Unweighted and loaded step-up each have media');


assert(api.workoutCategories.length===17,'Expected 17 categories');
assert(api.workoutTemplates.length===64,'64 fixed programs plus the existing rotating plan');
assert(new Set(api.workoutTemplates.map(w=>w.id)).size===64,'Duplicate program IDs');
const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/approved-workouts.json'),'utf8'));
for(const old of baseline){const current=api.workoutTemplates.find(w=>w.id===old.id);for(const [key,value] of Object.entries(old))assert(JSON.stringify(current[key])===JSON.stringify(value),'Existing workout changed: '+old.id+' '+key)}
for(const [category,p]of Object.entries(api.workoutCovers)){assert(p.alt&&/\.(jpg|png)$/.test(p.src),'Photo metadata '+category);assert(fs.existsSync(path.join(__dirname,'..',p.src)),'Photo missing '+p.src)}
assert(Object.keys(api.workoutCovers).length===12,'Every category has a related cover');
assert(Object.keys(api.workoutProgramCovers).length===65,'Every built-in choice has an explicit photo');for(const [id,photo]of Object.entries(api.workoutProgramCovers)){assert(photo.alt.length>10,'Descriptive alt '+id);assert(fs.existsSync(path.join(__dirname,'..',photo.src)),'Program photo missing '+id+' '+photo.src)}
assert(new Set([...Object.values(api.workoutCovers),...Object.values(api.workoutProgramCovers)].map(p=>p.src)).size>=58,'Broad equipment photo library');
for(const p of [...Object.values(api.workoutCovers),...Object.values(api.workoutProgramCovers)])assert(p.src.startsWith('./workout-images/neutral-')||p.src.startsWith('./train-images/'),'People-free cover allowlist '+p.src);
for(const setting of ['home','gym']){
 api.state.workoutSetting=setting;
 const choices=api.plannerPickerItems();
 assert(choices.map(w=>w.id).join(',')==='ezpz-workout','One premade workout for '+setting);
 const plan=api.baseWorkoutPlan('ezpz-workout');
 assert(plan.exercises.length===6&&plan.equipment==='No equipment','Six equipment-free exercises');
 for(const exercise of plan.exercises){
  const demo=api.guides.get(exercise.name);
  assert(demo?.photo&&demo?.localVideoUrl,'Bundled demo for '+exercise.name);
  assert(exercise.sets===2&&exercise.reps&&exercise.rest>0&&!exercise.load,'Bodyweight prescription');
 }
 const before=JSON.stringify(api.state);
 const markup=api.workoutChooser();
 assert(markup.includes('data-workout-pick="ezpz-workout"')&&!markup.includes('data-workout-pick="guided-'),'Only EZPZ available in the chooser');
 assert(JSON.stringify(api.state)===before,'Browsing changed user data');
}
const goal=api.featuredWorkouts.filter(w=>w.id.startsWith('guided-goal-'));
assert(goal.length===28&&new Set(goal.map(w=>w.id)).size===28,'Twenty-eight distinct goal sessions');
for(const plan of goal){
 assert(plan.exercises.length===6&&new Set(plan.exercises.map(x=>x.name)).size===6,'Six distinct exercises in '+plan.title);
 assert(plan.exercises.every(x=>api.guides.get(x.name)?.videoUrl&&api.guides.get(x.name)?.photo&&api.reviewedMuscleMap([x]).primary.length),'All goal exercises have media and muscle roles');
 const studio=api.hybridWorkoutCover(plan,plan.exercises);
 assert(studio.includes('anatomy-cover-overlay'),'Goal workout anatomy');
 assert(studio.includes('anatomy-studio-cover')&&!studio.includes('<img'),'Mapped workouts use the studio backdrop');
 assert(api.hybridWorkoutCover(plan.category).includes('anatomy-studio-cover'),'Mapped categories use the studio backdrop');
 assert(api.hybridWorkoutCover(plan.category).includes('anatomy-cover-overlay'),'Goal category anatomy');
}
assert(api.reviewedMuscleMap([{name:'Dumbbell Upright Row'}]).primary.includes('traps'),'Upright row targets traps');
for(const name of ['Dumbbell Shrug','Barbell Shrug']){
 assert(api.reviewedMuscleMap([{name}]).primary.join(' ')==='traps','Shrug targets traps');
 assert(api.hybridWorkoutCover('Build Muscle',[{name}]).includes('anatomy-traps anatomy-primary'),'Primary trap artwork');
}
assert(api.hybridWorkoutCover('Build Muscle',[{name:'Cable Rope Face Pull'}]).includes('anatomy-traps anatomy-supporting'),'Supporting trap artwork');
assert(api.rankedExerciseSwaps('DB Shrug','traps')[0].name==='Barbell Shrug','Trap swaps and search use the new guides');

const coverAudit=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/workout-cover-audit-2026-11-17.json'),'utf8'));
const artwork=new Set(),paths=new Set();
const workoutEntries=[...api.featuredWorkouts,...api.workoutTemplates,{id:'full-body'}];
assert(coverAudit.length===workoutEntries.length,'Every built-in workout is audited');
for(const workout of workoutEntries){
 const cover=api.workoutCover(workout),expected=coverAudit.find(row=>row.id===workout.id);
 assert(expected?.cover===cover.src,'Cover audit matches '+workout.id);
 assert(api.workoutCover(workout.id).src===cover.src,'ID and workout object use the same artwork for '+workout.id);
 const bytes=fs.readFileSync(path.join(__dirname,'..',cover.src));
 const digest=require('node:crypto').createHash('sha256').update(bytes).digest('hex');
 assert(!paths.has(cover.src)&&!artwork.has(digest),'Unique cover photo for '+workout.id);
 paths.add(cover.src);artwork.add(digest);
}

const curlSwaps=api.rankedExerciseSwaps('Lying Leg Curl');
const closeCurls=['Slider Hamstring Curl','Seated Leg Curl','Standing Single-Leg Machine Leg Curl'];
assert(curlSwaps.slice(0,3).every(x=>x.primaryMatch&&closeCurls.includes(x.name)),'Hamstring curls lead ranked swap suggestions');
assert(!curlSwaps.some(x=>x.name==='Lying Machine Leg Curl'),'Current exercise is excluded even when named by an alias');
assert(api.rankedExerciseSwaps('Lying Machine Leg Curl','bench press').some(x=>x.name==='Dumbbell Bench Press'&&!x.primaryMatch),'Search still finds exercises for other muscle groups');
assert(api.rankedExerciseSwaps('Unknown personal exercise','hamstring curl').some(x=>x.name==='Slider Hamstring Curl'),'Unmapped exercises can still search the full catalog');

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
console.log('PASS: one EZPZ Workout, bundled media, and legacy schedule/draft retention');
