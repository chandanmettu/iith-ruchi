# Ruchi

Ruchi is IIT Hyderabad's mess-registration and daily dining companion. The
monthly loop covers mess/hall selection, live seat capacity, a registration
pass and counter verification. The daily loop is designed around menus, extra
items, cuisine labels and useful nutrition context.

| | |
|---|---|
| **Live** | [ruchi.iith.online](https://ruchi.iith.online), a **demo**: browser-local data, production Supabase not activated. (Not `mess.iith.online`, which never worked.) |
| **Repository** | `github.com/chandanmettu/iith-ruchi` (public). It was `iith-mess` until 2026-09-19. |
| **Push via** | SSH host alias `github-iith-mess` (deploy key `~/.ssh/iith-mess-deploy`). The alias keeps the old name on purpose. |
| **Deploy** | Hostinger Git auto-deploy from `main`. **A push is a production release.** |
| **Agent policy** | Ask before pushing. |

The distinction matters: the public files are live, but blank Supabase values
in `assets/js/config.js` select the localStorage demo store and seeded demo
data. Do not describe registrations, scans or seat counts as production data
until the backend activation checklist has passed.

## What is built

- institute-domain sign-in flow, with a demo email path when offline
- mess and dining-hall selection with two-step confirmation
- capacity counters and one active registration per cycle
- boarding-pass-style registration confirmation and change/cancel flow
- roll-number lookup, scanner view and scan history for counter staff
- admin interface for registration configuration and oversight
- interchangeable `MockStore` and `SupaStore` data layers
- hardened Supabase schema for atomic seat claims, RLS, staff roles and scans
- daily-menu backend tables for meals, standard/extra items, cuisine,
  calories, protein, price and publication status

The daily-menu database exists, but the student menu screen and admin menu
editor are not built yet.

## Stack and structure

Plain HTML, CSS and JavaScript; there is no build step.

```text
index.html              student registration experience
scanner.html            counter lookup and scan log
admin.html              configuration and registration oversight
assets/js/config.js     public client configuration and demo defaults
assets/js/store.js      localStorage/Supabase data adapter
supabase/schema.sql     idempotent production database/RLS setup
docs/DEPLOY.md          backend activation and release checklist
docs/PROGRESS.md        current state and next work
docs/archive/           preserved pre-deployment narrative
```

## Local preview

```sh
python3 -m http.server 8012
```

Open `http://localhost:8012`. With Supabase values blank, the demo runs entirely
in the browser and can be reset from the admin screen.

## Production activation

Follow [`docs/DEPLOY.md`](docs/DEPLOY.md). In short: create the Supabase
project, run `supabase/schema.sql`, configure Google OAuth and allowed URLs,
bootstrap the first admin, set the project URL and anon key, then test student,
staff, over-capacity and cancellation paths. The service-role key and OAuth
secret must never enter the frontend or Git.

## Product direction

The goal is for it to feel like Swiggy or Zomato, something students open
daily and not once a month. The monthly registration loop is the front door.
The **daily loop** (menu per meal and hall, à la carte extras, cuisine tags,
nutrition) earns the repeat visits and is the highest-leverage work left.
Still open: where menu data comes from (manual entry or a weekly CSV upload).

Visual language: the "Sunrise IITH" identity is shared with Sanchari
(`../Sanchari/assets/app.css`). Reuse it and don't invent a new palette.

## Next

1. Activate and acceptance-test Supabase with a non-production cycle.
2. Confirm whether caps apply per hall, mess or mess-by-hall grid.
3. Build the daily menu reader and admin editor on the new menu tables.
4. Run a small staff/student pilot and document ownership and recovery.

See [`docs/PROGRESS.md`](docs/PROGRESS.md) for the current engineering record
and the workspace [`DEPLOY.md`](../../DEPLOY.md) for the wider release map.
