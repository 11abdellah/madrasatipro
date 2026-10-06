import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, handleApiError } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/classes/[id] - Get class group details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();

    const group = await prisma.classGroup.findFirst({
      where: {
        id: params.id,
        institutionId: session.institutionId,
      },
      include: {
        teacher: true,
        subject: true,
        classroom: true,
        enrollments: {
          include: { student: true },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "الفوج الدراسي غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ success: true, group });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/classes/[id] - Edit class group
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();

    const existing = await prisma.classGroup.findFirst({
      where: {
        id: params.id,
        institutionId: session.institutionId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "الفوج الدراسي غير موجود أو لا يتبع لمؤسستك" }, { status: 404 });
    }

    const {
      name,
      academicLevel,
      stream,
      subjectId,
      teacherId,
      classroomId,
      maxCapacity,
      monthlyFee,
      dayOfWeek,
      startTime,
      endTime,
    } = body;

    const updated = await prisma.classGroup.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name : existing.name,
        academicLevel: academicLevel !== undefined ? academicLevel : existing.academicLevel,
        stream: stream !== undefined ? stream : existing.stream,
        subjectId: subjectId !== undefined ? subjectId : existing.subjectId,
        teacherId: teacherId !== undefined ? teacherId : existing.teacherId,
        classroomId: classroomId !== undefined ? (classroomId || null) : existing.classroomId,
        maxCapacity: maxCapacity !== undefined ? Number(maxCapacity) : existing.maxCapacity,
        monthlyFee: monthlyFee !== undefined ? Number(monthlyFee) : existing.monthlyFee,
        dayOfWeek: dayOfWeek !== undefined ? Number(dayOfWeek) : existing.dayOfWeek,
        startTime: startTime !== undefined ? startTime : existing.startTime,
        endTime: endTime !== undefined ? endTime : existing.endTime,
      },
      include: {
        teacher: true,
        subject: true,
        classroom: true,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        institutionId: session.institutionId,
        userId: session.userId,
        action: "GROUP_UPDATED",
        entity: "ClassGroup",
        entityId: updated.id,
        details: `تم تحديث بيانات الفوج ${updated.name}`,
      },
    });

    return NextResponse.json({ success: true, group: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/classes/[id] - Safe Cascade Deletion
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();

    const existing = await prisma.classGroup.findFirst({
      where: {
        id: params.id,
        institutionId: session.institutionId,
      },
      include: {
        sessions: { select: { id: true } },
        exams: { select: { id: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "الفوج الدراسي غير موجود أو تم حذفه مسبقاً" }, { status: 404 });
    }

    const sessionIds = existing.sessions.map((s) => s.id);
    const examIds = existing.exams.map((e) => e.id);

    // Run clean cascade inside interactive transaction preventing any orphan foreign keys
    await prisma.$transaction(async (tx) => {
      // 1. Unlink TeacherHourLogs referring to this group
      await tx.teacherHourLog.updateMany({
        where: { groupId: params.id },
        data: { groupId: null },
      });

      // 2. Delete grades for exams of this group
      if (examIds.length > 0) {
        await tx.grade.deleteMany({
          where: { examId: { in: examIds } },
        });
        await tx.exam.deleteMany({
          where: { id: { in: examIds } },
        });
      }

      // 3. Delete attendance records for sessions of this group
      if (sessionIds.length > 0) {
        await tx.attendance.deleteMany({
          where: { sessionId: { in: sessionIds } },
        });
        await tx.classSession.deleteMany({
          where: { id: { in: sessionIds } },
        });
      }

      // 4. Delete enrollments
      await tx.enrollment.deleteMany({
        where: { groupId: params.id },
      });

      // 5. Delete the class group itself
      await tx.classGroup.delete({
        where: { id: params.id },
      });

      // 6. Audit Log
      await tx.auditLog.create({
        data: {
          institutionId: session.institutionId,
          userId: session.userId,
          action: "GROUP_DELETED",
          entity: "ClassGroup",
          entityId: params.id,
          details: `حذف الفوج الدراسي: ${existing.name}`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف الفوج الدراسي وجميع الجلسات والاشتراكات المرتبطة به بنجاح",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
