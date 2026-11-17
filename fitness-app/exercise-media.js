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
  ['Reverse Crunch','reverse-crunch','IM7xIocQTmg',[]],
  ['Bear Plank','bear-plank','https://www.the-fit-edit.com/library/bear-plank',['Quadruped Hover']],
  ['Tuck Hollow Hold','tuck-hollow','BZDI4Wrnw70',['Hollow Hold (Tuck)']],
  ['Dead Bug Heel Taps','heel-taps','g6DNBvNEtwk',[]],
  ['Standing Dumbbell Shoulder Press','standing-shoulder','AZdAqB7kuII',[]],
  ['Standing Overhead Dumbbell Triceps Extension','overhead-triceps','7h3lG2WnLXg',['Single Dumbbell Overhead Triceps Extension']],
  ['Close-Grip Push-Up','close-pushup','G2mlaEfpEIM',[]],
  ['Dumbbell Pullover','pullover','sJO1L9HcGY4',['Flat Dumbbell Pullover']],
  ['Bird Dog','bird','ZdAHe9_HeEw',['Bird-Dog']],
  ['Bodyweight Squat','squat','P-yaD24bUE8',['Air Squat']],
  ['Bodyweight Reverse Lunge','reverse','0SHCQLa-gms',['Reverse Lunge (Bodyweight)']],
  ['Dumbbell Farmer Carry','carry','7mzKcADa46c',["Dumbbell Farmer’s Carry","Dumbbell Farmer's Carry"]],
 ];
 const additions=[
  ["Dumbbell Step-Up","dumbbell-step-up","https://musclewiki.com/exercise/dumbbell-step-up",["DB Step-Up","Dumbbell Step Up"],"Dumbbells · step","Legs & Glutes",["quads glutes",""],{"reps":"8–12","unit":"reps","side":true}],
  ["Dumbbell Z Press","dumbbell-z-press","https://musclewiki.com/exercise/dumbbell-z-press",["Z Press","Dumbbell Z-Press"],"Dumbbells","Shoulders",["frontDelts","triceps core"],{"reps":"8–12","unit":"reps","side":false}],
  ["Kneeling Ab-Wheel Rollout","ab-wheel-rollout","9j3Lw5JP1S4",["Ab Wheel Rollout","Ab-Wheel Rollout","Ab Roller"],"Ab wheel","Core",["core","back"],{"reps":"6–10","unit":"reps","side":false}],
  ["Trap-Bar Deadlift","trap-deadlift","gIURejjI_j8",["Hex Bar Deadlift","Trap Bar Deadlift"],"Trap bar · weight plates","Legs & Glutes",["quads glutes","hamstrings forearms"],{"reps":"5–8","unit":"reps","side":false}],
  ["Dumbbell Bulgarian Split Squat","bulgarian-split","https://musclewiki.com/exercise/dumbbell-bulgarian-split-squat",["Dumbbell RFESS","Dumbbell Rear-Foot-Elevated Split Squat"],"Dumbbells · bench","Legs & Glutes",["quads glutes",""],{"reps":"8–12","unit":"reps","side":true}],
  ["Dumbbell Thruster","thruster","https://musclewiki.com/exercise/dumbbell-thruster",["Dumbbell Squat to Press"],"Dumbbells","Shoulders",["quads glutes frontDelts","triceps core"],{"reps":"8–12","unit":"reps","side":false}],
  ["Pull-Up","pull-up","https://seqd.app/exercises/pull-up/",["Pullup","Overhand Pull-Up","Pull Up"],"Pull-up bar","Back",["back","biceps forearms"],{"reps":"5–8","unit":"reps","side":false}],
  ["Machine Leg Extension","leg-extension","https://musclewiki.com/exercise/machine-leg-extension",["Leg Extension","Seated Leg Extension"],"Leg extension machine","Legs & Glutes",["quads",""],{"reps":"10–15","unit":"reps","side":false}],
  ["Seated Calf Raise","seated-calf","IQuMNPHHoZY",["Machine Seated Calf Raise","Seated Machine Calf Raise"],"Seated calf raise machine","Legs & Glutes",["calves",""],{"reps":"10–15","unit":"reps","side":false}],
  ["Barbell Romanian Deadlift","barbell-rdl","https://musclewiki.com/exercise/barbell-romanian-deadlift",["Barbell RDL"],"Barbell · weight plates","Legs & Glutes",["hamstrings glutes","forearms"],{"reps":"8–12","unit":"reps","side":false}],
  ["Incline Barbell Bench Press","incline-barbell","https://musclewiki.com/exercise/barbell-incline-bench-press",["Incline Barbell Press","Barbell Incline Bench Press"],"Barbell · incline bench · rack","Chest",["chest","frontDelts triceps"],{"reps":"8–12","unit":"reps","side":false}],
  ["Pec Deck Fly","pec-deck","https://www.strengthlog.com/pec-deck/",["Pec Deck","Seated Machine Chest Fly"],"Pec deck machine","Chest",["chest","frontDelts"],{"reps":"10–15","unit":"reps","side":false}],
  ["Cable Rope Face Pull","face-pull","C0XHJJ4dZQ4",["Face Pull","Cable Face Pull"],"Cable machine · rope","Shoulders",["rearDelts",""],{"reps":"10–15","unit":"reps","side":false}],
  ["Incline Dumbbell Curl","incline-curl","https://musclewiki.com/exercise/dumbbell-incline-curl",["Incline Biceps Curl","Dumbbell Incline Curl"],"Dumbbells · incline bench","Arms",["biceps","forearms"],{"reps":"10–15","unit":"reps","side":false}],
  ["Barbell Curl","barbell-curl","https://musclewiki.com/exercise/barbell-curl",["Barbell Biceps Curl","Straight-Bar Curl"],"Barbell · weight plates","Arms",["biceps","forearms"],{"reps":"8–12","unit":"reps","side":false}],
  ["EZ-Bar Skull Crusher","skull-crusher","sSWIEHe08qM",["EZ Bar Skullcrusher","EZ-Bar Lying Triceps Extension"],"EZ bar · flat bench","Arms",["triceps",""],{"reps":"8–12","unit":"reps","side":false}],
  ["Barbell Hip Thrust","barbell-hip-thrust","https://musclewiki.com/exercise/barbell-hip-thrust",["Barbell Hip Thrusts"],"Barbell · stable bench","Legs & Glutes",["glutes",""],{"reps":"8–12","unit":"reps","side":false}],
  ["Kneeling Cable Crunch","cable-crunch","https://vimeo.com/857482512",["Kneeling Cable Rope Crunch"],"Cable machine · rope","Core",["core",""],{"reps":"10–15","unit":"reps","side":false}],
  ["Dumbbell Suitcase Carry","suitcase-carry","vLKndwTVgzk",["One-Arm Dumbbell Carry"],"Dumbbell","Core",["core forearms",""],{"reps":"20–40","unit":"sec","side":true}],
  ["Seated Dumbbell Wrist Curl","wrist-curl","https://musclewiki.com/exercise/dumbbell-wrist-curl",["Dumbbell Wrist Curl"],"Dumbbell · bench","Arms",["forearms",""],{"reps":"12–15","unit":"reps","side":true}],
 ];
 const normalize=name=>String(name??'').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/[–—]/g,'-').replace(/\s+/g,' ');
 const searchTags={
  'Glute Bridge':'glute hip extension','Goblet Squat':'glute quads legs','Bodyweight Squat':'glute quads legs',
  'Bodyweight Reverse Lunge':'glute quads legs','Bodyweight Split Squat':'glute quads legs',
  'Bodyweight Step-Up':'glute quads legs','Dumbbell Romanian Deadlift':'glute hamstrings hinge',
 };
 const details=new Map();
 for(const [name,file,video,aliases,equipment,category,muscles,prescription] of [...entries,...additions]){
  const photo=file.startsWith('coach:')?coachSamplePhotos['photo-coach-'+file.slice(6)]:'./fitness-app/exercise-media/'+file+'.jpg';
  const reference=Object.freeze({name,photo,equipment,category,muscles,prescription,searchText:normalize([name,...aliases,searchTags[name]].filter(Boolean).join(' ')),videoUrl:video.startsWith('https://')?video:'https://www.youtube.com/watch?v='+video});
  for(const key of [name,...aliases])details.set(normalize(key),reference);
 }
 function get(name){return details.get(normalize(name))}
 function choices(names,current,query=''){
  const currentMedia=get(current),search=normalize(query),prior=new Set(),supported=[],remaining=[];
  for(const name of names){
   const reference=get(name),identity=reference?.name||normalize(name);
   if(identity===(currentMedia?.name||normalize(current)))continue;
   const matches=normalize(name).includes(search)||(reference?.searchText||'').includes(search);
   if(prior.has(identity)||!matches)continue;
   prior.add(identity);
   (reference?supported:remaining).push(name);
  }
  return [...supported,...remaining];
 }
 window.EzpzExerciseMedia=Object.freeze({get,choices,names:Object.freeze([...entries,...additions].map(([name])=>name))});
})();
