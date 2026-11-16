const fs=require('fs'),assert=require('node:assert/strict');const scripts=[...fs.readFileSync('fitness.html','utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).concat(['coach-sample-photos','coach-sample'].map(name=>fs.readFileSync('fitness-app/'+name+'.js','utf8'))).join('\n');let fail=false,disk='';const screen={innerHTML:''},doc={body:{dataset:{}},getElementById:id=>id==='screen'?screen:null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}};
const api=new Function('document','window','localStorage','fetch','console','alert',scripts+';return {coachSamplePackage,nutrition,recipes,target,applyPlanPackage,saveLibraryPlanDraft,saveNamedPlan,capturePlanPackage,planPackageWithPhotos,cleanSavedPlans,activateSavedPlan,storeReceivedPlan,renameLibraryPlan,setLibraryPlanCover,clearCurrentPlan,deleteNamedPlan,startNewNamedPlan,planSettings,planPhotoRefs,validatePlanPackage,restoredState,save,foodDate,datePlus,pendingPersonalPhotos,get state(){return state},set state(v){state=v}}')(doc,{addEventListener(){},scrollTo(){}},{getItem:()=>JSON.stringify({profile:{goal:'maintain',level:'Beginner',equipment:'home',days:3,age:35,weight:80,height:180,sex:'male'},logs:[],weights:[],foodLog:[],workoutLayoutVersion:2}),setItem:(k,v)=>{if(fail)throw Error('quota');disk=v}},()=>new Promise(()=>{}),{error(){}},()=>{});
const today=api.foodDate();api.state.plannerStart=today;api.state.plannerDays=14;api.state.workoutSchedule={[today]:'push-a',[api.datePlus(today,2)]:'push-a'};api.state.mealPlan={[today]:{breakfast:0,breakfastPortion:1}};api.state.logs=[{date:today,private:'kept'}];const history=JSON.stringify([api.state.logs,api.state.weights,api.state.foodLog]);const photo='data:image/jpeg;base64,/9j/AA==';api.pendingPersonalPhotos['photo-cover']=photo;api.state.trainerMedia={'push-a|Barbell Bench Press':{photoId:'photo-cover',videoUrl:'https://example.com/demo'}};const id=api.saveNamedPlan('Kasper 2 week plan');assert.equal(api.state.activeSavedPlanId,id);api.pendingPersonalPhotos['photo-cover']=photo;assert(api.setLibraryPlanCover(id,'photo-cover'));assert.equal(api.state.personalPhotos['photo-cover'],photo);const pack=api.planPackageWithPhotos(api.state.savedPlans[0]);assert.equal(pack.coverPhotoId,'photo-cover');assert.equal(pack.photos['photo-cover'],photo);assert(!pack.logs&&!pack.profile);assert.equal(api.restoredState(JSON.parse(disk)).savedPlans[0].coverPhotoId,'photo-cover');assert.equal(api.restoredState(JSON.parse(disk)).activeSavedPlanId,id);assert.equal(api.restoredState({...JSON.parse(disk),activeSavedPlanId:'not-real'}).activeSavedPlanId,undefined);
const date=api.datePlus(today,30);assert(api.activateSavedPlan(id,date));const first=JSON.stringify([api.state.customWorkouts,api.state.customFoods,api.state.trainerMedia,api.state.personalPhotos]);assert.throws(()=>api.activateSavedPlan(id,date),/Confirm replacement/);assert(api.activateSavedPlan(id,date,true));assert.equal(JSON.stringify([api.state.customWorkouts,api.state.customFoods,api.state.trainerMedia,api.state.personalPhotos]),first,'Repeated activation reuses unchanged items');assert.equal(api.state.planCoverPhotoId,'photo-cover');assert.equal(JSON.stringify([api.state.logs,api.state.weights,api.state.foodLog]),history);
const originalWorkout=api.state.customWorkouts[0].id;api.state.trainerMedia[originalWorkout+'|Barbell Bench Press'].videoUrl='https://example.com/edited';api.activateSavedPlan(id,date,true);assert.equal(api.state.customWorkouts.length,2);assert.equal(api.state.trainerMedia[originalWorkout+'|Barbell Bench Press'].videoUrl,'https://example.com/edited','Activation never overwrites media edited on an existing workout');const before=JSON.stringify(api.state);fail=true;assert.throws(()=>api.renameLibraryPlan(id,'Changed'),/kept/);assert.equal(JSON.stringify(api.state),before);assert.throws(()=>api.activateSavedPlan(id,date,true,true),/kept/);assert.equal(JSON.stringify(api.state),before);assert.throws(()=>api.storeReceivedPlan(pack),/kept/);assert.equal(JSON.stringify(api.state),before);fail=false;
assert(api.renameLibraryPlan(id,'My renamed plan'));assert.equal(api.state.planName,'My renamed plan');const schedule=JSON.stringify([api.state.workoutSchedule,api.state.mealPlan,api.state.extraWorkouts,api.state.planName,api.state.activeSavedPlanId]);const imported=api.storeReceivedPlan(pack);assert.equal(JSON.stringify([api.state.workoutSchedule,api.state.mealPlan,api.state.extraWorkouts,api.state.planName,api.state.activeSavedPlanId]),schedule);const received=api.cleanSavedPlans(api.state.savedPlans).find(p=>p.id===imported);assert.equal(received.origin,'imported');assert.equal(api.planPackageWithPhotos(received).photos[received.coverPhotoId],photo);const savedBefore=api.state.savedPlans.length;api.activateSavedPlan(imported,api.datePlus(today,60),false,true);assert.equal(api.state.savedPlans.length,savedBefore+1);assert.equal(api.state.activeSavedPlanId,imported);assert.equal(api.state.customWorkouts.length,2);assert.equal(JSON.stringify([api.state.logs,api.state.weights,api.state.foodLog]),history);
api.clearCurrentPlan();assert.equal(api.state.activeSavedPlanId,undefined);assert.equal(api.state.savedPlans.length,savedBefore+1);api.activateSavedPlan(id,api.datePlus(today,90));api.deleteNamedPlan(id);assert.equal(api.state.activeSavedPlanId,undefined);assert(api.state.personalPhotos[api.state.planCoverPhotoId]);assert.throws(()=>api.activateSavedPlan(id,today),/no longer/);const invalid={...pack,coverPhotoId:'<img>'};assert.throws(()=>api.validatePlanPackage(invalid,true),/valid EZPZ/);assert.throws(()=>api.validatePlanPackage({...pack,photos:{}},true),/missing/);console.log('PASS library covers/backup/export, received-plan staging, rename, active markers, date conflicts, repeated activation without duplicates, atomic save-before/quota rollback, deletion and retained history');

const activeBeforeDraft=JSON.stringify({...api.state,savedPlans:undefined});
const authored=structuredClone(pack);
authored.name='Client draft';
authored.entries=authored.entries.map((entry,i)=>i===0?entry:{meals:{}});
const draftId=api.saveLibraryPlanDraft(authored);
assert.equal(JSON.stringify({...api.state,savedPlans:undefined}),activeBeforeDraft);
assert.equal(api.restoredState(JSON.parse(disk)).savedPlans.find(p=>p.id===draftId).name,'Client draft');
const stored=api.state.savedPlans.find(p=>p.id===draftId);
assert.equal(api.planPackageWithPhotos(stored).photos[stored.coverPhotoId],photo);
const prior=JSON.stringify(api.state);
fail=true;
assert.throws(()=>api.saveLibraryPlanDraft({...authored,name:'Failed draft edit'},draftId),/kept/);
assert.equal(JSON.stringify(api.state),prior);
fail=false;
assert.equal(api.saveLibraryPlanDraft({...authored,name:'Edited draft'},draftId),draftId);
assert.equal(api.state.savedPlans.filter(p=>p.id===draftId).length,1);
assert.equal(JSON.stringify({...api.state,savedPlans:undefined}),activeBeforeDraft);
console.log('PASS standalone plan draft save, backup, export, edit and quota rollback with active schedule preserved');

const sample=api.coachSamplePackage();
assert.deepEqual(sample.nutritionTargets,[2400,190,230,80]);
assert.equal(sample.entries.length,14);
assert.equal(sample.entries.filter(day=>day.workout!=='rest').length,6);
assert.equal(Object.keys(sample.photos).length,5);
assert.equal(Object.keys(sample.media).length,16);
for(const day of sample.entries){
 const total=[0,0,0,0];
 assert.equal(Object.keys(day.meals).length,4);
 for(const meal of Object.values(day.meals)){
  const item=sample.meals.find(item=>item.id===meal.id);
  api.nutrition(api.recipes[item.index].ingredients,meal.portion).forEach((n,i)=>total[i]+=n);
 }
 assert(total.every((n,i)=>Math.abs(n-sample.nutritionTargets[i])<=[35,7,10,5][i]),total.join(', '));
}
const goalsBefore=api.target();
const freshCopy=api.storeReceivedPlan({...sample,name:'Client sample'});
const copy=api.cleanSavedPlans(api.state.savedPlans).find(p=>p.id===freshCopy);
copy.nutritionTargets=[2300,180,215,80];
copy.entries[0].meals.breakfast.portion=1;
api.saveLibraryPlanDraft(copy,freshCopy);
const goodCopy=api.cleanSavedPlans(api.state.savedPlans).find(p=>p.id===freshCopy);
const exported=JSON.parse(JSON.stringify(api.planPackageWithPhotos(goodCopy)));
assert.deepEqual(api.coachSamplePackage().nutritionTargets,sample.nutritionTargets);
const originalState=api.state;
api.state={profile:originalState.profile,logs:[],weights:[],foodLog:[]};
const clientPlan=api.storeReceivedPlan(exported);
api.activateSavedPlan(clientPlan,today);
assert.deepEqual(api.state.planNutritionTargets,[2300,180,215,80]);
assert.equal(api.state.mealPlan[today].breakfastPortion,1);
assert.equal(Object.keys(api.state.trainerMedia).length,16);
assert.equal(Object.keys(api.state.personalPhotos).length,5);
assert.deepEqual(api.target(),goalsBefore);
assert.deepEqual(api.capturePlanPackage().nutritionTargets,exported.nutritionTargets);
console.log('PASS coach sample targets, recipe portions, media, editable copy, and a plan-file round trip into a clean profile');
