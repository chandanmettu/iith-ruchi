# Menu and extras: September 2026 boards

Updated 24 September 2026 · local preview, not yet published.

## Source

Four owner-supplied board photographs cover breakfast, lunch/snacks, dinner and
paid extras. The two current JSON files record the filenames and SHA-256 hashes;
original photographs stay in Downloads. The boards print no effective date, so
this preview treats them as the current menu received on 24 September. Existing
August data and [interpretation](archive/AUGUST_MENU_INTERPRETATION.md) are retained.

- `assets/data/menu-september-2026.json`: 163 day-specific records plus 20 shared
  records. Regular meals were checked against all three boards. Added missing
  peanut/tomato chutneys to Tuesday breakfast and peanut chutney to Wednesday.
- `assets/data/extras-september-2026.json`: 70 day-specific records plus three
  shared breakfast extras, with numeric INR prices and portions when printed.
- `assets/js/menu-catalog.js`: selects included dishes, daily staples, scheduled
  extras and unmapped rotating choices for the selected day/meal.

Existing dish IDs are preserved. Extra IDs use an `extra-` prefix so saving or
logging an extra cannot collide with an included dish. Price lives on the
scheduled record: Monday pepper chicken costs ₹55; Friday lunch costs ₹45.
Omelette is ₹10 for one egg at breakfast and ₹20 at other listed meals, where
the board does not specify its egg count. No portion weights or nutrients are
inferred.

## Source interpretations and unresolved details

- Tuesday snacks' egg bonda is crossed out. Wednesday snacks have a handwritten
  “Egg Bonda (15/-)”; the ₹15 item appears on Wednesday, not Tuesday.
- Sunday dinner explicitly says nil for extras. Display an empty-state message,
  not an invented dish or a price of zero.
- Saturday snacks say weekly alternation but do not assign dishes to weeks.
  All eight listed choices carry their prices and a rotating/check-counter label;
  they are never described as all being served together.
- Asked whether extras apply to both Mess A and Mess B. Until confirmed, describe
  them as the posted extras list and ask students to check their counter. The
  already-confirmed shared regular menu remains unchanged.
- Wednesday fruit still conflicts: papaya Weeks 1/3, muskmelon Weeks 3/4. Withhold
  that entry and retain the explanation in the closed Menu notes.
- Tuesday sambar retains the printed radish/lauki choice.
- Dish-name spelling is normalized (bhurji, pav bhaji, vada pav, paneer). “Chicken
  Laal Maas” and Monday “Pepper Chicken (any)” retain source notes.

## Browsing and tracking

A glass Regular menu / Extras switch sits directly beneath the four meal tabs.
Its count follows the selected date and meal. Extras show INR prices and stated
portions in both card/list views and dish details. Dietary filtering keeps the
existing Espresso/Basil/Paprika transitions. Saved shows matching included
and paid dishes together for that day/meal. Nothing here places an order.

Plate mode stays optional and off initially. Students can record an extra they
ate, with the same half-portion controls and manually entered nutrition. Future
menus remain browse-only. Existing browser-local plate logs are preserved;
missing nutrients are not fabricated. A failed extras request leaves regular
menu browsing available and displays an explicit extras loading failure.

## Calendar and service hours

Keep the approved month blocks: 1–7 / 8–14 / 15–21 / 22–28 map to Weeks 1–4;
29–31 map to Week 1, and each month restarts. Students see the next seven dates,
not a week selector. Extras have weekday schedules independent of this rotation,
except Saturday's explicitly unresolved chaat selection.

Asia/Kolkata timings remain owner-confirmed: breakfast 7:30–10:00 weekdays and
7:30–10:30 weekends; lunch 12:30–14:45; snacks 17:00–18:00; dinner 19:30–21:30.

## Photographs

33 new Commons photographs are optimized under `assets/images/extras-menu/`.
`sources.json` and `menu-photo-credits.html` retain source, author and license
links. Existing egg and banana photography is reused. Related recipes
may use a dish-family reference (for example chicken curries); these are clearly
illustrative photographs, not images of actual mess servings. No new AI imagery
was generated for this update.

## Validation

`node --test tests/menu-catalog.test.js`: seven passing tests cover all four
rotations/28 day-meal combinations, price differences, handwritten/crossed-out
changes, breakfast corrections, nil/rotating extras and loading isolation.
Browser checks cover all 28 extras screens, Saved, price details, optional plate
logging/removal in an isolated storage namespace, filters and layouts at 320,
390, 820 and 1280 CSS px. All 256 regular/extra records resolve to existing
photo assets, all new images decode, and both HTML entry points match.
