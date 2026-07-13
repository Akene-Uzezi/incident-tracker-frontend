import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const superAdminRoutes = [
    "/dashboard/register",
    "/dashboard/users",
    "/dashboard/resetpassword",
  ];

  const isSuperAdminRoute = superAdminRoutes.some(route => {
    pathname.startsWith(route)
  })

  if (isSuperAdminRoute) {
    const userRole = request.cookies.get("user_role")?.value;
    if (!userRole || userRole.toLowerCase() !== "superadmin") {
      const redirectUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
};

export const confit = {
  matcher: [
    "/dashboard/register/:path*",
    "/dashboard/users/:path*",
    "/dashboard/resetpassword/:path*",
  ]
};
