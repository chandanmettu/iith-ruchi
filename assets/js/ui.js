/* ============================================================
   Shared UI helpers: toasts, theme, countdown, meters, confetti.
   ============================================================ */
(function () {
  'use strict';
  const UI = MESS.UI = {};

  UI.$  = (s, r) => (r || document).querySelector(s);
  UI.$$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

  UI.el = function (tag, attrs, kids) {
    const n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(c => n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return n;
  };

  UI.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- icons: consistent line-icon set, no emoji ---------- */
  const ICONS = {
    bowl: '<path d="M3 11h18a9 9 0 0 1-9 9 9 9 0 0 1-9-9Z"/><path d="M7 11c0-3 1.5-6 2-7M12 11c.3-2.5.3-5 0-7M17 11c-.5-1-2-4-2-7"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>',
    sun:  '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7"/>',
    check: '<path d="M5 12.5 10 17l9-10"/>',
    checkCircle: '<circle cx="12" cy="12" r="9.2"/><path d="M8 12.3 11 15.3 16.3 9"/>',
    xCircle: '<circle cx="12" cy="12" r="9.2"/><path d="m9 9 6 6M15 9l-6 6"/>',
    alertTriangle: '<path d="M12 3.5 22 20.5H2Z"/><path d="M12 10.2v4.3M12 17.7h.01"/>',
    ticket: '<path d="M4 8.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a1.7 1.7 0 0 0 0 3v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a1.7 1.7 0 0 0 0-3Z"/><path d="M14 6.5v11"/>',
    camera: '<path d="M4 8.5a1.5 1.5 0 0 1 1.5-1.5h1.3l1-1.6h8.4l1 1.6H18.5A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5Z"/><circle cx="12" cy="12.5" r="3.3"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.1 5.9l-1.6 1.6M7.5 16.5l-1.6 1.6M18.1 18.1l-1.6-1.6M7.5 7.5 5.9 5.9"/>',
    arrowRight: '<path d="M4.5 12h15M13 5.5 19.5 12 13 18.5"/>',
    chevronLeft: '<path d="M15 5.5 8 12l7 6.5"/>',
    signOut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
    download: '<path d="M12 3.5v11M7.5 10 12 14.5 16.5 10"/><path d="M4.5 17.5v1.8a2.2 2.2 0 0 0 2.2 2.2h10.6a2.2 2.2 0 0 0 2.2-2.2v-1.8"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.3-4.3"/>',
    mail: '<rect x="3.2" y="5.5" width="17.6" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>',
    scan: '<path d="M4 8V6a2 2 0 0 1 2-2h2M20 8V6a2 2 0 0 0-2-2h-2M4 16v2a2 2 0 0 0 2 2h2M20 16v2a2 2 0 0 1-2 2h-2M4 12h16"/>',
    refresh: '<path d="M4 12a8 8 0 0 1 14-5.3L20 8M20 12a8 8 0 0 1-14 5.3L4 16"/><path d="M20 4v4h-4M4 20v-4h4"/>',
    trash: '<path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12.5A1.5 1.5 0 0 0 9.5 21h5a1.5 1.5 0 0 0 1.5-1.5L17 7"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5"/>',
    printer: '<path d="M6.5 9V4h11v5"/><rect x="4" y="9" width="16" height="7.5" rx="1.6"/><path d="M6.5 14.5h11v6h-11Z"/>',
    edit: '<path d="M4 20h4.2L18.8 9.4a2 2 0 0 0 0-2.8L18 5.8a2 2 0 0 0-2.8 0L4.6 16.4Z"/><path d="m14.5 7.5 3 3"/>'
  };
  UI.icon = function (name, opts) {
    opts = opts || {};
    const size = opts.size || 20;
    const span = document.createElement('span');
    span.className = 'ic' + (opts.class ? ' ' + opts.class : '');
    span.style.width = size + 'px'; span.style.height = size + 'px';
    span.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="' + (opts.weight || 1.8) + '" stroke-linecap="round" stroke-linejoin="round">' +
      (ICONS[name] || '') + '</svg>';
    return span;
  };

  /* ---------- theme ---------- */
  UI.initTheme = function () {
    const saved = localStorage.getItem('mess.theme');
    const sys = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', saved || sys);
  };
  UI.toggleTheme = function () {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('mess.theme', next);
  };

  /* ---------- toast ---------- */
  UI.toast = function (msg, kind, ms) {
    let host = UI.$('#toasts');
    if (!host) { host = UI.el('div', { id: 'toasts' }); document.body.appendChild(host); }
    const t = UI.el('div', { class: 'toast ' + (kind || ''), role: 'status', 'aria-live': 'polite' }, [
      UI.icon(kind === 'bad' ? 'xCircle' : kind === 'good' ? 'checkCircle' : 'checkCircle', { size: 17 }),
      UI.el('span', { text: msg })
    ]);
    host.appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity .25s, transform .25s';
      t.style.opacity = '0'; t.style.transform = 'translateY(10px)';
      setTimeout(() => t.remove(), 260);
    }, ms || 2600);
  };

  /* ---------- confetti ---------- */
  UI.confetti = function () {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['#0284C7', '#059669', '#D97706', '#0EA5E9', '#10B981'];
    const host = UI.el('div', { class: 'confetti' });
    document.body.appendChild(host);
    for (let i = 0; i < 70; i++) {
      const p = UI.el('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[(Math.random() * colors.length) | 0];
      p.style.animationDuration = (1.5 + Math.random() * 1.6) + 's';
      p.style.animationDelay = (Math.random() * .5) + 's';
      p.style.borderRadius = Math.random() > .6 ? '50%' : '2px';
      host.appendChild(p);
    }
    setTimeout(() => host.remove(), 3800);
  };

  /* ---------- numbers ---------- */
  UI.countUp = function (node, to, ms) {
    const from = parseInt(node.getAttribute('data-v') || '0', 10);
    if (from === to) { node.textContent = to; return; }
    node.setAttribute('data-v', to);
    const start = performance.now(), dur = ms || 550;
    (function step(now) {
      const k = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      node.textContent = Math.round(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    })(start);
  };

  /* ---------- seat meter ---------- */
  UI.meter = function (opts) {
    const root = UI.el('div', { class: 'meter' });
    const track = UI.el('div', { class: 'track' });
    const fill = UI.el('div', { class: 'fill' });
    track.appendChild(fill);
    const nums = UI.el('div', { class: 'nums' });
    const left = UI.el('span', { class: 'left-n', 'data-v': '0' });
    const cap = UI.el('span', { class: 'muted' });
    nums.appendChild(UI.el('span', {}, [left, UI.el('span', { class: 'muted small', text: ' seats left' })]));
    nums.appendChild(cap);
    root.appendChild(nums); root.appendChild(track);

    root.update = function (taken, capacity) {
      const pct = capacity ? Math.min(100, (taken / capacity) * 100) : 100;
      fill.style.width = pct + '%';
      root.className = 'meter ' + (pct >= 100 ? 'lvl-full' : pct >= 90 ? 'lvl-high' : pct >= 70 ? 'lvl-mid' : '');
      UI.countUp(left, Math.max(0, capacity - taken));
      cap.textContent = taken + ' / ' + capacity;
    };
    root.update(opts && opts.taken || 0, opts && opts.cap || 0);
    return root;
  };

  /* ---------- countdown ---------- */
  UI.countdown = function (host, targetIso, onDone) {
    const parts = [['d', 'days'], ['h', 'hours'], ['m', 'mins'], ['s', 'secs']];
    host.innerHTML = '';
    host.className = 'count-grid';
    const boxes = parts.map(function (p) {
      const b = UI.el('b', { text: '00' });
      const box = UI.el('div', { class: 'count-box' }, [b, UI.el('s', { text: p[1] })]);
      host.appendChild(box);
      return b;
    });
    function tick() {
      let ms = new Date(targetIso).getTime() - Date.now();
      if (ms <= 0) { clearInterval(id); boxes.forEach(b => b.textContent = '00'); if (onDone) onDone(); return; }
      const d = Math.floor(ms / 864e5); ms -= d * 864e5;
      const h = Math.floor(ms / 36e5);  ms -= h * 36e5;
      const m = Math.floor(ms / 6e4);   ms -= m * 6e4;
      const s = Math.floor(ms / 1e3);
      [d, h, m, s].forEach((v, i) => boxes[i].textContent = String(v).padStart(2, '0'));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  };

  /* ---------- misc ---------- */
  UI.fmtDate = iso => new Date(iso).toLocaleString('en-IN',
    { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });

  UI.timeAgo = function (iso) {
    const s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 60) return Math.floor(s) + 's ago';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
  };

  UI.beep = function (good) {
    try {
      const ctx = UI._ac || (UI._ac = new (window.AudioContext || window.webkitAudioContext)());
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'square';
      o.frequency.value = good ? 880 : 200;
      g.gain.setValueAtTime(0.06, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (good ? 0.16 : 0.4));
      o.start(); o.stop(ctx.currentTime + (good ? 0.17 : 0.42));
    } catch (e) {}
  };

  UI.downloadCsv = function (filename, rows) {
    const esc = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const csv = rows.map(r => r.map(esc).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }));
    const a = UI.el('a', { href: url, download: filename });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  /* topbar shell shared by all three pages */
  UI.topbar = function (title, sub, right, markIcon) {
    const bar = UI.el('header', { class: 'topbar' });
    const inner = UI.el('div', { class: 'wrap inner' });
    inner.appendChild(UI.el('a', { class: 'logo', href: 'index.html' }, [
      UI.el('span', { class: 'mark' }, [UI.icon(markIcon || 'bowl', { size: 20 })]),
      UI.el('span', { class: 'txt' }, [
        UI.el('b', { text: title }),
        UI.el('s', { text: sub })
      ])
    ]));
    inner.appendChild(UI.el('div', { class: 'grow' }));
    (right || []).forEach(n => inner.appendChild(n));
    const themeBtn = UI.el('button', {
      class: 'btn sm ghost icon-only', 'aria-label': 'Toggle dark mode', onclick: function () {
        UI.toggleTheme();
        themeBtn.innerHTML = '';
        themeBtn.appendChild(UI.icon(document.documentElement.getAttribute('data-theme') === 'dark' ? 'sun' : 'moon', { size: 18 }));
      }
    }, [UI.icon(document.documentElement.getAttribute('data-theme') === 'dark' ? 'sun' : 'moon', { size: 18 })]);
    inner.appendChild(themeBtn);
    bar.appendChild(inner);
    return bar;
  };

  UI.glow = function () {
    const b = UI.el('div', { class: 'glow' });
    b.appendChild(UI.el('i', { class: 'g1' }));
    b.appendChild(UI.el('i', { class: 'g2' }));
    return b;
  };
  UI.blobs = UI.glow; // legacy alias
})();
