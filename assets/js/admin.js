/* ============================================================
   Admin console — window, caps, live occupancy, export.
   ============================================================ */
(function () {
  'use strict';
  const UI = MESS.UI, $ = UI.$;

  let store, cfg, counts = {}, regs = [];
  const bucketMeters = {};

  UI.initTheme();
  document.addEventListener('DOMContentLoaded', boot);

  async function boot() {
    document.body.insertBefore(UI.glow(), document.body.firstChild);
    document.body.insertBefore(
      UI.topbar('Mess Admin', 'Control room', [], 'gear'),
      document.body.firstChild.nextSibling
    );
    $('#btn-open-now').prepend(UI.icon('check', { size: 14 }));
    $('#btn-close-now').prepend(UI.icon('xCircle', { size: 14 }));
    $('#btn-reset').append(UI.icon('refresh', { size: 14 }), document.createTextNode('Reset demo data'));
    $('#btn-export').append(UI.icon('download', { size: 14 }), document.createTextNode('Export CSV'));

    store = await MESS.openStore();
    cfg = await store.getConfig();

    const note = $('#mode-note');
    note.innerHTML = '';
    note.appendChild(UI.icon('mail', { size: 16 }));
    note.appendChild(UI.el('span', {
      html: store.mode === 'live'
        ? 'Connected to <b>Supabase</b> — changes affect every student immediately.'
        : 'Running in <b>demo mode</b> — data lives in this browser only. Add Supabase keys in <span class="mono">assets/js/config.js</span> to go live.'
    }));

    fillForm();
    wire();
    store.subscribe(refresh);
    await refresh();
    setInterval(refresh, 8000);
  }

  /* ---------- form ---------- */
  const toLocal = iso => {
    const d = new Date(iso), p = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes());
  };

  function fillForm() {
    $('#cycle-pill').textContent = cfg.cycleLabel + ' · ' + (MESS.isOpen(cfg) ? 'OPEN' : 'CLOSED');
    $('#cycle-pill').className = 'pill ' + (MESS.isOpen(cfg) ? 'good' : 'bad');
    $('#f-label').value = cfg.cycleLabel;
    $('#f-opens').value = toLocal(cfg.opensAt);
    $('#f-closes').value = toLocal(cfg.closesAt);
    $('#f-capmode').value = cfg.capMode;
    $('#f-change').checked = !!cfg.allowChange;
    $('#f-pressure').checked = !!cfg.demoPressure;
    renderCapFields();
    renderFilter();
  }

  function renderCapFields() {
    const host = $('#cap-fields');
    host.innerHTML = '';
    const list = cfg.capMode === 'mess' ? cfg.messes : cfg.halls;
    const noun = cfg.capMode === 'mess' ? 'mess' : 'hall';
    list.forEach(function (item) {
      const inp = UI.el('input', { class: 'input', type: 'number', min: '0', value: String(item.cap), 'data-id': item.id });
      host.appendChild(UI.el('label', { class: 'f' }, [
        item.name + ' (' + item.id + ')', inp
      ]));
    });
    if (cfg.capMode === 'grid') {
      host.appendChild(UI.el('p', { class: 'small muted',
        text: 'In grid mode each hall cap above is split evenly across the ' + cfg.messes.length + ' messes.' }));
    }
    host.setAttribute('data-noun', noun);
  }

  function renderFilter() {
    const sel = $('#f-filter');
    sel.innerHTML = '';
    sel.appendChild(UI.el('option', { value: '', text: 'All registrations' }));
    cfg.messes.forEach(m => sel.appendChild(UI.el('option', { value: 'M:' + m.id, text: m.name })));
    cfg.halls.forEach(h => sel.appendChild(UI.el('option', { value: 'H:' + h.id, text: h.name })));
  }

  function wire() {
    $('#btn-save').addEventListener('click', saveSettings);
    $('#btn-save-caps').addEventListener('click', saveCaps);
    $('#f-capmode').addEventListener('change', function () {
      cfg.capMode = this.value; renderCapFields();
    });
    $('#btn-open-now').addEventListener('click', async function () {
      cfg.opensAt = new Date(Date.now() - 6e4).toISOString();
      if (new Date(cfg.closesAt) < new Date()) cfg.closesAt = new Date(Date.now() + 5 * 864e5).toISOString();
      await store.setConfig(cfg); fillForm(); await refresh();
      UI.toast('Registration is open', 'good');
    });
    $('#btn-close-now').addEventListener('click', async function () {
      cfg.closesAt = new Date(Date.now() - 6e4).toISOString();
      await store.setConfig(cfg); fillForm(); await refresh();
      UI.toast('Registration closed', 'good');
    });
    $('#f-pressure').addEventListener('change', async function () {
      cfg.demoPressure = this.checked;
      await store.setConfig(cfg);
      UI.toast(this.checked ? 'Simulated bookings on' : 'Simulated bookings off');
    });
    $('#btn-reset').addEventListener('click', async function () {
      if (!window.confirm('Wipe all local demo data and re-seed?')) return;
      await store.resetDemo();
      cfg = await store.getConfig();
      fillForm(); await refresh();
      UI.toast('Demo data reset', 'good');
    });
    $('#btn-export').addEventListener('click', exportCsv);
    $('#f-search').addEventListener('input', renderTable);
    $('#f-filter').addEventListener('change', renderTable);
  }

  async function saveSettings() {
    cfg.cycleLabel = $('#f-label').value.trim() || cfg.cycleLabel;
    cfg.opensAt  = new Date($('#f-opens').value).toISOString();
    cfg.closesAt = new Date($('#f-closes').value).toISOString();
    cfg.capMode  = $('#f-capmode').value;
    cfg.allowChange = $('#f-change').checked;
    await store.setConfig(cfg);
    fillForm(); await refresh();
    UI.toast('Settings saved', 'good');
  }

  async function saveCaps() {
    const list = cfg.capMode === 'mess' ? cfg.messes : cfg.halls;
    UI.$$('#cap-fields input[data-id]').forEach(function (inp) {
      const item = list.find(x => x.id === inp.getAttribute('data-id'));
      if (item) item.cap = Math.max(0, parseInt(inp.value, 10) || 0);
    });
    await store.setConfig(cfg);
    await refresh();
    UI.toast('Caps updated', 'good');
  }

  /* ---------- live view ---------- */
  async function refresh() {
    cfg = await store.getConfig();
    counts = await store.getCounts(cfg);
    regs = await store.listRegistrations(cfg);
    renderStats();
    renderBuckets();
    renderTable();
    $('#cycle-pill').textContent = cfg.cycleLabel + ' · ' + (MESS.isOpen(cfg) ? 'OPEN' : 'CLOSED');
    $('#cycle-pill').className = 'pill ' + (MESS.isOpen(cfg) ? 'good' : 'bad');
  }

  function renderStats() {
    let total = 0, cap = 0;
    MESS.allBuckets(cfg).forEach(function (b) {
      const c = counts[b.key] || { taken: 0, cap: b.cap };
      total += c.taken; cap += c.cap;
    });
    const byMess = {};
    cfg.messes.forEach(m => byMess[m.id] = 0);
    regs.forEach(r => { if (byMess[r.mess] !== undefined) byMess[r.mess]++; });

    const host = $('#stats');
    host.innerHTML = '';
    const add = (label, value) => host.appendChild(
      UI.el('div', { class: 'stat' }, [UI.el('b', { text: String(value) }), UI.el('s', { text: label })]));
    add('Registered', total);
    add('Seats left', Math.max(0, cap - total));
    add('Total capacity', cap);
    add('Fill rate', (cap ? Math.round(total / cap * 100) : 0) + '%');
    cfg.messes.forEach(m => add(m.name, byMess[m.id] || 0));
  }

  function renderBuckets() {
    const host = $('#buckets');
    host.innerHTML = '';
    MESS.allBuckets(cfg).forEach(function (b) {
      const c = counts[b.key] || { taken: 0, cap: b.cap };
      const hall = cfg.halls.find(h => h.id === b.hall);
      const mess = cfg.messes.find(m => m.id === b.mess);
      let label = hall ? hall.name : b.hall;
      if (cfg.capMode === 'mess') label = mess ? mess.name : b.mess;
      if (cfg.capMode === 'grid') label = (mess ? mess.name : b.mess) + ' · ' + b.hall;

      const row = UI.el('div', { class: 'stack gap-8' });
      row.appendChild(UI.el('div', { class: 'row between' }, [
        UI.el('b', { text: label }),
        UI.el('span', {
          class: 'pill ' + (c.taken >= c.cap ? 'bad' : c.taken / c.cap > .9 ? 'warn' : 'good'),
          text: c.taken >= c.cap ? 'FULL' : (c.cap - c.taken) + ' left'
        })
      ]));
      const m = UI.meter({ taken: c.taken, cap: c.cap });
      row.appendChild(m);
      bucketMeters[b.key] = m;
      host.appendChild(row);
    });
  }

  function filtered() {
    const q = $('#f-search').value.trim().toUpperCase();
    const f = $('#f-filter').value;
    return regs.filter(function (r) {
      if (f.slice(0, 2) === 'M:' && r.mess !== f.slice(2)) return false;
      if (f.slice(0, 2) === 'H:' && r.hall !== f.slice(2)) return false;
      if (!q) return true;
      return (r.roll || '').indexOf(q) >= 0 ||
             (r.name || '').toUpperCase().indexOf(q) >= 0 ||
             (r.email || '').toUpperCase().indexOf(q) >= 0;
    });
  }

  function renderTable() {
    const rows = filtered();
    $('#reg-count').textContent = '· ' + rows.length + ' of ' + regs.length;
    const body = $('#reg-body');
    body.innerHTML = '';
    rows.slice(0, 300).forEach(function (r) {
      const mess = (cfg.messes.find(m => m.id === r.mess) || {}).name || r.mess;
      const hall = r.hall;
      body.appendChild(UI.el('tr', {}, [
        UI.el('td', { class: 'mono', text: r.roll }),
        UI.el('td', { text: r.name || '—' }),
        UI.el('td', { text: mess }),
        UI.el('td', { text: hall }),
        UI.el('td', { class: 'small muted', text: r.email }),
        UI.el('td', { class: 'small muted', text: UI.fmtDate(r.created_at) })
      ]));
    });
    if (!rows.length) {
      body.appendChild(UI.el('tr', {}, [
        UI.el('td', { colspan: '6', class: 'muted center', text: 'No matching registrations.' })
      ]));
    }
  }

  function exportCsv() {
    const rows = [['Roll', 'Name', 'Email', 'Mess', 'Hall', 'Cycle', 'Registered At']];
    filtered().forEach(function (r) {
      const mess = (cfg.messes.find(m => m.id === r.mess) || {}).name || r.mess;
      rows.push([r.roll, r.name, r.email, mess, r.hall, cfg.cycleLabel, r.created_at]);
    });
    UI.downloadCsv('iith-mess-' + cfg.cycle + '.csv', rows);
    UI.toast('Exported ' + (rows.length - 1) + ' registrations', 'good');
  }
})();
