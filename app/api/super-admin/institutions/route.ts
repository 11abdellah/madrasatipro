import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, createSessionToken } from "@/lib/auth/session";
import bcrypt from "bcryptjs";
import { ensureInstitutionSubjects } from "@/lib/constants/subjects";

export const dynamic = "force-dynamic";

// GET /api/super-admin/institutions - List all institutions with metrics & plans (SUPER_ADMIN ONLY)
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (session.role !== "SUPER_ADMIN" && !session.isSuperAdmin) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول إلى لوحة المالك Super Admin" },
        { status: 403 }
      );
    }

    const institutions = await prisma.institution.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        subscription: {
          include: { plan: true },
        },
        users: {
          where: { role: { in: ["ADMIN", "OWNER"] } },
          select: { id: true, fullName: true, email: true, phone: true },
        },
        _count: {
          select: {
            students: true,
            teachers: true,
            classGroups: true,
            invoices: true,
          },
        },
      },
    });

    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
    });

    const stats = {
      totalInstitutions: institutions.length,
      activeInstitutions: institutions.filter((i) => i.status === "ACTIVE").length,
      pendingInstitutions: institutions.filter((i) => i.status === "PENDING_APPROVAL").length,
      suspendedInstitutions: institutions.filter((i) => i.status === "SUSPENDED").length,
      totalStudentsAcrossSaaS: institutions.reduce((acc, i) => acc + i._count.students, 0),
      totalTeachersAcrossSaaS: institutions.reduce((acc, i) => acc + i._count.teachers, 0),
      estimatedMonthlyMRR: institutions
        .filter((i) => i.status === "ACTIVE")
        .reduce((acc, i) => acc + (i.subscription?.plan?.priceDZD || 0), 0),
    };

    return NextResponse.json({
      institutions,
      plans,
      stats,
    });
  } catch (error) {
    console.error("Super Admin institutions error:", error);
    return NextResponse.json({ error: "تعذر استرجاع قائمة المؤسسات" }, { status: 500 });
  }
}

// POST /api/super-admin/institutions - Create / Onboard / Register an institution
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      code,
      wilayaCode,
      planId,
      adminName,
      adminEmail,
      adminPhone,
      password,
      status,
      address,
    } = body;

    if (!name || !adminEmail || !adminName) {
      return NextResponse.json(
        { error: "يرجى ملء جميع الحقول الإلزامية للمؤسسة والمدير" },
        { status: 400 }
      );
    }

    // Determine initial status
    let session = null;
    try {
      session = await getCurrentSession();
    } catch (e) {
      // Unauthenticated public registration
    }

    const isCallerSuperAdmin = session?.role === "SUPER_ADMIN" || session?.isSuperAdmin;
    const institutionStatus = status || (isCallerSuperAdmin ? "ACTIVE" : "PENDING_APPROVAL");

    // Resolve subscription plan
    let resolvedPlan = null;
    if (planId) {
      resolvedPlan = await prisma.subscriptionPlan.findFirst({
        where: {
          OR: [
            { id: planId },
            { name: { contains: planId } },
          ],
        },
      });
    }
    if (!resolvedPlan) {
      resolvedPlan = await prisma.subscriptionPlan.findFirst({
        where: { isActive: true },
        orderBy: { priceDZD: "asc" },
      });
    }

    const cleanCode = code
      ? code.toLowerCase().replace(/[^a-z0-9-]/g, "")
      : `inst-${Date.now().toString().slice(-6)}`;

    // Create institution
    const newInst = await prisma.institution.create({
      data: {
        name,
        code: cleanCode,
        wilayaCode: Number(wilayaCode) || 19,
        status: institutionStatus,
        academicYear: "2025-2026",
      },
    });

    // Create main branch
    const branch = await prisma.branch.create({
      data: {
        institutionId: newInst.id,
        name: `المقر الرئيسي — ${name}`,
        wilayaCode: Number(wilayaCode) || 19,
        address: address || undefined,
        isMain: true,
      },
    });

    // Create Admin User
    const passwordHash = await bcrypt.hash(password || "Madrasati2026!", 10);
    const adminUser = await prisma.user.create({
      data: {
        institutionId: newInst.id,
        fullName: adminName,
        email: adminEmail.toLowerCase().trim(),
        phone: adminPhone || "0550000000",
        passwordHash,
        role: "ADMIN",
      },
    });

    // Resolve Payment Method for historical subscription snapshot
    let chosenMethod = null;
    if (body.paymentMethodId) {
      chosenMethod = await prisma.paymentMethod.findUnique({ where: { id: body.paymentMethodId } });
    } else if (body.paymentMethod || body.paymentMethodCode) {
      const codeToSearch = body.paymentMethod || body.paymentMethodCode;
      chosenMethod = await prisma.paymentMethod.findFirst({
        where: { OR: [{ code: codeToSearch }, { name: { contains: codeToSearch } }] },
      });
    }

    // Create Subscription
    if (resolvedPlan) {
      await prisma.subscription.create({
        data: {
          institutionId: newInst.id,
          planId: resolvedPlan.id,
          status: institutionStatus === "ACTIVE" ? "ACTIVE" : "PENDING_APPROVAL",
          billingCycle: "MONTHLY",
          paymentMethodId: chosenMethod?.id || null,
          paymentMethodCode: chosenMethod?.code || body.paymentMethod || null,
          paymentMethodName: chosenMethod?.name || chosenMethod?.displayName || body.paymentMethod || null,
          transferReference: body.transferReference || null,
          startDate: new Date(),
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Create default classroom & all standard Algerian subjects
    await prisma.classroom.create({
      data: { institutionId: newInst.id, branchId: branch.id, name: "قاعة 01", capacity: 20 },
    });

    await ensureInstitutionSubjects(newInst.id, prisma);

    // If this was self-registration, generate session token and set cookie
    const response = NextResponse.json({
      success: true,
      message:
        institutionStatus === "ACTIVE"
          ? `تم إنشاء مؤسسة "${name}" بنجاح`
          : `تم استلام طلب تسجيل مؤسسة "${name}" بنجاح وهو قيد المراجعة`,
      institution: newInst,
      status: institutionStatus,
      admin: { email: adminUser.email, name: adminUser.fullName },
    });

    if (!isCallerSuperAdmin) {
      const token = await createSessionToken({
        userId: adminUser.id,
        email: adminUser.email,
        fullName: adminUser.fullName,
        role: adminUser.role,
        institutionId: newInst.id,
        branchId: branch.id,
        isSuperAdmin: false,
      });

      response.cookies.set("noubla_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error: any) {
    console.error("Create institution error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "البريد الإلكتروني أو رمز المؤسسة مسجل مسبقاً" }, { status: 400 });
    }
    return NextResponse.json({ error: "تعذر إنشاء المؤسسة" }, { status: 500 });
  }
}

// PATCH /api/super-admin/institutions - Suspend, activate, approve, or change plan (SUPER_ADMIN ONLY)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (session.role !== "SUPER_ADMIN" && !session.isSuperAdmin) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول إلى لوحة المالك Super Admin" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { institutionId, status, planId } = body;

    if (!institutionId) {
      return NextResponse.json({ error: "معرف المؤسسة مطلوب" }, { status: 400 });
    }

    if (status) {
      await prisma.institution.update({
        where: { id: institutionId },
        data: { status },
      });

      // Also sync subscription status if activating or suspending
      if (status === "ACTIVE") {
        await prisma.subscription.updateMany({
          where: { institutionId },
          data: { status: "ACTIVE" },
        });
      } else if (status === "SUSPENDED") {
        await prisma.subscription.updateMany({
          where: { institutionId },
          data: { status: "SUSPENDED" },
        });
      }
    }

    if (planId) {
      await prisma.subscription.updateMany({
        where: { institutionId },
        data: { planId },
      });
    }

    return NextResponse.json({ success: true, message: "تم تحديث حالة المؤسسة واشتراكها بنجاح" });
  } catch (error) {
    console.error("Update institution error:", error);
    return NextResponse.json({ error: "تعذر تعديل المؤسسة" }, { status: 500 });
  }
}
