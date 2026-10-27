const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const scripts=[...fs.readFileSync(path.join(__dirname,'../fitness.html'),'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n'),screen={innerHTML:''};let fail=false,writes=0,stored=JSON.stringify({profile:{goal:'maintain',level:'Beginner',equipment:'home',days:3,age:35,weight:80,height:180,sex:'male'},logs:[],weights:[],foodLog:[],workoutLayoutVersion:2});
const document={body:{dataset:{}},getElementById:id=>id==='screen'?screen:null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}};
const api=new Function('document','window','localStorage','fetch','console','alert',scripts+'\nreturn {nativeHealthImportStatus,chooseNativeTracker,cleanWellnessSettings,activeImportedWorkouts,dailyTrainingSummary,setImportedWorkoutHidden,sameWellnessMeasurement,movementMini,sleepImportDetails,applyNativeHealthSnapshot,nativeHealthPanel,saveSleep,foodDate,home,sleepPage,movementPage,connectedAppsPage,restoredState,importWellnessBatch,previewWellnessImport,selectedWellnessRecord,effectiveSleepLog,chooseWellnessSource,saveManualMovement,normalizeWellnessRecord,get state(){return state}}')(document,{addEventListener(){},scrollTo(){}},{getItem:()=>stored,setItem:(k,v)=>{if(fail)throw Error('full');writes++;stored=v}},()=>new Promise(()=>{}),{error(){}},()=>{});
const date=api.foodDate(),stamp=new Date().toISOString();
const sample={metric:'steps',value:100,date,source:'whoop-health-connect',externalId:'same-day',unit:'count',updatedAt:stamp};
assert(api.sameWellnessMeasurement(sample,{...sample,updatedAt:new Date(Date.parse(stamp)+60000).toISOString(),syncedAt:stamp}));
assert(!api.sameWellnessMeasurement(sample,{...sample,value:101}));
assert(!api.sameWellnessMeasurement({...sample,stepBasis:'whoop-period',periodStart:stamp},{...sample,stepBasis:'whoop-period',periodStart:new Date(Date.parse(stamp)+1).toISOString()}));
const row=(metric,value)=>({metric,value,date,unit:metric==='steps'?'count':'kcal',source:'whoop-health-connect',externalId:metric+'-'+date,updatedAt:stamp});
const snapshot=(records,metrics=['steps'])=>({version:1,from:date,through:date,metrics,records});
assert.equal(api.nativeHealthPanel(),'');
const yesterday=new Date(Date.parse(date+'T12:00:00Z')-86400000).toISOString().slice(0,10);
assert(api.movementMini().includes('steps-footprints'));assert(api.movementMini().includes('Today · not logged'));
api.applyNativeHealthSnapshot({version:1,from:yesterday,through:date,metrics:['steps'],records:[{...row('steps',8061),date:yesterday,externalId:'steps-'+yesterday}]});
const unchanged=JSON.stringify(api.state),latestCard=api.movementMini();
assert(latestCard.includes('Latest · '));assert(latestCard.includes('8,061'));assert(latestCard.includes('No count shared for today yet.'));assert(latestCard.includes('Goal met'));assert.equal(JSON.stringify(api.state),unchanged);
api.applyNativeHealthSnapshot(snapshot([row('steps',0)]));const zeroCard=api.movementMini();assert(!zeroCard.includes('Latest ·'));assert(zeroCard.includes('0<small> steps'));assert(!zeroCard.includes('steps-footprints'));
api.applyNativeHealthSnapshot({version:1,from:yesterday,through:date,metrics:['steps'],records:[]});

assert(api.saveManualMovement(date,{steps:'100',activeCalories:'',totalCalories:'',stepGoal:'8000'}));
assert.equal(api.applyNativeHealthSnapshot(snapshot([row('steps',2000)])),1);
assert.equal(api.selectedWellnessRecord('steps',date).value,100);
assert.equal(api.state.wellnessRecords.filter(r=>r.source==='whoop-health-connect').length,1);
api.applyNativeHealthSnapshot(snapshot([row('activeCalories',250)],['activeCalories']));
api.applyNativeHealthSnapshot(snapshot([]));
assert.equal(api.state.wellnessRecords.filter(r=>r.source==='whoop-health-connect'&&r.metric==='steps').length,0);
assert.equal(api.state.wellnessRecords.find(r=>r.metric==='activeCalories').value,250);
assert.equal(api.selectedWellnessRecord('steps',date).value,100);
const sleep={metric:'sleep',value:411,date,unit:'minutes',source:'whoop-health-connect',externalId:'sleep-'+date,updatedAt:stamp};
api.applyNativeHealthSnapshot(snapshot([{...sleep,deepMinutes:0,remMinutes:0}],['sleep']));
api.applyNativeHealthSnapshot(snapshot([{...sleep,updatedAt:new Date(Date.parse(stamp)+1).toISOString()}],['sleep']));
const detail=api.sleepImportDetails(date);assert(!detail.includes('sleep-stage-detail'));assert(detail.includes('wellness-source-sleep'));assert(!detail.includes('sleep-stage-grid'));assert.equal(api.selectedWellnessRecord('sleep',date).value,411);assert.equal(api.selectedWellnessRecord('sleep',date).deepMinutes,undefined);
// A successful empty raw-total snapshot clears unsupported native totals, preserving manual/other records.
api.applyNativeHealthSnapshot(snapshot([row('totalCalories',2608.2169)],['totalCalories']));
api.applyNativeHealthSnapshot(snapshot([],['totalCalories']));
assert.equal(api.state.wellnessRecords.some(r=>r.metric==='totalCalories'&&r.source==='whoop-health-connect'),false);
assert.equal(api.state.wellnessRecords.find(r=>r.metric==='activeCalories').value,250);
assert(api.saveManualMovement(date,{steps:'',activeCalories:'',totalCalories:'2274',stepGoal:'8000'}));
api.applyNativeHealthSnapshot(snapshot([],['totalCalories']));
assert.equal(api.selectedWellnessRecord('totalCalories',date).value,2274);
// A corrected WHOOP period replaces its old calendar total and survives normalization/restore.
const period={...row('steps',8061),stepBasis:'whoop-period',periodStart:new Date(Date.parse(stamp)-25*3600000).toISOString(),periodEnd:new Date(Date.parse(stamp)-3600000).toISOString()};
api.applyNativeHealthSnapshot(snapshot([period]));
let corrected=api.state.wellnessRecords.find(r=>r.source==='whoop-health-connect'&&r.metric==='steps');
assert.equal(corrected.value,8061);assert.equal(corrected.stepBasis,'whoop-period');assert.equal(api.normalizeWellnessRecord(corrected,true).periodEnd,period.periodEnd);
assert.equal(api.selectedWellnessRecord('steps',date).value,100); // manual choice stays selected
api.connectedAppsPage();assert(screen.innerHTML.includes('Saved sources'));assert(!screen.innerHTML.includes('<span>Not connected</span>'));
for(const bad of [{...period,periodEnd:period.periodStart},{...period,stepBasis:'guess'},{...period,source:'manual'}])assert.equal(api.normalizeWellnessRecord(bad),null);
let before=JSON.stringify(api.state);
for(const invalid of [snapshot([row('steps',-1)]),snapshot([{...row('steps',200),source:'manual'}]),snapshot([row('steps',200)],['sleep']),{...snapshot([]),metrics:[]},{...snapshot([]),through:'2999-01-01'}]){
 assert.throws(()=>api.applyNativeHealthSnapshot(invalid));assert.equal(JSON.stringify(api.state),before);
}
// Fitbit/Samsung snapshots reconcile only their own source, including completed workouts.
const samsung='samsung-health-connect',fitbit='fitbit-health-connect';
const workout=(source,id='w1')=>({source,externalId:id,date,start:date+'T00:00:00Z',end:date+'T00:30:00Z',durationMinutes:30,title:'Morning run',updatedAt:stamp});
let sequence=0;
const multi=(source,value,workouts=[workout(source)])=>({...snapshot([{...row('steps',value),source,updatedAt:new Date(Date.parse(stamp)+ ++sequence).toISOString()}],['steps','workouts']),source,workouts});
assert(api.chooseNativeTracker(samsung));
api.applyNativeHealthSnapshot(multi(samsung,12000));
assert.equal(api.activeImportedWorkouts().length,1);assert.equal(api.dailyTrainingSummary().percent,100);
assert(api.state.wellnessRecords.some(r=>r.source==='whoop-health-connect'));
api.applyNativeHealthSnapshot(multi(fitbit,9000));
assert.equal(api.activeImportedWorkouts().length,1);assert.equal(api.activeImportedWorkouts()[0].source,samsung);
assert(api.chooseNativeTracker(fitbit));assert.equal(api.activeImportedWorkouts()[0].source,fitbit);
assert.equal(api.selectedWellnessRecord('steps',date).value,100,'manual wins');
assert(api.saveManualMovement(date,{steps:'',activeCalories:'1',totalCalories:'',stepGoal:'10000'}));
assert.equal(api.cleanWellnessSettings(api.state.wellnessSettings).trackerSource,fitbit,'changing step goal retains tracker');
assert(api.chooseWellnessSource('steps',date,fitbit));assert.equal(api.selectedWellnessRecord('steps',date).value,9000);
assert(api.setImportedWorkoutHidden(fitbit+'|w1',true));
api.applyNativeHealthSnapshot(multi(fitbit,9500));assert(!api.activeImportedWorkouts().some(r=>r.source===fitbit));
assert(api.setImportedWorkoutHidden(fitbit+'|w1',false));
api.applyNativeHealthSnapshot(multi(samsung,11000,[]));assert(api.state.importedWorkouts.some(r=>r.source===fitbit));
api.applyNativeHealthSnapshot(multi(fitbit,9500));assert.equal(api.state.importedWorkouts.filter(r=>r.source===fitbit).length,1);
const restore=api.restoredState(JSON.parse(JSON.stringify(api.state)));assert.equal(restore.wellnessSettings.trackerSource,fitbit);assert.equal(restore.importedWorkouts.length,1);
const stable=JSON.stringify(api.state);
for(const bad of [{...multi(fitbit,4),source:'other'},multi(fitbit,4,[workout(samsung)]),multi(fitbit,4,[workout(fitbit),workout(fitbit)]),{...multi(fitbit,4),workouts:undefined}]){assert.throws(()=>api.applyNativeHealthSnapshot(bad));assert.equal(JSON.stringify(api.state),stable)}
// Direct WHOOP and its HC copy use one source per date, never double-count.
api.state.importedWorkouts=[workout('whoop','direct'),workout('whoop-health-connect','hc')];api.chooseNativeTracker('whoop-health-connect');assert.equal(api.activeImportedWorkouts().length,1);assert.equal(api.activeImportedWorkouts()[0].source,'whoop');
api.state.wellnessRecords=[];api.state.importedWorkouts=[workout(fitbit)];assert(api.nativeHealthImportStatus().includes('Imports saved'));
before=JSON.stringify(api.state);
fail=true;assert.throws(()=>api.applyNativeHealthSnapshot(snapshot([],['activeCalories'])));assert.equal(JSON.stringify(api.state),before);
console.log('PASS: WHOOP/Samsung/Fitbit source isolation, tracker/backup persistence, workout completion and deduplication, deletions, exclusions, atomic validation and storage rollback.');
