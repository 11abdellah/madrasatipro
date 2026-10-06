import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, handleApiError } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/classrooms/[id] - Get classroom details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();

    const classroom = await prisma.classroom.findFirst({
      where: {
        id: params.id,
        institutionId: session.institutionId,
      },
      include: {
        branch: { select: { id: true, name: true } },
        sessions: {
          take: 10,
          orderBy: { sessionDate: "desc" },
          include: {
            group: { select: { id: true, name: true } },
            teacher: { select: { id: true, fullName: true } },
          },
        },
        classGroups: {
          select: { id: true, name: true, academicLevel: true },
        },
        _count: {
          select: { sessions: true, classGroups: true },
        },
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { error: "القاعة الدراسية غير موجودة أو غير مصرح لك بالوصول إليها" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      classroom,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/classrooms/[id] - Update classroom
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    const { name, roomCode, capacity, description } = body;

    const existing = await prisma.classroom.findFirst({
      where: {
        id: params.id,
        institutionId: session.institutionId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "القاعة الدراسية غير موجودة أو غير مصرح لك بتعديلها" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) {
      if (!name || typeof name !== "string" || !name.trim()) {
        return NextResponse.json({ error: "اسم القاعة لا يمكن أن يكون فارغاً" }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (roomCode !== undefined) {
      updateData.roomCode = roomCode ? String(roomCode).trim() : null;
    }

    if (capacity !== undefined) {
      const numCapacity = Number(capacity);
      if (isNaN(numCapacity) || numCapacity <= 0) {
        return NextResponse.json({ error: "سعة القاعة يجب أن تكون عدداً أكبر من الصفر" }, { status: 400 });
      }
      updateData.capacity = numCapacity;
    }

    if (description !== undefined) {
      updateData.description = description ? String(description).trim() : null;
    }

    const updated = await prisma.classroom.update({
      where: { id: params.id },
      data: updateData,
      include: {
        branch: { select: { id: true, name: true } },
        _count: {
          select: { sessions: true, classGroups: true },
        },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        institutionId: session.institutionId,
        userId: session.userId,
        action: "CLASSROOM_UPDATED",
        entity: "Classroom",
        entityId: updated.id,
        details: JSON.stringify(updateData),
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تحديث بيانات القاعة بنجاح",
      classroom: {
        id: updated.id,
        name: updated.name,
        roomCode: updated.roomCode || "",
        capacity: updated.capacity,
        description: updated.description || "",
        branchName: updated.branch?.name || "المقر الرئيسي",
        branchId: updated.branchId,
        sessionsCount: updated._count.sessions,
        groupsCount: updated._count.classGroups,
        createdAt: updated.createdAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/classrooms/[id] - Safe deletion of classroom
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();

    const existing = await prisma.classroom.findFirst({
      where: {
        id: params.id,
        institutionId: session.institutionId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "القاعة الدراسية غير موجودة أو غير مصرح لك بحذفها" },
        { status: 404 }
      );
    }

    // Check if room has active sessions or groups
    const sessionsCount = await prisma.classSession.count({
      where: {
        classroomId: params.id,
        institutionId: session.institutionId,
      },
    });

    const groupsCount = await prisma.classGroup.count({
      where: {
        classroomId: params.id,
        institutionId: session.institutionId,
      },
    });

    if (sessionsCount > 0 || groupsCount > 0) {
      return NextResponse.json(
        {
          error: `لا يمكن حذف هذه القاعة (${existing.name}) لأنها مرتبطة بـ ${sessionsCount} حصة مجدولة و ${groupsCount} فوج دراسي. يرجى تعديل أو نقل الحصص أولاً لحماية السجلات التاريخية.`,
        },
        { status: 400 }
      );
    }

    await prisma.classroom.delete({
      where: { id: params.id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        institutionId: session.institutionId,
        userId: session.userId,
        action: "CLASSROOM_DELETED",
        entity: "Classroom",
        entityId: params.id,
        details: `حذف القاعة الدراسية ${existing.name}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `تم حذف القاعة "${existing.name}" بنجاح`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
