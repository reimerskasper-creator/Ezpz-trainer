/* Shared phone-photo picker. Cropping is a draft until the user saves the item. */
(()=>{
 let active=null,request=0;
 function notice(box,message){const el=box?.querySelector('.personal-photo-status');if(el)el.textContent=message}
 function close(){request++;if(!active)return;const {dialog,url,opener}=active;active=null;dialog.close();dialog.remove();URL.revokeObjectURL(url);opener?.focus()}
 function refresh(box,id){const preview=box.querySelector('.personal-photo-preview');if(preview){preview.replaceChildren();const src=personalPhoto(id);if(src){const img=new Image();img.src=src;img.alt='Your chosen photo';preview.append(img)}}}
 function apply(box,id){
  if(!box.isConnected)return false;
  const kind=box.dataset.photoKind,item=box.dataset.photoItem;
  if(kind==='workout'){
   builderDraft={...captureBuilder(),photoId:id};refresh(box,id);
   const cover=box.closest('form')?.querySelector('.own-cover-preview>img'),photo=workoutCover(builderDraft);if(cover){cover.src=photo.src;cover.alt=photo.alt}return true;
  }
  if(kind==='food'){box.closest('form').elements.namedItem('photoId').value=id;refresh(box,id);return true}
  const key=kind==='saved-food'?'customFoods':'customWorkouts',before=state[key],items=kind==='saved-food'?cleanCustomFoods(before):cleanCustomWorkouts(before);
  if(!items.some(x=>x.id===item)){notice(box,'This item is no longer available.');return false}
  state[key]=items.map(x=>x.id===item?{...x,photoId:id}:x);
  if(!save()){state[key]=before;notice(box,'Photo was not saved. Your previous photo is kept.');return false}
  if(kind==='saved-food'){customFoodPage();document.querySelector('.custom-food-saved').open=true}else workoutBuilder();return true;
 }
 async function choose(input){
  const box=input.closest('.personal-photo-controls'),file=input.files?.[0];input.value='';if(!file)return;
  if(!file.type.startsWith('image/')||file.type==='image/svg+xml'||file.size>20*1024*1024){notice(box,'Choose a photo up to 20 MB (JPEG, PNG or WebP).');return}
  close();const token=++request,url=URL.createObjectURL(file),img=new Image();notice(box,'Opening your photo…');
  try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url});if(token!==request||!box.isConnected){URL.revokeObjectURL(url);return}if(img.naturalWidth*img.naturalHeight>50000000)throw Error('large');
   const dialog=document.createElement('dialog');dialog.className='personal-photo-dialog';dialog.setAttribute('aria-labelledby','personal-photo-title');
   dialog.innerHTML='<div class="personal-photo-heading"><h2 id="personal-photo-title">Make it yours</h2><button type="button" data-photo-cancel aria-label="Cancel photo">×</button></div><p>Move and zoom to fit your card.</p><canvas width="720" height="480" aria-label="Preview of your cropped photo"></canvas><label for="photo-zoom">Zoom<input id="photo-zoom" type="range" min="1" max="3" step="0.05" value="1"></label><label for="photo-x">Move left / right<input id="photo-x" type="range" min="0" max="100" value="50"></label><label for="photo-y">Move up / down<input id="photo-y" type="range" min="0" max="100" value="50"></label><p class="personal-crop-status" role="status"></p><div class="personal-photo-actions"><button type="button" data-photo-cancel>Cancel</button><button type="button" class="primary" data-photo-apply>Use photo</button></div>';
   document.body.append(dialog);active={dialog,url,opener:input};const canvas=dialog.querySelector('canvas'),ctx=canvas.getContext('2d');
   function draw(){const zoom=Number(dialog.querySelector('#photo-zoom').value),x=Number(dialog.querySelector('#photo-x').value)/100,y=Number(dialog.querySelector('#photo-y').value)/100,scale=Math.max(canvas.width/img.naturalWidth,canvas.height/img.naturalHeight)*zoom,w=canvas.width/scale,h=canvas.height/scale;ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,(img.naturalWidth-w)*x,(img.naturalHeight-h)*y,w,h,0,0,canvas.width,canvas.height)}
   draw();dialog.addEventListener('input',draw);dialog.addEventListener('cancel',e=>{e.preventDefault();close()});dialog.addEventListener('click',e=>{
    if(e.target.closest('[data-photo-cancel]')){close();return}
    if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();return}
    if(!e.target.closest('[data-photo-apply]'))return;
    let photo;for(const quality of [.76,.62,.48,.35,.22]){photo=canvas.toDataURL('image/jpeg',quality);if(photo.length<=65000)break}
    if(photo.length>65000){const small=document.createElement('canvas');small.width=480;small.height=320;small.getContext('2d').drawImage(canvas,0,0,480,320);photo=small.toDataURL('image/jpeg',.45)}
    const id='photo-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
    if(!cleanPersonalPhotos({[id]:photo})[id]){dialog.querySelector('.personal-crop-status').textContent='Could not prepare this photo. Try another image.';return}
    pendingPersonalPhotos[id]=photo;
    if(apply(box,id)){notice(box,box.dataset.photoKind.startsWith('saved-')?'Photo saved.':'Photo ready. Save your item to keep it.');close()}
    else{delete pendingPersonalPhotos[id];dialog.querySelector('.personal-crop-status').textContent='Photo was not saved. Close and try again.'}
   });dialog.showModal();notice(box,'');
  }catch{URL.revokeObjectURL(url);notice(box,'This photo could not be opened. Try a JPEG, PNG or WebP photo.');}
 }
 document.addEventListener('change',e=>{if(e.target.matches('[data-personal-photo-input]'))choose(e.target)});
 document.addEventListener('click',e=>{const button=e.target.closest('[data-remove-personal-photo]');if(button){const box=button.closest('.personal-photo-controls');if(apply(box,''))notice(box,'Default photo selected.')}});
})();
