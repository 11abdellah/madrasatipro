import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, handleApiError } from "@/lib/auth/session";
import { getAlgiersCurrentMonth, getAlgiersTodayStr } from "@/lib/utils";

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

// GET /api/finance/salaries - List teachers payroll status for a given month
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || getAlgiersCurrentMonth();

    // 1. Fetch all active teachers in this institution with their groups and payroll for the month
    const teachers = await prisma.teacher.findMany({
      where: {
        institutionId: session.institutionId,
        status: { in: ["ACTIVE", "active"] },
      },
      orderBy: { fullName: "asc" },
      include: {
        classGroups: {
          select: {
            id: true,
            name: true,
            startTime: true,
            endTime: true,
            dayOfWeek: true,
            _count: { select: { enrollments: true } },
          },
        },
        payrollRecords: {
          where: { monthYear: month },
        },
      },
    });

    let totalGross = 0;
    let totalPaid = 0;

    const payrollList = teachers.map((t) => {
      // Calculate weekly hours from assigned class groups
      const weeklyHours = t.classGroups.reduce(
        (sum, g) => sum + getDurationHours(g.startTime, g.endTime),
        0
      );
      // Monthly hours approx = 4 weeks * weeklyHours
      const monthlyHours = Number((weeklyHours * 4).toFixed(1));

      // Calculate total gross due for the month
      let grossSalary = 0;
      if (t.wageType === "fixed" || t.contractType === "fixed") {
        grossSalary = t.fixedSalary > 0 ? t.fixedSalary : monthlyHours * t.hourlyRate;
      } else {
        grossSalary = Math.round(monthlyHours * t.hourlyRate);
      }

      // Amount paid in this month
      const amountPaid = t.payrollRecords.reduce(
        (sum, p) => sum + (p.amountPaid || 0),
        0
      );

      const remaining = Math.max(0, grossSalary - amountPaid);

      let status = "UNPAID";
      if (amountPaid >= grossSalary && grossSalary > 0) {
        status = "PAID";
      } else if (amountPaid > 0) {
        status = "PARTIAL";
      }

      totalGross += grossSalary;
      totalPaid += amountPaid;

      return {
        teacherId: t.id,
        fullName: t.fullName,
        phone: t.phone,
        specialization: t.specialization,
        wageType: t.wageType,
        hourlyRate: t.hourlyRate,
        fixedSalary: t.fixedSalary,
        groupsCount: t.classGroups.length,
        weeklyHours,
        monthlyHours,
        grossSalary,
        amountPaid,
        remaining,
        status,
        lastPaidAt: t.payrollRecords[0]?.paidAt || null,
        payrollId: t.payrollRecords[0]?.id || null,
      };
    });

    const totalRemaining = Math.max(0, totalGross - totalPaid);

    return NextResponse.json({
      month,
      teachers: payrollList,
      summary: {
        totalGross,
        totalPaid,
        totalRemaining,
        teachersCount: teachers.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/finance/salaries - Record a salary payment to a teacher
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    const { teacherId, amount, paymentDate, monthYear, notes, method } = body;

    if (!teacherId || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "يرجى تحديد الأستاذ ومبلغ صحيح أكبر من الصفر" },
        { status: 400 }
      );
    }

    const currentMonth = monthYear || getAlgiersCurrentMonth();
    const dateOfPayment = paymentDate || getAlgiersTodayStr();
    const paymentAmount = Number(amount);

    // Verify teacher belongs to current institution
    const teacher = await prisma.teacher.findFirst({
      where: {
        id: teacherId,
        institutionId: session.institutionId,
      },
      include: {
        classGroups: true,
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "الأستاذ غير موجود أو لا يتبع لمؤسستك" },
        { status: 404 }
      );
    }

    // Calculate monthly hours and gross
    const weeklyHours = teacher.classGroups.reduce(
      (sum, g) => sum + getDurationHours(g.startTime, g.endTime),
      0
    );
    const monthlyHours = Number((weeklyHours * 4).toFixed(1));
    const grossSalary =
      teacher.wageType === "fixed" || teacher.contractType === "fixed"
        ? (teacher.fixedSalary > 0 ? teacher.fixedSalary : monthlyHours * teacher.hourlyRate)
        : Math.round(monthlyHours * teacher.hourlyRate);

    // Run transaction: update/upsert TeacherPayroll AND create Expense record
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find existing payroll record for this teacher and month
      const existingPayroll = await tx.teacherPayroll.findFirst({
        where: {
          teacherId: teacher.id,
          monthYear: currentMonth,
        },
      });

      let updatedPayroll;
      if (existingPayroll) {
        const newPaid = existingPayroll.amountPaid + paymentAmount;
        updatedPayroll = await tx.teacherPayroll.update({
          where: { id: existingPayroll.id },
          data: {
            amountPaid: newPaid,
            totalDue: grossSalary,
            status: newPaid >= grossSalary ? "paid" : "partially_paid",
            paidAt: new Date(),
            paymentDate: dateOfPayment,
            notes: notes || existingPayroll.notes,
          },
        });
      } else {
        updatedPayroll = await tx.teacherPayroll.create({
          data: {
            teacherId: teacher.id,
            monthYear: currentMonth,
            hoursWorked: monthlyHours,
            hourlyRate: teacher.hourlyRate,
            totalDue: grossSalary,
            amountPaid: paymentAmount,
            status: paymentAmount >= grossSalary ? "paid" : "partially_paid",
            paidAt: new Date(),
            paymentDate: dateOfPayment,
            notes: notes || undefined,
          },
        });
      }

      // 2. Create corresponding Expense record under SALARIES category
      const expenseDescription = `راتب الأستاذ: ${teacher.fullName} (شهر ${currentMonth})${
        notes ? ` - ${notes}` : ""
      }${method ? ` [طريقة الدفع: ${method}]` : ""}`;

      const expense = await tx.expense.create({
        data: {
          institutionId: session.institutionId,
          branchId: session.branchId || undefined,
          category: "SALARIES",
          description: expenseDescription,
          amount: paymentAmount,
          expenseDate: dateOfPayment,
        },
      });

      // 3. Create AuditLog
      await tx.auditLog.create({
        data: {
          institutionId: session.institutionId,
          userId: session.userId,
          action: "TEACHER_SALARY_PAID",
          entity: "TeacherPayroll",
          entityId: teacher.id,
          details: JSON.stringify({
            teacherName: teacher.fullName,
            amount: paymentAmount,
            monthYear: currentMonth,
            expenseId: expense.id,
          }),
        },
      });

      return { updatedPayroll, expense };
    });

    return NextResponse.json({
      success: true,
      message: "تم تسجيل صرف الراتب وإدراجه في المصاريف بنجاح",
      payroll: result.updatedPayroll,
      expense: result.expense,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
