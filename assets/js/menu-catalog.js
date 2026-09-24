/* Shared menu selection: the posted regular menu and separately priced extras. */
(function(root) {
  'use strict';
  const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  function forMeal(menu,extras,date,meal,week) {
    const day=days[date.getDay()];
    const allowed=f=>f.issue!=='wed-fruit'&&(!f.weeks||f.weeks.includes(week));
    const weekly=(menu.days[day]?.[meal]||[]).filter(allowed);
    const ids=new Set(weekly.map(f=>f.id));
    const common=(menu.common[meal]||[]).filter(f=>allowed(f)&&!ids.has(f.id));
    const paid=[...(extras?.days[day]?.[meal]||[]),...(extras?.common[meal]||[])].filter(allowed);
    return {weekly,common,paid,scheduled:paid.filter(f=>f.availability!=='rotating'),rotating:paid.filter(f=>f.availability==='rotating')};
  }
  // Keep the source ID for Saved and existing plate records, but show only
  // alternatives that belong to the selected dietary category.
  function forDiet(item,filter) {
    if(!['veg','egg'].includes(filter))return item;
    const matches=diet=>filter==='veg'?diet==='vegetarian':['egg','nonvegetarian'].includes(diet);
    if(!item.options?.length)return matches(item.diet||'vegetarian')?item:null;
    const options=item.options.filter(o=>matches(o.diet));
    if(!options.length)return null;
    return {...item,options,name:options.map(o=>o.name).join(' / '),
      diet:options.length===1?options[0].diet:'choice',
      photoId:options.length===1?options[0].id:undefined};
  }
  const api={forMeal,forDiet};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.RuchiCatalog=api;
})(typeof window==='undefined'?globalThis:window);
