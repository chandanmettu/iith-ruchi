/* Reports remain user-reviewed email drafts; no delivery or resolution is implied. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id),form=$('report-form');
  const recipient='mess_secya@gymkhana.iith.ac.in',legacyKey='ruchi.report-draft.v1';
  const fields=['date','meal','hall','category','message'],meals=['Breakfast','Lunch','Snacks','Dinner'];
  let trigger=null,prepared='',subject='',photo=null,photoUrl=null,database=null;
  let restored=false,photoVersion=0;
  const status=message=>{$('report-status').textContent=message;};
  function db(){
    if(!database)database=new Promise((resolve,reject)=>{
      const request=indexedDB.open('ruchi-report-drafts',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('drafts');
      request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
      request.onblocked=()=>reject(new Error('Draft storage is busy.'));
    }).catch(error=>{database=null;throw error;});
    return database;
  }
  async function draftStore(action,value){
    const database=await db();
    return new Promise((resolve,reject)=>{
      const tx=database.transaction('drafts',action==='get'?'readonly':'readwrite'),store=tx.objectStore('drafts');
      const request=action==='put'?store.put(value,'current'):store[action]('current');
      tx.oncomplete=()=>resolve(request.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
    });
  }
  function currentContext(){
    $('report-date').value=$('date-label').getAttribute('datetime')||'';
    $('report-meal').value=document.querySelector('[data-meal].active')?.dataset.meal||'Breakfast';
  }
  const values=()=>Object.fromEntries(fields.map(name=>[name,$('report-'+name).value.trim()]));
  function invalidate(){ $('report-review').hidden=true;$('report-copy-fallback').hidden=true;status(''); }
  function showPhoto(file){
    if(photoUrl)URL.revokeObjectURL(photoUrl);
    photo=file;photoUrl=file?URL.createObjectURL(file):null;
    $('report-photo-preview').hidden=!file;$('photo-picker').hidden=!!file;
    if(file){$('report-photo-image').src=photoUrl;$('report-photo-name').textContent=file.name||'report-photo';$('report-photo-size').textContent=`${(file.size/1024/1024).toFixed(1)} MB · attached to email download`;}
    else{$('report-photo-image').removeAttribute('src');$('report-photo').value='';}
    $('photo-error').hidden=true;
  }
  async function restoreDraft(){
    let draft;
    try{draft=await draftStore('get');}catch{}
    if(!draft){try{draft=JSON.parse(localStorage.getItem(legacyKey)||'null');}catch{}}
    if(!draft||typeof draft!=='object')return;
    fields.forEach(name=>{if(typeof draft[name]==='string')$('report-'+name).value=draft[name];});
    if(!meals.includes($('report-meal').value))$('report-meal').value='Breakfast';
    if(!['Mess A','Mess B'].includes($('report-hall').value))$('report-hall').value='';
    if(draft.photo instanceof Blob)showPhoto(draft.photo);
    $('clear-report-draft').hidden=false;status('Your saved draft is here. It has not been sent.');
  }
  function close(sheet){
    if(sheet.classList.contains('closing'))return;
    const done=()=>{sheet.close();sheet.classList.remove('closing');trigger?.focus({preventScroll:true});};
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){done();return;}
    sheet.classList.add('closing');setTimeout(done,160);
  }
  document.querySelectorAll('[data-sheet]').forEach(button=>button.addEventListener('click',async()=>{
    trigger=button;const sheet=$(button.dataset.sheet);
    if(sheet.id==='report-dialog'){
      if(!restored){currentContext();form.inert=true;sheet.showModal();sheet.scrollTop=0;await restoreDraft();restored=true;form.inert=false;return;}
      if(!$('report-message').value&&!$('report-hall').value&&!photo)currentContext();
    }
    sheet.showModal();sheet.scrollTop=0;
  }));
  document.querySelectorAll('.feature-sheet').forEach(sheet=>{
    sheet.querySelector('[data-sheet-close]').addEventListener('click',()=>close(sheet));
    sheet.addEventListener('cancel',event=>{event.preventDefault();close(sheet);});
    sheet.addEventListener('click',event=>{if(event.target!==sheet)return;const box=sheet.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)close(sheet);});
  });
  $('report-photo').addEventListener('change',async()=>{
    const file=$('report-photo').files[0],version=++photoVersion;
    if(!file)return;
    const error=message=>{$('report-photo').value='';$('photo-error').textContent=message;$('photo-error').hidden=false;};
    if(!['image/jpeg','image/png','image/webp'].includes(file.type))return error('Choose a JPG, PNG or WebP photo.');
    if(file.size>8*1024*1024)return error('Choose a photo smaller than 8 MB.');
    if(!file.size)return error('This photo is empty. Please choose another.');
    // Decode before accepting, including files with a misleading extension.
    const url=URL.createObjectURL(file),image=new Image();image.src=url;
    try{await image.decode();if(version===photoVersion){showPhoto(file);invalidate();}}
    catch{if(version===photoVersion)error('This photo couldn’t be opened. Please choose another.');}
    finally{URL.revokeObjectURL(url);}
  });
  $('remove-report-photo').addEventListener('click',()=>{photoVersion++;showPhoto(null);invalidate();$('report-photo').focus();});
  $('save-report-draft').addEventListener('click',async()=>{
    const button=$('save-report-draft');button.disabled=true;
    try{await draftStore('put',{...values(),photo});try{localStorage.removeItem(legacyKey);}catch{}$('clear-report-draft').hidden=false;status('Draft'+(photo?' and photo':'')+' saved in this browser. Nothing has been sent.');}
    catch{status('This browser couldn’t save the draft. Keep this page open to review and email your report.');}
    finally{button.disabled=false;}
  });
  $('clear-report-draft').addEventListener('click',async()=>{
    try{await draftStore('delete');localStorage.removeItem(legacyKey);}catch{status('Couldn’t clear the saved draft. Please try again.');return;}
    photoVersion++;showPhoto(null);form.reset();currentContext();$('clear-report-draft').hidden=true;invalidate();status('Draft cleared.');
  });
  form.addEventListener('input',invalidate);
  form.addEventListener('submit',event=>{
    event.preventDefault();if(!form.reportValidity())return;
    const v=values();
    if(v.message.length<10){$('report-message').setCustomValidity('Please describe the issue in at least 10 characters.');form.reportValidity();$('report-message').setCustomValidity('');return;}
    prepared=`Ruchi mess report\n\nDate: ${v.date}\nMeal: ${v.meal}\nMess: ${v.hall}\nIssue: ${v.category}\n\n${v.message}\n\nPlease acknowledge this report and share any action taken.`;
    subject='Mess report: '+v.category+' · '+v.date;
    $('report-review-text').textContent=prepared+(photo?'\n\nPhoto: '+(photo.name||'report-photo'):'');
    const linkBody=prepared+(photo?'\n\n[Please attach the selected photo before sending: '+photo.name+']':'');
    $('report-email-link').href=`mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(linkBody)}`;
    $('download-report-email').hidden=!photo;$('report-attachment-note').hidden=!photo;
    $('report-review').hidden=false;status('Ready to review. Complete sending in your email app.');
    $('report-review').scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    (photo?$('download-report-email'):$('report-email-link')).focus({preventScroll:true});
  });
  $('download-report-email').addEventListener('click',async()=>{
    if(!photo||!prepared)return;
    const button=$('download-report-email');button.disabled=true;
    try{
      const content=await window.RuchiEmailDraft.create({recipient,subject,text:prepared,attachment:photo});
      const url=URL.createObjectURL(new Blob([content],{type:'message/rfc822'})),link=document.createElement('a');
      link.href=url;link.download='ruchi-report.eml';link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
      status('Email file downloaded with your photo. Open it in your mail app and send or forward it. Nothing has been sent yet.');
    }catch{status('Couldn’t prepare the download. Use the email link and attach your photo manually.');}
    finally{button.disabled=false;}
  });
  $('copy-report').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(prepared);status('Report text copied. Paste it into an email to '+recipient+(photo?' and attach your photo.':'.'));}
    catch{$('report-copy-text').value=prepared;$('report-copy-fallback').hidden=false;$('report-copy-fallback').open=true;$('report-copy-text').focus();$('report-copy-text').select();status('Select and copy the report text below.');}
  });
})();
