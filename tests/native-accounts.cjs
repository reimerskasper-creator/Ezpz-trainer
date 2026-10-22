const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
(async()=>{
 let click,callback,oauthArgs,exchanged=0,signedOut=0,opened=[],markup='',owner=null;
 const id='11111111-1111-4111-8111-111111111111';
 const box={children:[],set innerHTML(v){markup=v},get innerHTML(){return markup}};
 const sdk={auth:{
 getSession:async()=>({data:{session:null}}),getUser:async()=>({data:{user:{id,email:'test@example.test'}}}),
 onAuthStateChange(){},signOut:async()=>{signedOut++;return{}},
 signInWithOAuth:async args=>{oauthArgs=args;return {data:{url:'https://uwfetvlddswsmqcitgzy.supabase.co/auth/v1/authorize?provider=google'}}},
 exchangeCodeForSession:async code=>{assert.equal(code,'test-code');exchanged++;return{}}
 },functions:{invoke:async(name,args)=>({data:args.body.action==='start'?{url:'https://api.prod.whoop.com/oauth/oauth2/auth?state=test'}:{connected:true}})}};
 const bridge={openAuth:async data=>opened.push(data.url),addListener:async(name,fn)=>{assert.equal(name,'authCallback');callback=fn},getPendingUrl:async()=>({})};
 const sandbox={window:{Capacitor:{isNativePlatform:()=>true,isPluginAvailable:()=>true,registerPlugin:()=>bridge},EzpzAccountAdapter:{snapshot:()=>({profile:null,logs:[],weights:[],...(owner?{accountBackup:{ownerId:owner}}:{})}),hasActiveWorkout:()=>false,open(){}},supabase:{createClient:()=>sdk}},document:{getElementById:()=>box,addEventListener:(_,fn)=>click=fn},MutationObserver:class{observe(){}},fetch:async()=>({ok:true,json:async()=>({enabled:true,projectUrl:'https://test.supabase.co',publishableKey:'public'})}),TextEncoder,URL,location:{href:'https://localhost/index.html'},history:{replaceState(){}},navigator:{},localStorage:{setItem(){},removeItem(){}},confirm:()=>true};
 vm.runInNewContext(fs.readFileSync('fitness-app/accounts.js','utf8'),sandbox);
 const settle=async()=>{for(let i=0;i<20;i++)await new Promise(r=>setImmediate(r))};await settle();
 const action=async name=>{click({target:{closest:selector=>selector==='[data-account]'?({dataset:{account:name}}):null},preventDefault(){}});await settle()};
 await action('signin');assert.equal(oauthArgs.options.redirectTo,'ezpzfitness://auth/callback');assert.equal(oauthArgs.options.skipBrowserRedirect,true);assert.equal(opened.length,1);
 await callback({url:'https://attacker.test/callback?code=test-code'});assert.equal(exchanged,0);
 await callback({url:'ezpzfitness://auth/callback?code=test-code'});assert.equal(exchanged,1);assert(markup.includes('Signed in.'));
 await action('whoop-connect');assert.equal(opened.length,2);assert(opened[1].startsWith('https://api.prod.whoop.com/'));
 await callback({url:'ezpzfitness://whoop/callback?result=connected'});assert(markup.includes('authorization completed'));
 await action('whoop-status');assert(markup.includes('connected to your EZPZ account'));
 owner='another-account';await callback({url:'ezpzfitness://auth/callback?code=test-code'});assert.equal(signedOut,1);
 console.log('PASS: native external Google sign-in, PKCE callback, URL rejection, per-user WHOOP start/status and cross-account sign-out.');
})().catch(error=>{console.error(error);process.exitCode=1});
