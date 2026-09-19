# Ruchi deployment and backend activation

The static frontend is already delivered at <https://ruchi.iith.online>.
These steps activate the shared Supabase backend; until they are complete,
blank values in `assets/js/config.js` intentionally keep the site in demo mode.

## 1. Create the backend

1. Create an owned Supabase project in the appropriate region.
2. In the SQL editor, run `supabase/schema.sql` from the repository root.
   It is safe to rerun: tables/indexes use `if not exists`, while functions,
   triggers and policies are replaced by name.
3. Inspect the seeded `mess_config` row and replace dates, messes, halls and
   capacities with verified operational values.
4. In the SQL editor, insert the first admin into `staff`. Add real addresses
   only in the database, never in committed SQL.

The schema makes capacity claims atomic and recomputes roll/bucket values on
the server. Browser-supplied `p_roll` and `p_bucket` remain only for API
compatibility and are deliberately ignored.

## 2. Configure authentication

1. Enable Google as an Auth provider in Supabase and keep its client secret in
   the dashboard only.
2. Set the production site URL to `https://ruchi.iith.online`.
3. Add the exact production callback and the chosen localhost preview URL to
   the redirect allow-list.
4. Confirm a non-institute Google account cannot complete registration. The
   OAuth `hd` hint improves the chooser, but the database function is the final
   domain check.

## 3. Connect the frontend

Set only the public Supabase project URL and anon key in
`assets/js/config.js`. Never use a service-role key in browser code. The anon
key is safe only because RLS and the security-definer functions enforce the
real permissions.

Serve locally over HTTP and confirm the console reports no fallback to the demo
store:

```sh
python3 -m http.server 8012
```

## 4. Acceptance checklist

- student can sign in with an institute account and sees only their own record
- non-institute account cannot register
- a client-modified roll, bucket, mess or hall cannot bypass server validation
- second tab cannot create a duplicate active registration
- final available seat succeeds and the next claim returns `full`
- cancel/change works only within the configured window and returns capacity
- counter role can read registrations and insert scans, but cannot alter config
- admin can update config and capacity rows resync without dropping below taken
- changing cap mode re-buckets existing active registrations without changing
  the total, and removing an in-use mess/hall is rejected
- ordinary student cannot read the staff list or scan history
- unpublished menu days are invisible to ordinary students
- published menu items are readable; only admins can edit them

Run the checklist with a temporary cycle and small capacities before using real
student data.

## 5. Release and rollback

After local verification, review `git diff`, bump cache keys for any changed
referenced JavaScript/CSS, commit the intended files and push `main` for the
Hostinger deployment. Verify the public site with a cache-busted URL.

To revert the frontend, redeploy the previous Git commit. Database changes are
separate: take a database backup before a production migration and restore or
apply a forward migration if needed. Removing frontend credentials returns the
UI to demo mode; it does not delete backend data.
