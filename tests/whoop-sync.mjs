import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {createHandler} from '../supabase/functions/whoop-connect/index.js';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222';
const env={SUPABASE_URL:'https://test.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-server-key',WHOOP_CLIENT_ID:'test-client',WHOOP_CLIENT_SECRET:'test-secret'};
let states=[],connections=[],refreshes=0,failSleep=false,revokes=0;
const today=new Date().toISOString().slice(0,10),start=today+'T01:00:00Z',end=today+'T09:00:00Z';
const response=(data,status=200)=>new Response(status===204?null:JSON.stringify(data),{status});
const fetcher=async(url,opt={})=>{
 const u=new URL(url),method=opt.method||'GET';
 if(u.pathname==='/auth/v1/user')return response({id:opt.headers.Authorization==='Bearer user-b'?B:A});
 if(u.pathname.endsWith('/oauth2/token')){if(opt.body.get('grant_type')==='refresh_token')refreshes++;return response({access_token:'private-access-'+refreshes,refresh_token:'private-refresh-'+refreshes,expires_in:refreshes?3600:1,scope:'read:cycles read:sleep offline'});}
 if(u.pathname.endsWith('/cycle'))return response({records:[{id:1,start,end:null,step_count:1234,score_state:'SCORED',score:{kilojoule:8368}}]});
 if(u.pathname.endsWith('/activity/sleep'))return failSleep?response({},503):response({records:[{id:'s1',cycle_id:1,start,end,timezone_offset:'+00:00',nap:false,score_state:'SCORED',score:{stage_summary:{total_light_sleep_time_milli:14400000,total_slow_wave_sleep_time_milli:3600000,total_rem_sleep_time_milli:7200000}}}]});
 if(u.pathname.endsWith('/user/access')){revokes++;return response(null,204)}
 const table=u.pathname.split('/').at(-1),rows=table==='whoop_connections'?connections:states;
 const matched=rows.filter(r=>(!u.searchParams.has('user_id')||r.user_id===u.searchParams.get('user_id').slice(3))&&(!u.searchParams.has('state_hash')||r.state_hash===u.searchParams.get('state_hash').slice(3))&&(!u.searchParams.has('sync_lock')||r.sync_lock===u.searchParams.get('sync_lock').slice(3))&&(!u.searchParams.has('expires_at')||r.expires_at>u.searchParams.get('expires_at').slice(3))&&(!u.searchParams.has('or')||!r.sync_lock||r.sync_lock_expires_at<new Date().toISOString()));
 if(method==='DELETE'){if(table==='whoop_connections')connections=rows.filter(r=>!matched.includes(r));else states=rows.filter(r=>!matched.includes(r));return response(matched)}
 if(method==='POST'){const data=JSON.parse(opt.body);if(table==='whoop_connections')connections=data;else states.push(...data);return response(data)}
 if(method==='PATCH'){const patch=JSON.parse(opt.body);matched.forEach(r=>Object.assign(r,patch));return response(matched)}
 return response(matched.map(r=>({connected_at:r.connected_at})));
};
const h=createHandler(env,fetcher,webcrypto),root=env.SUPABASE_URL+'/functions/v1/whoop-connect';
const post=(action,user='a')=>h(new Request(root,{method:'POST',headers:{Authorization:'Bearer user-'+user},body:JSON.stringify({action,through:today})}));
const launch=await(await post('start')).json(),state=new URL(launch.url).searchParams.get('state');
assert.equal((await h(new Request(root+'?code=test&state='+state))).status,303);
const synced=await post('sync'),data=await synced.json();assert.equal(synced.status,200);assert.equal(data.snapshot.records.length,3);assert.equal(refreshes,1);assert.equal(connections[0].sync_lock,null);assert(!JSON.stringify(data).includes('private-'));
assert.equal((await post('sync','b')).status,502);assert.equal(connections.length,1);
const concurrent=await Promise.all([post('sync'),post('sync')]);assert.deepEqual(concurrent.map(r=>r.status).sort(),[200,502]);
failSleep=true;const failed=await post('sync');assert.equal(failed.status,502);assert.equal((await failed.json()).snapshot,undefined);assert.equal(connections[0].sync_lock,null);failSleep=false;
assert.equal((await post('disconnect','b')).status,502);assert.equal(revokes,0);
assert.equal((await post('disconnect')).status,200);assert.equal(revokes,1);assert.equal(connections.length,0);
console.log('PASS: per-user sync, refresh rotation, encrypted token isolation, concurrent-sync lease, failed-read atomicity, lease release and explicit disconnect.');
