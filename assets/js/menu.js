(() => {
  'use strict';
  const $=id=>document.getElementById(id), days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const icons=new Set(['soup','coffee','sandwich','apple','wheat','leaf','egg','drumstick','milk','cooking-pot','cookie','glass-water','salad']);
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const shift=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n,12);
  const fmt=n=>Number(n.toFixed(1)).toLocaleString('en-IN');
  const valid=n=>Number.isFinite(n)&&n>=.5&&Number.isSafeInteger(n*2);
  const today=()=>window.RuchiMealContext?.campusDate()||new Date();
  const flagship=document.body.hasAttribute('data-photo-menu');
  const measureEnabled=document.body.dataset.measureEnabled!=='false';
  let data=null,date=today(),meal=window.RuchiMealContext?.currentMeal()||'Breakfast',rotation=null,view='cards',measure=false,log={},visible=[],active=null,option=null,portion=1,editKey=null,toastTimer;
  let query='',filter='all',favorites=[],notices=[],extras=null,menuKind='regular';
  try{const stored=JSON.parse(localStorage.getItem('ruchi.saved-dishes.v1')||'[]');favorites=Array.isArray(stored)?stored.filter(x=>typeof x==='string'):[];}catch{}
  const viewKey=document.body.dataset.viewKey||'ruchi.menu.view';
  view=document.body.dataset.defaultView||(new URLSearchParams(location.search).get('skin')==='porcelain'?'list':'cards');
  try{view=localStorage.getItem(viewKey)||view;}catch{}
  const tracking=()=>measure&&iso(date)===iso(today());
  const intakePrefix=document.body.dataset.intakeKey||'ruchi.menu-intake.v2.';
  const storageKey=()=>`${intakePrefix}${iso(date)}`;
  const icon=f=>`assets/icons/${icons.has(f.icon)?f.icon:'cooking-pot'}.svg`;
  const photo=f=>document.body.hasAttribute('data-photo-menu')&&window.RuchiPhotos?.forDish(f);
  const artwork=f=>photo(f)||icon(f);
  const photoClass=f=>flagship&&window.RuchiPhotos?.isPackshot(f)?' is-packshot':'';
  function photoMarkup(f){
    const choices=flagship&&window.RuchiPhotos?.choices(f);
    const image=src=>`<img src="${escape(src)}" alt="" width="420" height="420" loading="lazy" decoding="async">`;
    return choices?`<span class="food-photo-pair">${choices.map(image).join('')}</span>`:image(artwork(f));
  }
  function matches(f){return (!query||`${f.name} ${f.category}`.toLowerCase().includes(query))&&(filter!=='saved'||favorites.includes(f.id));}
  const filterItems=items=>items.map(f=>window.RuchiCatalog.forDiet(f,filter)).filter(Boolean).filter(matches);
  function loadLog(){try{const x=JSON.parse(localStorage.getItem(storageKey())||'{}');log=Object.fromEntries(Object.entries(x).filter(([,r])=>r&&valid(r.quantity)&&r.item&&typeof r.name==='string'&&typeof r.meal==='string'));}catch{log={};}}
  function saveLog(){try{localStorage.setItem(storageKey(),JSON.stringify(log));return true;}catch{toast('Browser storage unavailable. Changes are kept for this visit only.');return false;}}
  function toast(s){clearTimeout(toastTimer);$('toast').textContent=s;$('toast').classList.add('visible');toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2800);}
  function renderDate(){const start=today();$('weekday').textContent=flagship?days[date.getDay()].slice(0,3)+',':days[date.getDay()];$('date-label').textContent=flagship?date.getDate():date.toLocaleDateString('en-IN',{day:'numeric',month:'long'});if(flagship)document.querySelector('.final-date > summary').setAttribute('aria-label',date.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})+', choose date');$('date-label').dateTime=iso(date);const end=shift(start,6);$('week-range').textContent=`${start.toLocaleDateString('en-IN',{day:'numeric',month:'short'})} – ${end.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}`;
    $('day-strip').innerHTML=Array.from({length:7},(_,i)=>{const d=shift(start,i),on=iso(d)===iso(date);return `<button class="day-button ${on?'active':''} ${iso(d)===iso(today())?'is-today':''}" data-date="${iso(d)}" aria-pressed="${on}" aria-label="${escape(d.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}))}"><span>${days[d.getDay()].slice(0,3)}</span><strong>${d.getDate()}</strong></button>`;}).join('');
  }
  function allowed(f){return f.issue!=='wed-fruit'&&(!f.weeks||(rotation!==null&&f.weeks.includes(rotation))); }
  function status(f){
    const diets=[...new Set((f.options?.length?f.options.map(o=>o.diet):[f.diet||'vegetarian']).map(d=>d==='egg'||d==='nonvegetarian'?'nonvegetarian':d==='vegetarian'?'vegetarian':'choice'))];
    const label=diets.length>1?'Vegetarian and egg or non-vegetarian alternatives':diets[0]==='nonvegetarian'?'Contains egg or non-vegetarian food':diets[0]==='vegetarian'?'Vegetarian':'See dietary options';
    return `<span class="diet-marks" role="img" aria-label="${label}">${diets.map(d=>`<span class="veg-dot ${d}" aria-hidden="true"></span>`).join('')}</span>`;
  }

  function itemQuantity(f){return Object.values(log).filter(r=>r.item.id===f.id&&r.meal===meal).reduce((n,r)=>n+r.quantity,0);}
  function card(f,featured=false){const idx=visible.push(f)-1,q=itemQuantity(f);return `<article class="food-card ${f.extra?'extra-card':''} ${featured?'featured-card':''} ${photo(f)?'has-photo':'icon-card'}" data-category="${escape(f.category)}"><button class="food-open" data-item="${idx}" aria-label="View ${escape(f.name)} details"><span class="food-photo${photoClass(f)}">${photoMarkup(f)}</span><span class="food-info">${featured?`<span class="feature-kicker">${escape(meal)} highlight</span>`:''}<span class="food-title">${escape(f.name)}${status(f)}</span><span class="food-meta">${f.options?.length>1?'<span class="choice-label">Choice of options</span>':''}${f.issue&&!flagship?'<span class="rotation-note">To confirm</span>':''}</span>${f.extra?`<span class="extra-price">₹${fmt(f.price)}</span>${f.sourceQuantity?`<span class="extra-portion">${escape(f.sourceQuantity)}</span>`:''}${f.availability==='rotating'?'<span class="extra-rotation">Rotating · check counter</span>':''}`:''}${tracking()&&!f.extra&&f.sourceQuantity?`<span class="food-source-quantity">Menu reference: ${escape(f.sourceQuantity)}</span>`:''}</span></button>${flagship?`<button class="save-dish" data-favorite="${escape(f.id)}" aria-label="${favorites.includes(f.id)?'Unsave':'Save'} ${escape(f.name)}" aria-pressed="${favorites.includes(f.id)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg></button>`:''}${tracking()?`<div class="card-measure"><p>${q?`${fmt(q)} on your plate`:'Add what you ate'}</p><button class="add-button ${q?'added':''}" data-item="${idx}" aria-label="Add ${escape(f.name)} to plate">${q?'Edit':flagship?'+ Add':'+'}</button></div>`:''}</article>`;}
  function renderMenu(reason='menu'){if(!data)return;$('menu-sections').dataset.transition=reason;rotation=window.RuchiRotation.weekFor(date,data.rotationRule);visible=[];
    const selection=window.RuchiCatalog.forMeal(data,extras,date,meal,rotation);
    const {weekly,common,paid,scheduled,rotating}=selection;
    const saved=filter==='saved';
    const isExtras=menuKind==='extras'&&!saved;
    $('menu-title').textContent=saved?'Saved dishes':isExtras?'Extras':meal;
    $('schedule-note').hidden=!data.days[days[date.getDay()]][meal].some(f=>f.issue==='wed-fruit');
    const all=saved?[...weekly,...common,...paid]:isExtras?paid:[...weekly,...common],filtered=filterItems(all);
    let groups=(saved?[['Regular menu',filterItems([...weekly,...common])],['Paid extras',filterItems(scheduled)],['Rotating Saturday extras',filterItems(rotating)]]:isExtras?[['At the extras counter',filterItems(scheduled)],['Rotating Saturday extras',filterItems(rotating)]]:[['On the menu',filterItems(weekly)],['Every day',filterItems(common)]]).filter(([,a])=>a.length);
    if($('menu-kind')){
      document.querySelectorAll('[data-menu-kind]').forEach(b=>b.setAttribute('aria-pressed',!saved&&b.dataset.menuKind===menuKind));
      $('extras-count').textContent=extras?paid.length:'—';
      $('extras-count').title=rotating.length?'Rotating choices, not all served together':'Listed extras for this meal';
    }
    if(flagship){
      $('menu-count').textContent=isExtras?`${meal} · ${filtered.length} ${rotating.length?'choices':'items'}`:`${filtered.length} ${filtered.length===1?'dish':'dishes'}`;
      $('search-empty').hidden=!!filtered.length;
      $('search-empty').textContent=saved?`No saved dishes for ${meal.toLowerCase()} yet. Choose All dishes to browse this meal.`:isExtras&&!extras?'Extras are temporarily unavailable. Please reload.':isExtras&&!paid.length?'No paid extras are listed for this meal. The regular menu is still available.':`No ${filter==='egg'?'egg or non-veg':filter==='veg'?'vegetarian':''} dishes listed for ${meal.toLowerCase()}. Try All dishes or Extras.`;
      $('search-empty').classList.toggle('extras-empty',isExtras);
      document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.filter===filter));
      document.dispatchEvent(new CustomEvent('ruchi:filterchange',{detail:{filter}}));
      document.querySelectorAll('[data-dock]').forEach(b=>{if(b.dataset.dock===(filter==='saved'?'saved':'menu'))b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
      const copy=window.RuchiMealContext.heading(meal,date);
      window.RuchiMealContext.updateTimes(date);
      window.RuchiMealContext.updateCountdown(meal,date);
      $('meal-greeting-lead').textContent=copy.lead;
      $('meal-greeting-accent').textContent=copy.accent;
      if(meal==='Breakfast'){$('meal-greeting-accent').replaceChildren(document.createTextNode('Break the '));const word=document.createElement('em');word.textContent='fast.';$('meal-greeting-accent').append(word);}
      if($('breakfast-meaning'))$('breakfast-meaning').hidden=meal!=='Breakfast';
      const notice=notices.find(n=>n.kind==='special'&&n.date===iso(date)&&(!n.meal||n.meal===meal));
      $('dining-notice').hidden=!notice;
      if(notice){$('notice-kicker').textContent='Special on the menu';$('notice-title').textContent=notice.title;$('notice-body').textContent=notice.message;}
    }$('menu-sections').innerHTML=groups.map(([label,items])=>`<section aria-label="${label}"><h3 class="group-heading">${label}</h3>${label==='Rotating Saturday extras'?'<p class="extras-group-note">One rotating selection, not all dishes together. Ask at the counter before planning your meal.</p>':''}<div class="food-grid">${items.map(f=>card(f)).join('')}</div></section>`).join('');
    document.querySelectorAll('[data-meal]').forEach(b=>{const on=b.dataset.meal===meal;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on);});document.dispatchEvent(new CustomEvent('ruchi:menurender'));renderTotals();}
  function renderTotals(){
    const rows=Object.values(log),n=rows.reduce((sum,r)=>sum+r.quantity,0);
    $('total-foods').textContent=rows.length?`${rows.length} dishes · ${fmt(n)} portions`:'Your plate is ready';
    $('nutrition-status').textContent='Tap to review your day';
    if($('plate-count')){
      let todayLog=log;
      if(iso(date)!==iso(today())){try{todayLog=JSON.parse(localStorage.getItem(`${intakePrefix}${iso(today())}`)||'{}');}catch{todayLog={};}}
      const count=Object.values(todayLog).filter(r=>r&&valid(r.quantity)).length;
      $('plate-count').textContent=count;
      $('plate-count').hidden=!count;
      $('plate-dock').setAttribute('aria-label',`My Plate, ${count} ${count===1?'dish':'dishes'} today`);
    }
    if($('measure-hint'))$('measure-hint').textContent=iso(date)===iso(today())?'Add what you ate. Your plate brings the whole day together.':'You’re browsing ahead. Return to today to add food to your plate.';
  }
  function setView(value){view=value==='list'?'list':'cards';document.body.classList.toggle('view-list',view==='list');document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===view));try{localStorage.setItem(viewKey,view);}catch{}if(data&&flagship)renderMenu('layout');}
  function selectDate(d){const start=iso(today()),end=iso(shift(today(),6));date=iso(d)<start||iso(d)>end?today():d;loadLog();renderDate();renderMenu();if($('log-dialog').open)renderLog();}
  function renderOptions(){const host=$('food-options');if(!active.item.options){host.innerHTML='';return;}host.innerHTML=tracking()?'<p class="option-intro">Choose the option you ate.</p>'+active.item.options.map((o,i)=>`<button data-option="${i}" aria-pressed="${option?.id===o.id}">${escape(o.name)}</button>`).join(''):`<p>Listed alternatives: ${active.item.options.map(o=>escape(o.name)).join(' / ')}</p>`;}
  const recordKey=()=>`${active.meal}:${active.item.id}:${option?.id||'plain'}`;
  function renderPortion(){const good=valid(portion);$('portion-value').value=Number.isFinite(portion)?portion:'';$('portion-error').hidden=good;$('portion-minus').disabled=good&&portion<=.5;$('save-portion').disabled=!good||!!(active.item.options&&!option);$('save-portion').textContent=editKey||log[recordKey()]?'Update plate':'Add to My Plate';$('remove-food').hidden=!(editKey||log[recordKey()]);document.querySelectorAll('[data-portion]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.portion)===portion));}
  function openItem(f,entry=null){active={item:f,meal:entry?.meal||meal,date:iso(date)};editKey=entry?.key||null;option=entry?.option||(f.options?.length===1?f.options[0]:null);if(!entry&&option&&log[recordKey()])editKey=recordKey();if(!entry&&!f.options){editKey=Object.keys(log).find(k=>log[k].item.id===f.id&&log[k].meal===meal)||null;}portion=entry?.quantity||(editKey?log[editKey].quantity:1);$('food-category').textContent=`${active.meal} · ${f.category}`;$('food-title').textContent=f.name;if($('extra-detail-price')){$('extra-detail-price').hidden=!f.extra;$('extra-detail-price').innerHTML=f.extra?`₹${fmt(f.price)} <small>Paid extra · at the counter</small>`:'';}$('detail-placeholder').classList.toggle('has-photo',!!photo(f));$('detail-placeholder').classList.toggle('is-packshot',!!(flagship&&window.RuchiPhotos?.isPackshot(f)));$('detail-placeholder').innerHTML=photoMarkup(f);$('food-description').textContent=(f.availability==='rotating'?'Part of the rotating Saturday chaat list. Check at the counter for this week’s selection. ': '')+(f.note||`${f.name} is listed on the ${days[date.getDay()]} ${active.meal.toLowerCase()} menu.`);$('serving-note').textContent=f.extra?(f.sourceQuantity?`Listed portion: ${f.sourceQuantity}. Price is for this portion.`:'Portion size is not specified on the extras board.'):f.sourceQuantity?`Menu reference: ${f.sourceQuantity}. This is not an enforced limit.`:'The menu does not specify a portion weight for this item.';$('food-warning').hidden=!f.issue;if(f.issue)$('food-warning').textContent=data.issues.find(x=>x.id===f.issue)?.detail||'Source detail needs confirmation.';$('portion-section').hidden=!tracking();renderOptions();renderPortion();if(window.RuchiPlate)window.RuchiPlate.fillNutrition(entry?.nutrition||log[editKey]?.nutrition||null);$('food-dialog').showModal();$('food-dialog').scrollTop=0;}
  function closeDialog(d,after){if(d.classList.contains('closing'))return;const done=()=>{d.close();d.classList.remove('closing');if(after)after();else if(d.id==='food-dialog'){const idx=visible.findIndex(f=>f.id===active?.item.id);document.querySelector(`.food-open[data-item="${idx}"]`)?.focus({preventScroll:true});}else ($('plate-dock')||(measureEnabled?$('measure'):document.querySelector('[data-dock=menu]'))).focus({preventScroll:true});};if(matchMedia('(prefers-reduced-motion: reduce)').matches){done();return;}d.classList.add('closing');setTimeout(done,160);}
  function renderLog(){
    $('log-date').textContent='Today · '+date.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});
    const rows=Object.entries(log);
    if(window.RuchiPlate){window.RuchiPlate.render(rows,artwork);return;}
    $('log-items').innerHTML=rows.map(([key,r],i)=>`<div class="log-row"><div><h3>${escape(r.name)}</h3><p>${escape(r.meal)} · ${fmt(r.quantity)} portions</p></div><button data-edit="${i}">Edit</button></div>`).join('');
  }
  function setMeasure(value){measure=measureEnabled&&value;$('measure').checked=measure;document.body.classList.toggle('measuring',measure);$('intake-bar').hidden=!!$('plate-dock')||!measure;$('measure-hint').hidden=!measure;renderMenu('measure');}
  function openPlate(){selectDate(today());renderLog();$('log-dialog').showModal();$('log-dialog').scrollTop=0;}
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.menuKind){menuKind=b.dataset.menuKind;if(filter==='saved')filter='all';renderMenu('category');}
    if(b.dataset.filter){filter=b.dataset.filter;renderMenu();}
    if(b.dataset.favorite){const id=b.dataset.favorite;favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];try{localStorage.setItem('ruchi.saved-dishes.v1',JSON.stringify(favorites));}catch{toast('Saved for this visit only.');}renderMenu('favorite');document.querySelector(`[data-favorite="${id}"]`)?.focus({preventScroll:true});}
    if(b.dataset.dock){const action=b.dataset.dock;if(action==='menu'){menuKind='regular';filter='all';query='';if($('dish-search'))$('dish-search').value='';renderMenu();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}if(action==='search'&&$('dish-search')){$('dish-search').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('dish-search').focus({preventScroll:true});}if(action==='saved'){filter='saved';query='';if($('dish-search'))$('dish-search').value='';renderMenu();$('menu').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}if(action==='notes'){$('menu-info').open=true;$('menu-info').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}}
    if(b.dataset.date){const [y,m,d]=b.dataset.date.split('-').map(Number);selectDate(new Date(y,m-1,d,12));}if(b.dataset.meal){meal=b.dataset.meal;renderMenu();}if(b.dataset.view)setView(b.dataset.view);if(b.dataset.item!==undefined)openItem(visible[Number(b.dataset.item)]);if(b.hasAttribute('data-close'))closeDialog(b.closest('dialog'));if(measureEnabled&&b.hasAttribute('data-open-log')){openPlate();}if(b.dataset.option!==undefined){option=active.item.options[Number(b.dataset.option)];editKey=log[recordKey()]?recordKey():null;portion=editKey?log[editKey].quantity:1;renderOptions();renderPortion();window.RuchiPlate?.fillNutrition(log[recordKey()]?.nutrition||null);}if(b.dataset.portion){portion=Number(b.dataset.portion);renderPortion();}if(b.dataset.edit!==undefined){const [key,r]=Object.entries(log)[Number(b.dataset.edit)];setMeasure(true);closeDialog($('log-dialog'),()=>openItem(r.item,{...r,key}));}});
  $('go-today').onclick=()=>selectDate(today());$('measure').onchange=e=>setMeasure(e.target.checked);
  $('portion-minus').onclick=()=>{portion=Math.max(.5,(valid(portion)?portion:1)-.5);renderPortion();};$('portion-plus').onclick=()=>{portion=(valid(portion)?portion:0)+.5;renderPortion();};$('portion-value').oninput=()=>{portion=$('portion-value').valueAsNumber;const good=valid(portion);$('portion-error').hidden=good;$('save-portion').disabled=!good||!!(active.item.options&&!option);$('portion-minus').disabled=good&&portion<=.5;};
  $('save-portion').onclick=()=>{if(active.date!==iso(date)||iso(date)!==iso(today())){toast('The date changed. Reopen the dish for today.');return;}if(!tracking()||!valid(portion)||(active.item.options&&!option))return;const nutrition=window.RuchiPlate?.readNutrition();if(nutrition===false)return;const k=recordKey();if(editKey&&editKey!==k)delete log[editKey];log[k]={item:active.item,option,name:option?.name||active.item.name,meal:active.meal,quantity:portion,nutrition:nutrition||null};const saved=saveLog();renderMenu();closeDialog($('food-dialog'));if(saved)toast(`${option?.name||active.item.name} added to My Plate`);};
  document.addEventListener('click',e=>{
    const button=e.target.closest('button');if(!button)return;
    if(button.hasAttribute('data-start-plate')){setMeasure(true);closeDialog($('log-dialog'));}
    if(button.dataset.plateAdjust!==undefined){
      const entry=Object.entries(log)[Number(button.dataset.plateAdjust)];if(!entry)return;
      const [key,row]=entry;row.quantity=Math.max(.5,row.quantity+Number(button.dataset.step));
      if(!valid(row.quantity))return;saveLog();renderMenu();renderLog();
      document.querySelector(`[data-plate-adjust="${button.dataset.plateAdjust}"][data-step="${button.dataset.step}"]`)?.focus({preventScroll:true});
    }
    if(button.dataset.plateRemove!==undefined){
      const entry=Object.entries(log)[Number(button.dataset.plateRemove)];if(!entry)return;
      delete log[entry[0]];saveLog();renderMenu();renderLog();toast('Removed from My Plate');
    }
  });
  $('remove-food').onclick=()=>{delete log[editKey||recordKey()];const saved=saveLog();renderMenu();closeDialog($('food-dialog'));if(saved)toast('Removed from this day');};$('reset-day').onclick=()=>{log={};const saved=saveLog();renderMenu();renderLog();if(saved)toast('Your plate is cleared');};
  document.querySelectorAll('#food-dialog,#log-dialog').forEach(d=>{d.addEventListener('cancel',e=>{e.preventDefault();closeDialog(d);});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(d);}});});window.addEventListener('storage',e=>{if(e.key===storageKey()||e.key===null){loadLog();renderMenu();if($('log-dialog').open)renderLog();}});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)selectDate(date);});window.addEventListener('focus',()=>selectDate(date));
  if($('dish-search')){
    $('dish-search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();renderMenu('search');});
    document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'&&!document.querySelector('dialog[open]')){e.preventDefault();$('dish-search').focus();}});
  }
  document.addEventListener('error',e=>{const img=e.target;if(img.tagName==='IMG'&&img.closest('.food-photo,.detail-placeholder')&&!img.dataset.fallback){img.dataset.fallback='true';img.src='assets/icons/cooking-pot.svg';img.closest('.food-card,.detail-placeholder')?.classList.remove('has-photo');}},true);
  if(flagship)$('menu-info').open=false;
  if(!measureEnabled){$('measure').checked=false;$('measure').disabled=true;}
  loadLog();setView(view);renderDate();
  if($('notice-title'))fetch('assets/data/menu-notices.json?v=1').then(r=>r.ok?r.json():[]).then(rows=>{notices=Array.isArray(rows)?rows.filter(n=>n&&typeof n.title==='string'&&typeof n.message==='string'):[];if(data)renderMenu();}).catch(()=>{});
  Promise.all([fetch('assets/data/menu-september-2026.json?v=2').then(r=>{if(!r.ok)throw new Error('Menu unavailable');return r.json();}),fetch('assets/data/extras-september-2026.json?v=1').then(r=>{if(!r.ok)throw new Error('Extras unavailable');return r.json();}).catch(()=>null)]).then(([d,e])=>{data=d;extras=e;$('load-state').hidden=true;$('source-issues').innerHTML=data.issues.filter(i=>!flagship||i.id!=='timings').map(i=>`<li><strong>${escape(i.title)}.</strong> ${escape(i.detail)}</li>`).join('');renderMenu();}).catch(()=>{$('load-state').innerHTML='The menu could not be loaded. <button class="plain-button" id="retry-menu">Try again</button>';$('retry-menu').onclick=()=>location.reload();});
})();
