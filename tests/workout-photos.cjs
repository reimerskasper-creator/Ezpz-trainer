// Run: node tests/workout-photos.cjs
const fs=require('node:fs'),path=require('node:path'),source=fs.readFileSync(path.join(__dirname,'../fitness.html'),'utf8');
const scripts=[...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n'),screen={innerHTML:''};
let writes=0;const initial={profile:{goal:'maintain',level:'Beginner',equipment:'home',days:3,age:35,weight:80,height:180,sex:'male'},logs:[],weights:[],workoutLayoutVersion:2,workoutDrafts:{'pull-b':{'sr0-0':'8','sw0-0':'20','sd0-0':true}}},stored=JSON.stringify(initial);
const document={body:{dataset:{}},getElementById:id=>id==='screen'?screen:null,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){}};
const api=new Function('document','window','localStorage','fetch','console',scripts+'\nreturn {home,train,workoutChooser,workoutCover,workoutCovers,workoutTemplates,get state(){return state}}')(document,{addEventListener(){},scrollTo(){}},{getItem:()=>stored,setItem(){writes++}},()=>new Promise(()=>{}),{error(){}});
const assert=(v,m)=>{if(!v)throw Error(m)};
assert(Object.keys(api.workoutCovers).length===9,'Every workout category needs a photo');
for(const [category,p]of Object.entries(api.workoutCovers)){assert(p.alt&&p.src.endsWith('.jpg'),'Photo metadata '+category);assert(fs.existsSync(path.join(__dirname,'..',p.src)),'Photo missing '+p.src)}
assert(new Set(Object.values(api.workoutCovers).map(x=>x.src)).size===9,'Categories must have different photos');
for(const plan of [{id:'full-body',category:'Full Body'},...api.workoutTemplates]){
 api.state.selectedWorkout=plan.id;const before=JSON.stringify(api.state),photo=api.workoutCover(plan.category||'Full Body');
 api.home();assert(screen.innerHTML.includes('src="'+photo.src+'"'),'Home photo must match '+plan.id);
 api.train();assert(screen.innerHTML.includes('workout-trigger-photo"><img src="'+photo.src+'"'),'Training photo must match '+plan.id);
 const chooser=api.workoutChooser();assert((chooser.match(/<img /g)||[]).length===9,'Nine chooser covers');
 if(plan.id!=='full-body')assert(chooser.includes('data-workout-pick="'+plan.id+'" aria-label="Choose '+plan.title+'" aria-pressed="true"'),'A/B choice state changed');
 assert(JSON.stringify(api.state)===before,'Rendering changed draft data');
}
assert(api.state.workoutDrafts['pull-b']['sr0-0']==='8','Saved draft lost');assert(writes===0,'Photo rendering wrote storage');
console.log('PASS: 9 category photos, matching Home/Train covers for all 17 workout choices, A/B controls and saved drafts');
