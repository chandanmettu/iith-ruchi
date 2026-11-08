/* My Plate: local portions with nutrition per portion. Values a student enters win;
   otherwise Ruchi's rough estimate for the dish (assets/data/nutrition-estimates.json),
   clearly labelled as an estimate, is used. The mess has supplied no nutrition data. */
(() => {
  'use strict';
  const fields=['kcal','protein','carbs','fat'];
  const titles=['Calories','Protein','Carbs','Fat'];
  const units=['kcal','g','g','g'];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=n=>Number(n.toFixed(1)).toLocaleString('en-IN');
  const whole=n=>Math.round(n).toLocaleString('en-IN');
  const $=id=>typeof document==='undefined'?null:document.getElementById(id);
  let estimates=null;
  const num=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
  function setEstimates(data){estimates=data&&data.items?data:null;}
  // Choice dishes are estimated per option; without a chosen option there is no single value.
  function estimateFor(item,option){
    if(!estimates||!item)return null;
    if(item.options?.length&&!option)return null;
    return estimates.items[option?.id||item.id]||null;
  }
  function valueFor(row,field){
    const entered=row.nutrition?.[field];
    if(num(entered))return {value:entered,source:'entered'};
    const est=estimateFor(row.item,row.option)?.[field];
    return num(est)?{value:est,source:'estimate'}:null;
  }
  function totals(rows){
    return fields.map(field=>{
      let value=0,known=0,entered=0,estimated=0;
      for(const [,row] of rows){const v=valueFor(row,field);if(!v)continue;value+=v.value*row.quantity;known++;v.source==='entered'?entered++:estimated++;}
      return {value,known,entered,estimated,total:rows.length};
    });
  }
  function caption(n,empty){
    if(empty)return 'Your day starts here';
    if(!n.known)return 'Not available yet';
    if(n.known<n.total)return `${n.known}/${n.total} dishes counted`;
    if(!n.estimated)return 'Entered values';
    return n.entered?'Estimate + your values':'Rough estimate';
  }
  function rowLine(row){
    const kcal=valueFor(row,'kcal'),protein=valueFor(row,'protein');
    if(!kcal&&!protein)return '';
    const approx=(kcal?.source==='estimate'||protein?.source==='estimate')?'≈ ':'';
    const parts=[kcal&&`${whole(kcal.value*row.quantity)} kcal`,protein&&`${whole(protein.value*row.quantity)} g protein`].filter(Boolean);
    return `<p class="plate-row-estimate">${approx}${parts.join(' · ')}</p>`;
  }
  function fillNutrition(n){
    fields.forEach(field=>{const el=$('plate-'+field);if(el)el.value=num(n?.[field])?n[field]:'';});
    if($('plate-nutrition-error'))$('plate-nutrition-error').hidden=true;
    const details=document.querySelector('.plate-nutrition-editor');if(details)details.open=!!n;
  }
  function readNutrition(){
    const values={};let invalid=false;
    for(const field of fields){const el=$('plate-'+field);if(el?.validity.badInput){invalid=true;el.focus();break;}if(!el||el.value.trim()===''){values[field]=null;continue;}const value=el.valueAsNumber;if(!Number.isFinite(value)||value<0){invalid=true;el.focus();break;}values[field]=value;}
    if($('plate-nutrition-error'))$('plate-nutrition-error').hidden=!invalid;
    if(invalid)return false;
    return fields.some(field=>values[field]!==null)?{...values,source:'user-entered'}:null;
  }
  // Dish sheet: the estimate for the portion being chosen, updated as the portion changes.
  function renderEstimate(item,option,portion){
    const serving=$('serving-note');if(!serving)return;
    let el=$('estimate-note');
    if(!el){el=document.createElement('p');el.id='estimate-note';el.className='estimate-note';serving.after(el);}
    const est=estimateFor(item,option);
    fields.forEach(field=>{const input=$('plate-'+field);if(input)input.placeholder=est?String(est[field]):'';});
    if(!estimates){el.hidden=true;return;}
    if(!est){
      const opts=(item.options||[]).map(o=>estimates.items[o.id]).filter(Boolean);
      el.hidden=!opts.length;
      if(opts.length){const k=opts.map(o=>o.kcal),lo=Math.min(...k),hi=Math.max(...k);el.innerHTML=`<strong>Rough estimate</strong> ${lo===hi?`≈ ${whole(lo)}`:`≈ ${whole(lo)}–${whole(hi)}`} kcal per portion, depending on the option.`;}
      return;
    }
    const q=num(portion)&&portion>0?portion:1;
    const amount=q===1?'1 portion':`${fmt(q)} portions`;
    el.hidden=false;
    el.innerHTML=`<strong>Rough estimate for ${esc(amount)}</strong> ≈ ${whole(est.kcal*q)} kcal · ${whole(est.protein*q)} g protein · ${whole(est.carbs*q)} g carbs · ${whole(est.fat*q)} g fat<small>1 portion = ${esc(est.portion)}. Typical Indian recipe values, not measured by the mess.</small>`;
  }
  function render(rows,artwork){
    const nutrients=totals(rows),portions=rows.reduce((n,[,r])=>n+r.quantity,0);
    const anyEstimate=nutrients.some(n=>n.estimated);
    $('log-summary').innerHTML=`<div class="plate-day-summary"><span>${rows.length} ${rows.length===1?'dish':'dishes'}</span><span>${fmt(portions)} ${portions===1?'portion':'portions'}</span><span>Across your day</span></div><div class="plate-macros">${nutrients.map((n,i)=>`<div class="plate-macro"><span>${titles[i]}</span><strong>${n.known?(n.estimated?'≈':'')+whole(n.value):rows.length?'—':'0'}<small>${units[i]}</small></strong><small>${caption(n,!rows.length)}</small></div>`).join('')}</div>${rows.length?`<p class="plate-data-note">${anyEstimate?'Rough estimates for typical Indian recipes at the portion shown for each dish, multiplied by your portions. The mess hasn’t supplied recipes, oil or serving weights, so treat these as a guide, not a measurement. ':''}Values you enter for a dish replace its estimate.</p>`:''}`;
    const groups=['Breakfast','Lunch','Snacks','Dinner'];
    $('log-items').innerHTML=rows.length?groups.map(meal=>{
      const entries=rows.map(([key,r],i)=>({key,r,i})).filter(x=>x.r.meal===meal);
      if(!entries.length)return '';
      return `<section class="plate-meal"><h3>${meal}<span>${entries.length} ${entries.length===1?'dish':'dishes'}</span></h3>${entries.map(({r,i})=>`<article class="plate-row"><img src="${esc(artwork(r.option?{...r.item,id:r.option.id,name:r.option.name}:r.item))}" alt="" width="52" height="52"><div class="plate-row-copy"><h4>${esc(r.name)}</h4>${rowLine(r)}<button class="plate-edit" data-edit="${i}" aria-label="Edit ${esc(r.name)} in food log">Portion & nutrition ↗</button></div><div class="plate-row-actions"><div class="plate-stepper"><button data-plate-adjust="${i}" data-step="-0.5" aria-label="Decrease ${esc(r.name)} portions" ${r.quantity<=.5?'disabled':''}>−</button><span aria-label="${fmt(r.quantity)} portions">${fmt(r.quantity)}</span><button data-plate-adjust="${i}" data-step="0.5" aria-label="Increase ${esc(r.name)} portions">+</button></div><button class="plate-remove" data-plate-remove="${i}" aria-label="Remove ${esc(r.name)} from plate">Remove</button></div></article>`).join('')}</section>`;
    }).join(''):`<div class="plate-empty"><svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="32"/><circle cx="40" cy="40" r="23"/><path d="M31 40h18m-9-9v18"/></svg><h3>A good day starts with a plate.</h3><p>Add the dishes you eat. Breakfast to dinner,<br>they all come together here.</p><button class="primary-button" data-start-plate>Build my plate <span aria-hidden="true">→</span></button></div>`;
    $('reset-day').hidden=!rows.length;
  }
  const api={totals,fillNutrition,readNutrition,render,setEstimates,estimateFor,renderEstimate};
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(typeof window!=='undefined')window.RuchiPlate=api;
})();
