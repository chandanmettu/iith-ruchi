# Ruchi

Ruchi is IIT Hyderabad’s daily mess companion: the next seven days of menus,
meal timings, saved dishes and a simple way to report an issue.

| | |
|---|---|
| **Live** | [ruchi.iith.online](https://ruchi.iith.online), daily dining beta; registration backend not activated. |
| **Repository** | `github.com/chandanmettu/iith-ruchi` (public). It was `iith-mess` until 2026-09-19. |
| **Push via** | SSH host alias `github-iith-mess` (deploy key `~/.ssh/iith-mess-deploy`). The alias keeps the old name on purpose. |
| **Deploy** | Hostinger Git auto-deploy from `main`. **A push is a production release.** |
| **Agent policy** | Ask before pushing. |

## Daily dining beta

`index.html` and `today.html` serve the same daily-menu app, without login.
The supplied August 2026 menu drives both messes. Dates automatically resolve
the four-week rotation; students never choose week numbers. Vegetarian and
non-vegetarian markers, card/list views and browser-local saved dishes are active.

Breakfast runs 7:30–10:00 am on weekdays and 7:30–10:30 am on weekends;
lunch 12:30–2:45 pm; snacks 5:00–6:00 pm; dinner 7:30–9:30 pm (Asia/Kolkata).
Automatic meal selection and the countdown use those hours and the selected date.
All source explanations live in the initially collapsed Menu notes.

Reports select Mess A/B, date, meal, issue and description, with an optional
photo. Drafts stay in IndexedDB on the device. Review opens an email addressed
to the mess secretary; photo reports can download an attached-image `.eml`.
Students complete sending in their mail client. There is no automatic sending,
server-side complaint inbox or delivery confirmation.

The interface uses locally hosted Outfit, a warm textured gradient, glass
surfaces and short meal-icon gestures. Reduced motion/transparency are supported.
The interface uses light Espresso by default, Basil green for
Vegetarian and Paprika red for Egg / non-veg, with smooth palette transitions.
All dishes and Saved return to Espresso. Dark mode is deferred.
Phones use two card columns, portrait tablets three, and wider screens four;
list views adapt separately. Images are illustrative; credits are linked from notes.

## Structure

Plain HTML, CSS and JavaScript, with no build step.

```text
index.html / today.html          daily dining app
register.html                   preserved registration prototype
scanner.html / admin.html        registration staff prototypes
assets/data/menu-august-2026.json source-backed menu and service hours
assets/data/menu-notices.json    dated special announcements (currently empty)
assets/js/menu.js                menu browsing, saved dishes and daily plate
assets/js/plate.js               plate rendering and entered-nutrition totals
assets/css/plate.css             optional tracking controls and plate sheet
assets/js/meal-context.js        India-time schedule and countdown
assets/js/beta-features.js       reports, drafts and roadmap sheets
assets/js/email-draft.js         attached-photo email file generation
assets/css/flagship.css          shared final app design and breakpoints
menu-photo-credits.html          photo attribution and illustration disclosure
supabase/schema.sql             future registration/menu backend
```

Keep `index.html` and `today.html` identical when updating the menu shell.
Keep CSS/JS cache keys in both pages in sync. Only final app assets ship;
earlier local design explorations and original oversized artwork are not part
of the public release.

## Preview and deployment

Serve this folder with a static HTTP server on port 8012. Open
`http://localhost:8012/` for the app, or `/register.html` for registration.
Review exact staged files before committing; pushing `main` publishes through
Hostinger. Verify the actual public URLs after deployment.

## Roadmap

1. Original photographs of the food served in the mess.
2. A standalone iPhone/Android app, planned for the App Store and Google Play.
3. Dish-specific nutrition, profiles with Google login, history/streaks, feedback
   and report tracking. These are planned, with no promised release dates.

Optional tracking is available as **Plate mode** and **My Plate**.
The dock opens today's plate across meals, with half-portion adjustments,
removal and browser-local persistence. Future menu dates cannot be logged as
eaten. Calories, protein, carbs and fat total the optional per-portion values
entered by the student; coverage labels identify partial totals. The source
menu contains no nutrition data, so automatic estimates are not populated yet.
Plate entries stay on the device. Nutrition is not invented.
Wednesday fruit rotation remains ambiguous in the source and is withheld.
See [menu interpretation](docs/WEEKLY_MENU.md) and [progress](docs/PROGRESS.md).

## Registration backend

`register.html`, scanner and admin retain the earlier localStorage demo.
Blank Supabase client settings intentionally select demo data. Production
registration, OAuth, capacity enforcement and staff roles are not activated.
Follow [the backend activation checklist](docs/DEPLOY.md) before claiming those
services work with real users. Never ship service-role keys or OAuth secrets.
