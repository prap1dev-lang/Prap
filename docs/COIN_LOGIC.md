# PRAP Coin — Mathematical & Business Rules

> **Invariant:** `1 PRAP Coin = ₹1` (integer arithmetic everywhere; no floats).

## 1. Earn

| Source                | Amount (Coins)                | When                                         |
| --------------------- | ----------------------------- | -------------------------------------------- |
| Onboarding            | 25,000                        | Successful registration + KYC OTP            |
| Visit 1 (Referrer)    | 10,000                        | Site visit 1 completed (≥2 family present)   |
| Visit 1 (Corporate)   | 5,000                         | Same trigger, credited to corporate          |
| Visit 2 (Referrer)    | 10,000                        | Site visit 2 completed                       |
| Visit 2 (Corporate)   | 5,000                         | Same trigger                                 |
| Visit 3+              | **0**                         | No bonus                                     |
| Investment-tier bonus | 25k / 50k / 75k               | First milestone (50%) captured               |

Investment tiers (on `total_property_price_inr`):
- ≤ ₹1 Cr → 25,000
- ₹1 Cr – ₹2 Cr → 50,000
- ₹2 Cr – ₹3 Cr → 75,000
- > ₹3 Cr → 75,000 (top tier retained; extend if/when needed)

## 1b. Broker programme (admin-credited)

A broker joins PRAP with **5 free client slots** to add clients and close deals.
Credits are triggered by admins from the Bookings panel (idempotent per booking):

| Event                                   | Broker  | Client  | Notes                                            |
| --------------------------------------- | ------- | ------- | ------------------------------------------------ |
| Client added + does a **property view** | +25,000 | +25,000 | "Credit view" — consumes one client slot         |
| **Deal closes**                         | +5,000  | +5,000  | "Close deal" — on first or a later visit         |

- If a deal does **not** close on the first visit, the client gets **3 more
  visits with no credit**; closing later still pays the close bonus.
- **Slot refill:** after every **5 closed deals**, the next batch of **5 client
  slots** unlocks automatically.
- **Redemption ceiling by deal value:** deal `< ₹1 Cr` → redeem up to **25,000**;
  deal `≥ ₹1 Cr` → redeem up to **45,000** (`brokerRedeemCap()` in `lib/coins.ts`).

Tracking columns on `users`: `broker_slots_total`, `broker_slots_used`,
`broker_deals_closed` (see `MIGRATION_BROKER_COINS.sql`). Ledger sources:
`broker_view_bonus`, `broker_deal_close`.

> The legacy auto-bonus visit logic (`credit_visit` RPC, `VISIT_BONUS`) remains
> for the corporate/referrer path; the broker path uses the admin buttons above.

## 2. Spend / Redeem

### As discount on milestones
Applied directly against the gross amount due. `coin_discount ≤ gross_due`.

### As bank/UPI withdrawal
Allowed **only after** the first 50% property milestone is captured.

```
max_withdraw_per_request = MIN(balance * 0.5, 1,00,000)
```

Multiple requests are allowed, each capped — and each must pass the 50% rule.

## 3. Holds / Reversals

When the user applies coins to a not-yet-captured Razorpay order:
1. Insert a `hold` ledger row (`delta = -applied`) to "reserve" the coins.
2. On `payment.captured` webhook → convert `hold` to `milestone_discount` (same delta).
3. On `payment.failed` or `refund` → insert a `release` row with opposite delta.

## 4. Concurrency & Integrity

- All wallet mutations go through `coin_ledger` (append-only).
- The `trg_sync_wallet` trigger keeps `wallets` denormalized for fast reads.
- Use `SELECT FOR UPDATE` on wallet row before any debit to prevent race conditions.
- `coin_ledger.balance_after` is computed in app code under the row lock, so it
  is correct serially even under contention.

## 5. Audit

- Every admin adjustment goes through `coin_source = 'admin_adjustment'` with a note.
- All ledger reads/writes are also mirrored to `audit_log` for sensitive flows.
