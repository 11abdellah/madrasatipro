import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, handleApiError } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/attendance
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    if (!groupId) {
      return NextResponse.json({ error: "معرف الفوج مطلوب" }, { status: 400 });
    }

    // 1. Fetch group and its enrolled students
    const group = await prisma.classGroup.findFirst({
      where: { id: groupId, institutionId: session.institutionId },
      include: {
        teacher: true,
        subject: true,
        enrollments: {
          include: { student: true },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "الفوج غير موجود" }, { status: 404 });
    }

    // 2. Fetch existing session & attendance records
    const classSession = await prisma.classSession.findFirst({
      where: {
        institutionId: session.institutionId,
        groupId,
        sessionDate: date,
      },
      include: {
        attendances: true,
      },
    });

    const attendanceMap: Record<string, string> = {};
    if (classSession) {
      classSession.attendances.forEach((a) => {
        attendanceMap[a.studentId] = a.status.toLowerCase();
      });
    }

    const students = group.enrollments.map((e) => ({
      id: e.student.id,
      firstName: e.student.firstName,
      lastName: e.student.lastName,
      fullName: `${e.student.firstName} ${e.student.lastName}`,
      phone: e.student.phone,
      academicLevel: e.student.academicLevel,
      status: attendanceMap[e.student.id] || "present", // default to present if not marked yet
    }));

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        teacher: group.teacher.fullName,
        subject: group.subject.nameAr,
      },
      session: classSession,
      students,
      attendanceMap,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/attendance - Save attendance for a session
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    const { groupId, date, records } = body; // records: { studentId: status }

    if (!groupId || !records) {
      return NextResponse.json({ error: "بيانات الحضور غير مكتملة" }, { status: 400 });
    }

    const sessionDate = date || new Date().toISOString().split("T")[0];

    // Find group
    const group = await prisma.classGroup.findFirst({
      where: { id: groupId, institutionId: session.institutionId },
    });

    if (!group) {
      return NextResponse.json({ error: "الفوج غير موجود" }, { status: 404 });
    }

    // Find or create session
    let classSession = await prisma.classSession.findFirst({
      where: { institutionId: session.institutionId, groupId, sessionDate },
    });

    if (!classSession) {
      classSession = await prisma.classSession.create({
        data: {
          institutionId: session.institutionId,
          groupId: group.id,
          teacherId: group.teacherId,
          classroomId: group.classroomId,
          subjectId: group.subjectId,
          sessionDate,
          startTime: group.startTime,
          endTime: group.endTime,
          status: "completed",
        },
      });
    }

    // Upsert attendance records
    for (const [studentId, status] of Object.entries(records)) {
      const attStatus = String(status).toUpperCase();

      await prisma.attendance.upsert({
        where: {
          sessionId_studentId: {
            sessionId: classSession.id,
            studentId,
          },
        },
        update: {
          status: attStatus,
          recordedAt: new Date(),
        },
        create: {
          institutionId: session.institutionId,
          sessionId: classSession.id,
          studentId,
          status: attStatus,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        institutionId: session.institutionId,
        userId: session.userId,
        action: "ATTENDANCE_RECORDED",
        entity: "Attendance",
        entityId: classSession.id,
        details: JSON.stringify({
          groupId,
          date: sessionDate,
          recordsCount: Object.keys(records).length,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم حفظ سجل الحضور والغياب بنجاح في قاعدة البيانات",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
