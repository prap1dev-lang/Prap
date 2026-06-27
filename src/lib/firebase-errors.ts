// Map Firebase Auth error codes to clear, user-facing messages. Shared by the
// login and signup OTP flows so both surface the same wording.

export function friendlyFirebaseError(e: any): string {
  switch (e?.code) {
    case "auth/invalid-phone-number":
      return "That phone number isn't valid. Enter a 10-digit Indian mobile.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/quota-exceeded":
      return "OTP service is busy right now. Please try again shortly.";
    case "auth/code-expired":
    case "auth/session-expired":
      return "Your code expired. Please request a new OTP.";
    case "auth/captcha-check-failed":
      return "Verification failed. Please try again.";
    case "auth/invalid-verification-code":
      return "That OTP is incorrect. Please re-enter the 6-digit code.";
    case "auth/operation-not-allowed":
      // Phone sign-in is disabled, or SMS to this region isn't allowed in the
      // Firebase Console (Authentication → Settings → SMS region policy).
      return "OTP sign-in is temporarily unavailable. Our team has been notified — please try again shortly or use password login.";
    case "auth/billing-not-enabled":
      return "OTP service is being set up. Please try again shortly or use password login.";
    default:
      return e?.message?.replace(/^Firebase:\s*/, "") || "Failed to send OTP";
  }
}
