# Surepass.io KYC Integration

PRAP uses [Surepass.io](https://surepass.io) for all government-data
verification: **PAN**, **Aadhaar (OTP)**, **RERA agent**, optional **Bank** &
**UPI**. The integration is server-only — your `SUREPASS_TOKEN` is **never**
exposed to the browser.

## Setup

1. Sign up at https://surepass.io and complete their KYC onboarding (yes,
   they verify you too).
2. **Dashboard → API Settings → Generate Token**. Pick scopes: PAN, Aadhaar-v2,
   Corporate (RERA), Bank, UPI.
3. Add to `.env.local`:
   ```
   SUREPASS_TOKEN=eyJ...your-token
   SUREPASS_BASE_URL=https://kyc-api.surepass.io/api/v1   # default; override if Surepass moves you to a regional sub-domain
   ```
4. Run the SQL migration: paste [docs/MIGRATION_SUREPASS.sql](MIGRATION_SUREPASS.sql) into Supabase SQL Editor.

## What runs when

| Trigger                                       | Endpoint                                  | Effect on `users` row                                                  |
| --------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------- |
| Signup (`/api/auth/verify`)                   | `POST /pan/pan`                           | `pan_verified=true`, `pan_full_name=...` (non-blocking on failure)     |
| User clicks "Verify Aadhaar" on dashboard     | `POST /aadhaar-v2/generate-otp` then `/submit-otp` | `aadhaar_verified=true`; auto-promotes `kyc_status='verified'` if PAN ↔ Aadhaar ↔ declared name all match |
| Admin clicks "Run RERA check" on broker page  | `POST /corporate/rera-agent`              | `rera_verified=true`, `rera_agent_name=...`                            |

Every Surepass call appends a row to **`kyc_verifications`** for audit.

## Endpoints we ship

| Path                                      | Auth scope    | Purpose                                            |
| ----------------------------------------- | ------------- | -------------------------------------------------- |
| `POST /api/kyc/pan`                       | any user      | Re-run PAN check (e.g. if signup-time call failed) |
| `POST /api/kyc/aadhaar/generate-otp`      | any user      | Start UIDAI OTP flow                               |
| `POST /api/kyc/aadhaar/submit-otp`        | any user      | Submit OTP, persist verified profile               |
| `POST /api/admin/kyc/rera`                | **admin**     | Run RERA agent verification on a broker user       |

## Cost guard

Surepass bills per call. To avoid duplicate spends:
- The PAN call only runs at signup. If the user retries via `/api/kyc/pan`,
  the latest result still overwrites — by design (rare).
- Aadhaar OTP sessions are stored in `aadhaar_otp_sessions` with `consumed=true`
  after first use. If the user re-submits an OTP, we look up a *fresh* session;
  otherwise we return HTTP 410 with a friendly message.
- RERA verification is admin-only and idempotent — running it twice on the
  same broker is safe but charges again.

## Failure modes

- **Token misconfigured** → `502` with message "SUREPASS_TOKEN not configured".
  The signup flow swallows it and proceeds; admin can retry from the user page.
- **Surepass plan doesn't include an endpoint** → check the dashboard's "Allowed
  endpoints" panel; you may need a paid SKU for RERA & Aadhaar v2.
- **UIDAI rate limits** on Aadhaar OTP — Surepass surfaces the message; our UI
  shows it verbatim.

## Going to production

- Move the token to Vercel Project → Settings → Environment Variables, scope
  **Production** and **Preview** separately.
- Add Surepass's egress IPs to your allow-list if you put the app behind a WAF.
- Set up a Supabase scheduled function to delete `aadhaar_otp_sessions` older
  than 24 hours — there's never a reason to keep them.
