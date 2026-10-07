import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// PATCH /api/super-admin/plans/[id] - Update plan details & prices (SUPER_ADMIN ONLY)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (session.role !== "SUPER_ADMIN" && !session.isSuperAdmin) {
      return NextResponse.json(
        { error: "غير مصرح لك بتعديل خطط الاشتراك" },
        { status: 403 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "معرف الخطة مطلوب" }, { status: 400 });
    }

    const body = await req.json();
    const {
      name,
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

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (priceDZD !== undefined) updateData.priceDZD = Number(priceDZD);
    if (annualPriceDZD !== undefined) updateData.annualPriceDZD = annualPriceDZD ? Number(annualPriceDZD) : null;
    if (maxStudents !== undefined) updateData.maxStudents = Number(maxStudents);
    if (maxTeachers !== undefined) updateData.maxTeachers = Number(maxTeachers);
    if (maxBranches !== undefined) updateData.maxBranches = Number(maxBranches);
    if (maxGroups !== undefined) updateData.maxGroups = Number(maxGroups);
    if (storageLimitGB !== undefined) updateData.storageLimitGB = Number(storageLimitGB);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    if (features !== undefined) {
      updateData.features = Array.isArray(features) ? JSON.stringify(features) : features;
    }

    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id },
      data: updateData,
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        institutionId: session.institutionId || undefined,
        userId: session.userId,
        action: "PLAN_UPDATED",
        entity: "SubscriptionPlan",
        entityId: id,
        details: `تعديل بيانات وسعر خطة "${updatedPlan.name}" إلى ${updatedPlan.priceDZD} دج`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `تم تحديث خطة "${updatedPlan.name}" بنجاح`,
      plan: {
        ...updatedPlan,
        features: typeof updatedPlan.features === "string" ? JSON.parse(updatedPlan.features) : updatedPlan.features,
      },
    });
  } catch (error: any) {
    console.error("PATCH /api/super-admin/plans/[id] error:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "الخطة غير موجودة" }, { status: 404 });
    }
    return NextResponse.json({ error: "تعذر تحديث الخطة في قاعدة البيانات" }, { status: 500 });
  }
}

// DELETE /api/super-admin/plans/[id] - Delete or deactivate a plan (SUPER_ADMIN ONLY)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (session.role !== "SUPER_ADMIN" && !session.isSuperAdmin) {
      return NextResponse.json(
        { error: "غير مصرح لك بحذف خطط الاشتراك" },
        { status: 403 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "معرف الخطة مطلوب" }, { status: 400 });
    }

    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: "الخطة غير موجودة" }, { status: 404 });
    }

    // Check if any subscriptions are linked to this plan
    if (existingPlan._count.subscriptions > 0) {
      // If there are existing subscriptions, deactivate it (soft delete) to protect database integrity
      await prisma.subscriptionPlan.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        message: `تم إلغاء تفعيل وإخفاء خطة "${existingPlan.name}" بنجاح من صفحة الهبوط ولوحة التحكم (تم الاحتفاظ بها في السجلات لوجود ${existingPlan._count.subscriptions} مؤسسة مشتركة بها).`,
      });
    }

    // Otherwise permanently delete it from the database
    await prisma.subscriptionPlan.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `تم حذف خطة "${existingPlan.name}" نهائياً من قاعدة البيانات بنجاح.`,
    });
  } catch (error: any) {
    console.error("DELETE /api/super-admin/plans/[id] error:", error);
    return NextResponse.json({ error: "تعذر حذف الخطة" }, { status: 500 });
  }
}

