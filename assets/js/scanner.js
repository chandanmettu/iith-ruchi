/* ============================================================
   Mess counter scanner.
   Accepts: USB barcode scanner (keyboard wedge), typed roll number,
   or phone/laptop camera via the native BarcodeDetector API.
   ============================================================ */
(function () {
  'use strict';
  const UI = MESS.UI, $ = UI.$;

  let store, cfg;
  let stats = { ok: 0, bad: 0 };
  let lastCode = '', lastAt = 0;
  let camStream = null, camLoop = null;

  UI.initTheme();
  document.addEventListener('DOMContentLoaded', boot);

  async function boot() {
    document.body.insertBefore(UI.glow(), document.body.firstChild);
    document.body.insertBefore(
      UI.topbar('Mess Counter', 'ID verification', [], 'scan'),
      document.body.firstChild.nextSibling
    );
    setCamLabel(false);
    $('#btn-clear-log').appendChild(UI.icon('trash', { size: 14 }));
    $('#btn-clear-log').appendChild(document.createTextNode('Clear'));
    idleVerdict();

    store = await MESS.openStore();
    cfg = await store.getConfig();

    $('#cycle-pill').textContent = cfg.cycleLabel;
    const sel = $('#sel-hall');
    sel.appendChild(UI.el('option', { value: '', text: 'Any hall (no location check)' }));
    cfg.halls.forEach(h => sel.appendChild(UI.el('option', { value: h.id, text: h.name + ' (' + h.id + ')' })));
    sel.value = localStorage.getItem('mess.counterHall') || '';
    sel.addEventListener('change', () => localStorage.setItem('mess.counterHall', sel.value));

    wire();
    await renderLog();
    focusInput();
  }

  function wire() {
    const input = $('#in-scan');

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); submit(input.value); }
      if (e.key === 'Escape') { input.value = ''; }
    });

    // keep the field focused — a barcode gun types wherever focus happens to be
    document.addEventListener('click', function (e) {
      if (e.target.closest('button, select, a, input, video')) return;
      focusInput();
    });
    setInterval(function () {
      const a = document.activeElement;
      if (!a || a === document.body) focusInput();
    }, 1200);

    $('#btn-cam').addEventListener('click', toggleCamera);
    $('#btn-clear-log').addEventListener('click', async function () {
      localStorage.removeItem('mess.scans');
      stats = { ok: 0, bad: 0 };
      await renderLog();
    });
  }

  function focusInput() { const i = $('#in-scan'); if (i) i.focus(); }

  /* ---------- normalise whatever the barcode gives us ---------- */
  function normalise(raw) {
    let s = String(raw || '').trim().toUpperCase().replace(/\s+/g, '');
    // ID cards often encode extra prefixes/suffixes — pull out a roll-shaped token
    const m = s.match(/[A-Z]{2}\d{2}[A-Z]{3,6}\d{3,6}/);
    if (m) return m[0];
    return s.replace(/[^A-Z0-9]/g, '');
  }

  async function submit(raw) {
    const code = normalise(raw);
    $('#in-scan').value = '';
    if (!code) return;

    // debounce accidental double-scans of the same card
    if (code === lastCode && Date.now() - lastAt < 1500) return;
    lastCode = code; lastAt = Date.now();

    cfg = await store.getConfig();
    const res = await store.lookup(cfg, code);
    const stationHall = $('#sel-hall').value;

    let kind, title, sub, reg = null;

    if (!res.found) {
      kind = 'bad';
      title = 'NOT REGISTERED';
      sub = code + ' has no active registration for ' + cfg.cycleLabel;
      stats.bad++;
    } else {
      reg = res.reg;
      const mess = (cfg.messes.find(m => m.id === reg.mess) || {}).name || reg.mess;
      const hall = (cfg.halls.find(h => h.id === reg.hall) || {}).name || reg.hall;
      if (stationHall && reg.hall !== stationHall) {
        kind = 'warn';
        title = 'WRONG HALL';
        sub = reg.name + ' is registered for ' + hall + ' · ' + mess;
        stats.bad++;
      } else {
        kind = 'ok';
        title = 'VERIFIED';
        sub = reg.name + ' · ' + mess + ' · ' + hall;
        stats.ok++;
      }
    }

    paint(kind, title, sub, code, reg);
    UI.beep(kind === 'ok');
    if (navigator.vibrate) navigator.vibrate(kind === 'ok' ? 40 : [50, 60, 50]);

    await store.logScan({
      roll: code, cycle: cfg.cycle, result: kind,
      name: reg ? reg.name : null, mess: reg ? reg.mess : null, hall: reg ? reg.hall : null,
      station: stationHall || null
    });
    await renderLog();
    focusInput();
  }

  function idleVerdict() {
    const v = $('#verdict');
    v.className = 'verdict idle';
    v.innerHTML = '';
    v.appendChild(UI.el('span', { class: 'ic-big' }, [UI.icon('ticket', { size: 44, weight: 1.5 })]));
    v.appendChild(UI.el('div', { class: 'big', text: 'Ready to scan' }));
    v.appendChild(UI.el('div', { class: 'muted', text: 'Waiting for a card…' }));
  }

  function paint(kind, title, sub, code, reg) {
    const v = $('#verdict');
    v.className = 'verdict ' + kind;
    v.innerHTML = '';
    const iconName = kind === 'ok' ? 'checkCircle' : kind === 'warn' ? 'alertTriangle' : 'xCircle';
    v.appendChild(UI.el('span', { class: 'ic-big' }, [UI.icon(iconName, { size: 48, weight: 1.6 })]));
    v.appendChild(UI.el('div', { class: 'big', text: title }));
    v.appendChild(UI.el('div', { class: 'mono', style: 'font-size:1.05rem;opacity:.9', text: code }));
    v.appendChild(UI.el('div', { style: 'font-weight:600', text: sub }));
    if (reg) {
      v.appendChild(UI.el('div', { class: 'small', style: 'opacity:.8',
        text: 'Registered ' + UI.fmtDate(reg.created_at) }));
    }
    setTimeout(function () {
      if (v.className.indexOf(kind) === -1) return;
      idleVerdict();
    }, 4000);
  }

  async function renderLog() {
    const scans = await store.listScans();
    const host = $('#log');
    host.innerHTML = '';
    if (!scans.length) {
      host.appendChild(UI.el('p', { class: 'small faint', text: 'No scans yet this session.' }));
    }
    scans.slice(0, 60).forEach(function (s) {
      const colour = s.result === 'ok' ? 'var(--good)' : s.result === 'warn' ? 'var(--warn)' : 'var(--bad)';
      const icon = s.result === 'ok' ? 'check' : s.result === 'warn' ? 'alertTriangle' : 'xCircle';
      host.appendChild(UI.el('div', { class: 'log-row' }, [
        UI.el('span', { class: 'tick', style: 'background:' + colour }, [UI.icon(icon, { size: 12, weight: 2.4 })]),
        UI.el('span', { class: 'mono grow', text: s.roll }),
        UI.el('span', { class: 'small muted', text: s.hall || '—' }),
        UI.el('span', { class: 'small faint', text: UI.timeAgo(s.at) })
      ]));
    });
    const ok = scans.filter(s => s.result === 'ok').length;
    UI.countUp($('#s-ok'), ok);
    UI.countUp($('#s-bad'), scans.length - ok);
    UI.countUp($('#s-total'), scans.length);
  }

  /* ---------- camera scanning (native BarcodeDetector) ---------- */
  function setCamLabel(active) {
    const btn = $('#btn-cam');
    btn.innerHTML = '';
    btn.appendChild(UI.icon('camera', { size: 14 }));
    btn.appendChild(document.createTextNode(active ? 'Stop camera' : 'Use camera'));
  }

  async function toggleCamera() {
    const vid = $('#cam');
    if (camStream) {
      camStream.getTracks().forEach(t => t.stop());
      camStream = null; clearInterval(camLoop);
      vid.classList.add('hide'); setCamLabel(false);
      return;
    }
    if (!('BarcodeDetector' in window)) {
      return UI.toast('No built-in barcode reader — use a USB scanner or type the roll number', 'bad', 5000);
    }
    try {
      camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    } catch (e) {
      return UI.toast('Camera permission denied', 'bad');
    }
    vid.srcObject = camStream;
    await vid.play();
    vid.classList.remove('hide');
    setCamLabel(true);

    const det = new BarcodeDetector({
      formats: ['code_128', 'code_39', 'qr_code', 'ean_13', 'codabar', 'itf']
    });
    camLoop = setInterval(async function () {
      try {
        const codes = await det.detect(vid);
        if (codes && codes.length) submit(codes[0].rawValue);
      } catch (e) {}
    }, 400);
  }
})();
