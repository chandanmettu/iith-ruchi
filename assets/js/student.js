/* ============================================================
   Student portal — login → mess → hall → confirm → pass
   ============================================================ */
(function () {
  'use strict';
  const UI = MESS.UI, $ = UI.$;

  let store, cfg, session = null, counts = {}, mine = null;
  let pick = { mess: null, hall: null };
  let step = 1;
  const meters = {};      // bucketKey -> [meter nodes]
  let stopCountdown = null;

  UI.initTheme();

  document.addEventListener('DOMContentLoaded', boot);

  async function boot() {
    document.body.insertBefore(UI.glow(), document.body.firstChild);
    mountTopbar();
    $('#google-ic').appendChild(UI.icon('mail', { size: 18 }));
    $('#pass-ic').appendChild(UI.icon('bowl', { size: 22 }));
    $('#btn-back-mess').appendChild(UI.icon('chevronLeft', { size: 16 }));
    $('#btn-back-mess').appendChild(document.createTextNode('Change mess'));
    $('#btn-back-hall').appendChild(UI.icon('chevronLeft', { size: 16 }));
    $('#btn-back-hall').appendChild(document.createTextNode('Back'));
    $('#btn-change').appendChild(UI.icon('edit', { size: 16 }));
    $('#btn-change').appendChild(document.createTextNode('Change my choice'));
    $('#btn-print').appendChild(UI.icon('printer', { size: 16 }));
    $('#btn-print').appendChild(document.createTextNode('Save / print pass'));
    $('#pane-confirm .banner.warn').appendChild(UI.icon('alertTriangle', { size: 16 }));
    $('#pane-confirm .banner.warn').appendChild(UI.el('span', {
      text: 'This is for the whole month and is checked at the counter. You can change it only while the window is open.'
    }));

    store = await MESS.openStore();
    cfg = await store.getConfig();
    session = await store.getSession();

    $('#mode-pill').textContent = store.mode === 'live' ? 'live' : 'demo mode';
    $('#mode-pill').className = 'pill ' + (store.mode === 'live' ? 'good' : 'primary');
    if (store.mode === 'live') $('#demo-login').classList.add('hide');
    else $('#btn-google').classList.add('hide');

    wire();
    store.subscribe(refresh);
    await refresh();
    setInterval(refresh, 15000);
    hide('#screen-boot');
    route();
  }

  function mountTopbar() {
    const right = [];
    const who = UI.el('span', { class: 'small muted mono hide-sm', id: 'who' });
    const out = UI.el('button', { class: 'btn sm outline hide', id: 'btn-signout', onclick: signOut },
      [UI.icon('signOut', { size: 15 }), 'Sign out']);
    right.push(who, out);
    document.body.insertBefore(UI.topbar('IITH Mess', 'Registration Portal', right), document.body.firstChild.nextSibling);
  }

  function show(s) { $(s).classList.remove('hide'); }
  function hide(s) { $(s).classList.add('hide'); }
  function only(id) {
    ['#screen-login', '#screen-closed', '#screen-choose', '#screen-done'].forEach(s =>
      s === id ? show(s) : hide(s));
  }

  /* ---------------- routing ---------------- */
  function route() {
    $('#btn-signout').classList.toggle('hide', !session);
    $('#who').textContent = session ? session.email : '';

    if (!session) {
      $('#login-cycle').textContent = cfg.cycleLabel;
      renderTicker();
      only('#screen-login');
      return;
    }
    if (mine) { renderPass(); only('#screen-done'); return; }
    if (!MESS.isOpen(cfg)) { renderClosed(); only('#screen-closed'); return; }
    renderChoose();
    only('#screen-choose');
  }

  /* ---------------- data ---------------- */
  async function refresh() {
    cfg = await store.getConfig();
    counts = await store.getCounts(cfg);
    if (session) mine = await store.getMine(cfg, session.email);
    updateMeters();
    updateChoiceStates();
    updateClosesIn();
    if (session && mine && !$('#screen-done').classList.contains('hide')) renderPass();
  }

  function bucketOf(mess, hall) { return MESS.bucketKey(cfg, mess, hall); }
  function cnt(mess, hall) {
    const k = bucketOf(mess, hall);
    return counts[k] || { taken: 0, cap: MESS.bucketCap(cfg, mess, hall) };
  }
  function isFull(mess, hall) { const c = cnt(mess, hall); return c.taken >= c.cap; }

  /* a mess is full only if every hall under it is full */
  function messFull(messId) { return cfg.halls.every(h => isFull(messId, h.id)); }

  function updateMeters() {
    Object.keys(meters).forEach(function (k) {
      const c = counts[k];
      if (!c) return;
      meters[k].forEach(m => m.update(c.taken, c.cap));
    });
  }

  /* ---------------- login ---------------- */
  function wire() {
    $('#btn-demo-login').addEventListener('click', demoLogin);
    ['#in-email', '#in-name'].forEach(s =>
      $(s).addEventListener('keydown', e => { if (e.key === 'Enter') demoLogin(); }));
    $('#btn-google').addEventListener('click', async () => {
      const r = await store.signIn();
      if (!r.ok) UI.toast('Sign-in failed', 'bad');
    });
    $('#btn-back-mess').addEventListener('click', () => { step = 1; renderChoose(); });
    $('#btn-back-hall').addEventListener('click', () => { step = 2; renderChoose(); });
    $('#btn-confirm').addEventListener('click', confirm);
    $('#btn-change').addEventListener('click', changeChoice);
    $('#btn-print').addEventListener('click', () => window.print());
  }

  async function demoLogin() {
    const email = $('#in-email').value.trim().toLowerCase();
    if (!email) return UI.toast('Enter your institute email', 'bad');
    const r = await store.signIn(email, $('#in-name').value);
    if (!r.ok) {
      return UI.toast(r.reason === 'domain'
        ? 'Use your @' + MESS.EMAIL_DOMAIN + ' address'
        : 'Could not sign in', 'bad');
    }
    session = r.session;
    pick = { mess: null, hall: null };
    step = 1;
    await refresh();
    route();
  }

  async function signOut() {
    await store.signOut();
    session = null; mine = null; pick = { mess: null, hall: null }; step = 1;
    route();
  }

  /* ---------------- closed screen ---------------- */
  function renderClosed() {
    const now = Date.now();
    const opens = new Date(cfg.opensAt).getTime();
    const beforeOpen = now < opens;
    $('#closed-pill').textContent = beforeOpen ? 'Opening soon' : 'Registration closed';
    $('#closed-pill').className = 'pill ' + (beforeOpen ? 'primary' : 'bad');
    $('#closed-title').textContent = beforeOpen ? 'Doors open soon' : 'Registration has closed';
    $('#closed-sub').textContent = beforeOpen
      ? 'Registration for ' + cfg.cycleLabel + ' opens on ' + UI.fmtDate(cfg.opensAt) + '. Set a reminder — seats go fast.'
      : 'The window for ' + cfg.cycleLabel + ' closed on ' + UI.fmtDate(cfg.closesAt) + '. Contact the mess office if you missed it.';
    if (stopCountdown) stopCountdown();
    if (beforeOpen) {
      stopCountdown = UI.countdown($('#closed-count'), cfg.opensAt, () => { refresh().then(route); });
    } else {
      $('#closed-count').innerHTML = '';
    }
  }

  function updateClosesIn() {
    const n = $('#closes-in');
    if (!n || !MESS.isOpen(cfg)) return;
    const ms = new Date(cfg.closesAt).getTime() - Date.now();
    const d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5);
    n.textContent = 'closes in ' + (d > 0 ? d + 'd ' + h + 'h' : h + 'h');
  }

  /* ---------------- choose flow ---------------- */
  function renderChoose() {
    renderSteps();
    $('#pane-mess').classList.toggle('hide', step !== 1);
    $('#pane-hall').classList.toggle('hide', step !== 2);
    $('#pane-confirm').classList.toggle('hide', step !== 3);

    const titles = {
      1: ['Choose your mess', 'Where do you want to eat this month?'],
      2: ['Choose your dining hall', 'Seats update live — pick before it fills.'],
      3: ['Almost done', 'Check the details, then lock it in.']
    };
    $('#step-title').textContent = titles[step][0];
    $('#step-sub').textContent = titles[step][1];

    if (step === 1) renderMessCards();
    if (step === 2) renderHallCards();
    if (step === 3) renderConfirm();
    updateClosesIn();
  }

  function renderSteps() {
    const host = $('#steps');
    host.innerHTML = '';
    [['Mess', 1], ['Hall', 2], ['Confirm', 3]].forEach(function (s, i) {
      if (i) host.appendChild(UI.el('span', { class: 'step-sep' }));
      const n = UI.el('span', { class: 'n' },
        step > s[1] ? [UI.icon('check', { size: 12 })] : [String(s[1])]);
      host.appendChild(UI.el('span', {
        class: 'step ' + (step === s[1] ? 'on' : step > s[1] ? 'done' : '')
      }, [n, s[0]]));
    });
  }

  function renderMessCards() {
    const host = $('#pane-mess');
    host.innerHTML = '';
    Object.keys(meters).forEach(k => { meters[k] = []; });

    cfg.messes.forEach(function (m) {
      const full = messFull(m.id);
      const card = UI.el('button', {
        class: 'choice' + (full ? ' full' : ''),
        'aria-pressed': pick.mess === m.id ? 'true' : 'false',
        disabled: full ? '' : null,
        onclick: function () { if (full) return; pick.mess = m.id; pick.hall = null; step = 2; renderChoose(); }
      });

      card.appendChild(UI.el('span', { class: 'check' }, [UI.icon('check', { size: 14 })]));
      card.appendChild(UI.el('div', { class: 'head' }, [
        UI.el('div', { class: 'stack gap-4' }, [
          UI.el('div', { class: 'title', text: m.name }),
          UI.el('div', { class: 'sub', text: m.blurb || '' })
        ]),
        UI.el('span', { class: 'pill ' + (m.accent || 'primary'), text: m.tag || '' })
      ]));

      // per-hall availability strip inside the mess card
      const strip = UI.el('div', { class: 'stack gap-10' });
      cfg.halls.forEach(function (h) {
        const c = cnt(m.id, h.id);
        const row = UI.el('div', { class: 'stack gap-4' });
        row.appendChild(UI.el('div', { class: 'row between small' }, [
          UI.el('b', { text: h.id }),
          UI.el('span', {
            class: 'small ' + (c.taken >= c.cap ? '' : 'muted'),
            text: c.taken >= c.cap ? 'full' : (c.cap - c.taken) + ' left'
          })
        ]));
        const mt = UI.meter({ taken: c.taken, cap: c.cap });
        mt.querySelector('.nums').style.display = 'none';
        row.appendChild(mt);
        strip.appendChild(row);
        const k = bucketOf(m.id, h.id);
        (meters[k] = meters[k] || []).push(mt);
      });
      card.appendChild(strip);
      card.appendChild(UI.el('div', { class: 'row', style: 'margin-top:auto' }, [
        UI.el('span', { class: 'small muted', text: full ? 'No seats left in either hall' : 'Select' }),
        full ? null : UI.icon('arrowRight', { size: 14, class: 'muted' })
      ].filter(Boolean)));
      host.appendChild(card);
    });
  }

  function renderHallCards() {
    const host = $('#hall-choices');
    host.innerHTML = '';
    Object.keys(meters).forEach(k => { meters[k] = []; });
    const mess = cfg.messes.find(m => m.id === pick.mess);

    cfg.halls.forEach(function (h) {
      const c = cnt(pick.mess, h.id);
      const full = c.taken >= c.cap;
      const card = UI.el('button', {
        class: 'choice' + (full ? ' full' : ''),
        'aria-pressed': pick.hall === h.id ? 'true' : 'false',
        disabled: full ? '' : null,
        onclick: function () { if (full) return; pick.hall = h.id; step = 3; renderChoose(); }
      });
      card.appendChild(UI.el('span', { class: 'check' }, [UI.icon('check', { size: 14 })]));
      card.appendChild(UI.el('div', { class: 'head' }, [
        UI.el('div', { class: 'stack gap-4' }, [
          UI.el('div', { class: 'title', text: h.name }),
          UI.el('div', { class: 'sub', text: (mess ? mess.name : '') + ' · ' + h.id })
        ]),
        UI.el('span', { class: 'pill ' + (h.accent || 'primary'), text: h.id })
      ]));
      const mt = UI.meter({ taken: c.taken, cap: c.cap });
      card.appendChild(mt);
      (meters[bucketOf(pick.mess, h.id)] = meters[bucketOf(pick.mess, h.id)] || []).push(mt);
      card.appendChild(UI.el('div', { class: 'small muted', text: full ? 'Full for ' + cfg.cycleLabel : 'Select' }));
      host.appendChild(card);
    });
  }

  function renderConfirm() {
    const m = cfg.messes.find(x => x.id === pick.mess);
    const h = cfg.halls.find(x => x.id === pick.hall);
    $('#c-name').textContent  = session.name;
    $('#c-email').textContent = session.email;
    $('#c-roll').textContent  = session.roll;
    $('#c-mess').textContent  = m ? m.name : pick.mess;
    $('#c-hall').textContent  = h ? h.name : pick.hall;
    $('#c-cycle').textContent = cfg.cycleLabel;

    const c = cnt(pick.mess, pick.hall);
    const host = $('#c-meter');
    host.innerHTML = '';
    const mt = UI.meter({ taken: c.taken, cap: c.cap });
    host.appendChild(mt);
    meters[bucketOf(pick.mess, pick.hall)] = [mt];
  }

  function updateChoiceStates() {
    if ($('#screen-choose').classList.contains('hide')) return;
    if (step === 1) {
      UI.$$('#pane-mess .choice').forEach(function (card, i) {
        const m = cfg.messes[i];
        if (!m) return;
        card.classList.toggle('full', messFull(m.id));
        card.disabled = messFull(m.id);
      });
    }
    if (step === 2) {
      UI.$$('#hall-choices .choice').forEach(function (card, i) {
        const h = cfg.halls[i];
        if (!h) return;
        const f = isFull(pick.mess, h.id);
        card.classList.toggle('full', f);
        card.disabled = f;
      });
    }
  }

  /* ---------------- confirm ---------------- */
  async function confirm() {
    const btn = $('#btn-confirm');
    btn.disabled = true;
    btn.textContent = 'Locking…';

    const res = await store.register({
      email: session.email, roll: session.roll, name: session.name,
      mess: pick.mess, hall: pick.hall
    });

    btn.disabled = false;
    btn.textContent = 'Lock my seat';

    if (!res.ok) {
      if (res.reason === 'full') {
        UI.toast('That hall just filled up — pick another', 'bad', 4200);
        await refresh(); step = 2; renderChoose(); return;
      }
      if (res.reason === 'already') {
        UI.toast('You are already registered this month', 'bad');
        await refresh(); route(); return;
      }
      if (res.reason === 'closed') {
        UI.toast('Registration window has closed', 'bad');
        await refresh(); route(); return;
      }
      return UI.toast(res.message || 'Something went wrong. Try again.', 'bad');
    }

    mine = res.reg;
    UI.confetti();
    UI.toast('Seat locked for ' + cfg.cycleLabel, 'good', 3200);
    await refresh();
    route();
  }

  async function changeChoice() {
    if (!MESS.isOpen(cfg)) return UI.toast('Window is closed — you cannot change now', 'bad');
    if (!cfg.allowChange) return UI.toast('Changes are disabled for this cycle', 'bad');
    if (!window.confirm('Release your current seat and choose again?\n\nSomeone else may take it while you decide.')) return;
    const r = await store.cancel(mine.id);
    if (!r.ok) return UI.toast('Could not release the seat', 'bad');
    mine = null; pick = { mess: null, hall: null }; step = 1;
    await refresh();
    route();
  }

  /* ---------------- pass ---------------- */
  function renderPass() {
    const m = cfg.messes.find(x => x.id === mine.mess);
    const h = cfg.halls.find(x => x.id === mine.hall);
    $('#p-cycle').textContent = cfg.cycleLabel;
    $('#p-name').textContent  = mine.name || session.name;
    $('#p-roll').textContent  = mine.roll;
    $('#p-mess').textContent  = m ? m.name : mine.mess;
    $('#p-hall').textContent  = h ? h.name : mine.hall;
    $('#p-when').textContent  = UI.fmtDate(mine.created_at);
    $('#btn-change').classList.toggle('hide', !MESS.isOpen(cfg) || !cfg.allowChange);
  }

  /* ---------------- ticker on the login screen ---------------- */
  function renderTicker() {
    const strip = $('#ticker-strip');
    const items = [];
    cfg.messes.forEach(function (m) {
      cfg.halls.forEach(function (h) {
        const c = cnt(m.id, h.id);
        items.push(m.name + ' · ' + h.id + ' — ' + (c.taken >= c.cap ? 'FULL' : (c.cap - c.taken) + ' seats left'));
      });
    });
    items.push('Registration for ' + cfg.cycleLabel);
    items.push('Caps reset every month');
    const txt = items.join('   •   ');
    strip.innerHTML = '';
    strip.appendChild(UI.el('span', { text: txt }));
    strip.appendChild(UI.el('span', { text: txt }));
  }
})();
