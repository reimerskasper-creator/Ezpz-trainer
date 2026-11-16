const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),html=fs.readFileSync('fitness.html','utf8');
const screen={innerHTML:''},document={body:{dataset:{}},getElementById:id=>id==='screen'?screen:null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}};let saved='',fail=false;
const initial={profile:{goal:'maintain',level:'Beginner',equipment:'home',days:3,age:35,weight:80,height:180,sex:'male'},logs:[],weights:[],foodLog:[],workoutLayoutVersion:2};
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n');const api=new Function('document','window','localStorage','fetch','console','alert','confirm',script+'\nreturn {cleanTrainerVideoUrl,cleanTrainerMedia,cleanTrainerSettings,cleanTrainerBackgrounds,save,restoredState,get state(){return state},set state(v){state=v},pendingPersonalPhotos}')(document,{addEventListener(){},scrollTo(){}},{getItem:()=>JSON.stringify(initial),setItem:(k,v)=>{if(fail)throw Error('quota');saved=v}},()=>new Promise(()=>{}),{error(){}},()=>{},()=>true);
for(const url of ['javascript:alert(1)','data:text/html,hi','file:///etc/passwd','http://example.com','https://user:pass@example.com','https://','https://example.com/'+ 'x'.repeat(2048)])assert.equal(api.cleanTrainerVideoUrl(url),'');assert.equal(api.cleanTrainerVideoUrl(' https://youtu.be/abc?t=12 '),'https://youtu.be/abc?t=12');
assert.deepEqual(api.cleanTrainerSettings(null),{motion:true,photoExpanded:false});assert.deepEqual(api.cleanTrainerSettings({motion:false,photoExpanded:true,extra:1}),{motion:false,photoExpanded:true});
assert.deepEqual(api.cleanTrainerMedia({'bad':{videoUrl:'https://example.com'},'full-body|Squat':{videoUrl:'javascript:alert(1)'},'full-body|RDL':{photoId:'photo-own',videoUrl:'https://youtu.be/abc',backgroundId:'photo-gym',extra:1}}),{'full-body|RDL':{photoId:'photo-own',videoUrl:'https://youtu.be/abc',backgroundId:'photo-gym'}});
assert.deepEqual(api.cleanTrainerBackgrounds(JSON.parse('{"__proto__":"photo-bad","full-body":"photo-good","other":"bad"}')),{'full-body':'photo-good'});
api.state={...initial,trainerMedia:{'full-body|RDL':{photoId:'photo-own',backgroundId:'photo-back',videoUrl:'https://youtu.be/abc'}},trainerBackgrounds:{'full-body':'photo-room'},trainerSettings:{motion:false,photoExpanded:true},homeBackground:{photoId:'photo-home'}};for(const id of ['photo-own','photo-back','photo-room','photo-home'])api.pendingPersonalPhotos[id]='data:image/jpeg;base64,/9j/AA==';assert(api.save());const snapshot=JSON.parse(saved);assert.deepEqual(Object.keys(snapshot.personalPhotos).sort(),['photo-back','photo-home','photo-own','photo-room']);const restored=api.restoredState(snapshot);assert.deepEqual(restored.trainerMedia,snapshot.trainerMedia);assert.deepEqual(restored.trainerBackgrounds,snapshot.trainerBackgrounds);assert.deepEqual(restored.trainerSettings,snapshot.trainerSettings);assert.deepEqual(restored.profile,initial.profile);fail=true;const before=JSON.stringify(api.state.personalPhotos);assert.equal(api.save(),false);assert.equal(JSON.stringify(api.state.personalPhotos),before);assert.equal(saved,JSON.stringify(snapshot));
assert(!fs.readFileSync('fitness-app/trainer-space.js','utf8').includes('<iframe'));assert(fs.readFileSync('fitness-app/trainer-space.css','utf8').includes('object-fit:contain!important'));
console.log('PASS trainer media URL/schema validation, photo references/backup retention, restored preferences, existing records and quota rollback');


const guidesWindow={};
new Function('window',fs.readFileSync('fitness-app/coach-sample-photos.js','utf8')+fs.readFileSync('fitness-app/exercise-media.js','utf8'))(guidesWindow);
const guides=guidesWindow.EzpzExerciseMedia;
assert.equal(guides.names.length,41);
assert.equal(guides.get('DB Romanian Deadlift'),guides.get('Dumbbell Romanian Deadlift'));
assert.notEqual(guides.get('Dumbbell Bench Press'),guides.get('Incline Dumbbell Press'));
assert.equal(guides.get('Incline Push-Up'),undefined);
for(const name of guides.names){
 const {photo,videoUrl}=guides.get(name);
 assert(photo.startsWith('data:image/jpeg')||fs.existsSync(photo),name+' photo exists');
 assert.match(videoUrl,/^https:\/\/(www\.youtube\.com\/watch\?v=[\w-]{11}|www\.the-fit-edit\.com\/library\/bear-plank)$/);
}
assert.deepEqual(guides.choices(['Custom Row','Floor Press','Dumbbell Floor Press','DB Floor Press','Goblet Squat'],'Goblet Squat'),['Dumbbell Floor Press','Custom Row','Floor Press']);
console.log('PASS shared exercise references use explicit aliases, include bundled photos and sort covered swaps first');
