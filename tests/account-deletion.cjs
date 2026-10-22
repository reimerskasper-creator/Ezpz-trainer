const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('supabase/functions/delete-fitness-account/index.ts','utf8').replace('export function','function');
const box={fetch,Response,JSON};vm.createContext(box);vm.runInContext(source,box);
const uid='12345678-1234-1234-1234-123456789abc';
async function check({method='POST',body={confirmation:'DELETE'},token=true,valid=true,deleted=true,origin='https://reimerskasper-creator.github.io'}={}){
 const calls=[];const handler=box.createHandler(name=>name==='SUPABASE_URL'?'https://test.supabase.co':'server-secret',async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify(calls.length===1?{id:uid}:{}),{status:calls.length===1?(valid?200:401):(deleted?200:500)});});
 const res=await handler(new Request('https://test/delete',{method,headers:{origin,...(token?{authorization:'Bearer user-token'}:{})},...(method==='POST'?{body:JSON.stringify(body)}:{})}));return {res,calls};
}
(async()=>{
 for(const options of [{token:false},{valid:false},{body:{confirmation:'DELETE',user_id:uid}},{body:{confirmation:'NO'}},{origin:'https://other.test'},{method:'GET'}]){const {res,calls}=await check(options);assert(res.status>=400);assert(calls.length<2);}
 const ok=await check();assert.equal(ok.res.status,200);assert.equal(ok.calls.length,2);assert(ok.calls[1].url.endsWith(uid));assert.equal(ok.calls[1].options.headers.Authorization,'Bearer server-secret');assert.deepEqual(await ok.res.json(),{deleted:true});
 const failed=await check({deleted:false});assert.equal(failed.res.status,502);assert(!JSON.stringify(await failed.res.json()).includes('server-secret'));
 const preflight=await check({method:'OPTIONS',token:false});assert.equal(preflight.res.status,204);assert.equal(preflight.calls.length,0);
 console.log('PASS: verified self-only deletion, explicit confirmation, origin/method/auth rejection, server failures, no secret disclosure');
})().catch(e=>{console.error(e);process.exitCode=1});
