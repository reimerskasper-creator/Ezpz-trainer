import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {createHandler} from '../supabase/functions/whoop-connect/index.js';
const id='11111111-1111-4111-8111-111111111111';
const env={SUPABASE_URL:'https://test.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'server-test-secret',WHOOP_CLIENT_ID:'test-client',WHOOP_CLIENT_SECRET:'client-test-secret'};
let states=[],connections=[],exchanges=0,failStorage=false;
const response=(data,status=200)=>new Response(JSON.stringify(data),{status});
const fetcher=async(url,options={})=>{
 const u=new URL(url),method=options.method||'GET';
 if(u.pathname==='/auth/v1/user')return response({id},options.headers.Authorization==='Bearer valid'?200:401);
 if(u.hostname==='api.prod.whoop.com'){
  exchanges++;assert.equal(options.body.get('redirect_uri'),env.SUPABASE_URL+'/functions/v1/whoop-connect');
  return response({access_token:'access-test-only',refresh_token:'refresh-test-only',expires_in:3600,scope:'read:cycles read:sleep offline'});
 }
 if(failStorage)return response({},503);
 const name=u.pathname.split('/').at(-1),table=name==='whoop_oauth_states'?states:connections;
 if(method==='DELETE'){
  const matched=table.filter(r=>(!u.searchParams.has('user_id')||r.user_id===u.searchParams.get('user_id').slice(3))&&(!u.searchParams.has('state_hash')||r.state_hash===u.searchParams.get('state_hash').slice(3))&&(!u.searchParams.has('expires_at')||r.expires_at>u.searchParams.get('expires_at').slice(3)));
  if(name==='whoop_oauth_states')states=states.filter(r=>!matched.includes(r));
  return response(matched);
 }
 if(method==='POST'){const rows=JSON.parse(options.body);if(name==='whoop_connections'){assert(options.headers.Prefer.includes('merge-duplicates'));connections=rows}else states.push(...rows);return response(rows)}
 return response(table.filter(r=>r.user_id===u.searchParams.get('user_id')?.slice(3)).map(r=>({connected_at:r.connected_at})));
};
const h=createHandler(env,fetcher,webcrypto),root=env.SUPABASE_URL+'/functions/v1/whoop-connect';
const post=(body,token='valid',origin='https://reimerskasper-creator.github.io')=>h(new Request(root,{method:'POST',headers:{Authorization:'Bearer '+token,Origin:origin},body:JSON.stringify(body)}));
assert.equal((await post({action:'start'},'bad')).status,401);
assert.equal((await post({action:'start'},'valid','https://attacker.example')).status,403);
assert.equal((await h(new Request(root+'?code=fake&state=bad'))).status,400);assert.equal(exchanges,0);
const start=await (await post({action:'start'})).json(),state=new URL(start.url).searchParams.get('state');
assert.equal(state.length,64);assert(!JSON.stringify(states).includes(state));
const callback=await h(new Request(root+'?code=example&state='+state));
assert.equal(callback.status,303);assert(callback.headers.get('Location').endsWith('?whoop=connected'));assert.equal(exchanges,1);
assert.equal(connections[0].user_id,id);const encrypted=JSON.stringify(connections);
assert(!encrypted.includes('access-test-only'));assert(!encrypted.includes('refresh-test-only'));
assert.equal((await h(new Request(root+'?code=example&state='+state))).status,400);assert.equal(exchanges,1);
const status=await (await post({action:'status'})).json();assert.equal(status.connected,true);assert(!JSON.stringify(status).includes('ciphertext'));
const nativeStart=await (await post({action:'start',platform:'android'})).json(),nativeState=new URL(nativeStart.url).searchParams.get('state');
assert.equal((await h(new Request(root+'?error=access_denied&state='+nativeState))).headers.get('Location'),'ezpzfitness://whoop/callback?result=cancelled');
const start2=await (await post({action:'start'})).json(),state2=new URL(start2.url).searchParams.get('state');
states[0].expires_at='2000-01-01T00:00:00Z';assert.equal((await h(new Request(root+'?code=x&state='+state2))).status,400);
failStorage=true;assert.equal((await post({action:'status'})).status,502);
const noCredentials=createHandler({...env,WHOOP_CLIENT_SECRET:''},fetcher,webcrypto);
assert.equal((await noCredentials(new Request(root,{method:'POST',headers:{Authorization:'Bearer valid'},body:'{"action":"start"}'}))).status,503);
console.log('PASS: authentication, origin gating, hashed expiring single-use state, callback exchange, encrypted storage, status isolation, replay/expiry rejection and storage failure.');

if(process.env.WHOOP_SMOKE_URL){
 const root=process.env.WHOOP_SMOKE_URL;
 const health=await fetch(root);assert.equal(health.status,200);const data=await health.json();assert.equal(data.callbackReady,true);assert.equal(data.credentialsConfigured,true);
 assert.equal((await fetch(root,{method:'POST',headers:{'Content-Type':'application/json'},body:'{"action":"start"}'})).status,401);
 assert.equal((await fetch(root+'?code=invalid&state=invalid')).status,400);
 console.log('PASS: deployed health endpoint, unauthorized start rejection and invalid callback rejection.');
}
