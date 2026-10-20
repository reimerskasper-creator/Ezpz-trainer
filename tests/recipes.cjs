// Run with: node tests/recipes.cjs
const fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../fitness.html'),'utf8');
const scripts=[...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n');
const assert=(v,m)=>{if(!v)throw Error(m)};
const screen={innerHTML:''},listeners={},fields={},cards=[];
let query='',writes=0;
const initial={profile:{weight:80,height:180,age:35,sex:'male',days:3,goal:'maintain',level:'Beginner',equipment:'home'},logs:[],weights:[],shopping:['Tomatoes (raw) — 100 g'],foodLog:[],mealPlan:{saved:{breakfast:0,lunch:4,dinner:5}},workoutLayoutVersion:2};
let stored=JSON.stringify(initial);
const document={body:{dataset:{}},getElementById:id=>id==='screen'?screen:id==='recipe-search'?{value:query}:null,querySelectorAll:s=>s==='[data-recipe-card]'?cards:[],querySelector:s=>fields[s]||null,addEventListener:(n,f)=>(listeners[n]??=[]).push(f)};
const api=new Function('document','window','localStorage','fetch','console','alert','confirm',scripts+'\nreturn {recipes,foods,nutrition,eat,mealDetail,updateRecipe,mealPhoto,recipeCategory,filterRecipes,mealPlanner,get state(){return state},setFilter(v){mealFilter=v}}')(document,{addEventListener(){},scrollTo(){}},{getItem:()=>stored,setItem:(k,v)=>{stored=v;writes++}},()=>new Promise(()=>{}),{error(){}},m=>{throw Error(m)},()=>true);
assert(api.recipes.length===49,'Expected 49 recipes');
const approved=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/approved-food.json'),'utf8'));
for(const [name,body] of Object.entries(approved.foodFunctions||{}))assert(source.includes(body),'Approved food function changed: '+name);
if(approved.stylePrefix)assert(source.includes(approved.stylePrefix),'Approved base styles changed');
assert(JSON.stringify(api.foods)===JSON.stringify(approved.foods),'Approved food reference values changed');
assert(JSON.stringify(api.recipes.map(({photo,...r})=>r))===JSON.stringify(approved.recipes),'Approved recipes changed');
for(let i=0;i<49;i++){const html=api.mealPhoto(i),photo=html.match(/src="([^"]+)"/)?.[1];assert(photo&&fs.existsSync(path.join(__dirname,'..',photo)),'Recipe image missing '+i)}
assert(api.recipes[0].name==='Greek yogurt berry bowl'&&api.recipes[4].name==='Turkey wrap'&&api.recipes[23].name==='Blueberry overnight oats','Saved numeric recipe references changed');
for(let i=24;i<49;i++){
 const r=api.recipes[i];
 assert(api.mealPhoto(i).includes(r.photo),'Missing image '+i);
 assert(fs.existsSync(path.join(__dirname,'..',r.photo)),'Missing photo asset '+r.photo);
 assert(['breakfast','lunch','dinner'].includes(api.recipeCategory(i)),'Missing category '+i);
 for(const [name,g] of r.ingredients)assert(api.foods[name]&&g>0,'Invalid ingredient '+name);
 for(const scale of [.5,1,1.5,2]){
  fields['[data-serving="'+i+'"]']={value:String(scale)};
  for(const key of ['kcal','protein','carbs','fat','ingredients','nutrition'])fields['[data-'+key+'="'+i+'"]']={};
  api.mealDetail(i);api.updateRecipe(i);
  const expected=[0,0,0,0];r.ingredients.forEach(([name,g])=>api.foods[name].forEach((v,k)=>expected[k]+=v*g*scale/100));
  assert(JSON.stringify(api.nutrition(r.ingredients,scale))===JSON.stringify(expected.map(Math.round)),'Macro calculation '+i);
  assert(fields['[data-kcal="'+i+'"]'].textContent===Math.round(expected[0]),'Displayed calories '+i);
  assert(r.ingredients.every(([name,g])=>fields['[data-ingredients="'+i+'"]'].innerHTML.includes(Math.round(g*scale*10)/10+' g')),'Scaled ingredient grams '+i);
 }
 cards.push({dataset:{recipeIndex:String(i),mealCategory:api.recipeCategory(i)},textContent:r.name,hidden:false});
}
api.eat();assert((screen.innerHTML.match(/data-recipe-card /g)||[]).length===49,'Recipe cards missing');
assert(api.mealPlanner().includes('value="48"'),'New recipes unavailable in planner');
api.setFilter('dinner');query='chickpea';api.filterRecipes();
assert(cards.filter(x=>!x.hidden).map(x=>Number(x.dataset.recipeIndex)).join(',')==='47','Search and category must combine');
query='garlic';api.filterRecipes();assert(cards.some(x=>!x.hidden),'Search ingredients');
assert(writes===0&&stored===JSON.stringify(initial),'Browsing changed saved data');
// Exercise the existing food-log and shopping handlers using the final added recipe.
const click=selector=>{const key=selector==='[data-log-food]'?'logFood':'recipe',node={dataset:{[key]:'48'}};for(const listener of listeners.click||[])listener({target:{closest:s=>s===selector?node:null}})};
fields['[data-serving="48"]']={value:'1.5'};click('[data-log-food]');
assert(api.state.foodLog.length===1&&api.state.foodLog[0].servings===1.5,'New recipe food logging');
assert(JSON.stringify(api.state.foodLog[0].macros)===JSON.stringify(api.nutrition(api.recipes[48].ingredients,1.5)),'Logged macros');
click('[data-recipe]');
assert(api.state.shopping.includes('Lentils (cooked, drained) — 270 g'),'Shopping portion weights');
assert(api.state.shopping.includes('Tomatoes (raw) — 100 g'),'Existing shopping data lost');
assert(api.state.mealPlan.saved.lunch===4,'Existing meal plan changed');
console.log('PASS: 49 recipes, 49 image assets, 100 portion cases, combined filters, logging, shopping and saved plans');
