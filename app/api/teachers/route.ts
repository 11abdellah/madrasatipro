import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, handleApiError } from "@/lib/auth/session";
import { assertWithinLimit } from "@/lib/services/entitlements";
import { teacherSchema } from "@/lib/validations/teacher";
import { getAlgiersCurrentMonth, getAlgiersTodayStr, calculateNextMonthlyPaymentDate, getTeacherPayrollStatus } from "@/lib/utils";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

function getDurationHours(startTime?: string, endTime?: string): number {
  if (!startTime || !endTime) return 1.5;
  try {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    if (isNaN(sh) || isNaN(eh)) return 1.5;
    const startMin = sh * 60 + (sm || 0);
    const endMin = eh * 60 + (em || 0);
    const diff = (endMin - startMin) / 60;
    return diff > 0 ? diff : 1.5;
  } catch {
    return 1.5;
  }
}

// GET /api/teachers - List all teachers for the current institution
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ACTIVE";
    const currentMonth = getAlgiersCurrentMonth();

    const where: any = {
      institutionId: session.institutionId,
    };

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { specialization: { contains: search } },
      ];
    }

    const teachers = await prisma.teacher.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        classGroups: {
          select: {
            id: true,
            name: true,
            startTime: true,
            endTime: true,
            maxCapacity: true,
            _count: {
              select: { enrollments: true },
            },
          },
        },
        sessions: {
          where: {
            sessionDate: { startsWith: currentMonth },
            status: "completed",
          },
          select: { id: true, startTime: true, endTime: true, sessionDate: true },
        },
        teacherHourLogs: {
          where: {
            workDate: { startsWith: currentMonth },
          },
          select: { id: true, hours: true, hourlyRate: true, totalAmount: true, workDate: true },
        },
        payrollRecords: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Format for frontend
    const formatted = teachers.map((t) => {
      let subjectsList: string[] = [];
      try {
        subjectsList = JSON.parse(t.subjects);
      } catch {
        subjectsList = t.subjects ? [t.subjects] : [];
      }

      const totalStudents = t.classGroups.reduce(
        (acc, g) => acc + (g._count?.enrollments || 0),
        0
      );

      // Manual hours explicitly registered by supervisor/admin for this month
      // (Requirement: The ONLY source of teacher working hours for HOURLY teachers is manual hours)
      const manualHours = Number(
        t.teacherHourLogs.reduce((sum, h) => sum + h.hours, 0).toFixed(1)
      );

      // Hourly teachers: automatic hours completely removed. Only manual hours are used.
      const totalHours = manualHours;

      // 3. Compensation & payroll logic
      const isMonthly = t.wageType === "fixed" || t.contractType === "fixed" || t.wageType === "monthly";
      
      // Monthly teachers do NOT use hours for salary (Requirement 14)
      const totalDue = isMonthly
        ? (t.fixedSalary || 0)
        : Math.round(totalHours * t.hourlyRate);

      // Payments made in current month
      const currentMonthPayrolls = t.payrollRecords.filter(p => p.monthYear === currentMonth);
      const totalPaid = currentMonthPayrolls.reduce(
        (acc, p) => acc + (p.amountPaid || 0),
        0
      );
      const balance = Math.max(0, totalDue - totalPaid);

      // Next payment date & status calculation
      const latestPaidRecord = t.payrollRecords.find(p => p.status === "paid" || p.amountPaid >= p.totalDue);
      const lastPaymentDate = latestPaidRecord?.paymentDate || (latestPaidRecord?.paidAt ? latestPaidRecord.paidAt.toISOString().split("T")[0] : null);
      const lastPaidMonth = latestPaidRecord?.monthYear || null;

      const startDate = t.joinDate || t.createdAt.toISOString().split("T")[0];
      const nextPaymentDate = isMonthly
        ? calculateNextMonthlyPaymentDate(startDate, lastPaidMonth)
        : null;

      const payrollStatus = isMonthly
        ? getTeacherPayrollStatus(t.fixedSalary, nextPaymentDate || "")
        : (balance > 0
            ? { code: "DUE_SOON", labelAr: "مستحق للصرف", badgeClass: "bg-rose-50 text-rose-700 border-rose-200" }
            : { code: "PAID", labelAr: "مدفوع بالكامل", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" });

      return {
        id: t.id,
        fullName: t.fullName,
        firstName: t.firstName,
        lastName: t.lastName,
        email: t.email,
        phone: t.phone,
        specialization: t.specialization,
        subjects: subjectsList,
        hourlyRate: t.hourlyRate,
        fixedSalary: t.fixedSalary,
        wageType: t.wageType,
        contractType: t.contractType,
        isMonthly,
        startDate,
        joinDate: startDate,
        nextPaymentDate,
        lastPaymentDate,
        payrollStatus,
        status: t.status,
        groupsCount: t.classGroups.length,
        studentsCount: totalStudents,
        avatarUrl: t.avatarUrl || null,
        weeklyHours: 0,
        scheduledHours: 0,
        manualHours,
        totalHours,
        completedHoursThisMonth: totalHours,
        totalDueThisMonth: totalDue,
        totalPaidThisMonth: totalPaid,
        balanceThisMonth: balance,
        todayClassesCount: 0,
      };
    });

    return NextResponse.json({ teachers: formatted });
  } catch (error: any) {
    return handleApiError(error);
  }
}

// POST /api/teachers - Create a new teacher
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();

    // 1. Validate Input
    const parseResult = teacherSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "بيانات الأستاذ غير صالحة";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = parseResult.data;

    // Use Prisma interactive transaction for limit enforcement and atomic creation
    const teacher = await prisma.$transaction(async (tx) => {
      // 0. Enforce Subscription Limit for Teachers atomically
      await assertWithinLimit(session.institutionId, "teachers", tx);

      // 2. Check if email already used in this institution
      const existing = await tx.teacher.findFirst({
        where: {
          institutionId: session.institutionId,
          email: data.email,
        },
      });

      if (existing) {
        throw new Error("البريد الإلكتروني مستخدم مسبقًا لأستاذ آخر في هذه المؤسسة");
      }

      // 3. Create User account for Teacher if not exists
      const defaultPassword = await bcrypt.hash("MadrasatiTeacher2026!", 10);
      const user = await tx.user.upsert({
        where: { email: data.email },
        update: {},
        create: {
          institutionId: session.institutionId,
          email: data.email,
          fullName: `أ. ${data.firstName} ${data.lastName}`,
          phone: data.phone,
          passwordHash: defaultPassword,
          role: "TEACHER",
        },
      });

      // 4. Create Teacher record in database
      const newTeacher = await tx.teacher.create({
        data: {
          institutionId: session.institutionId,
          branchId: session.branchId || undefined,
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          fullName: `أ. ${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          wilayaCode: data.wilayaCode,
          address: data.address,
          specialization: data.specialization,
          subjects: JSON.stringify(data.subjects),
          yearsExperience: data.yearsExperience,
          contractType: data.contractType === "monthly" ? "fixed" : (data.contractType || "hourly"),
          joinDate: data.startDate || data.joinDate || getAlgiersTodayStr(),
          wageType: data.wageType === "monthly" ? "fixed" : (data.wageType || "hourly"),
          hourlyRate: Number(data.hourlyRate) || 0,
          percentageShare: data.percentageShare || 0,
          fixedSalary: Number(data.fixedSalary) || 0,
          status: "ACTIVE",
        },
      });

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          institutionId: session.institutionId,
          userId: session.userId,
          action: "TEACHER_REGISTERED",
          entity: "Teacher",
          entityId: newTeacher.id,
          details: `تسجيل الأستاذ ${newTeacher.fullName}، التخصص: ${newTeacher.specialization}`,
        },
      });

      return newTeacher;
    });

    let subjectsList: string[] = [];
    try {
      subjectsList = JSON.parse(teacher.subjects);
    } catch {
      subjectsList = [teacher.subjects];
    }

    const isMonthly = teacher.wageType === "fixed" || teacher.contractType === "fixed";
    const startDate = teacher.joinDate || getAlgiersTodayStr();
    const nextPaymentDate = isMonthly
      ? calculateNextMonthlyPaymentDate(startDate, null)
      : null;
    const payrollStatus = isMonthly
      ? getTeacherPayrollStatus(teacher.fixedSalary, nextPaymentDate || "")
      : { code: "PAID", labelAr: "لا يوجد مستحقات", badgeClass: "bg-emerald-50 text-emerald-700" };

    return NextResponse.json({
      success: true,
      teacher: {
        id: teacher.id,
        fullName: teacher.fullName,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        phone: teacher.phone,
        specialization: teacher.specialization,
        subjects: subjectsList,
        hourlyRate: teacher.hourlyRate,
        fixedSalary: teacher.fixedSalary,
        wageType: teacher.wageType,
        contractType: teacher.contractType,
        isMonthly,
        startDate,
        joinDate: startDate,
        nextPaymentDate,
        lastPaymentDate: null,
        payrollStatus,
        status: teacher.status,
        groupsCount: 0,
        studentsCount: 0,
        avatarUrl: teacher.avatarUrl || null,
        weeklyHours: 0,
        scheduledHours: 0,
        manualHours: 0,
        totalHours: 0,
        completedHoursThisMonth: 0,
        totalDueThisMonth: isMonthly ? teacher.fixedSalary : 0,
        totalPaidThisMonth: 0,
        balanceThisMonth: isMonthly ? teacher.fixedSalary : 0,
        todayClassesCount: 0,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
