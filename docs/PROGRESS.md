# Ruchi — current progress

Last updated: **2026-09-22**

## Footer beta notice — 22 September 2026

Added a visible, palette-aware footer note explaining beta status, illustrative
web/AI-generated food imagery and features still in development. Credit and
Gymkhana affiliation wording remain. Both menu entry pages share the note and
updated stylesheet cache key. Publication explicitly authorised by the owner.

## Release handoff — 22 September 2026

Commit `7bb3b0f` (My Plate and dynamic dietary palettes) was pushed to
`origin/main` with the owner's approval. Final cache-busted production checks
still returned the previous HTML and 404 for the four new CSS/JS assets.
Production activation is therefore not yet verified. The owner chose to let
Hostinger finish automatically; no manual hosting change was performed.
A subsequent owner-requested retry sends this release record as a fresh commit
to retrigger the Git deployment. Application files remain at release `7bb3b0f`.

## My Plate — beta, 22 September 2026

Restored optional tracking as Plate mode, with a central My Plate dock action
and dish-count badge. The plate groups today's entries by meal and supports
half-portions, alternatives, editing and removal. Existing v2 daily logs are
preserved; storage remains local without login. Opening My Plate returns to
today, while future menu dates cannot be logged as eaten. Date changes during
an open dish prevent saving the entry against the wrong day.

Four nutrition cards sum entered per-portion calories, protein, carbs and fat.
The mess menu has no nutrition data. Unknown values display unavailable and
partial totals include coverage counts; zero is distinct from unknown. Automatic
standard-portion estimates remain pending the owner's nutrition-source choice.
Optional entry fields accept nonnegative values from labels/reliable sources.

Isolated browser QA used a separate intake-storage prefix, preserving existing
user entries. Checked adding, alternative selection, mixed-meal grouping,
editing, live recalculation, reload persistence, removal/clear and future-date
blocking. Phone visual review and 320/390/820 px geometry checks passed. Pure
totals checks cover fractional portions, partial coverage, zero and invalid
values. JavaScript syntax, matching entry pages and diff checks pass.
Owner authorised publication on 22 September 2026.

## Dynamic dietary palettes — 22 September 2026

The owner selected all three colour directions as filter-driven states. The
default is now a light Espresso; Vegetarian uses Basil green and Egg / non-veg
uses Paprika red. All dishes and Saved return to Espresso. Dark mode is deferred.
`dining-palette.css` animates shared colour tokens over 520 ms so gradients,
glass, text and selected controls move together. Reduced motion disables the
transition and touch rings. Palette changes follow the menu's actual filter
state, including keyboard and dock navigation, rather than a separate preference.

Both entry pages load the new assets and versioned menu script. Browser QA
confirmed green/red states, light default, preservation across meal changes,
Saved/Menu reset, keyboard activation and the themed report sheet. Layout checks
at 320, 390, 820 and 1280 CSS px found no horizontal overflow. JavaScript syntax,
matching entry pages and whitespace checks pass. This update is included in
the authorised My Plate release. No report submission was performed.

## Hero alignment correction — 2026-09-22

Replaced the left-packed headline/countdown flex row with a two-column grid.
The timer stays flush with the hero's right edge and uses a responsive width;
the headline fills the remaining column. This supersedes the earlier compact
left grouping, which left an abrupt unused area after the timer. Verified all
four meals at 320, 390, 768, 1024 and 1280 CSS px: no trailing timer gap,
headline intersection or horizontal overflow. Phone and desktop visual review
passed. Both entry pages have the new stylesheet cache key.

## Footer and compact controls — 2026-09-22

Owner approved “Made by Chandan” linked to chandanmettu.com, with “No official
affiliation with Gymkhana.” underneath. Removed the footer logo/brand block and
Menu beta badge. Dock is now 300 × 56 px (shrinks to fit small screens), retaining
44 px button heights. The countdown has larger digits and sits 12–18 px from
the heading rather than stretching to the far edge of its container.
Checked mobile footer/header visuals and desktop; 320, 390, 768 and 1280 px
layouts have no horizontal overflow or title/timer collision. Both menu shells
carry the updated CSS cache key.

## Report form mobile fix — 2026-09-22

The owner reported Safari's native date input overlapping Meal on an iPhone.
Date/Meal now stack below 481 CSS px. Wider screens retain two columns with
explicit zero minimum grid widths; labels and controls are constrained to their
cells. Date and select heights match, and the native date picker stays available.
Both entry pages use a new stylesheet cache key. Browser checks at 320, 390,
402, 480, 481, 768 and 1280 CSS px show no intersecting controls or sheet
overflow; both controls remain 48 px tall. Physical iPhone Safari was not available
for direct testing.

## Live verification

Release `c4ea9ce` is live at https://ruchi.iith.online/ (22 September 2026).
Verified all 100 release files over HTTPS: code, data, fonts and text match the
release; images decode correctly after CDN recompression, EXIF orientation and
resizing. Production browser loads the new homepage, switches meals/card/list
views and displays photos without console errors. Registration remains available
at `/register.html` as a demo. No Supabase activation or email delivery claimed.

## Daily dining beta release

Owner authorised publication on 22 September. The release makes the daily menu
`index.html` as well as `today.html`; the original registration screen is
preserved at `register.html`. Production Supabase remains inactive.

Shipped scope:
- Real August menu, seven future/current dates, automatic monthly rotation.
- Confirmed weekday/weekend service hours, India-time automatic meal selection
  and opening/closing countdowns.
- Approved logo, glass UI, meal gestures, dietary markers, card/list views and
  saved dishes. No search, no hall selector while browsing, no visible Measure.
- Report form with Mess A/B, issue/details and optional image; local photo drafts,
  review, email-client handoff and `.eml` attachment export. No email sent by QA.
- Upcoming timeline: actual mess photographs first, mobile app second,
  personalised features later. No promised dates.
- Collapsed notes and Ruchi / IIT Hyderabad footer. Approved developer credit and affiliation note (see above).

## Responsive and asset preparation

Portrait tablets (650–849 CSS px) now use a three-column card grid and two-column
list grid. Phones keep two cards / one list column; wider screens keep four
cards. The tablet meal selector has larger text and touch spacing.
Logo and Kissan artwork have smaller web derivatives; originals remain local.
Only the final app, needed assets, licences and attribution are staged for release.

## Validation

Pre-release checks passed: JavaScript syntax, complete static HTML dependencies,
180 menu records resolving to 53 existing photos, matching root/today shells,
and browser checks at 320, 390, 768, 820, 1024, 1180 and 1440 CSS pixels without
horizontal overflow. Visually reviewed phone, iPad portrait/landscape and desktop;
verified card/list switching, Saturday breakfast hours, report prefills, timeline
and absence of browser errors. Previous focused
checks passed schedule boundaries (17 cases), draft/photo recovery and independent
MIME parsing of recipient, Unicode text and byte-identical image attachment.
Actual mail-client send/import remains user-operated and unverified.

## Remaining work

- Replace illustrative photos with original mess photographs.
- Develop the planned standalone app; no store submission exists yet.
- Resolve conflicting Wednesday fruit week labels (item currently withheld).
- Confirm nutrition data before releasing Measure.
- Activate Supabase/OAuth/staff roles only after the separate acceptance checklist.
- Reports currently leave the app for email; no server-side ticket tracking.

The earlier registration narrative is in
[the archived progress document](archive/PRE_DEPLOYMENT_PROGRESS.md).


## Local colour studies — 22 September 2026

`colours.html` compares Basil & Cream, Paprika & Peach and Espresso & Butter.
Each embeds `colour-preview.html`, a snapshot of the current menu shell loading
only the extra `colour-study.css` and `colour-study.js` files. Current production
HTML/CSS/JS was unchanged by that exploration. The studies remain review-only;
the subsequent dynamic-palette implementation above uses all three directions,
with Espresso adapted to light mode.

Themes cover menu cards, selected meals, date picker, dock, reports and roadmap.
They retain meal gestures and add short touch feedback and restrained card hover.
Reduced-motion and reduced-transparency preferences are respected. The comparison
page provides individual phone/tablet/desktop width controls and full-size links.
Browser checks passed all three palettes at 320, 820 and 1280px with two/three/four
card columns and no horizontal overflow; meal switching and the dark mobile report
sheet were reviewed. No browser errors recorded. No reports sent or drafts saved.
