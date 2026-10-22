const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'www');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const name of ['fitness-app','brand','home-images','meal-images','workout-images','program-images','train-images','exercise-images','exercise-catalog.json','fitness-privacy.html'])if(fs.existsSync(path.join(root,name)))fs.cpSync(path.join(root,name),path.join(out,name),{recursive:true});
fs.copyFileSync(require.resolve('@capacitor/core/dist/capacitor.js'),path.join(out,'capacitor-runtime.js'));
let html=fs.readFileSync(path.join(root,'fitness.html'),'utf8');
html=html.replace('<head>','<head><script src="./capacitor-runtime.js"></script>');
// Package the canonical interface; never load remote pages inside a privileged bridge.
html=html.replace("if('serviceWorker' in navigator&&window.isSecureContext)","if(!window.Capacitor?.isNativePlatform()&&'serviceWorker' in navigator&&window.isSecureContext)");
// Browser OAuth returns to the website, not this app. Enable only after a native callback is tested.
html=html.replace(/<script defer src="\.\/fitness-app\/accounts.js"><\/script>/g,'');
html+='<script>document.addEventListener("DOMContentLoaded",()=>{const note=()=>{const el=document.getElementById("fitness-account-panel");if(el)el.innerHTML="<h3>Android connection test</h3><p>Google sign-in remains available in the browser app. Use your downloaded backup to restore existing progress here. This test app stores records separately on this phone.</p>"};new MutationObserver(note).observe(document.getElementById("screen"),{childList:true});});</script>';
// Avoid a self-triggering observer: the account panel is populated only by the page render.
html=html.replace('if(el)el.innerHTML=', 'if(el&&!el.dataset.nativeNote){el.dataset.nativeNote="1";el.innerHTML=').replace('separately on this phone.</p>"};','separately on this phone.</p>"}};');
fs.writeFileSync(path.join(out,'index.html'),html);fs.writeFileSync(path.join(out,'fitness.html'),html);
console.log('Packaged canonical fitness.html and local assets.');
