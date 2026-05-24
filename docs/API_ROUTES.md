# PRAP API Route Map (MVP)

All routes are JSON REST endpoints. Auth via Supabase JWT (Bearer token in
`Authorization` header) or session cookie. Role-Based Access Control (RBAC) is
enforced by Supabase Row Level Security (RLS) policies plus an in-request role
check helper (`requireRole(req, "broker" | ...)`).

## Public (no auth)

| Method | Path                       | Purpose                                |
| ------ | -------------------------- | -------------------------------------- |
| GET    | `/api/projects`            | List/search RERA projects              |
| GET    | `/api/projects/[slug]`     | One project detail                     |
| POST   | `/api/auth/otp`            | Send phone OTP (Firebase)              |
| POST   | `/api/auth/verify`         | Verify OTP + create/login user         |

## Authenticated (any logged-in user)

| Method | Path                         | Purpose                                       |
| ------ | ---------------------------- | --------------------------------------------- |
| GET    | `/api/coins/balance`         | Balance + last 50 ledger entries              |
| POST   | `/api/coins/redeem`          | Redemption request (50% rule + ₹1L cap)       |
| GET    | `/api/me`                    | Current user profile                          |
| PATCH  | `/api/me`                    | Update profile / payout methods               |
| POST   | `/api/kyc/upload`            | Upload Aadhaar/PAN/photo to Supabase Storage  |

## Broker only

| Method | Path                         | Purpose                                       |
| ------ | ---------------------------- | --------------------------------------------- |
| POST   | `/api/bookings`              | Create site-visit booking (Aadhaar lock-in)   |
| GET    | `/api/bookings?as=broker`    | Broker's bookings                             |
| POST   | `/api/bookings/visit`        | Mark a visit completed → trigger coin credits |

## Corporate only

| Method | Path                              | Purpose                              |
| ------ | --------------------------------- | ------------------------------------ |
| GET    | `/api/corporate/referral-code`    | Get current code                     |
| POST   | `/api/corporate/referral-code`    | Generate/rotate referral code        |
| GET    | `/api/corporate/referrals`        | List referred users + their visits   |

## Referrer (client) only

| Method | Path                              | Purpose                              |
| ------ | --------------------------------- | ------------------------------------ |
| GET    | `/api/bookings?as=client`         | My bookings & coin credits per visit |

## Payments

| Method | Path                              | Purpose                              |
| ------ | --------------------------------- | ------------------------------------ |
| POST   | `/api/payments/milestone`         | Create Razorpay order (50/25/25)     |
| POST   | `/api/payments/webhook`           | Razorpay event receiver              |

## Admin only

| Method | Path                              | Purpose                              |
| ------ | --------------------------------- | ------------------------------------ |
| GET    | `/api/admin/users?role=broker`    | Search users                         |
| POST   | `/api/admin/rera-verify`          | Approve/reject broker's RERA         |
| POST   | `/api/admin/projects`             | Create project                       |
| PATCH  | `/api/admin/projects/[id]`        | Update project                       |
| GET    | `/api/admin/ledger`               | Global coin ledger                   |
| POST   | `/api/admin/ledger/adjust`        | Manual ledger adjustment (audited)   |
| GET    | `/api/admin/payouts`              | All payout requests                  |
| POST   | `/api/admin/payouts/[id]/process` | Trigger Razorpay payout              |

---

## Visit Bonus trigger logic (server-side, in a transaction)

```text
on POST /api/bookings/visit
  let b = SELECT * FROM bookings WHERE id = $bookingId
  assert b.broker_id == current_user.id  (or admin)
  assert visit.attendees.length >= 2 family members  (DB trigger also enforces)

  let n = b.visits_completed + 1
  UPDATE bookings SET visits_completed = n, last_visit_at = now()

  if n == 1 or n == 2:
      INSERT coin_ledger(user_id=b.client_id,        source='visit_'||n,            delta=+10000, balance_after=...)
      if b.client.referred_by_corporate is not null:
          INSERT coin_ledger(user_id=b.client.referred_by_corporate, source='visit_'||n||'_corporate', delta=+5000)
  -- else: visit 3+ : NO bonus
```

## Coin Redemption logic (server-side, in a transaction)

```text
on POST /api/coins/redeem { bookingId, amount, method, dest }
  let b = SELECT * FROM bookings WHERE id = $bookingId AND client_id = current_user.id
  assert b.first_milestone_paid_at IS NOT NULL  -- "50% paid" gate

  SELECT FOR UPDATE balance FROM wallets WHERE user_id = current_user.id
  let cap = LEAST(balance * 0.5, 100000)
  assert amount > 0 and amount <= cap

  INSERT coin_ledger(user_id, source='redemption', delta=-amount, balance_after=balance - amount)
  INSERT payout_requests(user_id, amount, method, dest, status='queued')
  ENQUEUE razorpay_payout job
```
