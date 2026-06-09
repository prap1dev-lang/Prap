# Quick Testing Setup ✅

## What's been fixed:

### 1. **Test Login Endpoint** (`/api/auth/test-login`)
   - ✅ Auto-creates users in Supabase (no DB lookup required)
   - ✅ Generates magic links for authentication
   - ✅ Works in development mode only (blocked in production)
   - ✅ Full error logging for debugging

### 2. **Login Page** (`/auth/login`)
   - ✅ Accepts test OTP: `123456` for any phone number
   - ✅ Uses test endpoint when OTP is `123456`
   - ✅ Falls back to Firebase for real OTPs

### 3. **Test Page** (`/auth/test`)
   - ✅ New dedicated test page for the endpoint
   - ✅ Shows success/error responses
   - ✅ Displays magic link for manual testing

### 4. **MSG91 Removed**
   - ✅ All MSG91 code deleted
   - ✅ All MSG91 env variables cleaned up
   - ✅ Firebase is now the only auth provider

---

## How to Test Right Now:

### 🚀 **Easiest: Use Test Page**

```
http://localhost:3000/auth/test
```

1. Enter phone: `9876543210`
2. Click "Test Login"
3. Get instant magic link
4. Done!

### 🔐 **Full Flow: Use Login Form**

```
http://localhost:3000/auth/login
```

1. Enter phone: `9876543210` → Click "Send OTP"
2. Enter OTP: `123456` → Click "Sign in"
3. Auto-creates account and logs you in
4. Redirects to `/dashboard`

---

## What Each Component Does:

```
┌─────────────────────────────────────────┐
│  /auth/login (Login Page)               │
│  - Accepts test OTP: 123456             │
│  - Normalizes phone to +91...           │
└─────────────┬───────────────────────────┘
              │
              ├─► OTP = 123456?
              │   └─► /api/auth/test-login
              │
              └─► Real OTP?
                  └─► Firebase + /api/auth/firebase/exchange

┌─────────────────────────────────────────┐
│  /api/auth/test-login (Test Endpoint)   │
│  - Auto-creates user in Supabase        │
│  - Generates magic link                 │
│  - Returns actionLink to redirect to    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  /auth/test (Visual Tester)             │
│  - UI for testing endpoint              │
│  - Shows request/response               │
│  - Copy-paste the magic link if needed  │
└─────────────────────────────────────────┘
```

---

## Env Variables Required:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Firebase (for real OTPs later)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

✅ All already in your `.env.local`

---

## Debugging Tips:

### Issue: "Invalid phone format"
**Fix:** Phone must be exactly 10 digits or start with `+91`

### Issue: "Could not create session"
**Check:**
- Is `SUPABASE_SERVICE_ROLE_KEY` set?
- Can you reach Supabase dashboard?
- Check server logs for error details

### Issue: "Invalid OTP" (on real Firebase)
**Notes:**
- Firebase needs billing enabled for SMS
- Test phones must be whitelisted in Firebase console
- Use `123456` in test form to bypass Firebase

### Issue: Logs not showing
**Run with debug:**
```bash
DEBUG=* npm run dev
```

---

## Files Changed:

| File | Change |
|------|--------|
| `src/app/auth/login/page.tsx` | Added test OTP handler |
| `src/app/api/auth/test-login/route.ts` | Created (auto-creates users) |
| `src/app/auth/test/page.tsx` | Created (visual tester) |
| `.env.local` | Removed MSG91 vars |
| `src/lib/msg91.ts` | ❌ Deleted |
| `src/lib/msg91-widget.ts` | ❌ Deleted |

---

## Next Steps (When Billing Ready):

1. Enable Firebase billing
2. Set up test phones in Firebase console
3. Real OTPs will send via SMS automatically
4. Remove test OTP handler if you don't need it

For now, you can fully test all auth flows with:
- `/auth/test` for the endpoint
- `/auth/login` with OTP `123456` for the form
- Both create real Supabase users
