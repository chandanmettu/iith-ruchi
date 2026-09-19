# IITH Ruchi — Progress & Coming Next

Last updated: 2026-08-19

## Vision

Most IITH mess apps stop at "register once a month." Ruchi is meant to be
opened **every day**, Swiggy/Zomato-style: a clean, fast, food-first
interface where registration is just the front door. Once you're in, the
reason to come back is the daily menu, extra items, cuisine tags, and
calorie info — not a form.

Two loops, one app:

1. **Monthly loop** — register for a mess/dining hall before the window
   closes, see live seat availability, change your choice if allowed.
2. **Daily loop** — open the app to check today's menu per meal/hall, what
   extras are on offer, what cuisine it is, and roughly how many calories
   you're looking at, before you walk over.

## Live today

| Area | Notes |
|---|---|
| Sign-in | `@iith.ac.in` only, Google or a demo-email fallback |
| Mess/hall registration | Tap-to-arm-then-confirm register button (4s window), inline expand/collapse per mess card |
| Live seat counts | Per hostel block / dining hall (UDH / LDH), not per mess |
| Registration pass | Boarding-pass-style confirmation card once registered, with a "change my choice" path |
| Counter verification | Scanner screen, barcode/QR off the existing IITH ID card |
| Admin | Seat caps and registration oversight |
| Visual identity | "Sunrise IITH" language (matches Sanchari/Nivas) — reused, not reinvented |

Backend: demo mode by default (localStorage + seeded data), switches to
Supabase by pasting URL + anon key into `assets/js/config.js`.

## Coming next (priority order)

1. **Daily menu screen** — today's items per meal (breakfast/lunch/snacks/
   dinner) per dining hall. This is the highest-leverage addition: it's the
   difference between a form and an app people open daily.
2. **Extra / à la carte items** — separate from the standard thali, with
   price if applicable.
3. **Cuisine tagging** — South Indian / North Indian / Continental / etc.
   per item or per meal, shown as a glance-able tag or icon.
4. **Calorie / nutrition info** — per item, even approximate, so the app
   answers "what should I eat" not just "what is being served."
5. **Resolve the demo/live dual-backend question** — decide whether launch
   is Supabase from day one or localStorage-first with a later migration.
6. **Resolve per-hall cap assumptions** — confirm with the mess office
   whether UDH/LDH sit under both messes or are tied to specific messes
   (affects whether caps need `capMode: 'grid'`).
7. **Payment/fee status** — not modelled at all yet; decide whether Ruchi
   tracks mess-fee payment status or stays registration-only.
8. Feedback / rating on individual meals — lower priority, after the core
   daily-use loop is live.

## Not started

Rebates/leave-of-absence handling, push notifications for "today's menu is
up," historical menu browsing, nutrition goals/tracking beyond per-item
calories.

## Open questions for Chandan

- Where does menu data come from — manual entry by mess office / admin
  panel, or a weekly upload (spreadsheet/CSV)? This decides the admin build.
- Same UDH/LDH cap-scope and ID-card-barcode questions noted in the README/
  memory — still unconfirmed.
