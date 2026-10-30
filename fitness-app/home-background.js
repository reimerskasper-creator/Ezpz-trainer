/* Overview photo changes stay in a dialog draft until Save background. */
(()=>{
 let dialog=null,draft=null,opener=null,category=null;const temporary=new Set();
 const defaultPhoto='./home-images/zone-woodland.jpg';
 function preview(){
  if(!dialog)return;const b=cleanHomeBackground(draft),src=personalPhoto(b.photoId)||(category?progressDefaultPhoto(category):defaultPhoto),el=dialog.querySelector('.home-background-preview');
  el.style.backgroundImage='linear-gradient(105deg,#062b20d9,#062b20b8),url("'+src+'")';el.style.backgroundPosition=b.x+'% '+b.y+'%';el.style.backgroundSize=b.zoom===1?'cover':(b.zoom*100)+'% auto';
  dialog.querySelector('[data-background-crop]').hidden=!b.photoId;
 }
 function close(){if(!dialog)return;const old=dialog;dialog=null;old.close();old.remove();for(const id of temporary)delete pendingPersonalPhotos[id];temporary.clear();draft=null;opener?.focus({preventScroll:true})}
 function open(button){
  if(dialog)return;opener=button;category=button.dataset.progressBackground||null;draft=cleanHomeBackground(category?cleanProgressBackgrounds(state.progressBackgrounds)[category]:state.homeBackground);dialog=document.createElement('dialog');dialog.id='home-background-dialog';dialog.setAttribute('aria-labelledby','home-background-title');
  dialog.innerHTML='<span class="sheet-handle" aria-hidden="true"></span><div class="home-background-heading"><h2 id="home-background-title">Overview background</h2><button type="button" data-background-close aria-label="Close background settings">×</button></div><p class="home-background-help">Your photo. Your daily view.</p><div class="home-background-preview"><strong>Today’s overview</strong><span>White text stays readable</span></div><div class="personal-photo-controls" data-photo-kind="home"><label class="home-background-upload">↑ Upload photo<input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" data-personal-photo-input></label><p class="personal-photo-status" role="status"></p></div><details data-background-crop><summary>Adjust crop</summary><label>Zoom<input type="range" data-background-field="zoom" min="1" max="2" step="0.05"></label><label>Move left / right<input type="range" data-background-field="x" min="0" max="100" step="1"></label><label>Move up / down<input type="range" data-background-field="y" min="0" max="100" step="1"></label></details><p class="home-background-status" role="status"></p><div class="home-background-actions"><button type="button" data-background-default>Restore default</button><button type="button" class="primary" data-background-save>Save background</button></div>';
  if(category){dialog.querySelector('#home-background-title').textContent='Your photo';dialog.querySelector('.home-background-preview strong').textContent=progressPhotoLabel(category);dialog.querySelector('.personal-photo-controls').dataset.photoKind='progress'}
  if(category)dialog.querySelector('.home-background-help').textContent='Changes apply to this photo only.';
  document.body.append(dialog);resetSliders();preview();dialog.addEventListener('cancel',event=>{event.preventDefault();close()});
  dialog.addEventListener('input',event=>{const field=event.target.dataset.backgroundField;if(!field)return;draft[field]=Number(event.target.value);preview()});
  dialog.addEventListener('click',event=>{
   if(event.target.closest('[data-background-close]'))return close();
   if(event.target.closest('[data-background-default]')){draft=cleanHomeBackground(null);resetSliders();preview();return}
   if(!event.target.closest('[data-background-save]'))return;
   if(!(category?saveProgressBackground(category,draft):saveHomeBackground(draft))){dialog.querySelector('.home-background-status').textContent='Could not save. Your previous background is kept.';return}
   const scroll=window.scrollY,wasProgress=category;close();if(wasProgress){if(tab==='progress')progress();else render();window.scrollTo(0,scroll);document.querySelector('[data-progress-background="'+wasProgress+'"]')?.focus({preventScroll:true})}else if(tab==='home'){home();window.scrollTo(0,scroll);document.querySelector('[data-home-background]')?.focus({preventScroll:true})}
  });dialog.showModal();
 }
 function resetSliders(){dialog.querySelectorAll('[data-background-field]').forEach(input=>{input.value=draft[input.dataset.backgroundField]})}
 window.EZPZHomeBackground={select(id){if(!dialog?.isConnected)return false;if(id&&!personalPhoto(id))return false;if(pendingPersonalPhotos[id])temporary.add(id);draft=cleanHomeBackground({photoId:id});resetSliders();preview();return true}};
 window.EZPZProgressBackground={select(id){if(!category)return false;return window.EZPZHomeBackground.select(id)}};
 document.addEventListener('click',event=>{const button=event.target.closest('[data-home-background],[data-progress-background]');if(button)open(button)});
})();
