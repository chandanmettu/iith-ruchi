(() => {
  'use strict';
  const root = document.documentElement;
  const themeColour = document.querySelector('meta[name="theme-color"]');
  const palettes = {veg:'basil',egg:'paprika'};
  const canvas = {espresso:'#faf7f0',basil:'#f5f6ee',paprika:'#fff7ef'};
  // Follow the actual menu state, including dock navigation and keyboard input.
  // Palette is not persisted separately: refreshing starts at All dishes again.
  function sync(filter) {
    const palette = palettes[filter] || 'espresso';
    if (root.dataset.palette === palette) return;
    root.dataset.palette = palette;
    if (themeColour) themeColour.content = canvas[palette];
  }
  document.addEventListener('ruchi:filterchange',event => sync(event.detail.filter));
  sync(document.querySelector('[data-filter][aria-pressed="true"]')?.dataset.filter);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  document.addEventListener('pointerup',event => {
    if (reduce.matches || !event.target.closest('button,summary')) return;
    const touch = document.createElement('span');
    touch.className = 'colour-touch';
    touch.setAttribute('aria-hidden','true');
    touch.style.left = event.clientX+'px';
    touch.style.top = event.clientY+'px';
    document.body.append(touch);
    touch.addEventListener('animationend',()=>touch.remove(),{once:true});
    // Also clean up if reduced motion is enabled midway through the gesture.
    setTimeout(()=>touch.remove(),650);
  });
})();
