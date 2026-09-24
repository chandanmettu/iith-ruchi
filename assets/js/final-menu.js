(() => {
  'use strict';
  const picker = document.querySelector('.final-date');
  const trigger = picker.querySelector('summary');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const nav = document.querySelector('.journal-meals');
  const indicator = nav.querySelector('.meal-indicator');
  const host = document.getElementById('menu-sections');
  const dateList = document.getElementById('day-strip');
  // Finite, cancellable gestures keep the menu lively without constant motion.
  function animateMeal(button) {
    if (reduce.matches || document.hidden) return;
    const art = button.querySelector('.meal-art');
    if (!art) return;
    art.getAnimations({subtree:true}).forEach(animation => animation.cancel());
    const move = (target, frames, options = {}) => target?.animate(frames,
      {duration:850, easing:'cubic-bezier(.22,1,.36,1)', ...options});
    art.querySelectorAll('.steam path').forEach((path,index) => {
      move(path, [
        {opacity:0, transform:'translate(0, 3px) scaleX(.8)'},
        {opacity:.8, transform:'translate(0, 0) scaleX(1)', offset:.3},
        {opacity:0, transform:'translate(2px, -7px) scaleX(1.2)'}
      ], {duration:1600, delay:index*160, iterations:2});
    });
    move(art.querySelector('.vessel'), [
      {transform:'rotate(0)'}, {transform:'rotate(-5deg)',offset:.3}, {transform:'rotate(0)'}
    ]);
    move(art.querySelector('.lunch-plate'), [
      {transform:'translateX(0) rotate(0)'},
      {transform:'translateX(5px) rotate(5deg)',offset:.3},
      {transform:'translateX(-2px) rotate(-2deg)',offset:.65},
      {transform:'translateX(0) rotate(0)'}
    ]);
    move(art.querySelector('.lunch-leaf'), [
      {transform:'translateY(0)'}, {transform:'translateY(-3px)',offset:.4}, {transform:'translateY(0)'}
    ], {delay:80});
    move(art.querySelector('.snack-cookie'), [
      {transform:'rotate(0)'}, {transform:'rotate(-18deg)',offset:.2},
      {transform:'rotate(16deg)',offset:.65}, {transform:'rotate(0)'}
    ], {duration:1100});
    move(art.querySelector('.snack-crumbs'), [
      {transform:'translate(0,0)',opacity:1},
      {transform:'translate(2px,-3px)',opacity:.25,offset:.5},
      {transform:'translate(0,0)',opacity:1}
    ], {duration:1100});
  }
  nav.querySelectorAll('.meal').forEach(button => {
    button.addEventListener('pointerenter',event => {
      if (event.pointerType === 'mouse') animateMeal(button);
    });
    button.addEventListener('focus',() => {
      if (button.matches(':focus-visible')) animateMeal(button);
    });
    button.addEventListener('click',() => animateMeal(button));
  });
  const stopGestures = () => nav.getAnimations({subtree:true}).forEach(animation => animation.cancel());
  reduce.addEventListener('change',() => { if (reduce.matches) stopGestures(); });
  document.addEventListener('visibilitychange',() => { if (document.hidden) stopGestures(); });
  document.addEventListener('click',event => {
    const saved = event.target.closest('[data-favorite]');
    if (!saved || reduce.matches) return;
    const id = saved.dataset.favorite;
    requestAnimationFrame(() => {
      const heart = [...document.querySelectorAll('[data-favorite]')]
        .find(button => button.dataset.favorite === id && button.getAttribute('aria-pressed') === 'true')?.querySelector('svg');
      heart?.animate([{transform:'scale(1)'},{transform:'scale(1.25) rotate(-8deg)',offset:.4},{transform:'scale(1)'}],
        {duration:420,easing:'cubic-bezier(.22,1,.36,1)'});
    });
  });
  function formatDateRows() {
    dateList.querySelectorAll('[data-date]').forEach(button => {
      const date = new Date(`${button.dataset.date}T12:00:00`);
      button.querySelector('span').textContent = date.toLocaleDateString('en-IN', {weekday:'long'});
      button.querySelector('strong').textContent = date.toLocaleDateString('en-IN', {day:'numeric',month:'short'});
    });
  }
  new MutationObserver(formatDateRows).observe(dateList, {childList:true});
  formatDateRows();
  function closePicker(restoreFocus = false) {
    picker.open = false;
    if (restoreFocus) trigger.focus({preventScroll:true});
  }
  function positionIndicator() {
    const active = nav.querySelector('.meal.active');
    if (!active) return;
    indicator.style.width = `${active.offsetWidth}px`;
    indicator.style.transform = `translateX(${active.offsetLeft}px)`;
    nav.classList.add('indicator-ready');
  }
  document.addEventListener('click', event => {
    if (event.target.closest('[data-date],#go-today')) closePicker(true);
    else if (picker.open && !picker.contains(event.target)) closePicker();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && picker.open) { event.preventDefault(); closePicker(true); }
  });
  document.addEventListener('focusin', event => {
    if (picker.open && !picker.contains(event.target)) closePicker();
  });
  new ResizeObserver(positionIndicator).observe(nav);
  // Empty-to-empty menus do not mutate card children. Follow selection itself.
  document.addEventListener('ruchi:menurender',positionIndicator);
  new MutationObserver(() => {
    positionIndicator();
    if (reduce.matches || ['favorite','search','measure'].includes(host.dataset.transition)) return;
    document.querySelectorAll('#featured-dish .food-card,#menu-sections .food-card').forEach((card,index) => {
      card.animate([{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],
        {duration:240,delay:Math.min(index,4)*16,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
    });
  }).observe(host,{childList:true});
  positionIndicator();
  animateMeal(nav.querySelector('.meal.active'));
})();
