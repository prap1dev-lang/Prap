# Test Login Guide

Since billing/Firebase SMS isn't set up yet, we have two testing options:

## Option 1: Test Login Endpoint (Recommended)

This bypasses Firebase completely and creates users directly in Supabase.

### How to use:

1. **Go to test page:**
   ```
   http://localhost:3000/auth/test
   ```

2. **Enter any phone number:**
   - `9876543210` (10 digits)
   - `+919876543210` (with country code)

3. **Click "Test Login"**
   - Endpoint auto-creates user in Supabase
   - Generates a magic link
   - Shows you the result

### Technical Details:

**Endpoint:** `/api/auth/test-login`

```bash
curl -X POST http://localhost:3000/api/auth/test-login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "mode": "signup",
    "redirectTo": "http://localhost:3000/dashboard"
  }'
```

**Response:**
```json
{
  "ok": true,
  "actionLink": "https://...",
  "phone": "+919876543210"
}
```

The `actionLink` is a Supabase magic link that sets your session and redirects to the specified URL.

---

## Option 2: Login Page with Test OTP

For testing the full flow in the login form:

1. **Go to login page:**
   ```
   http://localhost:3000/auth/login
   ```

2. **Enter phone number:**
   - Any valid number: `9876543210`

3. **You'll see "We SMS'd a code..." message**
   - (No actual SMS is sent in dev)

4. **Enter OTP: `123456`**
   - This triggers the test endpoint
   - Auto-creates user and logs you in

### Why it might not work:

**Error: "Invalid phone format"**
- Phone must be in format `+919876543210`
- The page normalizes it, but check browser console for exact format

**Error: "No account found"**
- Fixed in latest update - now auto-creates on signup mode

**Error: "Could not create session"**
- Check Supabase connection:
  - Is `SUPABASE_URL` correct?
  - Is `SUPABASE_SERVICE_ROLE_KEY` set?
  - Can you access Supabase dashboard?

---

## Troubleshooting

### Check environment variables:

```bash
# In .env.local, verify these exist:
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Check Supabase connection:

Go to `/env-check` page:
```
http://localhost:3000/env-check
```

Shows which env vars are loaded.

### Check browser console:

The test endpoint logs everything:
```
[test-login] Success for +919876543210
[test-login] Parse error: ...
[test-login] Create user error: ...
[test-login] Generate link error: ...
```

### Check server logs:

Run dev with debug:
```bash
DEBUG=* npm run dev
```

---

## When billing is set up:

Once you have Firebase SMS billing:

1. Update Firebase console to allow your test phone numbers
2. Real OTPs will be sent via SMS
3. Users can sign up/login normally without using `123456`

For now, the test endpoint is production-ready for local testing!
