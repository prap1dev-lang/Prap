"use client";
import { useState } from "react";
import { Banknote, AlertTriangle, CheckCircle2 } from "lucide-react";
import { checkRedeem, COIN } from "@/lib/coins";

export default function RedeemPage() {
  const balance = 25000;
  const paidPercent = 0.0; // demo — flip to 0.5+ to unlock
  const [amount, setAmount] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const max = Math.min(Math.floor(balance * COIN.REDEMPTION.MAX_PERCENT), COIN.REDEMPTION.HARD_CAP_INR);
  const result = checkRedeem({ balance, requested: amount, paidPercent });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Redeem PRAP Coins</h1>
      <p className="mt-2 text-ink-500">
        Withdraw up to 50% of your balance (capped at ₹1,00,000) to your bank account or UPI.
      </p>

      <div className="card p-6 mt-8 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-ink-50 p-4">
            <p className="text-xs text-ink-500">Balance</p>
            <p className="font-bold text-lg">{balance.toLocaleString("en-IN")} Coins</p>
          </div>
          <div className="rounded-xl bg-ink-50 p-4">
            <p className="text-xs text-ink-500">Redeemable cap</p>
            <p className="font-bold text-lg">₹{max.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {paidPercent < COIN.REDEMPTION.UNLOCK_AFTER_PAYMENT_PCT && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 text-amber-900">
            <AlertTriangle className="h-5 w-5 flex-none mt-0.5" />
            <p className="text-sm">
              Redemption unlocks once you have paid <strong>50% of your property milestone</strong>.
              Until then, you can still apply coins as direct discount on milestones.
            </p>
          </div>
        )}

        <div>
          <label className="label">Amount to redeem (₹)</label>
          <input
            className="input"
            type="number"
            min={0}
            max={max}
            value={amount || ""}
            onChange={(e) => setAmount(+e.target.value)}
            placeholder="0"
          />
          <div className="mt-2 flex justify-between text-xs text-ink-500">
            <span>1 Coin = ₹1</span>
            <button type="button" className="font-semibold text-brand-700" onClick={() => setAmount(max)}>
              Use max (₹{max.toLocaleString("en-IN")})
            </button>
          </div>
        </div>

        <div>
          <label className="label">Payout method</label>
          <select className="input">
            <option>UPI — varun@upi</option>
            <option>Bank Transfer — XXXX1234</option>
          </select>
        </div>

        {!result.ok && amount > 0 && (
          <p className="text-sm text-rose-700">{result.reason}</p>
        )}

        <button
          className="btn-primary w-full"
          disabled={!result.ok || submitted}
          onClick={() => setSubmitted(true)}
        >
          <Banknote className="h-4 w-4" />
          {submitted ? "Requested" : "Request Redemption"}
        </button>

        {submitted && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3 text-emerald-900">
            <CheckCircle2 className="h-5 w-5 flex-none mt-0.5" />
            <p className="text-sm">
              Request received. Funds usually arrive within 24 banking hours.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
