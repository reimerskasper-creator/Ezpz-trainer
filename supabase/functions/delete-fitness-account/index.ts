// Server-only. Supabase supplies these environment values; never copy secrets to the app.
export function createHandler(env, request = fetch) {
 const origin = 'https://reimerskasper-creator.github.io';
 return async function handle(req) {
  const headers = {'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin','Cache-Control':'no-store'};
  const reply=(status,body)=>new Response(JSON.stringify(body),{status,headers:{...headers,'Content-Type':'application/json'}});
  if(req.headers.get('origin') && req.headers.get('origin')!==origin)return reply(403,{error:'Origin not allowed'});
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(req.method!=='POST')return reply(405,{error:'POST required'});
  const authorization=req.headers.get('authorization')||'';
  if(!/^Bearer \S+$/i.test(authorization))return reply(401,{error:'Sign in required'});
  try {
   const body=await req.json();
   if(body?.confirmation!=='DELETE' || Object.keys(body).some(key=>key!=='confirmation'))return reply(400,{error:'Explicit confirmation required; no user ID accepted'});
   const url=env('SUPABASE_URL'),key=env('SUPABASE_SERVICE_ROLE_KEY');
   if(!url||!key)return reply(503,{error:'Account deletion is not configured'});
   const verified=await request(url+'/auth/v1/user',{headers:{apikey:key,Authorization:authorization}});
   if(!verified.ok)return reply(401,{error:'Sign in again before deleting your account'});
   const user=await verified.json();
   if(!/^[0-9a-f-]{36}$/i.test(user.id||''))return reply(401,{error:'Account could not be verified'});
   // Derive the only target from Auth's verified response. Never trust a caller-supplied ID.
   const result=await request(url+'/auth/v1/admin/users/'+encodeURIComponent(user.id),{method:'DELETE',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({should_soft_delete:false})});
   if(!result.ok)return reply(502,{error:'Deletion was not confirmed. Contact support before retrying.'});
   return reply(200,{deleted:true});
  } catch { return reply(502,{error:'Deletion was not confirmed. Check your connection or contact support.'}); }
 };
}
if(typeof Deno!=='undefined')Deno.serve(createHandler(name=>Deno.env.get(name)));
