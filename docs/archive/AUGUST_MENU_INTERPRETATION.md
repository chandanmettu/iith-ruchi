# Weekly menu: August 2026 revision

2026-09-22 · Daily dining beta · `index.html` / `today.html`

## Current direction

The daily dining beta uses the final glass UI with illustrative food photos,
a vertical seven-day date picker and card/list browsing. Measure is hidden.
See `PROGRESS.md` for current release scope and `README.md` for entry points.

## Source and transcription

Input: `menu revision august 2026 - Sheet1.pdf`, one landscape page, supplied by
Chandan. Extracted with pdfplumber and pypdf and visually reviewed after rendering.
The normalized data is `assets/data/menu-august-2026.json`. It retains the input
SHA-256, original table cells and a recovered Wednesday breakfast text string for
traceability. The source PDF remains in Downloads; no original file was modified.

Coverage: seven days × breakfast/lunch/snacks/dinner, daily staples, Week 1/3 vs
2/4 variants, beverage rotations, egg/paneer/chicken alternatives, source quantity
notes, accompaniments, fruit, sweets, chutneys and ingredients where stated.
160 day-specific entries and 20 shared entries represent the source. These are
menu records, not counts of unique recipes or meals served.

Wednesday breakfast visually overflows its cell. The PDF text stream reads
“pav bajji (lemons+onions) and semiya upma”. Both dishes are preserved; Pav bhaji is
the normalized display spelling. Routine dish-name typos have been normalized,
with the raw source preserved. Empty snack-food cells have not been filled with
invented snacks: that meal currently lists the supplied beverages only.

Daily staples are merged with each day's rows, deduplicating exact item IDs.
The Sunday corn portion remains unspecified: the header's 50 g reference names
chana/peanuts/sprouts, whereas the Sunday row explicitly specifies corn.
Explicit portion references are not enforced limits. The 200 g chicken / 100 g
paneer reference belongs to the biryani ingredient, not the entire biryani weight.

## Unconfirmed source details

1. **Meal times:** absent from the PDF; the owner supplied the confirmed hours
   on 22 September (see schedule below).
2. **Rotation mapping:** Chandan subsequently said to start Week 1 from the
   month and continue. Implemented as date blocks 1–7 / 8–14 / 15–21 / 22–28,
   with 29–31 cycling to Week 1 and each month restarting. The fifth-week
   interpretation was explicitly communicated and can be changed in data config.
3. **Wednesday fruit:** source says papaya Weeks 1/3 and muskmelon Weeks 3/4.
   Preserve both in source data, but withhold this ambiguous fruit entry from
   the student menu and show a short confirmation-pending note. Do not silently
   change 3/4 to 2/4.
4. **Tuesday sambar:** source says “Radish or Louki Sambar (Radish)”. Preserve the
   radish/lauki choice and its source wording.
5. **Nutrition:** no kcal/protein values or complete recipe weights. All nutrition
   fields are null; the UI displays unavailable, never zero or fixture estimates.
6. Some chutneys, alternating papad/fryums and pickles are not assigned exact
   varieties. Preserve that lack of specificity. Friday dinner has daily fresh
   chutney in the header but no named variety in its row.

Wednesday fruit remains unconfirmed. The monthly rotation rule and confirmed
service hours have been applied.

## Implementation

- `today.html`: unified weekly menu, card/list switch, Measure and dialogs.
- `assets/css/flagship.css`: final glass UI and responsive card/list layouts.
- `assets/js/menu.js`: source loading, filtering, date controls, logging.
- `assets/data/menu-august-2026.json`: source-backed content, independent of UI.
- `assets/icons/`: selected Lucide SVGs and their original licence.

The date strip always starts today and includes six following dates. No previous/
next calendar-week browsing, rotation selector or week labels remain in student
UI. The selected date determines the rotation using `assets/js/menu-rotation.js`
and `rotationRule` in the menu JSON. Normal alternatives (egg vs paneer, for
example) remain real food choices, not schedule choices. Unknown rotation config
withholds rotating items rather than showing incompatible variants together.
Layout switching preserves the selected menu and measurement state.
Only layout preference is persistent; the UI starts with Measure off.

Measure records the selected date, meal, exact option and a self-reported portion
count. Alternative groups require choosing an option before saving. Editing an
existing portion replaces its count; other chosen alternatives can coexist.
There is no product portion cap. Unknown portion weights are not manufactured.

Logs are local to `ruchi.menu-intake.v2.YYYY-MM-DD` and independent of the older
sample-nutrition diary and registration demo. Counts are not calorie estimates.
The current date's log is not affected by browsing/logging a different date.
No backend, authentication, production configuration or registration flow changed.

## Validation

- All 28 day/meal screens populated in browser checks.
- Every entry references an existing local icon; weekly variants use only 1–4;
  no duplicated day-meal item IDs; every nutrition field remains null.
- Automatic rotation: September 21 shows fried idli (Week 3); September 22
  dinner shows jeera rice (Week 4), without the Week 1/3 fried rice.
- Checked dates 1, 7, 8, 15, 21, 22, 28, 29, 30, 31 and next-month reset.
- Exactly seven dates render; no rotation selector or week labels remain.
- Wednesday Week 2 dinner offers pepper egg curry or paneer butter masala;
  saving stays disabled until an explicit choice is selected.
- Chosen paneer option with 1.5 portions persists after reload, remains on
  Wednesday, and is absent from Tuesday. Test log cleared after verification.
- Card/list views checked at desktop and mobile widths; both fit at 320 px.
- Fixed expanded Measure controls overlapping subsequent list rows; rechecked
  real pointer hit areas and the choice flow.
- JavaScript syntax and Git whitespace checks pass.

## Next

Original mess photographs are next, then a standalone mobile app. Resolve the
remaining Wednesday fruit ambiguity. Nutrition needs a documented recipe/serving
source before totals can be introduced. The daily-menu beta is approved for release;
backend registration activation is a separate task.

## Selected UI

The final local `today.html` blends the user-selected Aura, Apricot and Grove
concepts: compact date popover, Apricot palette and horizontal meal tiles, clean
list rows and optional card view. See `docs/PROGRESS.md` for validation. Menu
source interpretation, rotation and intake storage are unchanged.


## Current beta surface (2026-09-22)

Measure is temporarily hidden/disabled on `today.html`; previously recorded logs
are preserved. Upcoming documents tracking, profile/Google login, streaks and
feedback as future features. Report currently composes email to the owner-supplied
mess secretary address after a user review; it does not create backend tickets.

Special-dinner notices use `assets/data/menu-notices.json`: a row with `kind` set
to `special`, a specific ISO `date`, `title`, `message`, and optional `meal`.
They appear above meal navigation only for that date and meal. Keep the file empty
unless an actual announcement is supplied; do not fabricate live service notices.


## Confirmed service schedule — 2026-09-22

Owner supplied timings now replace the provisional schedule: breakfast 7:30–10:00
am Monday–Friday and 7:30–10:30 am Saturday/Sunday; lunch 12:30–2:45 pm;
snacks 5:00–6:00 pm; dinner 7:30–9:30 pm. All times use Asia/Kolkata.
`meal-context.js` resolves breakfast hours from the selected date for labels and
countdowns, and from the current campus date for automatic meal selection.
The menu JSON records the owner-supplied schedule separately from PDF provenance;
the obsolete missing-timings issue and confirmation notice are removed.
Verified 17 boundary/weekend/auto-selection/countdown checks and browser date
switching (Saturday 10:30 am, Monday 10:00 am). Included in the daily-menu beta.
