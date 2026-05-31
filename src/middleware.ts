import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_PREFIXES = ["/admin", "/dashboard"];
const PUBLIC_WITHIN_PROTECTED = new Set<string>([
  "/admin/login",       // dedicated admin sign-in
]);

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet) => {
          res = NextResponse.next({ request: req });
          toSet.forEach(({ name, value, options }) =>
            res.cookies.set({ name, value, ...options }),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;
  const isProtected =
    PROTECTED_PREFIXES.some((p) => path.startsWith(p)) &&
    !PUBLIC_WITHIN_PROTECTED.has(path);

  if (isProtected && !user) {
    const url = req.nextUrl.clone();
    // Send admin attempts to /admin/login, everything else to /auth/login.
    url.pathname = path.startsWith("/admin") ? "/admin/login" : "/auth/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
