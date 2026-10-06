import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, handleApiError } from "@/lib/auth/session";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// GET /api/settings - Retrieve institution & user profile settings
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();

    const [institution, user] = await Promise.all([
      prisma.institution.findUnique({
        where: { id: session.institutionId },
        include: {
          branches: true,
          subscription: { include: { plan: true } },
        },
      }),
      prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
        },
      }),
    ]);

    if (!institution) {
      return NextResponse.json({ error: "المؤسسة غير موجودة" }, { status: 404 });
    }

    return NextResponse.json({
      institution: {
        id: institution.id,
        code: institution.code,
        name: institution.name,
        wilayaCode: institution.wilayaCode,
        address: institution.address || "",
        phone: institution.phone || "",
        email: institution.email || "",
        brandColor: institution.brandColor || "#E05B3A",
        logoUrl: institution.logoUrl || null,
        academicYear: institution.academicYear || "2025-2026",
        currency: institution.currency || "DZD",
        status: institution.status,
        plan: institution.subscription?.plan?.name || "الخطة القياسية",
      },
      user,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/settings - Update institution and/or user settings
export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();

    const {
      name,
      wilayaCode,
      address,
      phone,
      email,
      brandColor,
      academicYear,
      userFullName,
      userPhone,
      newPassword,
    } = body;

    // 1. Update Institution
    const updatedInst = await prisma.institution.update({
      where: { id: session.institutionId },
      data: {
        name: name !== undefined ? name : undefined,
        wilayaCode: wilayaCode !== undefined ? Number(wilayaCode) : undefined,
        address: address !== undefined ? address : undefined,
        phone: phone !== undefined ? phone : undefined,
        email: email !== undefined ? email : undefined,
        brandColor: brandColor !== undefined ? brandColor : undefined,
        academicYear: academicYear !== undefined ? academicYear : undefined,
      },
    });

    // 2. Update User if provided
    const userUpdateData: any = {};
    if (userFullName) userUpdateData.fullName = userFullName;
    if (userPhone) userUpdateData.phone = userPhone;
    if (newPassword && newPassword.trim().length >= 6) {
      userUpdateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: session.userId },
        data: userUpdateData,
      });
    }

    // 3. Audit Log
    await prisma.auditLog.create({
      data: {
        institutionId: session.institutionId,
        userId: session.userId,
        action: "SETTINGS_UPDATED",
        entity: "Institution",
        entityId: updatedInst.id,
        details: JSON.stringify({ name: updatedInst.name, year: updatedInst.academicYear }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم حفظ وتحديث الإعدادات بنجاح في قاعدة البيانات",
      institution: updatedInst,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
