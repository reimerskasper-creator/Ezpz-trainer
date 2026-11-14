const fs=require('node:fs'),assert=require('node:assert/strict');const js=fs.readFileSync('fitness-app/food-flow-design.js','utf8');const source=js.slice(js.indexOf('function foodMacroShares'),js.indexOf('\n(()=>{',js.indexOf('function foodMacroShares')));const shares=new Function(source+';return foodMacroShares')();assert.deepEqual(shares(7,42,1).percent,[82,14,4]);assert.deepEqual(shares(14,84,2),shares(7,42,1));for(const row of [[1,1,1],[0,10,0],[10,0,0],[0,0,10],[12,1,2]])assert.equal(shares(...row).percent.reduce((a,b)=>a+b),100);assert.equal(shares(0,0,0),null);assert.equal(shares(NaN,1,1),null);assert.equal(shares(-1,1,1),null);console.log('PASS normalized macro energy shares, rounding sum100, portion invariance and zero/invalid input');

const projectionSource=js.slice(js.indexOf('function renderFoodDayProjection'),js.lastIndexOf('\n(()=>{'));
const title={},rows={};
const card={querySelector:selector=>selector==='h4'?title:rows};
const input={valueAsNumber:100};
const panel={querySelector:selector=>selector==='#ingredient-amount'?input:card};
const existing={macros:[1440.4,112.2,135.4,null]};
const project=new Function('document','ingredientSelected','ingredientRows','ingredientTotals','diaryDay','foodDate','customMealPlanContext','foodSummary','target',projectionSource+';renderFoodDayProjection()');
const totals=(draft)=>draft.every(item=>item.grams>0)?[draft.length*89,draft.length*1.1,draft.length*22.8,draft.length*.3]:null;
const runProjection=(date='2026-11-14',planner=null)=>project(
 {getElementById:()=>panel},['banana'],[{food:['banana'],grams:100}],totals,
 ()=>date,()=> '2026-11-14',planner,
 requestedDate=>{assert.equal(requestedDate,date);return {entries:[existing],missing:[false,false,false,true]}},
 ()=>({calories:1500,protein:195,carbs:235,fat:75})
);
runProjection();
assert.equal(title.textContent,'Today after adding');
assert.match(rows.innerHTML,/<b>1,618.4<\/b> \/ 1,500 kcal/);
assert.match(rows.innerHTML,/<b>181<\/b> \/ 235 g/);
assert.match(rows.innerHTML,/<b>114.4<\/b> \/ 195 g/);
assert.match(rows.innerHTML,/<b>≥0.6<\/b> \/ 75 g/);
runProjection('2026-11-13');
assert.equal(title.textContent,'After adding · 2026-11-13');
input.valueAsNumber=NaN;
runProjection();
assert.equal(card.hidden,true);
input.valueAsNumber=100;
runProjection(undefined,{});
assert.equal(card.hidden,true);
console.log('PASS projected totals include draft foods, respect diary date and flag missing nutrients');
