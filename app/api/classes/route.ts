import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, handleApiError } from "@/lib/auth/session";
import { assertWithinLimit } from "@/lib/services/entitlements";
import { ensureInstitutionSubjects } from "@/lib/constants/subjects";

export const dynamic = "force-dynamic";

// GET /api/classes - List class groups for current institution
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();

    const groups = await prisma.classGroup.findMany({
      where: { institutionId: session.institutionId },
      orderBy: { createdAt: "desc" },
      include: {
        teacher: true,
        subject: true,
        classroom: true,
        enrollments: {
          include: {
            student: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            sessions: true,
          },
        },
      },
    });

    const formatted = groups.map((g) => ({
      id: g.id,
      name: g.name,
      academicLevel: g.academicLevel,
      stream: g.stream,
      subjectId: g.subjectId,
      subjectName: g.subject?.nameAr || "مادة دراسية",
      subjectColor: g.subject?.color || "#6366F1",
      teacherId: g.teacherId,
      teacherName: g.teacher?.fullName || "أستاذ المادة",
      teacherAvatar: g.teacher?.avatarUrl,
      classroomId: g.classroomId,
      classroomName: g.classroom?.name || "غير محددة",
      maxCapacity: g.maxCapacity,
      studentsCount: g._count.enrollments,
      sessionsCount: g._count.sessions,
      monthlyFee: g.monthlyFee,
      scheduleDesc: `${g.startTime} - ${g.endTime}`,
      dayOfWeek: g.dayOfWeek,
      students: g.enrollments.map((e) => ({
        id: e.student.id,
        name: `${e.student.firstName} ${e.student.lastName}`,
        phone: e.student.phone,
        status: e.student.status,
      })),
    }));

    // Ensure standard Algerian subjects are available for this institution
    const subjectsCount = await prisma.subject.count({
      where: { institutionId: session.institutionId },
    });
    if (subjectsCount < 5) {
      await ensureInstitutionSubjects(session.institutionId, prisma);
    }

    // Also get available teachers, subjects, classrooms for group creation
    const [teachers, subjects, classrooms] = await Promise.all([
      prisma.teacher.findMany({
        where: { institutionId: session.institutionId, status: "ACTIVE" },
        select: { id: true, fullName: true, specialization: true },
      }),
      prisma.subject.findMany({
        where: { institutionId: session.institutionId, active: true },
        orderBy: { nameAr: "asc" },
        select: { id: true, code: true, nameAr: true, nameFr: true, color: true },
      }),
      prisma.classroom.findMany({
        where: { institutionId: session.institutionId },
        select: { id: true, name: true, capacity: true },
      }),
    ]);

    return NextResponse.json({
      groups: formatted,
      metadata: { teachers, subjects, classrooms },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/classes - Create new class group
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
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

    if (!name || !subjectId || !teacherId) {
      return NextResponse.json(
        { error: "يرجى إدخال اسم الفوج، المادة، والأستاذ المشرف" },
        { status: 400 }
      );
    }

    const newGroup = await prisma.$transaction(async (tx) => {
      // 0. Enforce Subscription limit for groups inside transaction
      await assertWithinLimit(session.institutionId, "groups", tx);

      const group = await tx.classGroup.create({
        data: {
          institutionId: session.institutionId,
          branchId: session.branchId || undefined,
          name,
          academicLevel: academicLevel || "3AS",
          stream: stream || null,
          subjectId,
          teacherId,
          classroomId: classroomId || undefined,
          maxCapacity: Number(maxCapacity) || 20,
          monthlyFee: Number(monthlyFee) || 4000,
          dayOfWeek: Number(dayOfWeek) || 6,
          startTime: startTime || "09:00",
          endTime: endTime || "10:30",
        },
        include: {
          teacher: true,
          subject: true,
          classroom: true,
        },
      });

      await tx.auditLog.create({
        data: {
          institutionId: session.institutionId,
          userId: session.userId,
          action: "GROUP_CREATED",
          entity: "ClassGroup",
          entityId: group.id,
          details: JSON.stringify({ name: group.name, teacher: group.teacher?.fullName }),
        },
      });

      return group;
    });

    return NextResponse.json({ success: true, group: newGroup });
  } catch (error) {
    return handleApiError(error);
  }
}
