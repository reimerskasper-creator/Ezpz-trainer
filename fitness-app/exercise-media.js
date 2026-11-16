/* Only explicit aliases share media. Keep equipment and movement variations distinct. */
(()=>{
 const entries=[
  ['Dumbbell Bench Press','coach:bench','4_QuyfOCI5U',['Flat Dumbbell Bench Press','Flat Dumbbell Press']],
  ['Goblet Squat','coach:squat','Elx2y-Qb1nM',['Dumbbell Goblet Squat','DB Goblet Squat']],
  ['Dumbbell Romanian Deadlift','coach:hinge','QFbZevA7dps',['DB Romanian Deadlift','Dumbbell RDL']],
  ['Single-Arm Dumbbell Bench Row','coach:row','dFzUjzfih7k',['One-Arm Dumbbell Row','Single-Arm Dumbbell Row','One-Arm DB Row','1-Arm Dumbbell Row']],
  ['Push-Up','pushup','WDIpL0pjun0',['Pushup','Push-Ups']],
  ['Forearm Plank','plank','xhk1JkbF2lg',['Front Plank','Plank']],
  ['Glute Bridge','bridge','SKOMwg1JLrU',['Bodyweight Glute Bridge']],
  ['Dead Bug','deadbug','bxn9FBrt4-A',['Deadbug']],
  ['Bodyweight Split Squat','split','REflwhg0jNs',['Split Squat (Bodyweight)']],
  ['Bodyweight Step-Up','step','ACSIKCoECSA',['Bodyweight Step Up']],
  ['Bodyweight Standing Calf Raise','calf','Uyg2QR1WAq8',['Standing Bodyweight Calf Raise']],
  ['Side Plank','sideplank','ZpBJIRLGEgg',[]],
  ['Standing Dumbbell Curl','curl','w7hl4IbHMtY',['Dumbbell Curl','Dumbbell Biceps Curl','Standing Dumbbell Bicep Curl']],
  ['Dumbbell Hammer Curl','hammer','B8O6Ed_l6xw',['Hammer Curl']],
  ['Dumbbell Lateral Raise','lateral','XPPfnSEATJA',[]],
  ['Seated Dumbbell Shoulder Press','overhead','rO_iEImwHyo',['Seated Dumbbell Overhead Press']],
  ['Dumbbell Floor Press','floor','aHZuTZBrRAs',['DB Floor Press']],
  ['Incline Dumbbell Press','incline','_NrQUYg7Nlc',['Incline Dumbbell Bench Press']],
  ['Chest-Supported Dumbbell Row','chestrow','_b6ch2nIchk',['Dumbbell Chest-Supported Row']],
  ['Rope Triceps Pushdown','triceps','ZzNuKaKwCJA',['Cable Rope Pushdown','Cable Rope Triceps Pushdown','Rope Pushdown']],
  ['Lat Pulldown','pulldown','43hWj8mfYGY',['Cable Lat Pulldown']],
  ['Seated Cable Row','cablerow','0R9ZQd3aM6s',['Cable Seated Row']],
  ['45-Degree Leg Press','legpress','q4W4_VJbKW0',['45° Leg Press']],
  ['Pallof Press','pallof','syYBcVbEAFk',['Standing Cable Pallof Press']],
  ['Barbell Bench Press','barbell-bench','CayG6UYqL8g',['Flat Barbell Bench Press']],
  ['Cable Chest Fly','cable-fly','Io6e2uIoXlo',['Standing Cable Chest Fly']],
  ['Chest-Supported Dumbbell Reverse Fly','reverse-fly','7pE90Lysxss',['Chest-Supported Reverse Fly']],
  ['Slider Hamstring Curl','slider-curl','RU-QhYKNftM',['Sliding Hamstring Curl']],
  ['Lying Machine Leg Curl','lying-curl','lUH80pneL5w',['Lying Leg Curl']],
  ['Bird Dog','bird','ZdAHe9_HeEw',['Bird-Dog']],
  ['Bodyweight Squat','squat','P-yaD24bUE8',['Air Squat']],
  ['Bodyweight Reverse Lunge','reverse','0SHCQLa-gms',['Reverse Lunge (Bodyweight)']],
  ['Dumbbell Farmer Carry','carry','7mzKcADa46c',["Dumbbell Farmer’s Carry","Dumbbell Farmer's Carry"]],
 ];
 const normalize=name=>String(name??'').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/[–—]/g,'-').replace(/\s+/g,' ');
 const details=new Map();
 for(const [name,file,video,aliases] of entries){
  const photo=file.startsWith('coach:')?coachSamplePhotos['photo-coach-'+file.slice(6)]:'./fitness-app/exercise-media/'+file+'.jpg';
  const reference=Object.freeze({name,photo,videoUrl:'https://www.youtube.com/watch?v='+video});
  for(const key of [name,...aliases])details.set(normalize(key),reference);
 }
 function get(name){return details.get(normalize(name))}
 function choices(names,current,query=''){
  const currentMedia=get(current),search=normalize(query),prior=new Set(),supported=[],remaining=[];
  for(const name of names){
   const reference=get(name),identity=reference?.name||normalize(name);
   if(identity===(currentMedia?.name||normalize(current)))continue;
   const matches=normalize(name).includes(search)||normalize(reference?.name).includes(search);
   if(prior.has(identity)||!matches)continue;
   prior.add(identity);
   (reference?supported:remaining).push(name);
  }
  return [...supported,...remaining];
 }
 window.EzpzExerciseMedia=Object.freeze({get,choices,names:Object.freeze(entries.map(([name])=>name))});
})();
