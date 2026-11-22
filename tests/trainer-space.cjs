const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),html=fs.readFileSync('fitness.html','utf8');
const screen={innerHTML:''},document={body:{dataset:{}},getElementById:id=>id==='screen'?screen:null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}};let saved='',fail=false;
const initial={profile:{goal:'maintain',level:'Beginner',equipment:'home',days:3,age:35,weight:80,height:180,sex:'male'},logs:[],weights:[],foodLog:[],workoutLayoutVersion:2};
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n');const api=new Function('document','window','localStorage','fetch','console','alert','confirm',script+'\nreturn {cleanTrainerVideoUrl,cleanTrainerMedia,cleanTrainerSettings,cleanTrainerBackgrounds,save,restoredState,builderWorkoutForSave,saveBuilderExercisePhotos,workoutMediaReference,get state(){return state},set state(v){state=v},pendingPersonalPhotos}')(document,{addEventListener(){},scrollTo(){}},{getItem:()=>JSON.stringify(initial),setItem:(k,v)=>{if(fail)throw Error('quota');saved=v}},()=>new Promise(()=>{}),{error(){}},()=>{},()=>true);
for(const url of ['javascript:alert(1)','data:text/html,hi','file:///etc/passwd','http://example.com','https://user:pass@example.com','https://','https://example.com/'+ 'x'.repeat(2048)])assert.equal(api.cleanTrainerVideoUrl(url),'');assert.equal(api.cleanTrainerVideoUrl(' https://youtu.be/abc?t=12 '),'https://youtu.be/abc?t=12');
assert.deepEqual(api.cleanTrainerSettings(null),{motion:true,photoExpanded:false});assert.deepEqual(api.cleanTrainerSettings({motion:false,photoExpanded:true,extra:1}),{motion:false,photoExpanded:true});
assert.deepEqual(api.cleanTrainerMedia({'bad':{videoUrl:'https://example.com'},'full-body|Squat':{videoUrl:'javascript:alert(1)'},'full-body|RDL':{photoId:'photo-own',videoUrl:'https://youtu.be/abc',backgroundId:'photo-gym',extra:1}}),{'full-body|RDL':{photoId:'photo-own',videoUrl:'https://youtu.be/abc',backgroundId:'photo-gym'}});
assert.deepEqual(api.cleanTrainerBackgrounds(JSON.parse('{"__proto__":"photo-bad","full-body":"photo-good","other":"bad"}')),{'full-body':'photo-good'});
api.state={...initial,trainerMedia:{'full-body|RDL':{photoId:'photo-own',backgroundId:'photo-back',videoUrl:'https://youtu.be/abc'}},trainerBackgrounds:{'full-body':'photo-room'},trainerSettings:{motion:false,photoExpanded:true},homeBackground:{photoId:'photo-home'}};for(const id of ['photo-own','photo-back','photo-room','photo-home'])api.pendingPersonalPhotos[id]='data:image/jpeg;base64,/9j/AA==';assert(api.save());const snapshot=JSON.parse(saved);assert.deepEqual(Object.keys(snapshot.personalPhotos).sort(),['photo-back','photo-home','photo-own','photo-room']);const restored=api.restoredState(snapshot);assert.deepEqual(restored.trainerMedia,snapshot.trainerMedia);assert.deepEqual(restored.trainerBackgrounds,snapshot.trainerBackgrounds);assert.deepEqual(restored.trainerSettings,snapshot.trainerSettings);assert.deepEqual(restored.profile,initial.profile);fail=true;const before=JSON.stringify(api.state.personalPhotos);assert.equal(api.save(),false);assert.equal(JSON.stringify(api.state.personalPhotos),before);assert.equal(saved,JSON.stringify(snapshot));
assert(!fs.readFileSync('fitness-app/trainer-space.js','utf8').includes('<iframe'));assert(fs.readFileSync('fitness-app/trainer-space.css','utf8').includes('object-fit:contain!important'));
console.log('PASS trainer media URL/schema validation, photo references/backup retention, restored preferences, existing records and quota rollback');


const guidesWindow={};
new Function('window',fs.readFileSync('fitness-app/coach-sample-photos.js','utf8')+fs.readFileSync('fitness-app/exercise-media.js','utf8'))(guidesWindow);
const guides=guidesWindow.EzpzExerciseMedia,cleanVideo=api.cleanTrainerVideoUrl;
assert.equal(guides.names.length,163);
assert.equal(new Set(guides.names).size,163);
for(const name of guides.names)assert.equal(guides.get(name).name,name);
assert.equal(guides.get('Close-Grip Seated Cable Row'),guides.get('Seated Cable Row'));
assert.notEqual(guides.get('Wide-Grip Seated Cable Row').photo,guides.get('Seated Cable Row').photo);
assert.equal(guides.get('DB Romanian Deadlift'),guides.get('Dumbbell Romanian Deadlift'));
assert.notEqual(guides.get('Dumbbell Bench Press'),guides.get('Incline Dumbbell Press'));
assert.equal(guides.get('Incline Push-Up').name,'Incline Push-Up');
assert.notEqual(guides.get('Incline Push-Up').photo,guides.get('Decline Push-Up').photo);
assert.equal(guides.get('Weighted Ring Push-Up'),undefined);
const catalogClips=guides.names.map(name=>guides.get(name).localVideoUrl);
assert.equal(catalogClips.length,163);
assert(catalogClips.every(Boolean),'Each catalog exercise has an offline video');
assert.equal(new Set(catalogClips).size,catalogClips.length,'Every exercise has its own clip');
for(const name of guides.names){
 const {photo,videoUrl,localVideoUrl,prescription}=guides.get(name);
 assert(photo.startsWith('data:image/jpeg')||fs.existsSync(photo),name+' photo exists');
 if(localVideoUrl){assert.equal(videoUrl,localVideoUrl);assert(fs.existsSync(localVideoUrl),name+' video exists')}
 else if(prescription)assert.equal(cleanVideo(videoUrl),videoUrl);
 else assert.match(videoUrl,/^https:\/\/(www\.youtube\.com\/watch\?v=[\w-]{11}|www\.the-fit-edit\.com\/library\/bear-plank)$/);
}
assert.deepEqual(guides.choices(['Custom Row','Floor Press','Dumbbell Floor Press','DB Floor Press','Goblet Squat'],'Goblet Squat'),['Dumbbell Floor Press','Custom Row','Floor Press']);
console.log('PASS shared exercise references use explicit aliases, include bundled photos and sort covered swaps first');

const builderPhoto='photo-builder-exercise',custom={id:'custom-photo-workout',exercises:[{name:'My custom press',builderPhotoId:builderPhoto}]};
const draftOnly=api.builderWorkoutForSave(custom,custom.id);
assert(!Object.hasOwn(draftOnly.exercises[0],'builderPhotoId'));
api.pendingPersonalPhotos[builderPhoto]='data:image/jpeg;base64,/9j/AA==';
api.state={...initial,customWorkouts:[draftOnly],trainerMedia:{}};
fail=false;
api.saveBuilderExercisePhotos(draftOnly,custom);
assert.equal(api.workoutMediaReference(custom.id,custom.exercises[0].name).photo,api.pendingPersonalPhotos[builderPhoto]);
assert(api.save());
assert.equal(JSON.parse(saved).personalPhotos[builderPhoto],api.pendingPersonalPhotos[builderPhoto]);
custom.exercises[0].builderPhotoId='';
api.saveBuilderExercisePhotos(draftOnly,custom);
assert(api.save());
assert(!Object.hasOwn(JSON.parse(saved).personalPhotos,builderPhoto));
console.log('PASS custom exercise photo draft, Trainer reference, backup data and removal');
