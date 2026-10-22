const APP = 'https://reimerskasper-creator.github.io/Ezpz-trainer/fitness.html';
const ORIGINS = new Set(['https://reimerskasper-creator.github.io','https://localhost','http://localhost','capacitor://localhost']);
const TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';
export function createHandler(env, fetcher = fetch, cryptoApi = crypto) {
 const base=env.SUPABASE_URL,service=env.SUPABASE_SERVICE_ROLE_KEY;
 const callback=base+'/functions/v1/whoop-connect';
 const ready=()=>!!(env.WHOOP_CLIENT_ID&&env.WHOOP_CLIENT_SECRET);
 const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
 const bytes=s=>new TextEncoder().encode(s);
 const hex=a=>Array.from(new Uint8Array(a),v=>v.toString(16).padStart(2,'0')).join('');
 const random=()=>hex(cryptoApi.getRandomValues(new Uint8Array(32)));
 const hash=async s=>hex(await cryptoApi.subtle.digest('SHA-256',bytes(s)));
 const db=async(table,query='',method='GET',body)=>{
  const r=await fetcher(base+'/rest/v1/'+table+query,{method,headers:{apikey:service,Authorization:'Bearer '+service,'Content-Type':'application/json',Prefer:query.includes('on_conflict=')?'resolution=merge-duplicates,return=representation':'return=representation'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
  if(!r.ok)throw Error('Storage unavailable');
  return r.status===204?[]:await r.json();
 };
 const seal=async(user,tokens)=>{
  const digest=await cryptoApi.subtle.digest('SHA-256',bytes('ezpz-whoop-tokens-v1:'+service));
  const key=await cryptoApi.subtle.importKey('raw',digest,'AES-GCM',false,['encrypt']);
  const iv=cryptoApi.getRandomValues(new Uint8Array(12));
  const encrypted=await cryptoApi.subtle.encrypt({name:'AES-GCM',iv,additionalData:bytes(user)},key,bytes(JSON.stringify(tokens)));
  return {version:1,iv:hex(iv),ciphertext:hex(encrypted)};
 };
 const redirect=(result,platform)=>new Response(null,{status:303,headers:{...headers,Location:platform==='android'?'ezpzfitness://whoop/callback?result='+result:APP+'?whoop='+result}});
 return async req=>{
  const url=new URL(req.url),origin=req.headers.get('Origin'),cors=origin&&ORIGINS.has(origin)?{'Access-Control-Allow-Origin':origin,Vary:'Origin'}:{};
  const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...headers,...cors,'Content-Type':'application/json'}});
  if(origin&&!ORIGINS.has(origin))return json({error:'Origin not allowed'},403);
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,...cors,'Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,GET,OPTIONS'}});
  try{
   // OAuth redirects carry no Supabase JWT. Only a one-time, unexpired state permits token exchange.
   if(req.method==='GET'&&(url.searchParams.has('code')||url.searchParams.has('error')||url.searchParams.has('state'))){
    const state=url.searchParams.get('state');
    if(!state||!/^[a-f0-9]{64}$/.test(state))return json({error:'Invalid or expired connection request. Start again in EZPZ.'},400);
    const digest=await hash(state);
    const rows=await db('whoop_oauth_states','?state_hash=eq.'+digest+'&expires_at=gt.'+encodeURIComponent(new Date().toISOString()),'DELETE');
    if(rows.length!==1)return json({error:'Invalid or expired connection request. Start again in EZPZ.'},400);
    if(url.searchParams.has('error'))return redirect('cancelled',rows[0].return_platform);
    const code=url.searchParams.get('code');
    if(!ready()||!code||code.length>4096)return json({error:'Connection setup is incomplete. Start again after setup.'},503);
    const response=await fetcher(TOKEN_URL,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'authorization_code',code,redirect_uri:callback,client_id:env.WHOOP_CLIENT_ID,client_secret:env.WHOOP_CLIENT_SECRET}),signal:AbortSignal.timeout(15000)});
    if(!response.ok)return redirect('failed',rows[0].return_platform);
    const t=await response.json();
    if(typeof t.access_token!=='string'||!t.access_token||typeof t.refresh_token!=='string'||!t.refresh_token||!Number.isFinite(t.expires_in)||t.expires_in<=0)return redirect('failed',rows[0].return_platform);
    const scopes=typeof t.scope==='string'?t.scope.split(/\s+/):[];
    if(!scopes.includes('read:cycles')||!scopes.includes('read:sleep'))return redirect('failed',rows[0].return_platform);
    const user=rows[0].user_id;
    const sealed=await seal(user,{access_token:t.access_token,refresh_token:t.refresh_token,expires_at:new Date(Date.now()+t.expires_in*1000).toISOString(),scope:t.scope});
    await db('whoop_connections','?on_conflict=user_id','POST',[{user_id:user,encrypted_tokens:sealed,connected_at:new Date().toISOString()}]);
    return redirect('connected',rows[0].return_platform);
   }
   if(req.method==='GET')return json({service:'EZPZ WHOOP connection',callbackReady:true,credentialsConfigured:ready()});
   if(req.method!=='POST')return json({error:'Method not allowed'},405);
   const bearer=req.headers.get('Authorization')||'';
   if(!/^Bearer \S+$/.test(bearer))return json({error:'Sign in to EZPZ first.'},401);
   const identity=await fetcher(base+'/auth/v1/user',{headers:{apikey:service,Authorization:bearer},signal:AbortSignal.timeout(15000)});
   if(!identity.ok)return json({error:'Sign in to EZPZ again.'},401);
   const user=(await identity.json())?.id;
   if(typeof user!=='string'||!/^[0-9a-f-]{36}$/i.test(user))return json({error:'Invalid session.'},401);
   if(Number(req.headers.get('Content-Length'))>2048)return json({error:'Request too large'},413);
   const raw=await req.text();if(raw.length>2048)return json({error:'Request too large'},413);
   let body;try{body=JSON.parse(raw)}catch{return json({error:'Invalid request'},400)}
   if(body.action==='status'){
    const rows=await db('whoop_connections','?select=connected_at&user_id=eq.'+user);
    return json({configured:ready(),connected:rows.length===1,connectedAt:rows[0]?.connected_at||null});
   }
   if(body.action!=='start')return json({error:'Unknown action'},400);
   if(!ready())return json({error:'WHOOP setup is not complete yet.'},503);
   // Starting again invalidates older pending attempts for this user.
   await db('whoop_oauth_states','?user_id=eq.'+user,'DELETE');
   const state=random(),now=Date.now(),platform=body.platform==='android'?'android':'web';
   await db('whoop_oauth_states','','POST',[{state_hash:await hash(state),user_id:user,return_platform:platform,expires_at:new Date(now+10*60000).toISOString()}]);
   const authorization=new URL('https://api.prod.whoop.com/oauth/oauth2/auth');
   authorization.search=new URLSearchParams({client_id:env.WHOOP_CLIENT_ID,redirect_uri:callback,response_type:'code',scope:'read:cycles read:sleep offline',state}).toString();
   return json({url:authorization.href});
  }catch{return json({error:'Connection could not finish. Your device records were not changed. Try again.'},502)}
 };
}
if(typeof Deno!=='undefined')Deno.serve(createHandler(Deno.env.toObject()));
