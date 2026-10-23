// Run: node tests/planner-picker.cjs
const fs=require('node:fs'),path=require('node:path'),source=fs.readFileSync(path.join(__dirname,'../fitness.html'),'utf8');
const screen={innerHTML:''},body={innerHTML:'',scrollTop:0},search={value:''},dialog={innerHTML:'',open:false,showModal(){this.open=true},close(){this.open=false}},focuses=[],alerts=[];
let stored=JSON.stringify({profile:{goal:'maintain',level:'Beginner',equipment:'home',days:3,age:35,weight:80,height:180,sex:'male'},logs:[],weights:[],selectedWorkout:'push-a',workoutDrafts:{'push-a':{'sr0-0':'9'}},workoutLayoutVersion:2}),writes=0,fail=false;
const document={body:{dataset:{}},querySelector:()=>null,querySelectorAll:()=>[],getElementById:id=>id==='screen'?screen:id==='planner-picker'?dialog:id==='planner-picker-body'?body:id==='planner-picker-search'?search:{focus(){focuses.push(id)}},addEventListener(){}};
const script=[...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n');
const api=new Function('document','window','localStorage','fetch','console','alert','confirm',script+'\nreturn {planner,openPlannerPicker,closePlannerPicker,filterPlannerPicker,pickerWorkoutMatches,pickerMealMatches,commitPickerWorkout,commitPickerMeal,planSettings,datePlus,foodDate,setPlannedRecipe,restoredState,recipeCategory,get picker(){return planPicker},get state(){return state},previewWorkout,setPreview(id,date){previewWorkoutId=id;previewWorkoutDate=date;tab="preview"},setTab(v){tab=v}}')(document,{addEventListener(){},scrollTo(){}},{getItem:()=>stored,setItem:(k,v)=>{if(fail)throw Error('Storage full');stored=v;writes++}},()=>new Promise(()=>{}),{error(){}},m=>alerts.push(m),()=>true);
const assert=(v,m)=>{if(!v)throw Error(m)},equal=(a,b,m)=>assert(JSON.stringify(a)===JSON.stringify(b),m);
api.setTab('planner');api.planner();
assert(!screen.innerHTML.includes('<select id="planned-workout"')&&!screen.innerHTML.includes('data-schedule-meal='),'Long native selects removed');
assert(screen.innerHTML.includes('data-open-plan-picker="workout"')&&screen.innerHTML.includes('data-open-meal-picker="breakfast"'),'Photo picker triggers');
const before=JSON.stringify(api.state),writesBefore=writes;api.openPlannerPicker('workout');
assert(dialog.open&&(body.innerHTML.match(/data-plan-picker-category=/g)||[]).length===12,'Eleven workout photo categories');
assert(api.pickerWorkoutMatches().length===65,'All built-in sessions available');
api.picker.category='Full Body';api.picker.level='Beginner';api.filterPlannerPicker();
assert(api.pickerWorkoutMatches().length===2&&body.innerHTML.includes('Beginner'),'Category and level combine');
api.picker.category=null;api.picker.level='all';api.picker.query='full-body-home';api.filterPlannerPicker();
assert(api.pickerWorkoutMatches().length===1&&body.innerHTML.includes('data-plan-pick-workout="full-body-home"'),'Search finds session');
api.closePlannerPicker();assert(!dialog.open&&JSON.stringify(api.state)===before&&writes===writesBefore,'Cancel never changes saved plans');
const date=api.planSettings().date,other=api.datePlus(date,1);api.state.workoutSchedule={[other]:'pull-a'};
api.openPlannerPicker('workout');assert(api.commitPickerWorkout('full-body-home'),'Assign workout');
assert(api.state.workoutSchedule[date]==='full-body-home'&&api.state.workoutSchedule[other]==='pull-a','Only selected date changes');
assert(api.state.selectedWorkout==='push-a'&&api.state.workoutDrafts['push-a']['sr0-0']==='9','Planning preserves active workout and draft');
api.openPlannerPicker('workout');api.picker.category='Kettlebell';assert(api.pickerWorkoutMatches().length===10,'Ten kettlebell planner choices');assert(api.commitPickerWorkout('kb-foundations'),'Plan kettlebell session');assert(api.state.workoutSchedule[date]==='kb-foundations','Kettlebell schedule saved');api.openPlannerPicker('workout');api.commitPickerWorkout('rest');assert(api.state.workoutSchedule[date]==='rest','Rest action');
api.openPlannerPicker('workout');api.commitPickerWorkout('');assert(!api.state.workoutSchedule[date]&&api.state.workoutSchedule[other]==='pull-a','Remove only selected workout');
api.state.foodLog=[{id:'old',date,servings:1,name:'Saved',macros:[400,30,45,10]}];
api.openPlannerPicker('meal','breakfast');assert(api.pickerMealMatches().every(x=>api.recipeCategory(x.i)==='breakfast'),'Slot filter defaults to breakfast');
api.picker.mealFilter='all';assert(api.pickerMealMatches().length===157,'All 157 recipes available');
assert(api.commitPickerMeal(0),'Assign breakfast');assert(api.state.mealPlan[date].breakfast===0&&api.state.mealPlan[date].breakfastPortion===1,'New recipe starts at one serving');
api.setPlannedRecipe(date,'breakfast',0,1.5);api.setPlannedRecipe(date,'lunch',48,2);
api.openPlannerPicker('meal','breakfast');api.commitPickerMeal(0);assert(api.state.mealPlan[date].breakfastPortion===1.5,'Reselecting same recipe preserves portion');
api.openPlannerPicker('meal','breakfast');api.commitPickerMeal(1);assert(api.state.mealPlan[date].breakfastPortion===1,'Different recipe resets portion');
api.openPlannerPicker('meal','breakfast');api.commitPickerMeal(null);assert(api.state.mealPlan[date].breakfast===undefined&&api.state.mealPlan[date].lunch===48&&api.state.mealPlan[date].lunchPortion===2,'Remove one slot only');
assert(api.state.foodLog.length===1&&api.state.foodLog[0].id==='old','Planning never logs or removes eaten food');
api.openPlannerPicker('workout');const original=JSON.stringify(api.state.workoutSchedule);api.state.plannerOffset=1;assert(!api.commitPickerWorkout('leg-a')&&JSON.stringify(api.state.workoutSchedule)===original,'Stale picker cannot write a different day');api.closePlannerPicker();api.state.plannerOffset=0;
api.openPlannerPicker('workout');fail=true;assert(!api.commitPickerWorkout('leg-a')&&JSON.stringify(api.state.workoutSchedule)===original,'Storage failure restores prior workout plan');fail=false;api.closePlannerPicker();
assert(alerts.length===1&&alerts[0].includes('Unable to save'),'Storage error surfaced');
const backup=JSON.parse(JSON.stringify(api.state)),restored=api.restoredState(backup);equal(restored.mealPlan,backup.mealPlan,'Meal backup unchanged');equal(restored.workoutSchedule,backup.workoutSchedule,'Workout backup unchanged');
assert(focuses.includes('planned-workout'),'Focus returns to trigger');
console.log('PASS: photo picker categories, combined search/level filters, all 157 recipes, cancellation, target date/slot assignment, rest/removal, portion preservation, active drafts, food log, backups and storage rollback');


api.state.workoutSchedule={[date]:'push-a',[other]:'pull-a'};api.setPreview('push-a',date);api.previewWorkout();assert(screen.innerHTML.includes('data-preview-back')&&screen.innerHTML.includes('Change workout'),'Preview navigation and swap visible');
const swapBefore=JSON.stringify(api.state);api.openPlannerPicker('workout');assert(api.picker.origin==='preview'&&api.picker.date===date,'Preview picker targets scheduled date');api.closePlannerPicker();assert(JSON.stringify(api.state)===swapBefore,'Cancelling swap preserves data');
api.openPlannerPicker('workout');assert(api.commitPickerWorkout('full-body-home'),'Swap library workout');assert(api.state.workoutSchedule[date]==='full-body-home'&&api.state.workoutSchedule[other]==='pull-a','Swap changes one date');assert(api.state.selectedWorkout==='push-a'&&api.state.workoutDrafts['push-a']['sr0-0']==='9','Swap preserves active session and draft');
api.openPlannerPicker('workout');fail=true;assert(!api.commitPickerWorkout('leg-a')&&api.state.workoutSchedule[date]==='full-body-home','Failed swap rolls back');fail=false;api.closePlannerPicker();console.log('PASS: scheduled preview back/change controls, cancellation, library swap, date isolation and storage rollback');

api.state.customWorkouts=[{id:'custom-swap',title:'My saved session',category:'Full Body',level:'Beginner',equipment:'Dumbbells',minutes:'25',exercises:[{name:'Goblet Squat',sets:3,reps:'8–12',unit:'reps',rest:90,side:false}]}];api.openPlannerPicker('workout');api.picker.category='mine';assert(api.pickerWorkoutMatches().some(w=>w.id==='custom-swap'),'Saved workouts available');assert(api.commitPickerWorkout('custom-swap')&&api.state.workoutSchedule[date]==='custom-swap'&&api.state.workoutSchedule[other]==='pull-a','Swap saved workout on one date');console.log('PASS: saved custom workout swap');

api.setTab("planner");api.planner();assert(screen.innerHTML.indexOf("plan-workout")<screen.innerHTML.indexOf("plan-settings"),"Actual workout before settings");assert(screen.innerHTML.indexOf("plan-meals")<screen.innerHTML.indexOf("plan-settings"),"Actual meals before settings");assert(screen.innerHTML.includes('<details class="plan-repeat">') || screen.innerHTML.includes('<details class="card plan-repeat">'),"Copy tools collapse");
