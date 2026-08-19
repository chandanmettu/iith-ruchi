-- ============================================================
-- IITH Mess Portal — Supabase schema
-- Run this whole file in: Supabase dashboard → SQL Editor → New query
-- ============================================================

-- ---------- config (single row) ----------
create table if not exists mess_config (
  id   int primary key default 1,
  data jsonb not null,
  updated_at timestamptz default now(),
  constraint one_row check (id = 1)
);

-- ---------- capacity: the source of truth for seat caps ----------
-- One row per bucket per cycle. `taken` is incremented atomically.
create table if not exists capacity (
  cycle  text not null,
  bucket text not null,
  cap    int  not null check (cap >= 0),
  taken  int  not null default 0 check (taken >= 0),
  primary key (cycle, bucket)
);

-- ---------- registrations ----------
create table if not exists registrations (
  id         uuid primary key default gen_random_uuid(),
  cycle      text not null,
  email      text not null,
  roll       text not null,
  name       text,
  mess       text not null,
  hall       text not null,
  bucket     text not null,
  status     text not null default 'active',
  created_at timestamptz not null default now()
);

-- one active registration per student per cycle
create unique index if not exists reg_one_active
  on registrations (cycle, email) where status = 'active';

create index if not exists reg_roll on registrations (cycle, roll) where status = 'active';
create index if not exists reg_bucket on registrations (cycle, bucket) where status = 'active';

-- ---------- scan log ----------
create table if not exists scans (
  id      bigserial primary key,
  at      timestamptz not null default now(),
  roll    text not null,
  cycle   text,
  result  text,
  name    text,
  mess    text,
  hall    text,
  station text
);

-- ---------- staff allow-list ----------
create table if not exists staff (
  email text primary key,
  role  text not null default 'counter'   -- 'counter' | 'admin'
);

create or replace function is_staff() returns boolean
language sql stable as $$
  select exists (select 1 from staff where email = lower(auth.jwt() ->> 'email'));
$$;

create or replace function is_admin() returns boolean
language sql stable as $$
  select exists (select 1 from staff where email = lower(auth.jwt() ->> 'email') and role = 'admin');
$$;


-- ============================================================
-- Atomic seat claim.
-- The UPDATE ... WHERE taken < cap is a single row-level locked
-- statement, so 2000 students pressing the button at the same
-- instant can never oversell a hall.
-- ============================================================
create or replace function register_seat(
  p_cycle  text,
  p_mess   text,
  p_hall   text,
  p_bucket text,
  p_roll   text,
  p_name   text
) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_email  text;
  v_domain text := 'iith.ac.in';
  v_cfg    jsonb;
  v_row    registrations;
  v_hit    int;
begin
  v_email := lower(auth.jwt() ->> 'email');
  if v_email is null then
    return json_build_object('ok', false, 'reason', 'auth');
  end if;
  if v_email not like '%@' || v_domain then
    return json_build_object('ok', false, 'reason', 'domain');
  end if;

  select data into v_cfg from mess_config where id = 1;
  if v_cfg is null then
    return json_build_object('ok', false, 'reason', 'noconfig');
  end if;

  -- server-side window check: the client clock is not trusted
  if now() < (v_cfg ->> 'opensAt')::timestamptz
     or now() > (v_cfg ->> 'closesAt')::timestamptz then
    return json_build_object('ok', false, 'reason', 'closed');
  end if;
  if p_cycle is distinct from (v_cfg ->> 'cycle') then
    return json_build_object('ok', false, 'reason', 'cycle');
  end if;

  if exists (select 1 from registrations
             where cycle = p_cycle and email = v_email and status = 'active') then
    return json_build_object('ok', false, 'reason', 'already');
  end if;

  -- claim the seat first, then write the row
  update capacity
     set taken = taken + 1
   where cycle = p_cycle and bucket = p_bucket and taken < cap;
  get diagnostics v_hit = row_count;

  if v_hit = 0 then
    if not exists (select 1 from capacity where cycle = p_cycle and bucket = p_bucket) then
      return json_build_object('ok', false, 'reason', 'nobucket');
    end if;
    return json_build_object('ok', false, 'reason', 'full');
  end if;

  begin
    insert into registrations (cycle, email, roll, name, mess, hall, bucket)
    values (p_cycle, v_email, upper(p_roll), p_name, p_mess, p_hall, p_bucket)
    returning * into v_row;
  exception when unique_violation then
    -- lost a race with the student's own second tab: give the seat back
    update capacity set taken = greatest(0, taken - 1)
     where cycle = p_cycle and bucket = p_bucket;
    return json_build_object('ok', false, 'reason', 'already');
  end;

  return json_build_object('ok', true, 'registration', row_to_json(v_row));
end $$;


-- ---------- release a seat ----------
create or replace function cancel_seat(p_id uuid) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(auth.jwt() ->> 'email');
  v_row   registrations;
  v_cfg   jsonb;
begin
  select data into v_cfg from mess_config where id = 1;
  if now() > (v_cfg ->> 'closesAt')::timestamptz then
    return json_build_object('ok', false, 'reason', 'closed');
  end if;

  update registrations set status = 'cancelled'
   where id = p_id and email = v_email and status = 'active'
  returning * into v_row;

  if v_row.id is null then
    return json_build_object('ok', false, 'reason', 'notfound');
  end if;

  update capacity set taken = greatest(0, taken - 1)
   where cycle = v_row.cycle and bucket = v_row.bucket;

  return json_build_object('ok', true);
end $$;


-- ---------- keep capacity rows in sync with the config ----------
create or replace function sync_capacity() returns void
language plpgsql security definer set search_path = public as $$
declare
  v_cfg   jsonb;
  v_cycle text;
  v_mode  text;
  m jsonb; h jsonb;
  v_key text; v_cap int;
begin
  select data into v_cfg from mess_config where id = 1;
  v_cycle := v_cfg ->> 'cycle';
  v_mode  := coalesce(v_cfg ->> 'capMode', 'hall');

  for m in select * from jsonb_array_elements(v_cfg -> 'messes') loop
    for h in select * from jsonb_array_elements(v_cfg -> 'halls') loop
      if v_mode = 'mess' then
        v_key := 'M:' || (m ->> 'id');
        v_cap := (m ->> 'cap')::int;
      elsif v_mode = 'grid' then
        v_key := 'G:' || (m ->> 'id') || ':' || (h ->> 'id');
        v_cap := ((h ->> 'cap')::int) / greatest(1, jsonb_array_length(v_cfg -> 'messes'));
      else
        v_key := 'H:' || (h ->> 'id');
        v_cap := (h ->> 'cap')::int;
      end if;

      insert into capacity (cycle, bucket, cap, taken)
      values (v_cycle, v_key, v_cap, 0)
      on conflict (cycle, bucket) do update set cap = excluded.cap;
    end loop;
  end loop;
end $$;

create or replace function on_config_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform sync_capacity();
  return new;
end $$;

drop trigger if exists trg_config_sync on mess_config;
create trigger trg_config_sync after insert or update on mess_config
for each row execute function on_config_change();


-- ============================================================
-- Row level security
-- ============================================================
alter table mess_config   enable row level security;
alter table capacity      enable row level security;
alter table registrations enable row level security;
alter table scans         enable row level security;
alter table staff         enable row level security;

-- everyone signed in can read the config and the live counters
drop policy if exists cfg_read on mess_config;
create policy cfg_read on mess_config for select to authenticated using (true);

drop policy if exists cfg_write on mess_config;
create policy cfg_write on mess_config for all to authenticated
  using (is_admin()) with check (is_admin());

drop policy if exists cap_read on capacity;
create policy cap_read on capacity for select to authenticated using (true);

-- students see only their own registration; staff see all
drop policy if exists reg_read on registrations;
create policy reg_read on registrations for select to authenticated
  using (email = lower(auth.jwt() ->> 'email') or is_staff());

-- inserts happen only through register_seat() (security definer)
drop policy if exists reg_no_direct on registrations;
create policy reg_no_direct on registrations for insert to authenticated with check (false);

drop policy if exists scan_rw on scans;
create policy scan_rw on scans for all to authenticated
  using (is_staff()) with check (is_staff());

drop policy if exists staff_read on staff;
create policy staff_read on staff for select to authenticated using (true);


-- ============================================================
-- Bootstrap: seed the config row, then sync capacity
-- Edit the JSON below to match your real messes / halls / caps.
-- ============================================================
insert into mess_config (id, data) values (1, '{
  "cycle": "2026-08",
  "cycleLabel": "August 2026",
  "opensAt":  "2026-07-25T10:00:00+05:30",
  "closesAt": "2026-08-02T23:59:00+05:30",
  "capMode": "hall",
  "allowChange": true,
  "messes": [
    {"id":"A","name":"Mess A","tag":"Legacy","accent":"primary","cap":1400,
     "blurb":"The original mess — familiar menu, familiar crowd."},
    {"id":"B","name":"Mess B","tag":"New","accent":"good","cap":1400,
     "blurb":"The new block — refreshed kitchen, revised menu."}
  ],
  "halls": [
    {"id":"UDH","name":"Upper Dining Hall","accent":"primary","cap":1000},
    {"id":"LDH","name":"Lower Dining Hall","accent":"good","cap":1000}
  ]
}'::jsonb)
on conflict (id) do nothing;

select sync_capacity();

-- Add yourself as admin, and the counter staff:
-- insert into staff (email, role) values ('you@iith.ac.in', 'admin');
-- insert into staff (email, role) values ('messa.counter@iith.ac.in', 'counter');


-- ============================================================
-- Google sign-in setup (dashboard, not SQL):
--   Authentication → Providers → Google → enable, paste client id/secret
--   Authentication → URL Configuration → add your site URL
-- The portal also passes hd=iith.ac.in, and register_seat() rejects
-- any email outside the domain server-side.
-- ============================================================
