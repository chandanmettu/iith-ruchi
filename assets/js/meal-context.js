/* Mess timings supplied by Chandan on 2026-09-22. All times are Asia/Kolkata. */
window.RuchiMealContext = (() => {
  const schedule = {
    Breakfast: {start:450,end:600,time:'7:30–10:00 am',short:'7:30–10:00',lead:'Still waking up?',accent:'Break the fast.'},
    Lunch: {start:750,end:885,time:'12:30–2:45 pm',short:'12:30–2:45',lead:'Lunch is calling.',accent:'Dig in.'},
    Snacks: {start:1020,end:1080,time:'5:00–6:00 pm',short:'5:00–6:00',lead:'Study break?',accent:'Snack break.'},
    Dinner: {start:1170,end:1290,time:'7:30–9:30 pm',short:'7:30–9:30',lead:'Long day?',accent:'Let’s eat.'}
  };
  function campusParts(now=new Date()) {
    return Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
  }
  function campusDate(now=new Date()) {const p=campusParts(now);return new Date(p.year,p.month-1,p.day,12);}
  function hoursFor(meal,date=campusDate()) {
    const base=schedule[meal];
    return meal==='Breakfast'&&[0,6].includes(date.getDay())
      ? {...base,end:630,time:'7:30–10:30 am',short:'7:30–10:30'} : base;
  }
  function updateTimes(date) {
    Object.keys(schedule).forEach(meal=>{
      const label=document.getElementById(meal.toLowerCase()+'-time');
      if(label){const hours=hoursFor(meal,date);label.textContent=hours.short;label.title=hours.time;label.setAttribute('aria-label',hours.time);}
    });
  }
  function mealAt(minutes,date=campusDate()) {
    // Between meals show the next service; after dinner retain today's dinner.
    return Object.keys(schedule).find(name=>minutes<hoursFor(name,date).end)||'Dinner';
  }
  function currentMeal(now=new Date()) {const p=campusParts(now);return mealAt(p.hour*60+p.minute,campusDate(now));}
  function heading(meal) {return schedule[meal];}
  function serviceState(meal,date,now=new Date(),hours=hoursFor(meal,date)) {
    const p=campusParts(now),selected=Date.UTC(date.getFullYear(),date.getMonth(),date.getDate());
    const current=Date.UTC(p.year,p.month-1,p.day);
    const closeHour=Math.floor(hours.end/60),closeMinute=hours.end%60;
    const closeText=`${closeHour%12||12}:${String(closeMinute).padStart(2,'0')} ${closeHour>=12?'pm':'am'}`;
    if(selected>current)return {label:'Closes at',value:closeText,state:'future'};
    const open=selected+(hours.start-330)*60000,close=selected+(hours.end-330)*60000;
    if(now.getTime()>=close)return {label:'Service ended',value:'Closed',state:'closed'};
    const serving=now.getTime()>=open,target=serving?close:open;
    const seconds=Math.max(0,Math.ceil((target-now.getTime())/1000));
    const value=seconds>=3600?`${Math.floor(seconds/3600)}h ${String(Math.floor(seconds%3600/60)).padStart(2,'0')}m`:`${Math.floor(seconds/60)}m ${String(seconds%60).padStart(2,'0')}s`;
    return {label:serving?'Closes in':'Opens in',value,seconds,closeText,state:serving?'serving':'upcoming',urgent:serving&&seconds<=900};
  }
  return {schedule,hoursFor,updateTimes,campusDate,mealAt,currentMeal,heading,serviceState};
})();

// The countdown follows the selected meal/date and the mess service schedule.
(() => {
  const host=document.getElementById('service-countdown');
  if(!host)return;
  let timer,meal,date;
  function update() {
    clearTimeout(timer);
    if(document.hidden||!meal)return;
    const now=new Date(),state=window.RuchiMealContext.serviceState(meal,date,now);
    document.getElementById('countdown-label').textContent=state.label;
    const display=document.getElementById('countdown-value');
    if(display.dataset.value!==state.value){
      display.dataset.value=state.value;
      display.replaceChildren();
      if(Number.isFinite(state.seconds)){
        const hours=state.seconds>=3600;
        const values=hours?[Math.floor(state.seconds/3600),Math.floor(state.seconds%3600/60)]:[Math.floor(state.seconds/60),state.seconds%60];
        values.forEach((value,index)=>{
          if(index){const separator=document.createElement('span');separator.className='countdown-separator';separator.textContent=':';display.append(separator);}
          const unit=document.createElement('span');unit.className='countdown-unit';
          const number=document.createElement('b');number.textContent=String(value).padStart(2,'0');
          const label=document.createElement('small');label.textContent=(hours?['hr','min']:['min','sec'])[index];
          unit.append(number,label);display.append(unit);
        });
      }else{const value=document.createElement('span');value.className='countdown-static';value.textContent=state.value;display.append(value);}
    }
    host.dataset.state=state.state;
    host.classList.toggle('closing-soon',!!state.urgent);
    host.setAttribute('aria-label',`${meal}: ${state.label.toLowerCase()} ${state.value}. India Standard Time.`);
    if(state.state==='serving'||state.state==='upcoming')timer=setTimeout(update,1000-now.getMilliseconds());
    else timer=setTimeout(update,60000-now.getSeconds()*1000-now.getMilliseconds());
  }
  window.RuchiMealContext.updateCountdown=(selectedMeal,selectedDate)=>{meal=selectedMeal;date=selectedDate;update();};
  document.addEventListener('visibilitychange',update);
  window.addEventListener('pageshow',update);
  window.addEventListener('pagehide',()=>clearTimeout(timer));
})();
