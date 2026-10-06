import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// Helper function to check if two time ranges overlap
function doTimesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  // Assuming HH:mm format, e.g. "08:30" < "10:00"
  return startA < endB && endA > startB;
}

// GET /api/timetable - Get scheduled sessions for the current institution
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(req.url);

    const date = searchParams.get("date");
    const teacherId = searchParams.get("teacherId");
    const groupId = searchParams.get("groupId");
    const classroomId = searchParams.get("classroomId");
    const subjectId = searchParams.get("subjectId");

    const where: any = {
      institutionId: session.institutionId,
    };

    if (date) where.sessionDate = date;
    if (teacherId && teacherId !== "all") where.teacherId = teacherId;
    if (groupId && groupId !== "all") where.groupId = groupId;
    if (classroomId && classroomId !== "all") where.classroomId = classroomId;
    if (subjectId && subjectId !== "all") where.subjectId = subjectId;

    const sessions = await prisma.classSession.findMany({
      where,
      orderBy: [{ sessionDate: "asc" }, { startTime: "asc" }],
      include: {
        teacher: true,
        group: true,
        classroom: true,
        subject: true,
        _count: {
          select: { attendances: true },
        },
      },
    });

    const formatted = sessions.map((s) => ({
      id: s.id,
      sessionDate: s.sessionDate,
      startTime: s.startTime,
      endTime: s.endTime,
      timeRange: `${s.startTime} - ${s.endTime}`,
      status: s.status,
      notes: s.notes,
      group: {
        id: s.group.id,
        name: s.group.name,
        academicLevel: s.group.academicLevel,
        stream: s.group.stream,
      },
      teacher: {
        id: s.teacher.id,
        fullName: s.teacher.fullName,
        avatarUrl: s.teacher.avatarUrl,
      },
      classroom: s.classroom ? { id: s.classroom.id, name: s.classroom.name } : null,
      subject: s.subject ? { id: s.subject.id, nameAr: s.subject.nameAr, color: s.subject.color } : null,
      attendancesCount: s._count.attendances,
    }));

    return NextResponse.json({ sessions: formatted });
  } catch (error) {
    console.error("GET /api/timetable error:", error);
    return NextResponse.json({ error: "تعذر استرجاع الحصص الدراسية" }, { status: 500 });
  }
}

// POST /api/timetable - Create a new session with conflict checking
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();

    const {
      groupId,
      teacherId,
      classroomId,
      subjectId,
      sessionDate,
      startTime,
      endTime,
      notes,
    } = body;

    // 1. Basic validation
    if (!groupId || !teacherId || !sessionDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: "يرجى ملء جميع الحقول المطلوبة: الفوج، الأستاذ، التاريخ، ووقت البداية والنهاية" },
        { status: 400 }
      );
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "وقت بداية الحصة يجب أن يكون قبل وقت نهايتها" },
        { status: 400 }
      );
    }

    // 2. Fetch existing sessions for this institution on the same date to check conflicts
    const sameDaySessions = await prisma.classSession.findMany({
      where: {
        institutionId: session.institutionId,
        sessionDate,
        status: { not: "cancelled" },
      },
      include: {
        teacher: true,
        classroom: true,
        group: true,
      },
    });

    // Check Conflicts
    for (const existing of sameDaySessions) {
      const overlaps = doTimesOverlap(startTime, endTime, existing.startTime, existing.endTime);

      if (overlaps) {
        // Teacher conflict
        if (existing.teacherId === teacherId) {
          return NextResponse.json(
            {
              error: `الأستاذ مرتبط بحصة أخرى في هذا الوقت (${existing.group.name} من ${existing.startTime} إلى ${existing.endTime}).`,
            },
            { status: 400 }
          );
        }

        // Room conflict
        if (classroomId && existing.classroomId === classroomId) {
          return NextResponse.json(
            {
              error: `هذه القاعة محجوزة في هذا الوقت (${existing.classroom?.name || "القاعة"} من ${existing.startTime} إلى ${existing.endTime}).`,
            },
            { status: 400 }
          );
        }

        // Group conflict
        if (existing.groupId === groupId) {
          return NextResponse.json(
            {
              error: `الفوج لديه حصة أخرى في نفس التوقيت (من ${existing.startTime} إلى ${existing.endTime}).`,
            },
            { status: 400 }
          );
        }
      }
    }

    // 3. Resolve Subject if not provided
    let finalSubjectId = subjectId;
    if (!finalSubjectId) {
      const grp = await prisma.classGroup.findUnique({
        where: { id: groupId },
        select: { subjectId: true },
      });
      finalSubjectId = grp?.subjectId || undefined;
    }

    // 4. Create Session in DB
    const newSession = await prisma.classSession.create({
      data: {
        institutionId: session.institutionId,
        groupId,
        teacherId,
        classroomId: classroomId || undefined,
        subjectId: finalSubjectId,
        sessionDate,
        startTime,
        endTime,
        status: "scheduled",
        notes: notes || null,
      },
      include: {
        teacher: true,
        classroom: true,
        group: true,
        subject: true,
      },
    });

    // 5. Audit Log
    await prisma.auditLog.create({
      data: {
        institutionId: session.institutionId,
        userId: session.userId,
        action: "SESSION_CREATED",
        entity: "ClassSession",
        entityId: newSession.id,
        details: JSON.stringify({
          group: newSession.group.name,
          teacher: newSession.teacher.fullName,
          date: sessionDate,
          time: `${startTime}-${endTime}`,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "تمت إضافة الحصة بنجاح في الجدول",
      session: newSession,
    });
  } catch (error) {
    console.error("POST /api/timetable error:", error);
    return NextResponse.json({ error: "تعذر حفظ الحصة في قاعدة البيانات" }, { status: 500 });
  }
}
