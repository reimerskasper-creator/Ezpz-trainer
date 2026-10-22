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
let client=null,user=null,config=null,busy=false,message='Sign-in is optional. Your records stay on this device until you choose to save them.',remote=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function panel(){
 const box=document.getElementById('fitness-account-panel');if(!box)return;
 const action=(name,label)=>'<button data-account="'+name+'" '+(busy?'disabled':'')+'>'+label+'</button>';
 box.innerHTML='<span class="section-kicker">YOUR PROGRESS, YOUR CHOICE</span><h3>Save my progress</h3><p>Keep using EZPZ without an account, or sign in with Google.</p>'+(user?'<p>Signed in as <strong>'+esc(user.email||'Google account')+'</strong></p><p>Signing in does not upload or replace your records.</p>'+action('review','Check cloud backup')+(config?.backupEnabled?'<div class="account-actions">'+action('save','Save device progress to cloud')+action('restore','Restore cloud progress')+'</div>':'<p>Cloud Save and Restore are being checked before activation. Keep a downloaded backup for now.</p>')+action('signout','Sign out — keep device records')+'<p class="note">Keeping records leaves them readable on this device. Use Delete records from this device below when using a shared device.</p>':action('signin','Continue with Google'))+'<p role="status" aria-live="polite">'+esc(message)+'</p><details><summary>Account & privacy</summary><p>Google supplies your account identity and email. Supabase holds your sign-in session and, only after an explicit Save, your fitness backup. No wearable access is granted. Fitness backups can include measurements, food, sleep, steps, workout records and photos.</p><p>This is a private login test. Cloud backup remains unavailable until isolation checks pass. To request deletion of your test account, contact reimerskasper@gmail.com. Device deletion below does not delete a cloud account.</p></details>';
}
function status(text){message=text;panel();}
async function verified(){const {data,error}=await client.auth.getUser();if(error||!data?.user)throw Error('Your session has expired. Sign in again.');if(user&&data.user.id!==user.id)throw Error('Account changed. Reload before continuing.');user=data.user;assertOwner(app.snapshot(),user.id);return user;}
async function readRemote(){const u=await verified();const {data,error}=await client.from('fitness_backups').select('revision,updated_at,payload').eq('user_id',u.id).maybeSingle();if(error)throw Error('Cloud backup could not be read. Your device records are unchanged.');if(data){validBackup(data.payload);if(!Number.isSafeInteger(data.revision)||data.revision<1)throw Error('Invalid cloud revision.');}remote=data;return data;}
function summary(data){return data.logs.length+' workout records · '+data.weights.length+' weight records';}
async function run(name){
 if(busy)return;busy=true;panel();
 try{
  if(!config?.enabled||!client)throw Error('Sign-in needs internet. Please try again when connected.');
  if(name==='signin'){
   if(app.hasActiveWorkout()&&!confirm('Your workout is saved on this device. Leave it briefly to sign in with Google?'))return;
   // Confirm browser storage works before leaving for PKCE. Never touch fitness records here.
   const probe='ezpz-fitness-auth-probe';localStorage.setItem(probe,'1');localStorage.removeItem(probe);
   const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:RETURN_URL,scopes:'openid email profile',queryParams:{prompt:'select_account'}}});if(error)throw error;
  }else if(name==='signout'){
   if(!confirm('Sign out and KEEP your records on this device? They will remain readable here. Their account ownership is retained so another account cannot upload them.'))return;
   const {error}=await client.auth.signOut({scope:'local'});if(error)throw Error('Could not sign out. Try again online.');user=null;remote=null;status('Signed out. Device records were kept.');
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
     const {data,error}=await client.rpc('save_fitness_backup',{p_payload:payload,p_expected_revision:d?.revision||0});
     if(error){if(error.code==='40001')throw Error('Another device saved first. Check the cloud backup and review again.');throw Error('Cloud save was not confirmed. Check cloud backup before retrying.');}
     const revision=data?.[0]?.revision;if(!Number.isSafeInteger(revision))throw Error('Could not confirm the saved revision. Check cloud backup before retrying.');
     // Record ownership even if another local edit occurred during the network request; never replace edits.
     const now=app.snapshot();assertOwner(now,u.id);app.replace(attached(now,u.id,revision));status('Cloud backup saved. Later edits stay on this device until you Save again.');
    }else{
     if(!d)throw Error('There is no cloud backup to restore.');
     app.download(before,'ezpz-before-cloud-restore.json');if(!confirm('Restore '+summary(d.payload)+' from '+u.email+'? This REPLACES device records. A safety download was requested. Check that it downloaded before continuing.'))return;
     await verified();if(JSON.stringify(app.snapshot())!==fingerprint||!app.diskMatches())throw Error('Device records changed while reviewing. Try again.');
     const clean=payloadFor(d.payload,u.id);app.replace(attached(clean,u.id,d.revision));status('Cloud backup restored to this device.');
    }
   });
  }
 }catch(e){status(e.message||'Account action failed. Device records are unchanged.');}finally{busy=false;panel();}
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-account]');if(b){e.preventDefault();run(b.dataset.account);}});
new MutationObserver(()=>{const p=document.getElementById('fitness-account-panel');if(p&&!p.children.length)panel();}).observe(document.getElementById('screen'),{childList:true});
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
  client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'){user=null;remote=null;}else if(session?.user){user=session.user;}panel();});
 }catch(e){status(e.message||'Sign-in is unavailable. You can keep using EZPZ offline.');}finally{panel();}
}
init();
})(typeof window!=='undefined'?window:globalThis);
