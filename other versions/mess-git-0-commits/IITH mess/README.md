# Messbook · IITH

A high-fidelity registration portal prototype for IITH mess allocation.

## Run it

```bash
npm install
npm run dev
```

## Current experience

- Calm, IITH-focused student landing page
- IITH ID–based registration (no Google sign-in in this phase)
- Four selectable plans: Old/New mess with UHD/LHD; each mess has 2,000 seats split into 1,000 UHD and 1,000 LHD
- Live-looking remaining-capacity indicators and first-come messaging
- A held selection state and physical-ID barcode verification receipt
- Responsive layout for phone and desktop

## Before a campus launch

This frontend intentionally uses local demo data. The production implementation needs a backend that owns every security- and allocation-critical decision:

1. A trusted student registry or IITH identity source that verifies ID numbers before allowing registration.
2. A database transaction or queue-based allocation endpoint that locks a seat before confirmation. **Never** enforce the 1,000-person UHD/LHD quota only in the browser.
3. A monthly registration window configured in the backend, with an auditable timezone (IST), and no changes after confirmation.
4. Student, registration, plan/capacity, and staff-role tables plus an immutable registration audit log.
5. Staff login and a scanner view that accepts the barcode from the physical IITH ID card.
6. A server-side match from scanned ID → current-month registration, showing only the access result and essential plan information.

The next build step is wiring this interface to the student registry, data store, and staff scanner flow.
