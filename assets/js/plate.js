/* My Plate: local portions and explicitly entered nutrition, never invented totals. */
(() => {
  'use strict';
  const fields=['kcal','protein','carbs','fat'];
  const titles=['Calories','Protein','Carbs','Fat'];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=n=>Number(n.toFixed(1)).toLocaleString('en-IN');
  const $=id=>document.getElementById(id);
  function totals(rows){
    return fields.map(field=>{
      let value=0,known=0;
      for(const [,row] of rows){const n=row.nutrition?.[field];if(typeof n==='number'&&Number.isFinite(n)&&n>=0){value+=n*row.quantity;known++;}}
      return {value,known,total:rows.length};
    });
  }
  function fillNutrition(n){
    fields.forEach(field=>{const el=$('plate-'+field);if(el)el.value=typeof n?.[field]==='number'?n[field]:'';});
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
  function render(rows,artwork){
    const nutrients=totals(rows),portions=rows.reduce((n,[,r])=>n+r.quantity,0);
    $('log-summary').innerHTML=`<div class="plate-day-summary"><span>${rows.length} ${rows.length===1?'dish':'dishes'}</span><span>${fmt(portions)} ${portions===1?'portion':'portions'}</span><span>Across your day</span></div><div class="plate-macros">${nutrients.map((n,i)=>`<div class="plate-macro"><span>${titles[i]}</span><strong>${n.known?fmt(n.value):rows.length?'—':'0'}<small>${i?'g':'kcal'}</small></strong><small>${!rows.length?'Your day starts here':n.known===n.total?'Entered values':n.known?`${n.known}/${n.total} dishes counted`:'Not available yet'}</small></div>`).join('')}</div>${rows.length?'<p class="plate-data-note">Nutrition uses values you enter per portion. Missing values are not counted; totals may be incomplete. Mess recipes and serving weights are not verified.</p>':''}`;
    const groups=['Breakfast','Lunch','Snacks','Dinner'];
    $('log-items').innerHTML=rows.length?groups.map(meal=>{
      const entries=rows.map(([key,r],i)=>({key,r,i})).filter(x=>x.r.meal===meal);
      if(!entries.length)return '';
      return `<section class="plate-meal"><h3>${meal}<span>${entries.length} ${entries.length===1?'dish':'dishes'}</span></h3>${entries.map(({r,i})=>`<article class="plate-row"><img src="${esc(artwork(r.option?{...r.item,id:r.option.id,name:r.option.name}:r.item))}" alt="" width="52" height="52"><div class="plate-row-copy"><h4>${esc(r.name)}</h4><button class="plate-edit" data-edit="${i}" aria-label="Edit ${esc(r.name)} in food log">Portion & nutrition ↗</button></div><div class="plate-row-actions"><div class="plate-stepper"><button data-plate-adjust="${i}" data-step="-0.5" aria-label="Decrease ${esc(r.name)} portions" ${r.quantity<=.5?'disabled':''}>−</button><span aria-label="${fmt(r.quantity)} portions">${fmt(r.quantity)}</span><button data-plate-adjust="${i}" data-step="0.5" aria-label="Increase ${esc(r.name)} portions">+</button></div><button class="plate-remove" data-plate-remove="${i}" aria-label="Remove ${esc(r.name)} from plate">Remove</button></div></article>`).join('')}</section>`;
    }).join(''):`<div class="plate-empty"><svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="32"/><circle cx="40" cy="40" r="23"/><path d="M31 40h18m-9-9v18"/></svg><h3>A good day starts with a plate.</h3><p>Add the dishes you eat. Breakfast to dinner,<br>they all come together here.</p><button class="primary-button" data-start-plate>Build my plate <span aria-hidden="true">→</span></button></div>`;
    $('reset-day').hidden=!rows.length;
  }
  window.RuchiPlate={totals,fillNutrition,readNutrition,render};
})();
