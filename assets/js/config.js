/* ============================================================
   IITH Mess Portal — configuration
   ------------------------------------------------------------
   DEMO MODE  (default): leave SUPABASE blank. Everything runs in
   the browser via localStorage. Just open index.html.

   LIVE MODE: paste your Supabase project URL + anon key below,
   run supabase/schema.sql in the SQL editor, and serve over http.
   ============================================================ */

window.MESS = window.MESS || {};

MESS.SUPABASE = {
  url:     '',   // e.g. 'https://abcdefgh.supabase.co'
  anonKey: ''    // e.g. 'eyJhbGciOi...'
};

MESS.EMAIL_DOMAIN = 'iith.ac.in';

/* ---- default cycle config (admin can override at runtime) ---- */
MESS.defaultConfig = function () {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const cycle = next.getFullYear() + '-' + String(next.getMonth() + 1).padStart(2, '0');

  return {
    cycle: cycle,
    cycleLabel: next.toLocaleString('en-IN', { month: 'long', year: 'numeric' }),

    // registration window — defaults keep the demo open right now
    opensAt:  new Date(now.getTime() - 2 * 864e5).toISOString(),
    closesAt: new Date(now.getTime() + 5 * 864e5).toISOString(),

    // 'hall' | 'mess' | 'grid'  — where the seat cap is enforced
    capMode: 'hall',

    messes: [
      { id: 'A', name: 'Mess A', tag: 'Legacy', accent: 'primary', cap: 1400,
        blurb: 'The original mess — familiar menu, familiar crowd.' },
      { id: 'B', name: 'Mess B', tag: 'New',    accent: 'good',    cap: 1400,
        blurb: 'The new block — refreshed kitchen, revised menu.' }
    ],

    halls: [
      { id: 'UDH', name: 'Upper Dining Hall', accent: 'primary', cap: 1000 },
      { id: 'LDH', name: 'Lower Dining Hall', accent: 'good',    cap: 1000 }
    ],

    // demo-only: makes seats tick down on their own so the live
    // counter is visible during a walkthrough
    demoPressure: false,

    // allow a student to change their choice while the window is open
    allowChange: true
  };
};

/* ---- which bucket a (mess, hall) pick consumes ---- */
MESS.bucketKey = function (cfg, messId, hallId) {
  if (cfg.capMode === 'mess') return 'M:' + messId;
  if (cfg.capMode === 'grid') return 'G:' + messId + ':' + hallId;
  return 'H:' + hallId;
};

MESS.bucketCap = function (cfg, messId, hallId) {
  if (cfg.capMode === 'mess') {
    const m = cfg.messes.find(function (x) { return x.id === messId; });
    return m ? m.cap : 0;
  }
  const h = cfg.halls.find(function (x) { return x.id === hallId; });
  if (cfg.capMode === 'grid') return h ? Math.round(h.cap / cfg.messes.length) : 0;
  return h ? h.cap : 0;
};

/* every bucket that exists for this config */
MESS.allBuckets = function (cfg) {
  const out = [];
  const seen = {};
  cfg.messes.forEach(function (m) {
    cfg.halls.forEach(function (h) {
      const k = MESS.bucketKey(cfg, m.id, h.id);
      if (seen[k]) return;
      seen[k] = 1;
      out.push({ key: k, cap: MESS.bucketCap(cfg, m.id, h.id), mess: m.id, hall: h.id });
    });
  });
  return out;
};

MESS.isOpen = function (cfg, at) {
  const t = (at || new Date()).getTime();
  return t >= new Date(cfg.opensAt).getTime() && t <= new Date(cfg.closesAt).getTime();
};
