import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, handleApiError } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/finance/invoices
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();

    const invoices = await prisma.invoice.findMany({
      where: { institutionId: session.institutionId },
      orderBy: { createdAt: "desc" },
      include: {
        student: true,
        parent: true,
        items: true,
        payments: true,
      },
    });

    const formatted = invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      studentId: inv.studentId,
      studentName: `${inv.student.firstName} ${inv.student.lastName}`,
      parentId: inv.parentId || "",
      parentName: inv.parent?.fullName || "الولي",
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      items: inv.items,
      subtotal: inv.subtotal,
      discountTotal: inv.discountTotal,
      finalTotal: inv.finalTotal,
      amountPaid: inv.amountPaid,
      remainingBalance: Math.max(0, inv.finalTotal - inv.amountPaid),
      status: inv.status.toLowerCase(),
      academicCycle: `الطور الدراسي — ${inv.student.academicLevel}`,
    }));

    return NextResponse.json({ invoices: formatted });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/finance/invoices
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();

    const count = await prisma.invoice.count({
      where: { institutionId: session.institutionId },
    });
    const instCode = session.institutionId.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase();
    let invNumber = `INV-2026-${instCode}-${String(count + 1).padStart(4, "0")}`;
    let collision = await prisma.invoice.findUnique({ where: { invoiceNumber: invNumber } });
    let invCounter = count + 1;
    while (collision) {
      invCounter++;
      invNumber = `INV-2026-${instCode}-${String(invCounter).padStart(4, "0")}`;
      collision = await prisma.invoice.findUnique({ where: { invoiceNumber: invNumber } });
    }

    const invoice = await prisma.invoice.create({
      data: {
        institutionId: session.institutionId,
        invoiceNumber: invNumber,
        studentId: body.studentId,
        parentId: body.parentId || undefined,
        issueDate: body.issueDate || new Date().toISOString().split("T")[0],
        dueDate: body.dueDate || new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
        subtotal: Number(body.subtotal) || 0,
        discountTotal: Number(body.discount) || 0,
        finalTotal: Number(body.finalTotal) || 0,
        amountPaid: 0,
        status: "UNPAID",
        items: {
          create: body.items?.map((it: any) => ({
            description: it.description,
            amount: Number(it.amount),
          })) || [],
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    return handleApiError(error);
  }
}
