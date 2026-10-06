import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, handleApiError } from "@/lib/auth/session";
import { getSubscriptionContext } from "@/lib/services/entitlements";
import { getAlgiersCurrentMonth, getAlgiersTodayStr } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET /api/dashboard/stats - Real database aggregations for current institution only
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const instId = session.institutionId;
    const currentMonth = getAlgiersCurrentMonth();
    const today = getAlgiersTodayStr();

    // 1. Total active students for this institution
    const totalStudents = await prisma.student.count({
      where: { institutionId: instId, status: { not: "ARCHIVED" } },
    });

    // 2. Active Teachers
    const activeTeachers = await prisma.teacher.count({
      where: { institutionId: instId, status: "ACTIVE" },
    });

    // 3. Class Groups Count
    const totalGroups = await prisma.classGroup.count({
      where: { institutionId: instId },
    });

    // 4. Monthly Payments (Revenue) in Algiers current month
    const monthlyPayments = await prisma.payment.findMany({
      where: {
        institutionId: instId,
        paymentDate: { startsWith: currentMonth },
      },
      select: { amount: true },
    });
    const monthlyRevenue = monthlyPayments.reduce((acc, p) => acc + p.amount, 0);

    // 5. Monthly Expenses (Includes both side expenses and teacher payroll expenses)
    const currentMonthExpenses = await prisma.expense.findMany({
      where: {
        institutionId: instId,
        expenseDate: { startsWith: currentMonth },
      },
      select: { amount: true, category: true },
    });
    const monthlyExpenses = currentMonthExpenses.reduce((acc, e) => acc + e.amount, 0);
    const monthlyPayrollExpenses = currentMonthExpenses
      .filter((e) => e.category === "SALARIES")
      .reduce((acc, e) => acc + e.amount, 0);
    const monthlySideExpenses = monthlyExpenses - monthlyPayrollExpenses;

    // 6. Net Profit/Result
    const netMonthlyProfit = monthlyRevenue - monthlyExpenses;

    // 7. Today's Attendance Rate
    const todayAttendances = await prisma.attendance.findMany({
      where: {
        institutionId: instId,
        session: { sessionDate: today },
      },
    });

    let todayAttendanceRate = 0;
    if (todayAttendances.length > 0) {
      const present = todayAttendances.filter((a) => a.status === "PRESENT").length;
      todayAttendanceRate = Math.round((present / todayAttendances.length) * 100);
    }

    // 8. Invoices & All-Time Stats
    const invoices = await prisma.invoice.findMany({
      where: { institutionId: instId },
      select: { finalTotal: true, amountPaid: true },
    });
    const totalBilled = invoices.reduce((acc, inv) => acc + inv.finalTotal, 0);
    const totalCollected = invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
    const dueDebts = invoices.reduce(
      (acc, inv) => acc + Math.max(0, inv.finalTotal - inv.amountPaid),
      0
    );

    // 9. Today's scheduled sessions
    const todaySessions = await prisma.classSession.findMany({
      where: {
        institutionId: instId,
        sessionDate: today,
        status: { not: "cancelled" },
      },
      orderBy: { startTime: "asc" },
      include: {
        teacher: true,
        classroom: true,
        subject: true,
        group: true,
      },
    });

    // 10. Top Teachers (without stock photos)
    const topTeachers = await prisma.teacher.findMany({
      where: { institutionId: instId, status: "ACTIVE" },
      take: 5,
      include: {
        classGroups: {
          include: {
            _count: { select: { enrollments: true } },
          },
        },
      },
    });

    const formattedTeachers = topTeachers.map((t) => {
      let subjects = ["عام"];
      try {
        subjects = JSON.parse(t.subjects);
      } catch {
        if (t.subjects) subjects = [t.subjects];
      }
      const totalStudentsCount = t.classGroups.reduce((acc, g) => acc + g._count.enrollments, 0);
      return {
        id: t.id,
        fullName: t.fullName,
        email: t.email,
        phone: t.phone,
        avatarUrl: t.avatarUrl || null,
        specialization: t.specialization,
        subject: subjects[0] || "الرياضيات",
        studentsCount: totalStudentsCount,
        groupsCount: t.classGroups.length,
      };
    });

    // 11. Format upcoming sessions
    const formattedSessions = todaySessions.map((s, idx) => {
      const colors = ["#6366F1", "#0EA5E9", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];
      return {
        id: s.id,
        timeRange: `${s.startTime} - ${s.endTime}`,
        title: s.group.name,
        room: s.classroom?.name || "قاعة دراسية",
        teacher: s.teacher.fullName,
        accentColor: s.subject?.color || colors[idx % colors.length],
        status: s.status,
      };
    });

    // 12. Recent Activity Audit Logs
    const recentLogs = await prisma.auditLog.findMany({
      where: { institutionId: instId },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        user: { select: { fullName: true, role: true } },
      },
    });

    // 13. Subscription context & limits
    const subscriptionContext = await getSubscriptionContext(instId);

    return NextResponse.json({
      totalStudents,
      activeTeachers,
      totalGroups,
      monthlyRevenue,
      monthlyExpenses,
      monthlyPayrollExpenses,
      monthlySideExpenses,
      netMonthlyProfit,
      totalBilled,
      totalCollected,
      dueDebts,
      todayAttendanceRate,
      todaySessionsCount: todaySessions.length,
      upcomingSessions: formattedSessions,
      topTeachers: formattedTeachers,
      recentActivities: recentLogs,
      subscriptionContext,
      currentMonth,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
