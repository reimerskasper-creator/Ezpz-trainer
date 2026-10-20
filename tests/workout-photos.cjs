// Run: node tests/workout-photos.cjs
const fs=require('node:fs'),path=require('node:path'),source=fs.readFileSync(path.join(__dirname,'../fitness.html'),'utf8');
const scripts=[...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n'),screen={innerHTML:''};
let writes=0;const initial={profile:{goal:'maintain',level:'Beginner',equipment:'home',days:3,age:35,weight:80,height:180,sex:'male'},logs:[],weights:[],workoutLayoutVersion:2,workoutDrafts:{'pull-b':{'sr0-0':'8','sw0-0':'20','sd0-0':true}}},stored=JSON.stringify(initial);
const document={body:{dataset:{}},getElementById:id=>id==='screen'?screen:null,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){}};
const api=new Function('document','window','localStorage','fetch','console',scripts+'\nreturn {home,train,workoutChooser,workoutCover,workoutCovers,workoutTemplates,categoryPrograms,workoutCategories,setCategory(v){chooserCategory=v},get state(){return state}}')(document,{addEventListener(){},scrollTo(){}},{getItem:()=>stored,setItem(){writes++}},()=>new Promise(()=>{}),{error(){}});
const assert=(v,m)=>{if(!v)throw Error(m)};

assert(api.workoutCategories.length===11,'Expected 11 categories');
assert(api.workoutTemplates.length===54,'54 fixed programs plus the existing rotating plan');
assert(new Set(api.workoutTemplates.map(w=>w.id)).size===54,'Duplicate program IDs');
const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/approved-workouts.json'),'utf8'));
for(const old of baseline){const current=api.workoutTemplates.find(w=>w.id===old.id);for(const [key,value] of Object.entries(old))assert(JSON.stringify(current[key])===JSON.stringify(value),'Existing workout changed: '+old.id+' '+key)}
for(const [category,p]of Object.entries(api.workoutCovers)){assert(p.alt&&/\.(jpg|png)$/.test(p.src),'Photo metadata '+category);assert(fs.existsSync(path.join(__dirname,'..',p.src)),'Photo missing '+p.src)}
assert(Object.keys(api.workoutCovers).length===11,'Every category has a related cover');
let count=0;
for(const cat of api.workoutCategories){
 const plans=api.categoryPrograms(cat.id);assert(plans.length===5,'Five choices in '+cat.id);count+=plans.length;
 const combinations=plans.filter(w=>w.id!=='full-body').map(w=>w.exercises.map(e=>e.name).sort().join('|'));
 assert(new Set(combinations).size===combinations.length,'Duplicate exercise lists in '+cat.id);
 api.setCategory(null);assert((api.workoutChooser().match(/data-workout-category=/g)||[]).length===11,'Category overview');
 api.setCategory(cat.id);
 for(const plan of plans){
  assert(plan.exercises.filter(e=>!/Warm-up|Cooldown/.test(e.name)).length>=6,'Six main exercises: '+plan.id);
  api.state.selectedWorkout=plan.id;const before=JSON.stringify(api.state),photo=api.workoutCover(plan.coverCategory||plan.category);
  api.home();assert(screen.innerHTML.includes('src="'+photo.src+'"'),'Home photo must match '+plan.id);
  api.train();assert(screen.innerHTML.includes('workout-trigger-photo"><img src="'+photo.src+'"'),'Train photo must match '+plan.id);
  const chooser=api.workoutChooser();assert((chooser.match(/data-workout-pick=/g)||[]).length===5,'Five program cards');
  assert(chooser.includes('data-workout-pick="'+plan.id+'" aria-label="Choose '+(plan.title||plan.programName)+'" aria-pressed="true"'),'Selected state '+plan.id);
  if(plan.id!=='full-body')for(const e of plan.exercises)assert(e.name&&e.sets>0&&e.reps&&e.rest>=0,'Exercise prescription '+plan.id);
  assert(JSON.stringify(api.state)===before,'Rendering changed draft data');
 }
}
assert(count===55,'55 program choices');assert(api.state.workoutDrafts['pull-b']['sr0-0']==='8','Saved draft lost');assert(writes===0,'Rendering wrote storage');
console.log('PASS: 11 categories, 55 choices, 6+ exercises, distinct sessions, matching photos, original prescriptions and drafts preserved');
