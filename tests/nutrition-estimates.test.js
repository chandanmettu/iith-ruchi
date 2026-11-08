/* Run with: node --test tests/nutrition-estimates.test.js */
const test=require('node:test'),assert=require('node:assert/strict');
const menu=require('../assets/data/menu-november-2026.json');
const extras=require('../assets/data/extras-september-2026.json');
const est=require('../assets/data/nutrition-estimates.json');
const plate=require('../assets/js/plate.js');

function eatable(){
  const ids=new Set();
  const walk=src=>Object.values(src).forEach(items=>items.forEach(it=>{
    if(it.options?.length)it.options.forEach(o=>ids.add(o.id));else ids.add(it.id);
  }));
  walk(menu.common);Object.values(menu.days).forEach(walk);
  walk(extras.common);Object.values(extras.days).forEach(walk);
  return ids;
}

test('every dish, option and extra a student can log has an estimate',()=>{
  const missing=[...eatable()].filter(id=>!est.items[id]);
  assert.deepEqual(missing,[]);
});
test('estimates are labelled as estimates and the menu itself stays unfabricated',()=>{
  assert.equal(est.kind,'estimate');assert.match(est.basis,/not measured/);
  const walk=src=>Object.values(src).forEach(items=>items.forEach(it=>assert.equal(it.nutrition,null)));
  walk(menu.common);Object.values(menu.days).forEach(walk);
});
test('each estimate names its portion and its calories add up from its macros',()=>{
  for(const [id,e] of Object.entries(est.items)){
    assert.ok(e.portion&&typeof e.portion==='string',id);
    for(const f of ['kcal','protein','carbs','fat'])assert.ok(Number.isFinite(e[f])&&e[f]>=0,`${id} ${f}`);
    const fromMacros=4*e.protein+4*e.carbs+9*e.fat;
    assert.ok(Math.abs(fromMacros-e.kcal)<=Math.max(12,.12*e.kcal),`${id}: ${e.kcal} kcal vs ${fromMacros} from macros`);
    assert.ok(e.kcal<=1000,`${id} is implausibly large for one portion`);
  }
});
test('My Plate multiplies estimates by portions, and entered values win',()=>{
  plate.setEstimates(est);
  const roti=menu.days.Monday.Lunch.find(f=>f.id==='ghee-plain-roti');
  const biryani=menu.days.Sunday.Dinner.find(f=>f.id==='chicken-or-paneer-dum-biryani');
  const chicken=biryani.options.find(o=>o.id==='chicken-dum-biryani');
  const rows=[
    ['a',{item:roti,option:null,quantity:3,nutrition:null}],
    ['b',{item:biryani,option:chicken,quantity:1.5,nutrition:null}],
    ['c',{item:roti,option:null,quantity:2,nutrition:{kcal:100,protein:null,carbs:null,fat:null,source:'user-entered'}}],
  ];
  const [kcal,protein]=plate.totals(rows);
  const r=est.items['ghee-plain-roti'],c=est.items['chicken-dum-biryani'];
  assert.equal(kcal.value,3*r.kcal+1.5*c.kcal+2*100);
  assert.deepEqual([kcal.known,kcal.entered,kcal.estimated],[3,1,2]);
  assert.equal(protein.value,3*r.protein+1.5*c.protein+2*r.protein);
  assert.equal(plate.estimateFor(biryani,null),null,'a choice dish needs its option');
});
