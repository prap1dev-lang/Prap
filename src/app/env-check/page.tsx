"use client";
// Shows exactly what Next.js inlined into the client bundle.

export default function EnvCheck() {
  const vars = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 12) + "…",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.slice(0, 10) + "…",
  };

  return (
    <div style={{ padding: 40, fontFamily: "monospace", lineHeight: 1.8 }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Env check (client bundle)</h1>
      <p style={{ color: "#666" }}>
        These are the values Next.js baked into the JS sent to your browser.
        Any value shown as <strong>undefined</strong> or <strong>(empty)</strong> means
        it wasn't loaded at build/dev startup time.
      </p>
      <table style={{ marginTop: 30, borderCollapse: "collapse" }}>
        <tbody>
          {Object.entries(vars).map(([k, v]) => (
            <tr key={k}>
              <td style={{ padding: "8px 16px", borderBottom: "1px solid #eee", fontWeight: 600 }}>{k}</td>
              <td
                style={{
                  padding: "8px 16px",
                  borderBottom: "1px solid #eee",
                  color: v ? "#059669" : "#dc2626",
                }}
              >
                {v ? String(v) : "❌ undefined / empty"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: 40, padding: 16, background: "#fef3c7", borderRadius: 8 }}>
        <strong>URL in your address bar?</strong>{" "}
        <span id="url" />
        <script
          dangerouslySetInnerHTML={{
            __html: `document.getElementById("url").textContent = window.location.href;`,
          }}
        />
      </p>
    </div>
  );
}
