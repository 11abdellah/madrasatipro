import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  assertWithinLimit,
  LimitExceededError,
  SubscriptionInactiveError,
  getSubscriptionContext,
} from "@/lib/services/entitlements";

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "noubla_super_secret_jwt_key_2026_algeria_edtech"
);

export class UnauthorizedError extends Error {
  statusCode = 401;
  code = "UNAUTHORIZED";
  constructor(message = "يرجى تسجيل الدخول للوصول إلى هذا المورد") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  institutionId: string;
  branchId?: string;
  isSuperAdmin?: boolean;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Returns current authenticated user and strict tenant context.
 * The backend ALWAYS determines institutionId from the session, never trusting client request bodies.
 * Throws UnauthorizedError if unauthenticated. NO FALLBACK TO DEMO DATA.
 */
export async function getCurrentSession(): Promise<SessionPayload> {
  const cookieStore = cookies();
  const token = cookieStore.get("noubla_session")?.value;
  const tenantOverride = cookieStore.get("noubla_tenant_override")?.value;

  if (token) {
    const session = await verifySessionToken(token);
    if (session) {
      // If user is SUPER_ADMIN and switched tenant context, allow override
      if (session.isSuperAdmin && tenantOverride) {
        return {
          ...session,
          institutionId: tenantOverride,
        };
      }
      return session;
    }
  }

  // Strictly throw UnauthorizedError. Do NOT leak seed or demo institution data!
  throw new UnauthorizedError();
}

/**
 * Server-side subscription limits enforcement wrapper.
 */
export async function checkSubscriptionLimit(
  institutionId: string,
  resource: "students" | "teachers" | "branches" | "groups"
): Promise<{ allowed: boolean; message?: string; currentCount?: number; maxAllowed?: number; planName?: string }> {
  try {
    const result = await assertWithinLimit(institutionId, resource, prisma);
    return { allowed: true, currentCount: result.currentCount, maxAllowed: result.maxAllowed, planName: result.planName };
  } catch (err: any) {
    return {
      allowed: false,
      message: err.message,
      currentCount: err.currentUsage,
      maxAllowed: err.maxLimit,
      planName: err.planName,
    };
  }
}

export async function requirePermission(permission: string): Promise<SessionPayload> {
  const session = await getCurrentSession();
  if (session.role === "SUPER_ADMIN" || session.role === "OWNER" || session.role === "ADMIN") {
    return session;
  }
  throw new Error("غير مصرح لك بتنفيذ هذه العملية");
}

/**
 * Standardized API error response handler.
 * Automatically catches UnauthorizedError (401), LimitExceededError (409), and SubscriptionInactiveError (403).
 */
export function handleApiError(error: any): NextResponse {
  if (error instanceof UnauthorizedError || error?.name === "UnauthorizedError" || error?.code === "UNAUTHORIZED") {
    return NextResponse.json({ error: error.message || "يرجى تسجيل الدخول للمتابعة", code: "UNAUTHORIZED" }, { status: 401 });
  }

  if (error instanceof LimitExceededError || error?.code === "PLAN_LIMIT_REACHED") {
    return NextResponse.json(
      {
        error: error.message,
        code: "PLAN_LIMIT_REACHED",
        resource: error.resource,
        currentUsage: error.currentUsage,
        maxLimit: error.maxLimit,
        planName: error.planName,
      },
      { status: 409 }
    );
  }

  if (error instanceof SubscriptionInactiveError || error?.code === "SUBSCRIPTION_INACTIVE") {
    return NextResponse.json(
      {
        error: error.message,
        code: "SUBSCRIPTION_INACTIVE",
        status: error.status,
      },
      { status: 403 }
    );
  }

  console.error("API error:", error);
  return NextResponse.json({ error: error.message || "حدث خطأ غير متوقع في الخادم" }, { status: 500 });
}
