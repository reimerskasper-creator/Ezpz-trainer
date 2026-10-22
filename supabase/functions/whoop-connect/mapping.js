const finite=(value,max)=>typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=max;
const stamp=value=>typeof value==='string'&&Number.isFinite(Date.parse(value))?new Date(value).toISOString():null;
function wakeDate(sleep){
 if(!/^[-+]\d{2}:\d{2}$/.test(sleep.timezone_offset||''))return null;
 const end=stamp(sleep.end);if(!end)return null;
 const offset=sleep.timezone_offset,minutes=(Number(offset.slice(1,3))*60+Number(offset.slice(4)))*(offset[0]==='-'?-1:1);
 if(Number(offset.slice(4))>59||Math.abs(minutes)>14*60)return null;
 return new Date(Date.parse(end)+minutes*60000).toISOString().slice(0,10);
}
export function mapWhoop(cycles,sleeps,from,through,observedAt){
 const records=new Map(),mainByCycle=new Map();
 const put=(record,rank)=>{const key=record.metric+'|'+record.date,old=records.get(key);if(!old||rank>old.rank)records.set(key,{record,rank})};
 for(const sleep of sleeps){
  if(sleep.nap!==false||!stamp(sleep.start)||!stamp(sleep.end)||Date.parse(sleep.end)<=Date.parse(sleep.start))continue;
  const date=wakeDate(sleep);if(!date)continue;
  const old=mainByCycle.get(String(sleep.cycle_id));
  if(!old||Date.parse(sleep.end)>Date.parse(old.end))mainByCycle.set(String(sleep.cycle_id),{date,end:sleep.end});
  const stages=sleep.score?.stage_summary;
  if(date<from||date>through||sleep.score_state!=='SCORED'||!stages)continue;
  const names=['total_light_sleep_time_milli','total_slow_wave_sleep_time_milli','total_rem_sleep_time_milli'];
  if(!names.every(k=>finite(stages[k],86400000)))continue;
  const sum=names.reduce((n,k)=>n+stages[k],0);if(sum>86400000)continue;
  const total=Math.floor(sum/60000),deep=Math.floor(stages.total_slow_wave_sleep_time_milli/60000),rem=Math.floor(stages.total_rem_sleep_time_milli/60000);
  put({metric:'sleep',date,source:'whoop',externalId:'whoop-sleep-'+sleep.id,unit:'minutes',value:total,deepMinutes:deep,remMinutes:rem,updatedAt:observedAt},Date.parse(sleep.end));
 }
 for(const cycle of cycles){
  const main=mainByCycle.get(String(cycle.id)),start=stamp(cycle.start),end=cycle.end==null?null:stamp(cycle.end);
  if(!main||!start||cycle.end!=null&&!end||end&&Date.parse(end)<=Date.parse(start)||main.date<from||main.date>through)continue;
  const metadata={cycleStart:start,...(end?{cycleEnd:end}:{}),cycleOpen:!end};
  const row=(metric,unit,value)=>({metric,date:main.date,source:'whoop',externalId:'whoop-cycle-'+cycle.id+'-'+metric,unit,value,updatedAt:observedAt,...metadata});
  if(Number.isInteger(cycle.step_count)&&finite(cycle.step_count,200000))put(row('steps','count',cycle.step_count),Date.parse(start));
  const energy=cycle.score?.kilojoule;
  if(cycle.score_state==='SCORED'&&finite(energy,30000*4.184))put(row('totalCalories','kcal',energy/4.184),Date.parse(start));
 }
 return {version:1,source:'whoop',from,through,metrics:['steps','sleep','totalCalories'],records:[...records.values()].map(x=>x.record),observedAt};
}
