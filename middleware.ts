import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose/jwt/verify";

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "noubla_super_secret_jwt_key_2026_algeria_edtech"
);

interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  institutionId: string;
  isSuperAdmin?: boolean;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("noubla_session")?.value;

  let session: SessionPayload | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      session = payload as unknown as SessionPayload;
    } catch (err) {
      session = null;
    }
  }

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isSuperAdminRoute = pathname.startsWith("/super-admin");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isPendingApprovalRoute = pathname === "/pending-approval";

  // 1. If trying to access protected routes without a valid session, redirect to login
  if (!session && (isSuperAdminRoute || isDashboardRoute || isPendingApprovalRoute)) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If already logged in and visiting login/register, redirect to appropriate area
  if (session && isAuthRoute) {
    const isSuperAdmin = session.role === "SUPER_ADMIN" || Boolean(session.isSuperAdmin);
    if (isSuperAdmin) {
      return NextResponse.redirect(new URL("/super-admin", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 3. If accessing super-admin route but not a super-admin, redirect to dashboard
  if (session && isSuperAdminRoute) {
    const isSuperAdmin = session.role === "SUPER_ADMIN" || Boolean(session.isSuperAdmin);
    if (!isSuperAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/super-admin/:path*",
    "/pending-approval",
    "/login",
    "/register",
  ],
};
