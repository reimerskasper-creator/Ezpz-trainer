/* Optional identity and explicit snapshots. No background fitness-data uploads. */
(function(root){
'use strict';
const RETURN_URL='https://reimerskasper-creator.github.io/Ezpz-trainer/fitness.html';
function validBackup(data){
 if(!data||typeof data!=='object'||Array.isArray(data)||!Array.isArray(data.logs)||!Array.isArray(data.weights)||data.logs.length>10000||data.weights.length>10000||new TextEncoder().encode(JSON.stringify(data)).length>2000000)throw Error('Not a valid EZPZ Fitness backup (maximum 2 MB).');
 if(data.profile!==null){const p=data.profile;if(!p||Array.isArray(p)||!['home','gym'].includes(p.equipment)||!['Beginner','Intermediate','Advanced'].includes(p.level)||!Number.isFinite(p.weight)||p.weight<30||p.weight>350||!Number.isFinite(p.height)||p.height<120||p.height>230||!Number.isFinite(p.age)||p.age<18||p.age>100||!Number.isFinite(p.days)||p.days<2||p.days>5)throw Error('Invalid profile in backup.');}
 return data;
}
function assertOwner(data,id){if(data.accountBackup?.ownerId&&data.accountBackup.ownerId!==id)throw Error('These device records belong to another account. Sign back into that account, or export and delete its device records before using a different account.');}
function payloadFor(data,id){validBackup(data);assertOwner(data,id);const copy=JSON.parse(JSON.stringify(data));delete copy.accountBackup;return copy;}
function attached(data,id,revision){return {...data,accountBackup:{ownerId:id,revision}};}
if(typeof module==='object'&&module.exports){module.exports={validBackup,assertOwner,payloadFor,attached};return;}
const app=root.EzpzAccountAdapter;if(!app)return;
const cap=root.Capacitor,native=!!(cap?.isNativePlatform?.()&&cap?.isPluginAvailable?.('EzpzAccount')),nativeAccount=native?cap.registerPlugin('EzpzAccount'):null;
let whoopConnected=false,whoopWorkoutAccess=null,whoopMessage='Connect separately to authorize access to your WHOOP data.',callbackBusy=false;
const whoopPanel=()=>'<p>'+esc(whoopMessage)+'</p><button data-go="connected-apps">Manage connected apps →</button>';
root.EzpzWhoopAccount={open:()=>{app.open();panel();}};

let client=null,user=null,config=null,busy=false,message='Sign-in is optional. Your records stay on this device until you choose to save them.',remote=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function panel(){
 const box=document.getElementById('fitness-account-panel');if(!box)return;
 const action=(name,label)=>'<button data-account="'+name+'" '+(busy?'disabled':'')+'>'+label+'</button>';
 box.innerHTML='<span class="section-kicker">YOUR PROGRESS, YOUR CHOICE</span><h3>Save my progress</h3><p>Keep using EZPZ without an account, or sign in with Google.</p>'+(user?'<p>Signed in as <strong>'+esc(user.email||'Google account')+'</strong></p><p>Signing in does not upload or replace your records.</p>'+action('review','Check cloud backup')+(config?.backupEnabled?'<div class="account-actions">'+action('save','Save device progress to cloud')+action('restore','Restore cloud progress')+'</div>':'<p>Cloud Save and Restore are being checked before activation. Keep a downloaded backup for now.</p>')+action('signout','Sign out — keep device records')+'<p class="note">Keeping records leaves them readable on this device. Use Delete records from this device below when using a shared device.</p>':action('signin','Continue with Google'))+'<p role="status" aria-live="polite">'+esc(message)+'</p><details><summary>Account & privacy</summary><p>Google supplies your account identity and email. Supabase holds your sign-in session and, only after an explicit Save, your fitness backup. Google sign-in alone does not grant wearable access. WHOOP requires separate authorization. Fitness backups can include measurements, food, sleep, steps, workout records and photos.</p><p>This is a private backup test. Cloud saves and restores happen only when you choose them. To request deletion of your test account, contact reimerskasper@gmail.com. Device deletion below does not delete a cloud account.</p><p><a href="./fitness-privacy.html">Privacy and deletion information</a></p>'+(user&&config?.accountDeletionEnabled?'<p>Deleting your cloud account permanently removes its cloud backup. Device records and downloaded copies remain.</p>'+action('delete-account','Delete my cloud account and backup'):'')+'</details><section class="account-whoop">'+whoopPanel()+'</section>';
}
function status(text){message=text;panel();const out=document.getElementById('whoop-sync-status');if(out)out.textContent=whoopMessage;}

function paintWhoopConnection(){
 const out=document.getElementById('whoop-connection-status');
 if(out)out.textContent=!user?'Sign in to connect your wearable.':!whoopConnected?'Not connected yet.':whoopWorkoutAccess===true?'Connected · Steps, sleep, calories and workouts.':whoopWorkoutAccess===false?'Connected · Workout access needs updating.':'Connected · Checking workout access.';
 for(const button of document.querySelectorAll?.('[data-whoop-upgrade]')||[]){button.hidden=whoopConnected&&whoopWorkoutAccess===true;button.disabled=busy;button.textContent=whoopConnected?'Enable workout access':'Connect WHOOP';}
}

function whoopStatus(text){whoopMessage=text;panel();const out=document.getElementById('whoop-sync-status');if(out)out.textContent=text;paintWhoopConnection();}
async function verified(){const {data,error}=await client.auth.getUser();if(error||!data?.user)throw Error('Your session has expired. Sign in again.');if(user&&data.user.id!==user.id)throw Error('Account changed. Reload before continuing.');user=data.user;assertOwner(app.snapshot(),user.id);return user;}
async function readRemote(){const u=await verified();const {data,error}=await client.from('fitness_backups').select('revision,updated_at,payload').eq('user_id',u.id).maybeSingle();if(error)throw Error('Cloud backup could not be read. Your device records are unchanged.');if(data){validBackup(data.payload);if(!Number.isSafeInteger(data.revision)||data.revision<1)throw Error('Invalid cloud revision.');}remote=data;return data;}
function summary(data){return data.logs.length+' workout records · '+data.weights.length+' weight records';}
async function run(name,automatic=false){
 if(busy)return;busy=true;panel();
 try{
  if(!config?.enabled||!client)throw Error('Sign-in needs internet. Please try again when connected.');
  if(name==='signin'){
   if(app.hasActiveWorkout()&&!confirm('Your workout is saved on this device. Leave it briefly to sign in with Google?'))return;
   // Confirm browser storage works before leaving for PKCE. Never touch fitness records here.
   const probe='ezpz-fitness-auth-probe';localStorage.setItem(probe,'1');localStorage.removeItem(probe);
   const {data,error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:native?'ezpzfitness://auth/callback':RETURN_URL,...(native?{skipBrowserRedirect:true}:{}),scopes:'openid email profile',queryParams:{prompt:'select_account'}}});if(error)throw error;
   if(native){if(!data?.url)throw Error('Could not start sign-in.');await nativeAccount.openAuth({url:data.url});status('Finish Google sign-in in your browser, then return to EZPZ.');}
  }else if(name==='whoop-sync'||name==='whoop-disconnect'){
   const u=await verified();
   if(!app.today||!app.importWhoop)throw Error('Update EZPZ before importing WHOOP data.');
   if(automatic){const check=await client.functions.invoke('whoop-connect',{body:{action:'status'}});if(check.error)throw Error('Could not refresh the connection. Saved data is still available.');whoopConnected=!!check.data?.connected;whoopWorkoutAccess=check.data?.workoutPermission===true?true:check.data?.workoutPermission===false?false:null;paintWhoopConnection();if(!whoopConnected){whoopStatus('Connect a wearable to refresh your measurements automatically.');return;}}
   if(name==='whoop-disconnect'&&!confirm('Disconnect WHOOP? Saved measurements on this device will remain.'))return;
   whoopStatus(name==='whoop-sync'?'Reading WHOOP measurements…':'Disconnecting WHOOP…');
   const {data,error}=await client.functions.invoke('whoop-connect',{body:{action:name==='whoop-sync'?'sync':'disconnect',through:app.today()}});
   if(error){let detail;try{detail=await error.context?.json()}catch{}throw Error(detail?.error||'WHOOP could not finish. Try again.');}
   const current=await verified();if(current.id!==u.id)throw Error('Account changed. No measurements were imported.');
   if(name==='whoop-disconnect'){if(!data?.disconnected)throw Error('Disconnect was not confirmed.');whoopConnected=false;whoopStatus('WHOOP disconnected. Saved measurements were kept.');return;}
   const summary=app.importWhoop(data?.snapshot,u.id),changed=summary.added+summary.updated;
   whoopConnected=true;whoopWorkoutAccess=data?.workoutPermission===true?true:data?.workoutPermission===false?false:null;try{localStorage.setItem('ezpz-whoop-last-sync-'+u.id,new Date().toISOString())}catch{}
   app.refreshImports?.();
   const workoutCount=(summary.workoutsAdded||0)+(summary.workoutsUpdated||0);
   whoopStatus((changed?'Imported '+changed+' new or updated measurement'+(changed===1?'':'s')+'.':summary.unchanged?'No new records. Your WHOOP measurements are up to date.':'No measurements were shared for the last seven days.')+(summary.removed?' '+summary.removed+' removed record'+(summary.removed===1?'':'s')+' reconciled.':'')+(workoutCount?' '+workoutCount+' workout'+(workoutCount===1?'':'s')+' updated.':'')+(data?.workoutPermission===false?' Reconnect WHOOP once to include workouts.':'')+' Manual entries stay saved.');
  }else if(name==='whoop-connect'||name==='whoop-status'){
   await verified();
   const {data,error}=await client.functions.invoke('whoop-connect',{body:{action:name==='whoop-connect'?'start':'status',platform:native?'android':'web'}});
   if(error)throw Error('WHOOP connection could not be checked. Confirm you are signed in and try again.');
   if(name==='whoop-status'){whoopConnected=!!data?.connected;whoopWorkoutAccess=data?.workoutPermission===true?true:data?.workoutPermission===false?false:null;whoopStatus(whoopConnected?(whoopWorkoutAccess===false?'WHOOP is connected for measurements. Choose Enable workout access to authorize workouts.':'WHOOP authorization is connected to your EZPZ account.'):'WHOOP is not connected yet.');return;}
   if(typeof data?.url!=='string')throw Error('Could not start WHOOP authorization.');
   const target=new URL(data.url);if(target.origin!=='https://api.prod.whoop.com'||target.pathname!=='/oauth/oauth2/auth')throw Error('Invalid WHOOP authorization URL.');
   localStorage.setItem('ezpz-whoop-pending',JSON.stringify({ownerId:user.id,expiresAt:Date.now()+10*60000}));
   if(native)await nativeAccount.openAuth({url:target.href});else location.assign(target.href);
  }else if(name==='signout'){
   if(!confirm('Sign out and KEEP your records on this device? They will remain readable here. Their account ownership is retained so another account cannot upload them.'))return;
   const {error}=await client.auth.signOut({scope:'local'});if(error)throw Error('Could not sign out. Try again online.');user=null;remote=null;whoopConnected=false;whoopWorkoutAccess=null;status('Signed out. Device records were kept.');
  }else if(name==='delete-account'){
   if(!config.accountDeletionEnabled)throw Error('Account deletion is not activated yet. Use the privacy page to contact support.');
   if(!navigator.locks)throw Error('Use a current browser to delete your account safely.');
   await navigator.locks.request('ezpz-fitness-cloud-operation',async()=>{
    const u=await verified();
    if(prompt('Permanently delete the EZPZ cloud account and backup for '+u.email+'? Device records and downloaded copies stay. Type DELETE to continue:')!=='DELETE')return;
    if(!confirm('Permanently delete '+u.email+' and its cloud backup? This cannot be undone. Your Google account will not be deleted.'))return;
    await verified();
    const {data,error}=await client.functions.invoke('delete-fitness-account',{body:{confirmation:'DELETE'}});
    if(error||data?.deleted!==true)throw Error('Cloud account deletion was not confirmed. Contact support before retrying. Device records were kept.');
    user=null;remote=null;
    try{await client.auth.signOut({scope:'local'});}catch{}
    status('Cloud account and backup deleted. Device records and downloaded files were kept. Export and delete this device’s records before connecting a new account.');
   });
  }else if(name==='review'){
   const d=await readRemote();status(d?'Cloud backup: '+summary(d.payload)+' · saved '+new Date(d.updated_at).toLocaleString()+'. Device records were not changed.':'No cloud backup yet. Device records were not changed.');
  }else if(name==='save'||name==='restore'){
   if(!config.backupEnabled)throw Error('Cloud Save and Restore are not activated yet.');
   if(!navigator.locks)throw Error('Use a current browser to safely save or restore your backup.');
   await navigator.locks.request('ezpz-fitness-cloud-operation',async()=>{
    const u=await verified(),before=app.snapshot(),fingerprint=JSON.stringify(before),d=await readRemote();
    if(app.hasActiveWorkout()&&name==='restore')throw Error('Finish your active workout before restoring.');
    if(name==='save'){
     const payload=payloadFor(before,u.id),known=before.accountBackup?.revision||0;
     // A different revision requires a deliberate review and safety copy of the cloud version.
     if(d&&d.revision!==known){app.download(d.payload,'ezpz-cloud-safety-copy.json');if(!confirm('The cloud has a different backup ('+summary(d.payload)+'). A safety download was requested. Check that it downloaded before continuing. Replace that cloud backup with this device?'))return;}
     if(!before.accountBackup?.ownerId&&!confirm('Attach this device’s existing fitness records to '+u.email+' and upload a backup?'))return;
     if(!confirm('Save '+summary(payload)+' and the rest of this device’s fitness data to '+u.email+'?'))return;
     await verified();if(JSON.stringify(app.snapshot())!==fingerprint||!app.diskMatches())throw Error('Device records changed while reviewing. Try again.');
     if(!before.accountBackup?.ownerId)app.replace(attached(before,u.id,0));
     const savedFingerprint=JSON.stringify(app.snapshot());
     const {data,error}=await client.rpc('save_fitness_backup',{p_payload:payload,p_expected_revision:d?.revision||0});
     if(error){if(error.code==='40001')throw Error('Another device saved first. Check the cloud backup and review again.');throw Error('Cloud save was not confirmed. Check cloud backup before retrying.');}
     const revision=data?.[0]?.revision;if(!Number.isSafeInteger(revision))throw Error('Could not confirm the saved revision. Check cloud backup before retrying.');
     // Record ownership even if another local edit occurred during the network request; never replace edits.
     const now=app.snapshot();assertOwner(now,u.id);if(JSON.stringify(now)!==savedFingerprint||!app.diskMatches()){status('Cloud backup saved. Device records changed during upload; they were kept. Check cloud backup before saving again.');return;}app.replace(attached(now,u.id,revision));status('Cloud backup saved. Later edits stay on this device until you Save again.');
    }else{
     if(!d)throw Error('There is no cloud backup to restore.');
     app.download(before,'ezpz-before-cloud-restore.json');if(!confirm('Restore '+summary(d.payload)+' from '+u.email+'? This REPLACES device records. A safety download was requested. Check that it downloaded before continuing.'))return;
     await verified();if(JSON.stringify(app.snapshot())!==fingerprint||!app.diskMatches())throw Error('Device records changed while reviewing. Try again.');
     const clean=payloadFor(d.payload,u.id);app.replace(attached(clean,u.id,d.revision));status('Cloud backup restored to this device.');
    }
   });
  }
 }catch(e){if(name.startsWith('whoop-'))whoopStatus(e.message||'WHOOP action failed. Device records were kept.');else status(e.message||'Account action failed. Device records are unchanged.');}finally{busy=false;panel();paintWhoopConnection();}
}
document.addEventListener('click',e=>{if(e.target.closest('[data-open-whoop]')){e.preventDefault();app.open();panel();document.getElementById('fitness-account-panel')?.scrollIntoView?.({behavior:'smooth',block:'start'});return;}const b=e.target.closest('[data-account]');if(b){e.preventDefault();run(b.dataset.account);}});
new MutationObserver(()=>{const p=document.getElementById('fitness-account-panel');if(p&&!p.children.length)panel();const out=document.getElementById('whoop-sync-status');if(out)out.textContent=whoopMessage;paintWhoopConnection();}).observe(document.getElementById('screen'),{childList:true});
async function handleNativeCallback(value){
 if(callbackBusy||typeof value!=='string')return;
 let url;try{url=new URL(value)}catch{return}
 if(url.protocol!=='ezpzfitness:'||url.pathname!=='/callback'||!['auth','whoop'].includes(url.hostname))return;
 callbackBusy=true;
 try{
  app.open();
  if(url.hostname==='whoop'){
   if(url.searchParams.get('result')!=='authorized'){whoopStatus('WHOOP authorization did not finish. Try Connect WHOOP again.');return;}
   const completion=url.searchParams.get('completion');if(!completion||!/^[a-f0-9]{64}$/.test(completion))throw Error('Invalid WHOOP return. Start Connect WHOOP again.');
   const pending=JSON.parse(localStorage.getItem('ezpz-whoop-pending')||'null'),u=await verified();
   if(!pending||pending.ownerId!==u.id||pending.expiresAt<Date.now())throw Error('Start Connect WHOOP from this app and try again.');
   const {data,error}=await client.functions.invoke('whoop-connect',{body:{action:'finish',completion}});
   if(error||data?.connected!==true)throw Error('WHOOP connection could not finish. Start again from this app.');
   const confirmed=await verified();if(confirmed.id!==u.id)throw Error('Account changed. Check WHOOP connection after signing in again.');
   localStorage.removeItem('ezpz-whoop-pending');whoopConnected=true;whoopStatus('Connected. Your measurements will refresh automatically.');return;
  }
  if(url.searchParams.get('error'))throw Error('Google sign-in did not finish. Try again.');
  const code=url.searchParams.get('code');if(!code)throw Error('Sign-in callback had no code. Try again.');
  const {error}=await client.auth.exchangeCodeForSession(code);if(error)throw Error('Sign-in could not finish. Start again from this app.');
  try{await verified();}catch(error){await client.auth.signOut({scope:'local'});user=null;throw error;}status('Signed in. Your device records were kept.');
 }catch(error){if(url.hostname==='whoop')whoopStatus(error.message||'Could not finish WHOOP connection.');else status(error.message||'Could not finish sign-in.');}
 finally{callbackBusy=false;if(user)scheduleWhoopSync(true);}
}

let lastAutoAttempt=0,lastAutoUser='',scheduledAuto=0;
function scheduleWhoopSync(force=false){
 const ticket=++scheduledAuto;
 setTimeout(async()=>{
  if(ticket!==scheduledAuto)return;
  if(!client||busy||callbackBusy||document.visibilityState==='hidden'||root.navigator?.onLine===false)return;
  if(!user){try{const result=await client.auth.getSession();if(!result.data?.session)return;await verified();}catch{return;}}
  if(!force&&lastAutoUser===user.id&&Date.now()-lastAutoAttempt<120000)return;
  lastAutoUser=user.id;lastAutoAttempt=Date.now();await run('whoop-sync',true);
 },500);
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='hidden')scheduleWhoopSync()});
root.addEventListener?.('focus',()=>scheduleWhoopSync());
root.addEventListener?.('online',()=>scheduleWhoopSync(true));

async function init(){
 try{
  const response=await fetch('./fitness-app/account-config.json',{cache:'no-store'});if(!response.ok)throw Error('Account settings unavailable.');config=await response.json();if(!config.enabled){status('Account sign-in is not activated yet.');return;}
  if(!root.supabase?.createClient)throw Error('Sign-in library unavailable. Reconnect and reload.');
  client=root.supabase.createClient(config.projectUrl,config.publishableKey,{auth:{flowType:'pkce',detectSessionInUrl:false,persistSession:true,storageKey:'ezpz-fitness-auth-v1'}});
  const url=new URL(location.href),code=url.searchParams.get('code'),error=url.searchParams.get('error_description');
  if(code||error){url.searchParams.delete('code');url.searchParams.delete('error');url.searchParams.delete('error_description');url.searchParams.delete('error_code');history.replaceState(null,'',url.pathname+url.search+url.hash);app.open();}
  if(error)throw Error('Google sign-in was cancelled or could not finish. Please try again.');
  if(code){const {error:exchangeError}=await client.auth.exchangeCodeForSession(code);if(exchangeError)throw Error('Sign-in could not finish. Use the same browser and try again.');}
  const {data,error:sessionError}=await client.auth.getSession();if(sessionError)throw sessionError;
  if(data?.session){const result=await client.auth.getUser();if(result.error)throw Error('Session could not be verified. Sign in again.');user=result.data.user;try{assertOwner(app.snapshot(),user.id);}catch(e){await client.auth.signOut({scope:'local'});user=null;throw e;}status('Signed in. No fitness records were uploaded or changed.');}
  if(nativeAccount){await nativeAccount.addListener('appResumed',()=>scheduleWhoopSync());await nativeAccount.addListener('authCallback',data=>handleNativeCallback(data.url));const pending=await nativeAccount.getPendingUrl();if(pending?.url)await handleNativeCallback(pending.url);}
  const whoopReturn=new URL(location.href),whoopResult=whoopReturn.searchParams.get('whoop');if(whoopResult){const completion=whoopReturn.searchParams.get('completion');whoopReturn.searchParams.delete('whoop');whoopReturn.searchParams.delete('completion');history.replaceState(null,'',whoopReturn.pathname+whoopReturn.search+whoopReturn.hash);await handleNativeCallback('ezpzfitness://whoop/callback?'+new URLSearchParams({result:whoopResult,completion:completion||''}));app.open();}
  client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'){user=null;remote=null;whoopConnected=false;whoopWorkoutAccess=null;}else if(session?.user){user=session.user;scheduleWhoopSync();}panel();});
 }catch(e){status(e.message||'Sign-in is unavailable. You can keep using EZPZ offline.');}finally{panel();if(user)scheduleWhoopSync();}
}
init();
})(typeof window!=='undefined'?window:globalThis);

