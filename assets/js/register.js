/* ============================================================
   IITH Mess — registration screen logic.
   Self-contained: own icons, own toast/confetti, own meter/expand
   interactions. Talks to the shared data layer (config.js/store.js)
   only — no dependency on the old app.css/ui.js visual system.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const el = function (tag, attrs, kids) {
    const n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  };

  const ICONS = {
    hall: '<path d="M4 21V9l8-6 8 6v12"/><path d="M9 21v-7h6v7"/>',
    roll: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h5"/>',
    mess: '<path d="M4 13h16a8 8 0 0 1-8 8 8 8 0 0 1-8-8Z"/><path d="M8 13c0-2.6 1.2-5.2 1.7-6.1M12 13c.2-2.3.2-4.3 0-6.1M16 13c-.4-.9-1.7-3.5-1.7-6.1"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    check: '<path d="M5 12.5 10 17l9-10"/>',
    checkCircle: '<circle cx="12" cy="12" r="9.2"/><path d="M8 12.3 11 15.3 16.3 9"/>',
    xCircle: '<circle cx="12" cy="12" r="9.2"/><path d="m9 9 6 6M15 9l-6 6"/>'
  };
  function icon(name, size) {
    return '<svg viewBox="0 0 24 24" width="' + (size || 18) + '" height="' + (size || 18) +
      '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      (ICONS[name] || '') + '</svg>';
  }

  /* ---------- toast ---------- */
  function toast(msg, kind, ms) {
    let host = $('#toasts');
    if (!host) { host = el('div', { id: 'toasts' }); document.body.appendChild(host); }
    const t = el('div', { class: 'toast ' + (kind || '') });
    t.innerHTML = icon(kind === 'bad' ? 'xCircle' : 'checkCircle', 15) + '<span></span>';
    t.querySelector('span').textContent = msg;
    host.appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity .25s,transform .25s';
      t.style.opacity = '0'; t.style.transform = 'translateY(10px)';
      setTimeout(function () { t.remove(); }, 260);
    }, ms || 2600);
  }

  /* ---------- confetti ---------- */
  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['#e8491f', '#f2a71b', '#ff8a3d', '#1f8a4c', '#ffd873'];
    const host = el('div', { class: 'confetti' });
    document.body.appendChild(host);
    for (let i = 0; i < 60; i++) {
      const p = el('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[(Math.random() * colors.length) | 0];
      p.style.animationDuration = (1.4 + Math.random() * 1.5) + 's';
      p.style.animationDelay = (Math.random() * .4) + 's';
      p.style.borderRadius = Math.random() > .6 ? '50%' : '2px';
      host.appendChild(p);
    }
    setTimeout(function () { host.remove(); }, 3600);
  }

  /* ---------- time helpers (same spirit as the Sanchari app) ---------- */
  function daypart() {
    const h = new Date().getHours();
    return (h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening') + ',';
  }
  function fmtRel(ms) {
    if (ms <= 0) return 'any moment now';
    const mins = Math.round(ms / 60000);
    if (mins < 60) return '~' + mins + ' min';
    const h = Math.floor(mins / 60), m = mins % 60;
    if (h < 24) return '~' + h + ' hr' + (m ? ' ' + m + ' min' : '');
    const d = Math.floor(h / 24), rh = h % 24;
    return '~' + d + ' day' + (d > 1 ? 's' : '') + (rh ? ' ' + rh + ' hr' : '');
  }
  function fmtWhen(iso) {
    return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
  }

  /* ---------- state ---------- */
  let store, cfg, session = null, counts = {}, mine = null;
  const armedBtns = {}; // bucketKey -> timeout id, for the tap-to-confirm register pattern

  document.addEventListener('DOMContentLoaded', boot);

  async function boot() {
    store = await MESS.openStore();
    cfg = await store.getConfig();
    session = await store.getSession();

    wire();
    store.subscribe(refresh);
    await refresh();
    setInterval(refresh, 12000);
    setInterval(tickRelativeLabels, 30000);

    $('#screen-boot').classList.add('hide');
    route();
  }

  function show(id) { $(id).classList.remove('hide'); }
  function hide(id) { $(id).classList.add('hide'); }
  function only(id) {
    ['#screen-login', '#screen-closed', '#screen-main'].forEach(function (s) { s === id ? show(s) : hide(s); });
  }

  function route() {
    $('#btn-signout').classList.toggle('hide', !session);
    $('#btn-info').classList.toggle('hide', !!session);
    $('#who').classList.toggle('hide', !session);
    if (session) $('#who').textContent = session.email;

    $('#daypart').textContent = daypart();
    $('#daypart2').textContent = daypart();
    $('#login-cycle').textContent = cfg.cycleLabel;
    $('#main-cycle').textContent = cfg.cycleLabel;

    if (!session) { only('#screen-login'); return; }
    if (!MESS.isOpen(cfg)) { renderClosed(); only('#screen-closed'); return; }
    only('#screen-main');
    if (mine) { renderPass(); show('#pane-pass'); hide('#pane-choose'); }
    else { renderMessCards(); hide('#pane-pass'); show('#pane-choose'); }
    renderClosesRel();
  }

  async function refresh() {
    cfg = await store.getConfig();
    counts = await store.getCounts(cfg);
    if (session) mine = await store.getMine(cfg, session.email);
    route();
  }

  function tickRelativeLabels() {
    if (!session) return;
    if (!MESS.isOpen(cfg)) renderClosed();
    else renderClosesRel();
  }

  /* ---------- wiring ---------- */
  function wire() {
    $('#btn-show-demo').addEventListener('click', function () {
      $('#demo-fields').classList.remove('hide');
      $('#btn-show-demo').classList.add('hide');
      $('#in-email').focus();
    });
    $('#btn-demo-login').addEventListener('click', demoLogin);
    ['#in-email', '#in-name'].forEach(function (s) {
      $(s).addEventListener('keydown', function (e) { if (e.key === 'Enter') demoLogin(); });
    });
    $('#btn-google').addEventListener('click', async function () {
      const r = await store.signIn();
      if (!r || !r.ok) toast('Sign-in is not available in demo mode — use the email option below', 'bad', 3600);
    });
    $('#btn-signout').addEventListener('click', signOut);
    $('#btn-info').addEventListener('click', function () {
      toast('Seats are capped per hall and open live — first come, first served.', '', 4200);
    });
    $('#btn-change').addEventListener('click', changeChoice);
  }

  async function demoLogin() {
    const email = $('#in-email').value.trim().toLowerCase();
    if (!email) return toast('Enter your institute email', 'bad');
    const r = await store.signIn(email, $('#in-name').value);
    if (!r.ok) {
      return toast(r.reason === 'domain' ? 'Use your @' + MESS.EMAIL_DOMAIN + ' address' : 'Could not sign in', 'bad');
    }
    session = r.session;
    await refresh();
  }

  async function signOut() {
    await store.signOut();
    session = null; mine = null;
    route();
  }

  /* ---------- closed screen ---------- */
  function renderClosed() {
    const now = Date.now();
    const opens = new Date(cfg.opensAt).getTime();
    const closes = new Date(cfg.closesAt).getTime();
    const beforeOpen = now < opens;
    $('#closed-title').textContent = beforeOpen ? 'Doors open soon' : 'Registration has closed';
    $('#closed-sub').textContent = beforeOpen
      ? 'Registration for ' + cfg.cycleLabel + ' opens ' + fmtWhen(cfg.opensAt) + '.'
      : 'The window for ' + cfg.cycleLabel + ' closed ' + fmtWhen(cfg.closesAt) + '.';
    $('#closed-rel').textContent = beforeOpen ? fmtRel(opens - now) + ' to go' : '';
    $('#closed-rel').classList.toggle('hide', !beforeOpen);
  }

  function renderClosesRel() {
    const ms = new Date(cfg.closesAt).getTime() - Date.now();
    $('#closes-rel').innerHTML = 'closes in <b>' + fmtRel(ms).replace('~', '') + '</b>';
  }

  /* ---------- bucket helpers ---------- */
  function bucketOf(mess, hall) { return MESS.bucketKey(cfg, mess, hall); }
  function cnt(mess, hall) {
    const k = bucketOf(mess, hall);
    return counts[k] || { taken: 0, cap: MESS.bucketCap(cfg, mess, hall) };
  }
  function fillClass(taken, cap) {
    const pct = cap ? taken / cap : 1;
    return pct >= 1 ? 'full' : pct >= .9 ? 'high' : pct >= .7 ? 'mid' : '';
  }

  /* ---------- mess cards ---------- */
  const openMess = { _cur: null };

  function renderMessCards() {
    const host = $('#mcards');
    host.innerHTML = '';

    cfg.messes.forEach(function (m) {
      let totalLeft = 0, totalCap = 0;
      cfg.halls.forEach(function (h) { const c = cnt(m.id, h.id); totalLeft += Math.max(0, c.cap - c.taken); totalCap += c.cap; });
      const messFull = totalLeft <= 0;

      const card = el('div', { class: 'mcard' + (openMess._cur === m.id ? ' open' : ''), 'data-mess': m.id });

      const stub = el('div', { class: 'stub' });
      const main = el('button', {
        class: 'm-main', type: 'button',
        onclick: function () {
          openMess._cur = openMess._cur === m.id ? null : m.id;
          renderMessCards();
        }
      });
      main.innerHTML =
        '<div class="m-name">' + m.name + '</div>' +
        '<div class="m-tag">' + (m.tag || '') + '</div>' +
        '<div class="m-blurb">' + (m.blurb || '') + '</div>' +
        '<div class="m-expand">' + (messFull ? 'See halls' : 'Tap to see halls') + icon('check', 12).replace('stroke-width="2"', 'stroke-width="3"').replace('<path d="M5 12.5 10 17l9-10"/>', '<path d="M6 9l6 6 6-6"/>') + '</div>';

      const vp = el('div', { class: 'm-vp' });
      const stubR = el('div', { class: 'm-stub' + (messFull ? ' full' : '') });
      stubR.innerHTML = messFull
        ? '<div class="n">Full</div><div class="l">this month</div>'
        : '<div class="n">' + totalLeft + '</div><div class="l">seats left</div>';

      stub.appendChild(main); stub.appendChild(vp); stub.appendChild(stubR);
      card.appendChild(stub);

      const detail = el('div', { class: 'm-detail' });
      const detailIn = el('div', { class: 'm-detail-in' });
      cfg.halls.forEach(function (h) { detailIn.appendChild(renderHallRow(m, h)); });
      detail.appendChild(detailIn);
      card.appendChild(detail);

      host.appendChild(card);
    });
  }

  function renderHallRow(m, h) {
    const c = cnt(m.id, h.id);
    const left = Math.max(0, c.cap - c.taken);
    const full = left <= 0;
    const pct = c.cap ? Math.min(100, (c.taken / c.cap) * 100) : 100;
    const bucketKey = bucketOf(m.id, h.id);

    const row = el('div', { class: 'hrow' });
    row.innerHTML =
      '<div class="hbadge">' + h.id.slice(0, 2) + '</div>' +
      '<div class="hinfo">' +
      '  <div class="hname">' + h.name + '</div>' +
      '  <div class="hmeter">' +
      '    <div class="track"><div class="fill ' + fillClass(c.taken, c.cap) + '" style="width:' + pct + '%"></div></div>' +
      '    <span class="hleft">' + (full ? 'Full' : left + ' left') + '</span>' +
      '  </div>' +
      '</div>';

    const btn = el('button', { class: 'regbtn' + (full ? ' full' : ''), type: 'button', disabled: full ? '' : null });
    btn.textContent = full ? 'Full' : 'Register';
    btn.addEventListener('click', function () { onRegisterTap(btn, m, h, bucketKey); });
    row.appendChild(btn);
    return row;
  }

  async function onRegisterTap(btn, m, h, bucketKey) {
    if (btn.disabled) return;

    if (armedBtns[bucketKey]) {
      clearTimeout(armedBtns[bucketKey]);
      delete armedBtns[bucketKey];
      btn.classList.add('busy');
      btn.textContent = '…';
      const res = await store.register({ email: session.email, roll: session.roll, name: session.name, mess: m.id, hall: h.id });
      btn.classList.remove('busy', 'confirming');

      if (!res.ok) {
        if (res.reason === 'full') toast('That hall just filled up', 'bad', 3600);
        else if (res.reason === 'already') toast('You are already registered this month', 'bad');
        else if (res.reason === 'closed') toast('Registration window has closed', 'bad');
        else toast(res.message || 'Something went wrong — try again', 'bad');
        await refresh();
        return;
      }
      mine = res.reg;
      confetti();
      toast('Seat locked for ' + cfg.cycleLabel, 'good', 3000);
      await refresh();
      return;
    }

    // arm: ask for one more tap within 4s, mirroring a physical "press and hold" without blocking the UI
    Object.keys(armedBtns).forEach(revertArmed);
    armedBtns[bucketKey] = setTimeout(function () { revertArmed(bucketKey); }, 4000);
    btn.classList.add('confirming');
    btn.textContent = 'Tap to confirm';
  }

  function revertArmed(key) {
    clearTimeout(armedBtns[key]);
    delete armedBtns[key];
    if (openMess._cur) renderMessCards();
  }

  /* ---------- pass ---------- */
  function renderPass() {
    const m = cfg.messes.find(function (x) { return x.id === mine.mess; });
    const h = cfg.halls.find(function (x) { return x.id === mine.hall; });
    const host = $('#pass-host');
    const wrap = el('div', { class: 'pass', 'data-mess': mine.mess });

    wrap.innerHTML =
      '<div class="pass-band"><div class="pass-band-in">' +
      '  <div><div class="pass-route">' + cfg.cycleLabel + '</div></div>' +
      '  <div class="pass-bp">IITH<br>MESS PASS</div>' +
      '</div></div>' +
      '<div class="pass-meta">' +
      cell('roll', 'Name', mine.name || session.name) +
      cell('roll', 'Roll no', mine.roll) +
      cell('mess', 'Mess', m ? m.name : mine.mess) +
      cell('hall', 'Dining hall', h ? h.name : mine.hall) +
      '</div>' +
      '<div class="pass-perf"></div>' +
      '<div class="pass-stub">' +
      '  <span class="pass-serial">' + mine.roll + '</span>' +
      '  <span class="pass-valid"><i></i>Active</span>' +
      '</div>' +
      '<div class="pass-note">Show your ID card at the counter. Roll number found → you\'re through.</div>';

    host.innerHTML = '';
    host.appendChild(wrap);
    $('#btn-change').classList.toggle('hide', !MESS.isOpen(cfg) || !cfg.allowChange);
  }

  function cell(iconName, label, value) {
    return '<div class="pm-cell"><div class="pm-icon">' + icon(iconName, 18) + '</div>' +
      '<div><div class="pm-lbl">' + label + '</div><div class="pm-val">' + value + '</div></div></div>';
  }

  async function changeChoice() {
    if (!MESS.isOpen(cfg)) return toast('Window is closed — you cannot change now', 'bad');
    if (!cfg.allowChange) return toast('Changes are disabled for this cycle', 'bad');
    if (!window.confirm('Release your current seat and choose again?')) return;
    const r = await store.cancel(mine.id);
    if (!r.ok) return toast('Could not release the seat', 'bad');
    mine = null;
    openMess._cur = null;
    await refresh();
  }
})();
