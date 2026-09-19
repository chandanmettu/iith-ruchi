# Ruchi — current progress

Last updated: **2026-09-05**

This file describes the current product only. The earlier pre-deployment
vision and backlog are preserved verbatim in
[`archive/PRE_DEPLOYMENT_PROGRESS.md`](archive/PRE_DEPLOYMENT_PROGRESS.md).

## Current state

Ruchi's frontend is deployed at <https://ruchi.iith.online>. It currently runs
the demo/localStorage backend because `assets/js/config.js` does not contain a
Supabase project URL or anon key. The visible registration, scanner and admin
flows work as a product demonstration; their data is browser-local and is not
an institute registration record.

## 2026-09-05 — backend foundation and documentation reset

- Reworked `supabase/schema.sql` into an idempotent production schema.
- Kept seat claims atomic, but stopped trusting the browser-supplied roll and
  capacity bucket. The function now derives the roll from the authenticated
  institute email, validates the selected mess/hall against server config, and
  derives the capacity bucket server-side.
- Config changes now re-bucket active registrations and recompute counters;
  removing a mess/hall that still has active registrations is rejected instead
  of silently corrupting capacity.
- Escaped student/configuration values in the boarding pass and selection-card
  HTML path so a stored display value cannot become markup.
- Supabase reads/writes now surface RLS/network errors instead of silently
  showing empty data or a false “saved” state during activation testing.
- Made staff/admin helpers `SECURITY DEFINER` with a locked search path so RLS
  checks can safely inspect the staff allow-list.
- Replaced broad scan-log mutation access with staff read/insert and admin-only
  delete policies; restricted staff-directory reads to self/admin.
- Added explicit function grants and revoked anonymous/public RPC execution.
- Added `menu_days` and `menu_items` with publication state, meal, standard vs
  extra item, cuisine, calorie, protein, price and availability fields.
- Aligned demo grid-capacity rounding with PostgreSQL integer division.
- Added `docs/DEPLOY.md` and rewrote the README so “deployed frontend” is not
  confused with “production backend active.”

The schema has been reviewed locally but has not been applied to a live
Supabase project in this workspace; no project credentials were available or
added.

## Built and deployed

- responsive student registration UI
- demo institute-domain sign-in
- mess/hall selection, seat counts and registration confirmation
- cancel/change path while the configured window is open
- scanner/counter lookup and scan history interfaces
- admin configuration and registration views
- localStorage demo adapter and Supabase adapter

## Backend ready in source, not activated

- Google-authenticated institute accounts
- atomic one-registration-per-cycle seat claims
- RLS-protected registrations, capacity, scans and staff roles
- daily-menu storage and publication controls

## Next, in order

1. Create/select the owned Supabase project and apply the schema.
2. Configure Google OAuth, redirect URLs and the first admin outside Git.
3. Set accurate mess/hall/capacity data and test all three cap modes.
4. Run the acceptance checklist in `DEPLOY.md`; only then switch the public
   status from demo to production-backed.
5. Build the daily menu reader, then the admin menu editor or CSV workflow.
6. Pilot with a small student/staff group before a full registration cycle.

Open product decisions: source/owner of menu data, confirmed cap scope, staff
ownership/handover and whether fee status belongs in Ruchi at all.
