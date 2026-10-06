import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();

    const expenses = await prisma.expense.findMany({
      where: { institutionId: session.institutionId },
      orderBy: { expenseDate: "desc" },
    });

    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

    return NextResponse.json({ expenses, totalExpenses });
  } catch (error) {
    console.error("GET /api/finance/expenses error:", error);
    return NextResponse.json({ error: "تعذر جلب المصاريف" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    const { category, description, amount, expenseDate } = body;

    if (!description || !amount) {
      return NextResponse.json({ error: "يرجى إدخال وصف المصروف والمبلغ" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        institutionId: session.institutionId,
        category: category || "OTHER",
        description,
        amount: Number(amount),
        expenseDate: expenseDate || new Date().toISOString().split("T")[0],
      },
    });

    await prisma.auditLog.create({
      data: {
        institutionId: session.institutionId,
        userId: session.userId,
        action: "EXPENSE_CREATED",
        entity: "Expense",
        entityId: expense.id,
        details: `${description} (${amount} دج)`,
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error("POST /api/finance/expenses error:", error);
    return NextResponse.json({ error: "تعذر تسجيل المصروف" }, { status: 500 });
  }
}
