/* ============================================================
   Data layer. Two interchangeable backends:
     MockStore     — localStorage, works from file://, no setup
     SupabaseStore — real Postgres, atomic seat claim, Google auth
   Both expose the same async API, so the UI never knows which.
   ============================================================ */
(function () {
  'use strict';

  const K = {
    cfg:   'mess.config',
    regs:  'mess.regs',
    scans: 'mess.scans',
    sess:  'mess.session',
    seeded:'mess.seeded'
  };

  /* localStorage is unavailable on some file:// origins (and in private
     windows). Fall back to an in-memory map so the demo still runs. */
  const mem = {};
  const canLS = (function () {
    try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return true; }
    catch (e) { return false; }
  })();

  const read  = (k, d) => {
    try {
      const v = canLS ? localStorage.getItem(k) : (k in mem ? mem[k] : null);
      return v ? JSON.parse(v) : d;
    } catch (e) { return d; }
  };
  const write = (k, v) => {
    const s = JSON.stringify(v);
    mem[k] = s;
    if (canLS) { try { localStorage.setItem(k, s); } catch (e) {} }
  };
  const drop = (k) => { delete mem[k]; if (canLS) { try { localStorage.removeItem(k); } catch (e) {} } };
  MESS.storageDrop = drop;
  MESS.storagePersistent = canLS;
  const uid   = () => 'r_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

  MESS.rollFromEmail = function (email) {
    return String(email || '').split('@')[0].replace(/[^a-z0-9]/gi, '').toUpperCase();
  };
  MESS.nameFromEmail = function (email) {
    const local = String(email || '').split('@')[0];
    if (/^[a-z]{2}\d{2}[a-z]+\d+$/i.test(local)) return local.toUpperCase();
    return local.replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  /* ---------- seed data so a fresh demo looks alive ---------- */
  function seedRegistrations(cfg) {
    const branches = ['CS','EE','ME','CE','MA','PH','CY','BT','AI','ES','MS','CH'];
    const years    = ['22','23','24','25'];
    const progs    = ['BTECH','MTECH'];
    const buckets  = MESS.allBuckets(cfg);
    const regs = [];
    const used = {};

    buckets.forEach(function (b) {
      // fill each bucket to a plausible 55–80%
      const target = Math.floor(b.cap * (0.55 + Math.random() * 0.25));
      for (let i = 0; i < target; i++) {
        let roll, guard = 0;
        do {
          roll = branches[(Math.random() * branches.length) | 0]
               + years[(Math.random() * years.length) | 0]
               + progs[Math.random() < 0.75 ? 0 : 1]
               + (11001 + ((Math.random() * 900) | 0));
          guard++;
        } while (used[roll] && guard < 40);
        if (used[roll]) continue;
        used[roll] = 1;

        const mess = cfg.capMode === 'hall'
          ? cfg.messes[(Math.random() * cfg.messes.length) | 0].id
          : b.mess;

        regs.push({
          id: uid(),
          cycle: cfg.cycle,
          email: roll.toLowerCase() + '@' + MESS.EMAIL_DOMAIN,
          roll: roll,
          name: roll,
          mess: mess,
          hall: b.hall,
          bucket: MESS.bucketKey(cfg, mess, b.hall),
          status: 'active',
          seeded: true,
          created_at: new Date(Date.now() - Math.random() * 3 * 864e5).toISOString()
        });
      }
    });
    return regs;
  }

  /* ================= Mock (demo) store ================= */
  function MockStore() {
    this.mode = 'demo';
    this._subs = [];

    try { this._bc = new BroadcastChannel('mess-portal'); } catch (e) { this._bc = null; }
    const self = this;
    if (this._bc) this._bc.onmessage = function () { self._fire(); };
    window.addEventListener('storage', function (e) {
      if (e.key === K.regs || e.key === K.cfg) self._fire();
    });
  }

  MockStore.prototype = {
    async init() {
      let cfg = read(K.cfg, null);
      if (!cfg) { cfg = MESS.defaultConfig(); write(K.cfg, cfg); }
      if (!read(K.seeded, false)) {
        write(K.regs, seedRegistrations(cfg));
        write(K.seeded, true);
      }
      this._startPressure();
      return this;
    },

    /* --- config --- */
    async getConfig() { return read(K.cfg, MESS.defaultConfig()); },
    async setConfig(cfg) { write(K.cfg, cfg); this._broadcast(); this._startPressure(); return cfg; },

    /* --- auth (demo: trust-on-typing, domain enforced) --- */
    async getSession() { return read(K.sess, null); },
    async signIn(email, name) {
      email = String(email || '').trim().toLowerCase();
      if (!email.endsWith('@' + MESS.EMAIL_DOMAIN)) {
        return { ok: false, reason: 'domain' };
      }
      const sess = {
        email: email,
        name: (name && name.trim()) || MESS.nameFromEmail(email),
        roll: MESS.rollFromEmail(email),
        demo: true
      };
      write(K.sess, sess);
      return { ok: true, session: sess };
    },
    async signOut() { drop(K.sess); },

    /* --- counts --- */
    async getCounts(cfg) {
      const regs = read(K.regs, []);
      const out = {};
      MESS.allBuckets(cfg).forEach(b => { out[b.key] = { taken: 0, cap: b.cap }; });
      regs.forEach(function (r) {
        if (r.cycle !== cfg.cycle || r.status !== 'active') return;
        if (!out[r.bucket]) out[r.bucket] = { taken: 0, cap: 0 };
        out[r.bucket].taken++;
      });
      return out;
    },

    async getMine(cfg, email) {
      return read(K.regs, []).find(r =>
        r.cycle === cfg.cycle && r.email === email && r.status === 'active') || null;
    },

    async register(p) {
      const cfg = await this.getConfig();
      if (!MESS.isOpen(cfg)) return { ok: false, reason: 'closed' };

      const regs = read(K.regs, []);
      const mine = regs.find(r => r.cycle === cfg.cycle && r.email === p.email && r.status === 'active');
      if (mine) return { ok: false, reason: 'already', reg: mine };

      const bucket = MESS.bucketKey(cfg, p.mess, p.hall);
      const cap    = MESS.bucketCap(cfg, p.mess, p.hall);
      const taken  = regs.filter(r => r.cycle === cfg.cycle && r.status === 'active' && r.bucket === bucket).length;
      if (taken >= cap) return { ok: false, reason: 'full' };

      const reg = {
        id: uid(), cycle: cfg.cycle,
        email: p.email, roll: p.roll, name: p.name,
        mess: p.mess, hall: p.hall, bucket: bucket,
        status: 'active', created_at: new Date().toISOString()
      };
      regs.push(reg);
      write(K.regs, regs);
      this._broadcast();
      return { ok: true, reg: reg };
    },

    async cancel(id) {
      const regs = read(K.regs, []);
      const r = regs.find(x => x.id === id);
      if (!r) return { ok: false, reason: 'notfound' };
      const cfg = await this.getConfig();
      if (!MESS.isOpen(cfg)) return { ok: false, reason: 'closed' };
      r.status = 'cancelled';
      write(K.regs, regs);
      this._broadcast();
      return { ok: true };
    },

    /* --- staff --- */
    async lookup(cfg, roll) {
      roll = String(roll || '').trim().toUpperCase();
      const regs = read(K.regs, []);
      const hit = regs.find(r => r.cycle === cfg.cycle && r.status === 'active' && r.roll === roll);
      if (hit) return { found: true, reg: hit };
      const other = regs.find(r => r.roll === roll && r.status === 'active');
      return { found: false, otherCycle: other || null };
    },

    async listRegistrations(cfg) {
      return read(K.regs, [])
        .filter(r => r.cycle === cfg.cycle && r.status === 'active')
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    },

    async logScan(entry) {
      const s = read(K.scans, []);
      s.unshift(Object.assign({ at: new Date().toISOString() }, entry));
      write(K.scans, s.slice(0, 400));
      return true;
    },
    async listScans() { return read(K.scans, []); },

    async resetDemo() {
      [K.regs, K.scans, K.sess, K.seeded, K.cfg].forEach(drop);
      await this.init();
      this._broadcast();
    },

    /* --- realtime --- */
    subscribe(fn) { this._subs.push(fn); return () => { this._subs = this._subs.filter(f => f !== fn); }; },
    _fire() { this._subs.forEach(f => { try { f(); } catch (e) {} }); },
    _broadcast() { this._fire(); if (this._bc) { try { this._bc.postMessage('u'); } catch (e) {} } },

    /* --- demo pressure: fake students booking in the background --- */
    async _startPressure() {
      clearInterval(this._pt);
      const cfg = await this.getConfig();
      if (!cfg.demoPressure) return;
      const self = this;
      this._pt = setInterval(async function () {
        const c = await self.getConfig();
        if (!c.demoPressure || !MESS.isOpen(c)) return;
        const buckets = MESS.allBuckets(c);
        const b = buckets[(Math.random() * buckets.length) | 0];
        const counts = await self.getCounts(c);
        if (!counts[b.key] || counts[b.key].taken >= b.cap) return;
        const roll = 'XX' + (24 + ((Math.random() * 2) | 0)) + 'BTECH' + (19000 + ((Math.random() * 999) | 0));
        const regs = read(K.regs, []);
        const mess = c.capMode === 'hall' ? c.messes[(Math.random() * c.messes.length) | 0].id : b.mess;
        regs.push({
          id: uid(), cycle: c.cycle, email: roll.toLowerCase() + '@' + MESS.EMAIL_DOMAIN,
          roll: roll, name: roll, mess: mess, hall: b.hall,
          bucket: MESS.bucketKey(c, mess, b.hall), status: 'active',
          ghost: true, created_at: new Date().toISOString()
        });
        write(K.regs, regs);
        self._broadcast();
      }, 2600);
    }
  };

  /* ================= Supabase (live) store ================= */
  function SupaStore(client) { this.mode = 'live'; this.sb = client; this._subs = []; }

  SupaStore.prototype = {
    async init() {
      const self = this;
      this.sb.channel('cap')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'capacity' }, () => self._fire())
        .subscribe();
      return this;
    },

    async getConfig() {
      const { data } = await this.sb.from('mess_config').select('data').eq('id', 1).single();
      return (data && data.data) || MESS.defaultConfig();
    },
    async setConfig(cfg) {
      await this.sb.from('mess_config').upsert({ id: 1, data: cfg });
      this._fire();
      return cfg;
    },

    async getSession() {
      const { data } = await this.sb.auth.getSession();
      const u = data && data.session && data.session.user;
      if (!u) return null;
      const email = (u.email || '').toLowerCase();
      if (!email.endsWith('@' + MESS.EMAIL_DOMAIN)) { await this.signOut(); return null; }
      return {
        email,
        name: (u.user_metadata && u.user_metadata.full_name) || MESS.nameFromEmail(email),
        roll: MESS.rollFromEmail(email)
      };
    },
    async signIn() {
      await this.sb.auth.signInWithOAuth({
        provider: 'google',
        options: { queryParams: { hd: MESS.EMAIL_DOMAIN }, redirectTo: location.href.split('#')[0] }
      });
      return { ok: true, redirect: true };
    },
    async signOut() { await this.sb.auth.signOut(); },

    async getCounts(cfg) {
      const { data } = await this.sb.from('capacity').select('bucket,cap,taken').eq('cycle', cfg.cycle);
      const out = {};
      MESS.allBuckets(cfg).forEach(b => { out[b.key] = { taken: 0, cap: b.cap }; });
      (data || []).forEach(r => { out[r.bucket] = { taken: r.taken, cap: r.cap }; });
      return out;
    },

    async getMine(cfg, email) {
      const { data } = await this.sb.from('registrations').select('*')
        .eq('cycle', cfg.cycle).eq('email', email).eq('status', 'active').maybeSingle();
      return data || null;
    },

    async register(p) {
      const cfg = await this.getConfig();
      const { data, error } = await this.sb.rpc('register_seat', {
        p_cycle: cfg.cycle, p_mess: p.mess, p_hall: p.hall,
        p_bucket: MESS.bucketKey(cfg, p.mess, p.hall),
        p_roll: p.roll, p_name: p.name
      });
      if (error) return { ok: false, reason: 'error', message: error.message };
      this._fire();
      return data && data.ok ? { ok: true, reg: data.registration } : { ok: false, reason: (data && data.reason) || 'error' };
    },

    async cancel(id) {
      const { data, error } = await this.sb.rpc('cancel_seat', { p_id: id });
      if (error) return { ok: false, reason: 'error', message: error.message };
      this._fire();
      return data && data.ok ? { ok: true } : { ok: false, reason: (data && data.reason) || 'error' };
    },

    async lookup(cfg, roll) {
      roll = String(roll || '').trim().toUpperCase();
      const { data } = await this.sb.from('registrations').select('*')
        .eq('cycle', cfg.cycle).eq('roll', roll).eq('status', 'active').maybeSingle();
      return data ? { found: true, reg: data } : { found: false, otherCycle: null };
    },

    async listRegistrations(cfg) {
      const { data } = await this.sb.from('registrations').select('*')
        .eq('cycle', cfg.cycle).eq('status', 'active').order('created_at', { ascending: false }).limit(5000);
      return data || [];
    },

    async logScan(entry) { await this.sb.from('scans').insert(entry); return true; },
    async listScans() {
      const { data } = await this.sb.from('scans').select('*').order('at', { ascending: false }).limit(300);
      return data || [];
    },
    async resetDemo() { throw new Error('Not available in live mode'); },

    subscribe(fn) { this._subs.push(fn); return () => { this._subs = this._subs.filter(f => f !== fn); }; },
    _fire() { this._subs.forEach(f => { try { f(); } catch (e) {} }); }
  };

  /* ================= factory ================= */
  MESS.openStore = async function () {
    const c = MESS.SUPABASE;
    if (c && c.url && c.anonKey) {
      try {
        const mod = await import('https://esm.sh/@supabase/supabase-js@2');
        const client = mod.createClient(c.url, c.anonKey);
        return await new SupaStore(client).init();
      } catch (e) {
        console.warn('Supabase unavailable, falling back to demo store:', e);
      }
    }
    return await new MockStore().init();
  };
})();
