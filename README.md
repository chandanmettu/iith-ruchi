# IITH Mess Portal

Mess registration portal for IIT Hyderabad — registration flow, dining-hall
allocation and per-hall capacity caps.

**Status:** in development · **Not deployed** · **Not on GitHub**

Plain HTML/CSS/JS, no build step — consistent with the other live IITH projects.

## Which version this is

Three builds of this existed. **This one — the Claude build — is the one being
taken forward**, chosen for its plain-HTML stack matching the other projects.

The other two are preserved under `other versions/`, not deleted:

- `mess-git-0-commits/` — had `git init` run but **not a single commit**, so no
  history exists
- `mess-gemini-react/` — a React rebuild; more files, but that's scaffolding
  rather than more product

## Before this goes live

Nothing here has been deployed or security-reviewed beyond a secrets scan
(clean — no keys, no `.env`, no credentials). The open questions from the
earlier notes still stand: the demo/live dual backend, and the per-hall cap
assumptions.
