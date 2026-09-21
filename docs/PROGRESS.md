# Ruchi — current progress

Last updated: **2026-09-22**

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
