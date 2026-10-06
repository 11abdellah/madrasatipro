import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, handleApiError } from "@/lib/auth/session";
import { getAlgiersCurrentMonth, getAlgiersTodayStr } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET /api/teachers/[id]/hours - Get hours log history for teacher
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const currentMonth = getAlgiersCurrentMonth();

    // Verify teacher belongs to institution
    const teacher = await prisma.teacher.findFirst({
      where: {
        id: params.id,
        institutionId: session.institutionId,
      },
      select: {
        id: true,
        fullName: true,
        hourlyRate: true,
        wageType: true,
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "الأستاذ غير موجود" }, { status: 404 });
    }

    const hourLogs = await prisma.teacherHourLog.findMany({
      where: {
        teacherId: params.id,
        institutionId: session.institutionId,
      },
      orderBy: { workDate: "desc" },
      include: {
        group: { select: { id: true, name: true } },
        subject: { select: { id: true, nameAr: true } },
      },
    });

    // Compute monthly totals
    const currentMonthLogs = hourLogs.filter((log) => log.workDate.startsWith(currentMonth));
    const monthlyManualHours = Number(
      currentMonthLogs.reduce((sum, log) => sum + log.hours, 0).toFixed(1)
    );
    const monthlyManualTotalDue = currentMonthLogs.reduce((sum, log) => sum + log.totalAmount, 0);

    return NextResponse.json({
      success: true,
      teacher,
      logs: hourLogs.map((log) => ({
        id: log.id,
        workDate: log.workDate,
        hours: log.hours,
        hourlyRate: log.hourlyRate,
        totalAmount: log.totalAmount,
        notes: log.notes,
        groupName: log.group?.name || "—",
        subjectName: log.subject?.nameAr || "—",
        createdAt: log.createdAt,
      })),
      summary: {
        currentMonth,
        monthlyManualHours,
        monthlyManualTotalDue,
        totalLogsCount: hourLogs.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/teachers/[id]/hours - Log manual teaching hours
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    const { workDate, hours, hourlyRate, groupId, subjectId, notes } = body;

    const numHours = Number(hours);
    if (!workDate || isNaN(numHours) || numHours <= 0) {
      return NextResponse.json(
        { error: "يرجى تحديد تاريخ صالح وعدد ساعات أكبر من الصفر" },
        { status: 400 }
      );
    }

    // Verify teacher belongs to institution
    const teacher = await prisma.teacher.findFirst({
      where: {
        id: params.id,
        institutionId: session.institutionId,
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "الأستاذ غير موجود أو لا يتبع لمؤسستك" }, { status: 404 });
    }

    const rate = hourlyRate !== undefined && Number(hourlyRate) >= 0
      ? Number(hourlyRate)
      : teacher.hourlyRate;

    // Server-side calculation: hours * hourlyRate
    const totalAmount = Math.round(numHours * rate);

    const log = await prisma.teacherHourLog.create({
      data: {
        institutionId: session.institutionId,
        teacherId: teacher.id,
        workDate,
        hours: numHours,
        hourlyRate: rate,
        totalAmount,
        groupId: groupId || undefined,
        subjectId: subjectId || undefined,
        notes: notes || undefined,
      },
      include: {
        group: { select: { id: true, name: true } },
        subject: { select: { id: true, nameAr: true } },
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        institutionId: session.institutionId,
        userId: session.userId,
        action: "TEACHER_HOURS_LOGGED",
        entity: "TeacherHourLog",
        entityId: log.id,
        details: `تسجيل ${numHours} ساعات للأستاذ ${teacher.fullName} بقيمة ${totalAmount} دج`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تسجيل الساعات بنجاح",
      log: {
        id: log.id,
        workDate: log.workDate,
        hours: log.hours,
        hourlyRate: log.hourlyRate,
        totalAmount: log.totalAmount,
        notes: log.notes,
        groupName: log.group?.name || "—",
        subjectName: log.subject?.nameAr || "—",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/teachers/[id]/hours - Edit an existing hour log entry
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    const { logId, workDate, hours, hourlyRate, groupId, subjectId, notes } = body;

    if (!logId) {
      return NextResponse.json({ error: "معرف السجل مطلوب" }, { status: 400 });
    }

    const existingLog = await prisma.teacherHourLog.findFirst({
      where: {
        id: logId,
        teacherId: params.id,
        institutionId: session.institutionId,
      },
      include: { teacher: true },
    });

    if (!existingLog) {
      return NextResponse.json({ error: "سجل الساعات غير موجود أو غير مصرح به" }, { status: 404 });
    }

    const numHours = hours !== undefined ? Number(hours) : existingLog.hours;
    if (isNaN(numHours) || numHours <= 0) {
      return NextResponse.json({ error: "عدد الساعات يجب أن يكون رقماً أكبر من الصفر" }, { status: 400 });
    }

    const rate = hourlyRate !== undefined ? Number(hourlyRate) : existingLog.hourlyRate;
    const finalDate = workDate || existingLog.workDate;
    const totalAmount = Math.round(numHours * rate);

    const updatedLog = await prisma.teacherHourLog.update({
      where: { id: logId },
      data: {
        workDate: finalDate,
        hours: numHours,
        hourlyRate: rate,
        totalAmount,
        groupId: groupId !== undefined ? (groupId || null) : existingLog.groupId,
        subjectId: subjectId !== undefined ? (subjectId || null) : existingLog.subjectId,
        notes: notes !== undefined ? notes : existingLog.notes,
      },
      include: {
        group: { select: { id: true, name: true } },
        subject: { select: { id: true, nameAr: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تعديل السجل بنجاح",
      log: {
        id: updatedLog.id,
        workDate: updatedLog.workDate,
        hours: updatedLog.hours,
        hourlyRate: updatedLog.hourlyRate,
        totalAmount: updatedLog.totalAmount,
        notes: updatedLog.notes,
        groupName: updatedLog.group?.name || "—",
        subjectName: updatedLog.subject?.nameAr || "—",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/teachers/[id]/hours - Delete an hour log entry
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(req.url);
    const logId = searchParams.get("logId");

    if (!logId) {
      return NextResponse.json({ error: "معرف السجل مطلوب للحذف" }, { status: 400 });
    }

    const existingLog = await prisma.teacherHourLog.findFirst({
      where: {
        id: logId,
        teacherId: params.id,
        institutionId: session.institutionId,
      },
    });

    if (!existingLog) {
      return NextResponse.json({ error: "سجل الساعات غير موجود أو غير مصرح به" }, { status: 404 });
    }

    await prisma.teacherHourLog.delete({
      where: { id: logId },
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف سجل الساعات بنجاح",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
