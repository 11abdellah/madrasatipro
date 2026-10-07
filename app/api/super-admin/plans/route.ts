import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/super-admin/plans - Fetch subscription plans (active only by default, or all if includeInactive=true)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where = includeInactive ? {} : { isActive: true };

    const plans = await prisma.subscriptionPlan.findMany({
      where,
      orderBy: { priceDZD: "asc" },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      plans: plans.map((p) => ({
        ...p,
        features: typeof p.features === "string" ? JSON.parse(p.features) : p.features,
        subscriberCount: p._count.subscriptions,
      })),
    });
  } catch (error) {
    console.error("GET /api/super-admin/plans error:", error);
    return NextResponse.json({ error: "تعذر جلب خطط الاشتراكات" }, { status: 500 });
  }
}

// POST /api/super-admin/plans - Create a new plan (SUPER_ADMIN ONLY)
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (session.role !== "SUPER_ADMIN" && !session.isSuperAdmin) {
      return NextResponse.json(
        { error: "غير مصرح لك بتعديل أو إضافة خطط الاشتراك" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      slug,
      description,
      priceDZD,
      annualPriceDZD,
      maxStudents,
      maxTeachers,
      maxBranches,
      maxGroups,
      storageLimitGB,
      features,
      isActive,
    } = body;

    if (!name || priceDZD === undefined) {
      return NextResponse.json(
        { error: "اسم الخطة والسعر الشهري مطلوبان" },
        { status: 400 }
      );
    }

    const planSlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, "-");

    const newPlan = await prisma.subscriptionPlan.create({
      data: {
        name,
        slug: planSlug,
        description: description || undefined,
        priceDZD: Number(priceDZD),
        annualPriceDZD: annualPriceDZD ? Number(annualPriceDZD) : undefined,
        maxStudents: Number(maxStudents) || 50,
        maxTeachers: Number(maxTeachers) || 10,
        maxBranches: Number(maxBranches) || 1,
        maxGroups: Number(maxGroups) || 10,
        storageLimitGB: Number(storageLimitGB) || 10,
        features: Array.isArray(features) ? JSON.stringify(features) : features || "[]",
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `تم إنشاء خطة "${name}" بنجاح`,
      plan: newPlan,
    });
  } catch (error: any) {
    console.error("POST /api/super-admin/plans error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "اسم الخطة أو الرمز التعريفي مسجل مسبقاً" }, { status: 400 });
    }
    return NextResponse.json({ error: "تعذر إنشاء الخطة" }, { status: 500 });
  }
}
