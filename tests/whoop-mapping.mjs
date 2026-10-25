import assert from 'node:assert/strict';
import {mapWhoop,mapWorkouts} from '../supabase/functions/whoop-connect/mapping.js';
const observed='2026-10-22T18:00:00Z',from='2026-10-16',through='2026-10-22';
const sleep={id:'sleep1',cycle_id:1,start:'2026-10-22T01:00:00Z',end:'2026-10-22T09:00:00Z',timezone_offset:'-04:00',nap:false,score_state:'SCORED',score:{stage_summary:{total_light_sleep_time_milli:4*3600000,total_slow_wave_sleep_time_milli:3600000,total_rem_sleep_time_milli:2*3600000,total_in_bed_time_milli:8*3600000}}};
const cycle={id:1,start:sleep.start,end:null,step_count:0,score_state:'SCORED',score:{kilojoule:8368,strain:12}};
const data=mapWhoop([cycle],[sleep],from,through,observed),get=m=>data.records.find(r=>r.metric===m);
assert.equal(get('sleep').value,420);assert.equal(get('sleep').deepMinutes,60);assert.equal(get('sleep').remMinutes,120);
assert.equal(get('steps').value,0);assert.equal(get('steps').cycleOpen,true);assert.equal(get('totalCalories').value,2000);
assert(!JSON.stringify(data).includes('strain'));assert(!JSON.stringify(data).includes('total_in_bed'));
assert.equal(mapWhoop([{...cycle,step_count:null,score:null}],[{...sleep,score:null}],from,through,observed).records.length,0);
assert.equal(mapWhoop([cycle],[{...sleep,nap:true}],from,through,observed).records.length,0);
assert.equal(mapWhoop([cycle],[],from,through,observed).records.length,0);
const timezone=mapWhoop([{...cycle,end:'2026-10-22T10:00:00Z'}],[{...sleep,end:'2026-10-22T01:00:00Z',start:'2026-10-21T18:00:00Z',timezone_offset:'-04:00'}],from,through,observed);
assert(timezone.records.every(r=>r.date==='2026-10-21'));
const negative=mapWhoop([{...cycle,step_count:-1,score:{kilojoule:-2}}],[sleep],from,through,observed);
assert.deepEqual(negative.records.map(r=>r.metric),['sleep']);
console.log('PASS: sleep-only duration, stage values, zero versus missing, cycle energy units, wake-date timezone, omitted naps and no recovery/workout data.');


{
const observed=new Date().toISOString(),end=new Date(Date.now()-1000).toISOString(),start=new Date(Date.now()-3601000).toISOString(),date=start.slice(0,10);
const workout={id:'session1',start,end,timezone_offset:'+00:00',sport_name:'weightlifting',updated_at:observed};
const sessions=mapWorkouts([workout,workout,{...workout,id:'unfinished',end:null}],date,date,observed);
assert.equal(sessions.length,1);assert.equal(sessions[0].durationMinutes,60);assert.equal(sessions[0].title,'Weightlifting');assert.equal(sessions[0].date,date);
assert.equal(mapWorkouts([{...workout,timezone_offset:'+00:99'}],date,date,observed).length,0);
assert.equal(mapWorkouts([{...workout,end:new Date(Date.now()+60000).toISOString()}],date,date,observed).length,0);
console.log('PASS: completed workout mapping, stable IDs, duration, provider-local date, absent end and invalid offsets.');

}

const richSleep=structuredClone(sleep);richSleep.score.stage_summary.total_awake_time_milli=60*60000;const rich=mapWhoop([],[richSleep],from,through,observed).records[0];assert.equal(rich.lightMinutes,240);assert.equal(rich.awakeMinutes,60);assert.equal(rich.inBedMinutes,480);const missing=structuredClone(richSleep);delete missing.score.stage_summary.total_awake_time_milli;assert.equal(mapWhoop([],[missing],from,through,observed).records[0].awakeMinutes,undefined);richSleep.score.stage_summary.total_awake_time_milli=0;assert.equal(mapWhoop([],[richSleep],from,through,observed).records[0].awakeMinutes,0);console.log('PASS WHOOP Light/Awake/in-bed duration mapping, missing vs true zero and compatible existing totals');
