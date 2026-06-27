# Fixing OTP / verification messages landing in spam

PRAP sends two kinds of verification messages. **Neither is controlled by the
app code** — both are fixed in third-party dashboards + DNS. This guide lists the
exact settings to change.

| Channel | What it sends | Where it's configured | Why it lands in spam |
| ------- | ------------- | --------------------- | -------------------- |
| **SMS** | The 6-digit login/signup OTP (`signInWithPhoneNumber`) | Firebase Console + TRAI **DLT** | Unregistered sender ID / promotional routing in India |
| **Email** | Password-reset link (`resetPasswordForEmail`); session magic-link is **not** emailed | Supabase Auth SMTP + your DNS | Default Supabase sender has no SPF/DKIM/DMARC aligned to `prap.in` |

---

## 0. FIRST: `auth/operation-not-allowed` — "SMS unable to be sent until this region enabled"

If sending the OTP throws **`auth/operation-not-allowed`** with the message
*"SMS unable to be sent until this region enabled by the app developer"*, the OTP
is being **blocked before it ever leaves Firebase**. Nothing in the app code can
fix this — it is a console toggle. Two possible causes, fix both:

1. **SMS region policy is blocking India.** New Firebase projects default to an
   allow-list that may exclude `+91`.
   - Firebase Console → **Authentication → Settings → SMS region policy** (a.k.a.
     "Regions for SMS sign-in").
   - Either switch to **"Deny" mode with no countries blocked**, or use **"Allow"
     mode and add India (+91)** (plus any other countries you serve).
   - Save. OTP starts sending within a minute.
2. **Phone provider is not enabled.** Authentication → **Sign-in method** →
   **Phone** → Enable → Save.

Until step 1 is done, the friendly fallback message in the app ("OTP sign-in is
temporarily unavailable… use password login") is shown instead of the raw error.

---

## 0b. iOS — OTP lands in "Filtered / Unknown Senders"

On iPhones, Messages auto-sorts texts from numbers not in the user's contacts
into a separate **"Unknown Senders"** tab (Settings → Messages → *Filter Unknown
Senders*). The OTP isn't lost — it's just hidden in that tab, which users read as
"went to spam". This is iOS behaviour, not Firebase. Mitigations:

1. **Code (done):** the OTP inputs now use `autoComplete="one-time-code"`. When the
   SMS is well-formed, iOS surfaces the code as a **QuickType suggestion above the
   keyboard**, so the user taps it without opening Messages at all — even when the
   text is in the filtered tab.
2. **SMS body format:** for iOS/Android autofill to reliably trigger, the OTP text
   should read like a standard code message, e.g. `123456 is your PRAP
   verification code`. Firebase's default template works; if you switch to a custom
   SMS provider keep this format (code near the start, the word "code").
3. **Registered sender header (DLT, see §1):** a recognised alphanumeric sender ID
   (e.g. `PRAPIN`) is trusted more than a raw long number and is less likely to be
   filtered.

---

## 1. SMS OTP — stop it being flagged / delayed (India)

The OTP is a real SMS from Firebase Phone Auth. There is no "spam folder" for
SMS, but Indian carriers throttle or junk-label messages from senders that
aren't **DLT-registered** (TRAI mandate).

**Do this in order:**

1. **Firebase Console → Authentication → Sign-in method → Phone**
   - Confirm Phone provider is **enabled**.
   - Under **Authorized domains**, add your production domain (`prap.in`,
     `www.prap.in`) and any preview domains. A missing domain makes reCAPTCHA
     fall back and can suppress sends.
2. **Upgrade the Firebase project to the Blaze plan.** The free Spark plan has a
   very low daily SMS cap; once hit, messages silently stop — which looks like
   "not delivered / spam".
3. **Register on DLT** (the real fix for India). Firebase sends via partner
   aggregators; for reliable, non-spam-labelled delivery register:
   - A **Principal Entity (PE) ID** on any DLT portal (Jio/Airtel/VI/BSNL).
   - A **Header / Sender ID** (e.g. `PRAPIN`).
   - A **transactional content template** for the OTP text.
   Then raise a Firebase support ticket (or use a custom SMS provider — see #3)
   to attach your DLT header so OTPs route as **transactional**, not promotional.
4. **Test numbers for QA:** Firebase Console → Phone → *Phone numbers for
   testing*. Add a number + fixed code so you can test without burning real SMS
   or hitting carrier spam filters.

> If you need full control over SMS sender ID and DLT, replace Firebase SMS with
> a direct provider (MSG91 / Twilio / Kaleyra) that exposes the DLT header. That
> is a larger change — ask and I'll wire it behind the same `/api/auth/...` flow.

---

## 2. Email links — stop them landing in Gmail/Outlook spam

Supabase Auth emails (the password-reset link) are sent **from Supabase's shared
mail server by default** (`noreply@mail.app.supabase.io`). That domain is not
aligned to `prap.in`, so receivers fail DMARC alignment and bin it.

**Fix = send through your own authenticated domain.** You already have a Resend
key in `.env.local` (`RESEND_API_KEY`, `EMAIL_FROM`); point Supabase SMTP at it.

1. **Verify your sending domain in Resend** (Resend → Domains → add `prap.in`).
   Resend gives you DNS records — add all of them at your DNS host:
   - **SPF** (TXT): `v=spf1 include:resend.com ~all` (merge with any existing SPF —
     you may have only **one** SPF record).
   - **DKIM** (CNAME records Resend provides).
   - **DMARC** (TXT on `_dmarc.prap.in`): start with
     `v=DMARC1; p=none; rua=mailto:dmarc@prap.in;` then tighten to `p=quarantine`.
2. **Supabase → Project Settings → Authentication → SMTP Settings → Enable
   custom SMTP** and enter Resend's SMTP creds:
   - Host: `smtp.resend.com`  Port: `465` (SSL) or `587` (STARTTLS)
   - Username: `resend`  Password: your `RESEND_API_KEY`
   - Sender email: `noreply@prap.in`  Sender name: `PRAP`
   (Must match `EMAIL_FROM` and the domain you verified above.)
3. **Supabase → Authentication → Rate limits:** the default custom-SMTP cap is low.
   Raise it to match expected reset volume so legit mail isn't dropped.
4. **Supabase → Authentication → URL Configuration:** set **Site URL** to
   `https://prap.in` and add `https://prap.in/auth/reset-password` to the
   redirect allow-list, so the reset link host matches your domain (mismatched
   hosts also trip spam filters).

### Covers EVERY email the platform sends

All platform email goes through Resend (`src/lib/resend.ts`) from `EMAIL_FROM`
(`noreply@prap.in`): welcome, payment receipt, redemption confirmation,
contact-form ack, corporate referral code — plus Supabase's password-reset link.
The **same domain verification in step 1 above fixes all of them**. Until `prap.in`
is verified in Resend with SPF/DKIM/DMARC, every one of these lands in spam no
matter what the code does.

**Code-side spam triggers already fixed in `src/lib/resend.ts` (done):**

- ✅ Every email now ships a **plain-text alternative** (HTML-only is downranked).
- ✅ **`List-Unsubscribe` + `List-Unsubscribe-Post: One-Click`** headers on
  marketing-class mail — *mandatory* under Gmail/Yahoo 2024 bulk-sender rules.
  Backed by a real endpoint: `GET/POST /api/email/unsubscribe`.
- ✅ A monitored **`Reply-To`** (`EMAIL_REPLY_TO`) instead of a silent no-reply.
- ✅ **Emoji removed from subject lines** and money/"coins" phrasing softened
  (`₹X on its way` → `…is being processed`) — both common spam-filter triggers.
- ✅ The mailer **skips recipients who unsubscribed** (`email_optouts` table) for
  marketing mail; transactional mail (receipts, resets, payouts) always sends.

**You must still do (DNS / dashboards — code cannot):**

1. Verify `prap.in` in Resend and add its **SPF, DKIM, DMARC** DNS records.
2. Point **Supabase Auth → custom SMTP** at Resend (so the reset link isn't sent
   from the unauthenticated default sender).
3. Run **`docs/MIGRATION_EMAIL_OPTOUT.sql`** in Supabase to persist unsubscribes.
4. Set `EMAIL_REPLY_TO` to a real monitored inbox on the verified domain.
5. Warm up gradually and keep the spam-complaint rate < 0.3% (Postmaster Tools).

### Good news: sessions no longer depend on email

`/api/auth/firebase/exchange` mints the Supabase session **server-side** via
`generateLink` + `/auth/v1/verify` — **no email is sent** for login/signup. So
once SMTP above is fixed, the **only** user-facing email is the password-reset
link, which keeps the spam surface tiny.

---

## Quick verification checklist

- [ ] Send a reset email to a Gmail address → it lands in **Inbox**, not Spam.
- [ ] Open the received email → **Show original** → SPF/DKIM/DMARC all `PASS`.
- [ ] OTP SMS arrives within ~10s on a real Indian number on Blaze plan.
- [ ] Firebase test number returns its fixed code without sending real SMS.
- [ ] `Site URL` + redirect URLs in Supabase all use `https://prap.in`.
