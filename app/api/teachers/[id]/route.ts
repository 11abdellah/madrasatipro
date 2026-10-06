import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";

// GET /api/teachers/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const teacher = await prisma.teacher.findFirst({
      where: {
        id: params.id,
        institutionId: session.institutionId,
      },
      include: {
        classGroups: true,
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "الأستاذ غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ teacher });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في جلب بيانات الأستاذ" }, { status: 500 });
  }
}

// PATCH /api/teachers/[id] - Update teacher details
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();

    const existing = await prisma.teacher.findFirst({
      where: {
        id: params.id,
        institutionId: session.institutionId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "الأستاذ غير موجود" }, { status: 404 });
    }

    const firstName = body.firstName !== undefined ? body.firstName : existing.firstName;
    const lastName = body.lastName !== undefined ? body.lastName : existing.lastName;
    const fullName = (body.firstName || body.lastName) ? `أ. ${firstName} ${lastName}` : existing.fullName;
    const joinDate = body.startDate !== undefined ? body.startDate : (body.joinDate !== undefined ? body.joinDate : existing.joinDate);
    const rawWageType = body.wageType !== undefined ? body.wageType : existing.wageType;
    const wageType = rawWageType === "monthly" ? "fixed" : rawWageType;

    const updated = await prisma.teacher.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        fullName,
        phone: body.phone !== undefined ? body.phone : existing.phone,
        email: body.email !== undefined ? body.email : existing.email,
        specialization: body.specialization !== undefined ? body.specialization : existing.specialization,
        joinDate,
        wageType,
        contractType: wageType,
        hourlyRate: body.hourlyRate !== undefined ? Number(body.hourlyRate) : existing.hourlyRate,
        fixedSalary: body.fixedSalary !== undefined ? Number(body.fixedSalary) : existing.fixedSalary,
        status: body.status !== undefined ? body.status : existing.status,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        institutionId: session.institutionId,
        userId: session.userId,
        action: "TEACHER_UPDATED",
        entity: "Teacher",
        entityId: updated.id,
        details: `تم تحديث بيانات الأستاذ ${updated.fullName}`,
      },
    });

    return NextResponse.json({ success: true, teacher: updated });
  } catch (error: any) {
    console.error("PATCH /api/teachers/[id] error:", error);
    return NextResponse.json({ error: "تعذر تحديث بيانات الأستاذ" }, { status: 500 });
  }
}

// DELETE /api/teachers/[id] - Safe archive teacher
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();

    const existing = await prisma.teacher.findFirst({
      where: {
        id: params.id,
        institutionId: session.institutionId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "الأستاذ غير موجود" }, { status: 404 });
    }

    // Soft delete / archive
    const archived = await prisma.teacher.update({
      where: { id: params.id },
      data: { status: "ARCHIVED" },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        institutionId: session.institutionId,
        userId: session.userId,
        action: "TEACHER_ARCHIVED",
        entity: "Teacher",
        entityId: archived.id,
        details: `تمت أرشفة الأستاذ ${archived.fullName} بنجاح.`,
      },
    });

    return NextResponse.json({ success: true, message: "تمت أرشفة الأستاذ بنجاح" });
  } catch (error: any) {
    console.error("DELETE /api/teachers/[id] error:", error);
    return NextResponse.json({ error: "تعذر أرشفة الأستاذ" }, { status: 500 });
  }
}
