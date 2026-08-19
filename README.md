# IITH Ruchi

Mess registration and daily dining companion for IIT Hyderabad — pick your
mess and dining hall, then keep coming back for the live menu, extra items,
and cuisine of the day. Swiggy/Zomato-style everyday use, not a once-a-month
form.

> Naming: the repo slug stays the plain descriptor `iith-mess`; the brand
> name "Ruchi" carries the subdomain, the README H1, the repo description
> and the in-app header. Same family as Sanchari and Nivas.

**Status:** live at [ruchi.iith.online](https://ruchi.iith.online) · **On GitHub:** `saichandanmettu/iith-mess` (public)

Registration, the counter scanner and the admin console all work. A full
registration cycle has not yet been run with real students.

Plain HTML/CSS/JS, no build step — consistent with the other live IITH
projects (Sanchari, Nivas, Aquatics, Athletics).

## Which version this is

Three builds of this existed locally. **This one — the Claude build — is
the one being taken forward**, chosen for its plain-HTML stack matching the
other projects. The other two (a zero-commit copy and a React rebuild) are
kept locally under `other versions/` for reference but are **not tracked in
this repo** — deliberately excluded via `.gitignore` to keep the published
history to the product that's actually shipping.

## Vision

Registration is the front door, not the destination. The app should earn a
place people open daily, the way Swiggy/Zomato do:

- **Monthly registration** — pick mess + dining hall, see live seat caps,
  lock it in two taps.
- **Daily menu** — what's being served today, per meal, per hall.
- **Extra items / à la carte** — anything beyond the standard thali.
- **Cuisine tagging** — South Indian / North Indian / Continental etc. per
  item, so people can tell at a glance what today looks like.
- **Calorie / nutrition info** — enough to make the "what should I eat"
  decision without leaving the app.
- Clean, neat, food-app look and feel — not a government-form aesthetic.

See `docs/PROGRESS.md` for what's built vs. what's next in priority order.

## Before this goes live

Nothing here has been deployed or security-reviewed beyond a secrets scan
(clean — no keys, no `.env`, no credentials). The open questions from the
earlier notes still stand: the demo/live dual backend, and the per-hall cap
assumptions.
