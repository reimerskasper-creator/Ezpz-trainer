/* A built-in example uses the same package format as a coach's shared plan. */
function coachSamplePackage() {
 const movements=[
  ['Dumbbell bench press','bench','4_QuyfOCI5U',false],
  ['Goblet squat','squat','Elx2y-Qb1nM',false],
  ['Dumbbell Romanian deadlift','hinge','QFbZevA7dps',false],
  ['Single-arm dumbbell bench row','row','dFzUjzfih7k',true],
  ['Dead Bug','deadbug','bxn9FBrt4-A',true],
  ['Glute Bridge','bridge','SKOMwg1JLrU',false],
 ];
 const workouts=[],media={},backgrounds={};
 for(let week=0;week<2;week++){
  for(const [letter,order] of [['A',[0,1,3,2,4,5]],['B',[2,3,1,0,5,4]]]){
   const id='custom-coach-'+letter.toLowerCase()+'-'+(week+1);
   const exercises=order.map(index=>{
    const [name,photo,video,side]=movements[index];
    media[id+'|'+name]={photoId:'photo-coach-'+photo,videoUrl:'https://www.youtube.com/watch?v='+video};
    return {name,sets:index>=4?2:3,reps:String((index===1?12:index===4?8:10)+week),unit:'reps',rest:index>=4?45:90,side,...(index>=4?{load:false}:{})};
   });
   workouts.push({id,title:'Full-body strength '+letter,category:'Full Body',level:'Beginner',equipment:'Dumbbells and a flat bench',minutes:'45',photoId:'photo-coach-cover',exercises});
   backgrounds[id]='photo-coach-cover';
  }
 }
 const mealDays=[
  [[14,1.5],[16,1],[13,1.5],[0,.5]],
  [[14,1.5],[12,1],[13,1.5],[2,.5]],
  [[9,1.5],[6,1],[22,1.5],[14,.5]],
  [[14,1.5],[1,1],[5,1],[9,1]],
  [[14,1],[1,1],[22,1.5],[20,.5]],
 ];
 const meals=[...new Set(mealDays.flatMap(day=>day.map(([i])=>i)))].map(index=>({id:'meal-'+index,kind:'recipe',index,signature:JSON.stringify(recipes[index])}));
 const entries=Array.from({length:14},(_,day)=>{
  const weekday=day%7,week=Math.floor(day/7),training=[0,2,4].indexOf(weekday);
  const workout=training<0?'rest':'custom-coach-'+((week+training)%2?'b':'a')+'-'+(week+1);
  const slots=['breakfast','lunch','dinner','extra-snack'];
  const meals=Object.fromEntries(mealDays[[0,1,2,1,3,4,0][weekday]].map(([index,portion],i)=>[slots[i],{id:'meal-'+index,portion,...(i===3?{label:'Snack'}:{})}]));
  return {workout,meals};
 });
 return validatePlanPackage({
  format:'ezpz-plan',version:2,name:'Coach Sample Plan',days:14,
  nutritionTargets:[2400,190,230,80],
  entries,workouts,meals,media,backgrounds,coverPhotoId:'photo-coach-cover',
  photos:coachSamplePhotos,
 },true);
}
