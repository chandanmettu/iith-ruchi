-- ============================================================
-- Ruchi — production Supabase schema
-- New project: run this whole file in the Supabase SQL editor.
-- Existing project: back it up, then rerun this idempotent file.
-- No service-role key belongs in the browser or this repository.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.mess_config (
  id int primary key default 1,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  constraint one_row check (id = 1)
);

create table if not exists public.capacity (
  cycle text not null,
  bucket text not null,
  cap int not null constraint capacity_cap_nonnegative check (cap >= 0),
  taken int not null default 0
    constraint capacity_taken_within_cap check (taken >= 0 and taken <= cap),
  primary key (cycle, bucket)
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  cycle text not null,
  email text not null,
  roll text not null,
  name text,
  mess text not null,
  hall text not null,
  bucket text not null,
  status text not null default 'active'
    constraint registrations_status_allowed check (status in ('active', 'cancelled')),
  created_at timestamptz not null default now()
);

create unique index if not exists reg_one_active
  on public.registrations (cycle, email) where status = 'active';
create index if not exists reg_roll
  on public.registrations (cycle, roll) where status = 'active';
create index if not exists reg_bucket
  on public.registrations (cycle, bucket) where status = 'active';

create table if not exists public.scans (
  id bigserial primary key,
  at timestamptz not null default now(),
  roll text not null,
  cycle text,
  result text,
  name text,
  mess text,
  hall text,
  station text
);

create table if not exists public.staff (
  email text primary key,
  role text not null default 'counter'
    constraint staff_role_allowed check (role in ('counter', 'admin'))
);

create table if not exists public.menu_days (
  id uuid primary key default gen_random_uuid(),
  service_date date not null,
  hall text not null,
  published boolean not null default false,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service_date, hall)
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  menu_day_id uuid not null references public.menu_days(id) on delete cascade,
  meal text not null check (meal in ('breakfast', 'lunch', 'snacks', 'dinner')),
  name text not null check (char_length(trim(name)) between 1 and 120),
  kind text not null default 'standard' check (kind in ('standard', 'extra')),
  cuisine text,
  calories_kcal int check (calories_kcal is null or calories_kcal >= 0),
  protein_g numeric(6,2) check (protein_g is null or protein_g >= 0),
  price_inr numeric(8,2) check (price_inr is null or price_inr >= 0),
  available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_days_date_hall
  on public.menu_days (service_date, hall);
create index if not exists menu_items_day_meal
  on public.menu_items (menu_day_id, meal, sort_order, name);

create or replace function public.current_email() returns text
language sql stable security definer
set search_path = public, pg_temp as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer
set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.staff where email = public.current_email()
  );
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer
set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.staff
    where email = public.current_email() and role = 'admin'
  );
$$;

create or replace function public.sync_capacity() returns void
language plpgsql security definer
set search_path = public, pg_temp as $$
declare
  v_cfg jsonb;
  v_cycle text;
  v_mode text;
  m jsonb;
  h jsonb;
  v_key text;
  v_cap int;
  v_taken int;
  v_keys text[] := array[]::text[];
begin
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'admin access required';
  end if;

  select data into v_cfg from public.mess_config where id = 1;
  if v_cfg is null then
    raise exception 'mess configuration is missing';
  end if;

  v_cycle := v_cfg ->> 'cycle';
  v_mode := coalesce(v_cfg ->> 'capMode', 'hall');
  if v_cycle is null or v_mode not in ('hall', 'mess', 'grid') then
    raise exception 'invalid mess configuration';
  end if;

  if exists (
    select 1 from public.registrations r
    where r.cycle = v_cycle and r.status = 'active'
      and (
        not exists (
          select 1
          from jsonb_array_elements(coalesce(v_cfg -> 'messes', '[]'::jsonb)) as x(value)
          where x.value ->> 'id' = r.mess
        )
        or not exists (
          select 1
          from jsonb_array_elements(coalesce(v_cfg -> 'halls', '[]'::jsonb)) as x(value)
          where x.value ->> 'id' = r.hall
        )
      )
  ) then
    raise exception 'configuration removes a mess or hall used by an active registration';
  end if;

  update public.registrations r
  set bucket = case v_mode
    when 'mess' then 'M:' || r.mess
    when 'grid' then 'G:' || r.mess || ':' || r.hall
    else 'H:' || r.hall
  end
  where r.cycle = v_cycle and r.status = 'active';

  for m in select * from jsonb_array_elements(coalesce(v_cfg -> 'messes', '[]'::jsonb)) loop
    for h in select * from jsonb_array_elements(coalesce(v_cfg -> 'halls', '[]'::jsonb)) loop
      if v_mode = 'mess' then
        v_key := 'M:' || (m ->> 'id');
        v_cap := (m ->> 'cap')::int;
      elsif v_mode = 'grid' then
        v_key := 'G:' || (m ->> 'id') || ':' || (h ->> 'id');
        v_cap := ((h ->> 'cap')::int) /
          greatest(1, jsonb_array_length(v_cfg -> 'messes'));
      else
        v_key := 'H:' || (h ->> 'id');
        v_cap := (h ->> 'cap')::int;
      end if;

      v_keys := array_append(v_keys, v_key);
      select count(*)::int into v_taken
      from public.registrations
      where cycle = v_cycle and bucket = v_key and status = 'active';

      insert into public.capacity (cycle, bucket, cap, taken)
      values (v_cycle, v_key, greatest(v_cap, v_taken), v_taken)
      on conflict (cycle, bucket) do update
        set cap = greatest(excluded.cap, v_taken), taken = v_taken;
    end loop;
  end loop;

  if cardinality(v_keys) = 0 then
    raise exception 'configuration must contain at least one mess and hall';
  end if;

  delete from public.capacity
  where cycle = v_cycle and not (bucket = any(v_keys));
end;
$$;

create or replace function public.on_config_change() returns trigger
language plpgsql security definer
set search_path = public, pg_temp as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.after_config_change() returns trigger
language plpgsql security definer
set search_path = public, pg_temp as $$
begin
  perform public.sync_capacity();
  return new;
end;
$$;

drop trigger if exists trg_config_timestamp on public.mess_config;
create trigger trg_config_timestamp before update on public.mess_config
for each row execute function public.on_config_change();

drop trigger if exists trg_config_sync on public.mess_config;
create trigger trg_config_sync after insert or update on public.mess_config
for each row execute function public.after_config_change();

create or replace function public.touch_updated_at() returns trigger
language plpgsql security definer
set search_path = public, pg_temp as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_menu_days_timestamp on public.menu_days;
create trigger trg_menu_days_timestamp before update on public.menu_days
for each row execute function public.touch_updated_at();

drop trigger if exists trg_menu_items_timestamp on public.menu_items;
create trigger trg_menu_items_timestamp before update on public.menu_items
for each row execute function public.touch_updated_at();

-- p_bucket and p_roll stay in this signature for frontend compatibility, but
-- the server derives both from trusted configuration and authenticated email.
create or replace function public.register_seat(
  p_cycle text,
  p_mess text,
  p_hall text,
  p_bucket text,
  p_roll text,
  p_name text
) returns json
language plpgsql security definer
set search_path = public, pg_temp as $$
declare
  v_email text := public.current_email();
  v_roll text;
  v_name text;
  v_cfg jsonb;
  v_mess jsonb;
  v_hall jsonb;
  v_mode text;
  v_bucket text;
  v_row public.registrations;
  v_hit int;
begin
  if v_email = '' then
    return json_build_object('ok', false, 'reason', 'auth');
  end if;
  if v_email !~ '^[a-z0-9._%+-]+@iith[.]ac[.]in$' then
    return json_build_object('ok', false, 'reason', 'domain');
  end if;

  v_roll := upper(regexp_replace(split_part(v_email, '@', 1), '[^a-z0-9]', '', 'gi'));
  if v_roll = '' then
    return json_build_object('ok', false, 'reason', 'identity');
  end if;
  v_name := left(coalesce(
    nullif(trim(auth.jwt() -> 'user_metadata' ->> 'full_name'), ''),
    nullif(trim(p_name), ''),
    v_roll
  ), 120);

  select data into v_cfg from public.mess_config where id = 1;
  if v_cfg is null then
    return json_build_object('ok', false, 'reason', 'noconfig');
  end if;
  if nullif(v_cfg ->> 'opensAt', '') is null
     or nullif(v_cfg ->> 'closesAt', '') is null then
    return json_build_object('ok', false, 'reason', 'config');
  end if;
  if now() < (v_cfg ->> 'opensAt')::timestamptz
     or now() > (v_cfg ->> 'closesAt')::timestamptz then
    return json_build_object('ok', false, 'reason', 'closed');
  end if;
  if p_cycle is distinct from (v_cfg ->> 'cycle') then
    return json_build_object('ok', false, 'reason', 'cycle');
  end if;

  select elem.value into v_mess
  from jsonb_array_elements(coalesce(v_cfg -> 'messes', '[]'::jsonb)) as elem(value)
  where elem.value ->> 'id' = p_mess limit 1;
  select elem.value into v_hall
  from jsonb_array_elements(coalesce(v_cfg -> 'halls', '[]'::jsonb)) as elem(value)
  where elem.value ->> 'id' = p_hall limit 1;
  if v_mess is null or v_hall is null then
    return json_build_object('ok', false, 'reason', 'selection');
  end if;

  v_mode := coalesce(v_cfg ->> 'capMode', 'hall');
  if v_mode = 'mess' then
    v_bucket := 'M:' || (v_mess ->> 'id');
  elsif v_mode = 'grid' then
    v_bucket := 'G:' || (v_mess ->> 'id') || ':' || (v_hall ->> 'id');
  elsif v_mode = 'hall' then
    v_bucket := 'H:' || (v_hall ->> 'id');
  else
    return json_build_object('ok', false, 'reason', 'config');
  end if;

  if exists (
    select 1 from public.registrations
    where cycle = p_cycle and email = v_email and status = 'active'
  ) then
    return json_build_object('ok', false, 'reason', 'already');
  end if;

  update public.capacity set taken = taken + 1
  where cycle = p_cycle and bucket = v_bucket and taken < cap;
  get diagnostics v_hit = row_count;

  if v_hit = 0 then
    if not exists (
      select 1 from public.capacity where cycle = p_cycle and bucket = v_bucket
    ) then
      return json_build_object('ok', false, 'reason', 'nobucket');
    end if;
    return json_build_object('ok', false, 'reason', 'full');
  end if;

  begin
    insert into public.registrations
      (cycle, email, roll, name, mess, hall, bucket)
    values
      (p_cycle, v_email, v_roll, v_name, p_mess, p_hall, v_bucket)
    returning * into v_row;
  exception when unique_violation then
    update public.capacity set taken = greatest(0, taken - 1)
    where cycle = p_cycle and bucket = v_bucket;
    return json_build_object('ok', false, 'reason', 'already');
  end;

  return json_build_object('ok', true, 'registration', row_to_json(v_row));
end;
$$;

create or replace function public.cancel_seat(p_id uuid) returns json
language plpgsql security definer
set search_path = public, pg_temp as $$
declare
  v_email text := public.current_email();
  v_row public.registrations;
  v_cfg jsonb;
begin
  if v_email = '' then
    return json_build_object('ok', false, 'reason', 'auth');
  end if;

  select data into v_cfg from public.mess_config where id = 1;
  if v_cfg is null then
    return json_build_object('ok', false, 'reason', 'noconfig');
  end if;
  if not coalesce((v_cfg ->> 'allowChange')::boolean, false)
     or now() < (v_cfg ->> 'opensAt')::timestamptz
     or now() > (v_cfg ->> 'closesAt')::timestamptz then
    return json_build_object('ok', false, 'reason', 'closed');
  end if;

  update public.registrations set status = 'cancelled'
  where id = p_id and email = v_email and status = 'active'
  returning * into v_row;

  if v_row.id is null then
    return json_build_object('ok', false, 'reason', 'notfound');
  end if;

  update public.capacity set taken = greatest(0, taken - 1)
  where cycle = v_row.cycle and bucket = v_row.bucket;
  return json_build_object('ok', true);
end;
$$;

alter table public.mess_config enable row level security;
alter table public.capacity enable row level security;
alter table public.registrations enable row level security;
alter table public.scans enable row level security;
alter table public.staff enable row level security;
alter table public.menu_days enable row level security;
alter table public.menu_items enable row level security;

drop policy if exists cfg_read on public.mess_config;
create policy cfg_read on public.mess_config for select to anon, authenticated using (true);
drop policy if exists cfg_write on public.mess_config;
create policy cfg_write on public.mess_config for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists cap_read on public.capacity;
create policy cap_read on public.capacity for select to anon, authenticated using (true);

drop policy if exists reg_read on public.registrations;
create policy reg_read on public.registrations for select to authenticated
  using (email = public.current_email() or public.is_staff());
drop policy if exists reg_no_direct on public.registrations;
create policy reg_no_direct on public.registrations for insert to authenticated
  with check (false);

drop policy if exists scan_rw on public.scans;
drop policy if exists scan_read on public.scans;
create policy scan_read on public.scans for select to authenticated
  using (public.is_staff());
drop policy if exists scan_insert on public.scans;
create policy scan_insert on public.scans for insert to authenticated
  with check (public.is_staff());
drop policy if exists scan_delete on public.scans;
create policy scan_delete on public.scans for delete to authenticated
  using (public.is_admin());

drop policy if exists staff_read on public.staff;
create policy staff_read on public.staff for select to authenticated
  using (email = public.current_email() or public.is_admin());
drop policy if exists staff_admin_write on public.staff;
create policy staff_admin_write on public.staff for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists menu_days_read on public.menu_days;
create policy menu_days_read on public.menu_days for select to authenticated
  using (published or public.is_staff());
drop policy if exists menu_days_admin on public.menu_days;
create policy menu_days_admin on public.menu_days for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists menu_items_read on public.menu_items;
create policy menu_items_read on public.menu_items for select to authenticated
  using (exists (
    select 1 from public.menu_days d
    where d.id = menu_day_id and (d.published or public.is_staff())
  ));
drop policy if exists menu_items_admin on public.menu_items;
create policy menu_items_admin on public.menu_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Supabase normally grants broad table privileges and lets RLS narrow them.
-- Make the intended API surface explicit so a future default cannot widen it.
revoke all on table public.mess_config, public.capacity,
  public.registrations, public.scans, public.staff,
  public.menu_days, public.menu_items from anon, authenticated;

grant select on table public.mess_config, public.capacity to anon, authenticated;
grant insert, update, delete on table public.mess_config to authenticated;
grant select on table public.registrations to authenticated;
grant select, insert, delete on table public.scans to authenticated;
grant select, insert, update, delete on table public.staff to authenticated;
grant select, insert, update, delete on table public.menu_days, public.menu_items
  to authenticated;
grant usage, select on sequence public.scans_id_seq to authenticated;

revoke all on function public.current_email() from public, anon;
revoke all on function public.is_staff() from public, anon;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.sync_capacity() from public, anon, authenticated;
revoke all on function public.on_config_change() from public, anon, authenticated;
revoke all on function public.after_config_change() from public, anon, authenticated;
revoke all on function public.touch_updated_at() from public, anon, authenticated;
revoke all on function public.register_seat(text, text, text, text, text, text) from public, anon;
revoke all on function public.cancel_seat(uuid) from public, anon;

grant execute on function public.current_email() to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.register_seat(text, text, text, text, text, text) to authenticated;
grant execute on function public.cancel_seat(uuid) to authenticated;

insert into public.mess_config (id, data) values (1, '{
  "cycle": "2026-09",
  "cycleLabel": "September 2026",
  "opensAt": "2026-09-01T10:00:00+05:30",
  "closesAt": "2026-09-08T23:59:00+05:30",
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

select public.sync_capacity();

-- `create table if not exists` does not add constraints to an older table.
-- Add/validate them after the capacity reconciliation above has repaired any
-- stale counter-to-cap relationship.
do $constraints$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.capacity'::regclass
      and conname = 'capacity_taken_within_cap'
  ) then
    alter table public.capacity add constraint capacity_taken_within_cap
      check (taken >= 0 and taken <= cap) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.registrations'::regclass
      and conname = 'registrations_status_allowed'
  ) then
    alter table public.registrations add constraint registrations_status_allowed
      check (status in ('active', 'cancelled')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.staff'::regclass
      and conname = 'staff_role_allowed'
  ) then
    alter table public.staff add constraint staff_role_allowed
      check (role in ('counter', 'admin')) not valid;
  end if;
end;
$constraints$;

alter table public.capacity validate constraint capacity_taken_within_cap;
alter table public.registrations validate constraint registrations_status_allowed;
alter table public.staff validate constraint staff_role_allowed;

-- Bootstrap the first admin in the SQL editor, then manage the allow-list in
-- the admin UI or SQL editor. Never put real addresses in this repository:
-- insert into public.staff (email, role) values ('admin@iith.ac.in', 'admin');

-- Dashboard work still required:
-- 1. Enable Google Auth and configure its client ID/secret.
-- 2. Add the production URL and local preview URL to Auth URL Configuration.
-- 3. Put only the project URL and anon key in assets/js/config.js.
