"use client";
import { useEffect, useRef, useState } from "react";

// Globals injected by MSG91's otp-provider.js when initialized with
// exposeMethods: true.
declare global {
  interface Window {
    initSendOTP?: (config: any) => void;
    sendOtp?: (identifier: string, success: (d: any) => void, failure: (e: any) => void) => void;
    verifyOtp?: (otp: string, success: (d: any) => void, failure: (e: any) => void) => void;
    retryOtp?: (channel: number | undefined, success: (d: any) => void, failure: (e: any) => void) => void;
  }
}

// MSG91 ships two CDN hosts — try the primary, fall back to phone91.com on error.
const SCRIPT_URLS = [
  "https://verify.msg91.com/otp-provider.js",
  "https://verify.phone91.com/otp-provider.js",
];
const SCRIPT_ATTR = "data-msg91-otp";

type Status = "loading" | "ready" | "error";

type UseWidgetReturn = {
  status: Status;
  error: string | null;
  /** Send OTP. Returns a promise that resolves when MSG91 confirms send. */
  send: (mobileE164: string) => Promise<void>;
  /** Verify OTP. Resolves with the MSG91 access-token (opaque string). */
  verify: (otp: string) => Promise<string>;
  /** Resend, optionally as voice call. */
  resend: (voice?: boolean) => Promise<void>;
};

/**
 * Loads MSG91's hosted OTP widget script once and exposes typed wrappers
 * around its global send/verify methods. The widget handles SMS sending,
 * OTP storage and verification entirely on MSG91's side using their
 * pre-approved DLT templates — no DLT registration needed on our side.
 */
export function useMsg91Widget(): UseWidgetReturn {
  const widgetId = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID;
  const tokenAuth = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH;
  const bypass = process.env.NEXT_PUBLIC_MSG91_DEV_BYPASS === "true";
  const [status, setStatus] = useState<Status>(bypass ? "ready" : "loading");
  const [error, setError] = useState<string | null>(null);
  const accessTokenRef = useRef<string | null>(null);

  useEffect(() => {
    // Dev bypass — never load the MSG91 script.
    if (bypass) {
      console.warn("[MSG91 DEV BYPASS] Widget skipped. Use OTP 123456 to verify.");
      setStatus("ready");
      return;
    }

    if (!widgetId || !tokenAuth) {
      setStatus("error");
      setError(
        "NEXT_PUBLIC_MSG91_WIDGET_ID / NEXT_PUBLIC_MSG91_TOKEN_AUTH are not set. Configure them in .env.local.",
      );
      return;
    }

    // Already loaded? Initialize immediately.
    if (window.initSendOTP) {
      init();
      return;
    }

    // Inject script tag once. Try primary URL, fall back to phone91 on error.
    if (!document.querySelector(`script[${SCRIPT_ATTR}]`)) {
      tryLoad(0);
    } else {
      // Race: tag exists but onload didn't fire — poll briefly.
      const t = setInterval(() => {
        if (window.initSendOTP) {
          clearInterval(t);
          init();
        }
      }, 200);
      setTimeout(() => clearInterval(t), 8000);
    }

    function tryLoad(i: number) {
      if (i >= SCRIPT_URLS.length) {
        setStatus("error");
        setError("Could not load MSG91 widget script from any CDN. Check network / ad-blocker.");
        return;
      }
      const s = document.createElement("script");
      s.src = SCRIPT_URLS[i];
      s.async = true;
      s.setAttribute(SCRIPT_ATTR, "1");
      s.onload = () => init();
      s.onerror = () => {
        s.remove();
        tryLoad(i + 1);
      };
      document.head.appendChild(s);
    }

    function init() {
      try {
        window.initSendOTP!({
          widgetId,
          tokenAuth,
          exposeMethods: true,
          success: (data: any) => {
            // Top-level success — fires when MSG91 confirms the OTP.
            // `data.message` is the access-token we exchange server-side.
            if (data?.message) accessTokenRef.current = String(data.message);
          },
          failure: (e: any) => {
            console.warn("[msg91 widget] failure", e);
          },
        });
        setStatus("ready");
      } catch (e: any) {
        setStatus("error");
        setError(e?.message || "MSG91 init failed");
      }
    }
  }, [widgetId, tokenAuth]);

  function ensureReady() {
    if (status !== "ready") throw new Error("MSG91 widget not ready");
    if (!window.sendOtp || !window.verifyOtp) {
      throw new Error("MSG91 methods not available — script may not have loaded");
    }
  }

  return {
    status,
    error,
    send: async (mobile) => {
      if (bypass) {
        console.warn(`[MSG91 DEV BYPASS] Pretending to SMS ${mobile}. Use 123456 to verify.`);
        return;
      }
      return new Promise<void>((resolve, reject) => {
        try {
          ensureReady();
          const id = mobile.replace(/^\+/, "");
          window.sendOtp!(
            id,
            () => resolve(),
            (err: any) => reject(new Error(err?.message || JSON.stringify(err))),
          );
        } catch (e: any) {
          reject(e);
        }
      });
    },

    verify: async (otp) => {
      if (bypass) {
        if (otp !== "123456") throw new Error("Invalid OTP (bypass: enter 123456)");
        return "dev-bypass-token";
      }
      return new Promise<string>((resolve, reject) => {
        try {
          ensureReady();
          window.verifyOtp!(
            otp,
            (data: any) => {
              const token = data?.message || accessTokenRef.current;
              if (!token) return reject(new Error("MSG91 returned no access token"));
              resolve(String(token));
            },
            (err: any) => reject(new Error(err?.message || JSON.stringify(err))),
          );
        } catch (e: any) {
          reject(e);
        }
      });
    },

    resend: async (voice = false) => {
      if (bypass) {
        console.warn("[MSG91 DEV BYPASS] Resend skipped. Code is still 123456.");
        return;
      }
      return new Promise<void>((resolve, reject) => {
        try {
          ensureReady();
          window.retryOtp!(
            voice ? 11 : undefined,
            () => resolve(),
            (err: any) => reject(new Error(err?.message || JSON.stringify(err))),
          );
        } catch (e: any) {
          reject(e);
        }
      });
    },
  };
}
