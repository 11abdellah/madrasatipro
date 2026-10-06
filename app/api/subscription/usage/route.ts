import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession, handleApiError } from "@/lib/auth/session";
import { getSubscriptionContext } from "@/lib/services/entitlements";

export const dynamic = "force-dynamic";

// GET /api/subscription/usage - Get current subscription plan, limits, and usage
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const context = await getSubscriptionContext(session.institutionId);

    return NextResponse.json(context);
  } catch (error) {
    return handleApiError(error);
  }
}
