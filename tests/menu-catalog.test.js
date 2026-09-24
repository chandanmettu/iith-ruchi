/* Run with: node --test tests/menu-catalog.test.js */
const test=require('node:test'),assert=require('node:assert/strict');
const menu=require('../assets/data/menu-september-2026.json');
const extras=require('../assets/data/extras-september-2026.json');
const {forMeal}=require('../assets/js/menu-catalog.js');
const date=day=>new Date(2026,8,20+day,12); // Sunday through Saturday
const pick=(day,meal,week=3)=>forMeal(menu,extras,date(day),meal,week);
const price=(day,meal,id)=>pick(day,meal).paid.find(f=>f.id===id)?.price;
test('all 28 menus resolve without duplicate IDs or fabricated nutrition',()=>{
 for(let day=0;day<7;day++)for(const meal of ['Breakfast','Lunch','Snacks','Dinner'])for(let week=1;week<=4;week++){
  const {weekly,common,paid}=pick(day,meal,week),all=[...weekly,...common,...paid];
  assert.equal(new Set(all.map(f=>f.id)).size,all.length);
  for(const f of all)assert.equal(f.nutrition,null);
  for(const f of paid){assert.ok(Number.isInteger(f.price)&&f.price>0);assert.ok(f.extra);assert.ok(f.id.startsWith('extra-'));assert.equal(f.currency,'INR');}
 }
});
test('every breakfast has its own paid egg, banana and one-egg omelette',()=>{
 for(let day=0;day<7;day++){
  assert.deepEqual(pick(day,'Breakfast').paid.map(f=>f.price),[9,6,10]);
  assert.ok(pick(day,'Breakfast').weekly.some(f=>f.id==='egg-or-banana'));
 }
 assert.equal(price(4,'Lunch','extra-omelette'),20);
});
test('day-specific price differences remain intact',()=>{
 assert.equal(price(1,'Lunch','extra-pepper-chicken'),55);
 assert.equal(price(5,'Lunch','extra-pepper-chicken'),45);
 assert.equal(price(3,'Dinner','extra-paneer-biryani'),85);
 assert.equal(price(5,'Dinner','extra-paneer-dum-biryani'),90);
 assert.equal(price(1,'Dinner','extra-fish-gravy'),60);
});
test('crossed-out Tuesday egg bonda moves to handwritten Wednesday',()=>{
 assert.equal(price(2,'Snacks','extra-egg-bonda'),undefined);
 assert.equal(price(3,'Snacks','extra-egg-bonda'),15);
});
test('Sunday dinner nil and Saturday rotation are not presented as daily stock',()=>{
 assert.equal(pick(0,'Dinner').paid.length,0);
 const saturday=pick(6,'Snacks');assert.equal(saturday.scheduled.length,0);assert.equal(saturday.rotating.length,8);
});
test('breakfast chutneys corrected; source fruit conflict still withheld',()=>{
 for(const id of ['peanut-chutney','tomato-chutney'])assert.ok(pick(2,'Breakfast').weekly.some(f=>f.id===id));
 assert.ok(pick(3,'Breakfast').weekly.some(f=>f.id==='peanut-chutney'));
 for(let week=1;week<=4;week++)assert.ok(!pick(3,'Lunch',week).weekly.some(f=>f.issue==='wed-fruit'));
 assert.ok(pick(1,'Breakfast',1).weekly.some(f=>f.id==='fried-idli'));
 assert.ok(!pick(1,'Breakfast',1).weekly.some(f=>f.id==='ragi-idli'));
});
test('regular menu remains usable if extras request fails',()=>{
 const r=forMeal(menu,null,date(4),'Lunch',4);assert.ok(r.weekly.length>0);assert.deepEqual(r.paid,[]);
});
