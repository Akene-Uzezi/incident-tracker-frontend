import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function apiOrigin(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_apiurl || "http://localhost:3001").origin;
  } catch {
    return "";
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const superAdminRoutes = [
    "/dashboard/register",
    "/dashboard/users",
    "/dashboard/resetpassword",
  ];

  const isSuperAdminRoute = superAdminRoutes.some(route => pathname.startsWith(route));

  if (isSuperAdminRoute) {
    const userRole = request.cookies.get("user_role")?.value;
    if (!userRole || userRole.toLowerCase() !== "superadmin") {
      const redirectUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Per-request nonce for the theme-detection inline script (see app/layout.tsx +
  // components/inline-script.tsx). Forwarded via a request header so the Server
  // Component layout can read it with next/headers and stamp it onto the <script>.
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  const origin = apiOrigin();
  // React/Next's dev-mode debugging (Fast Refresh, stack-frame reconstruction) uses
  // eval() and is only ever active outside production — never shipped to real users.
  const isDev = process.env.NODE_ENV !== "production";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ""}`,
    // Inline style ATTRIBUTES set by React/Radix/Framer Motion are largely CSSOM
    // writes (CSP-exempt), but some vendor code sets style via cssText/setAttribute,
    // which does need this. Style injection is a much weaker primitive than script
    // injection, so this is an accepted trade-off rather than a nonce for styles too.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${origin ? ` ${origin}` : ""}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
