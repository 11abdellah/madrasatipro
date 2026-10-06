import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, handleApiError } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// POST /api/finance/payments
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    const { studentId, invoiceId, amount, method, notes } = body;

    if (!studentId || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "بيانات الدفع غير مكتملة أو المبلغ غير صالح" }, { status: 400 });
    }

    const student = await prisma.student.findFirst({
      where: { id: studentId, institutionId: session.institutionId },
      include: { parent: true },
    });
    if (!student) {
      return NextResponse.json({ error: "الطالب المحدد غير مسجل بهذه المؤسسة" }, { status: 404 });
    }

    let validInvoiceId: string | undefined = undefined;
    if (invoiceId) {
      const inv = await prisma.invoice.findFirst({
        where: { id: invoiceId, institutionId: session.institutionId },
      });
      if (inv) {
        validInvoiceId = inv.id;
      }
    }

    const payCount = await prisma.payment.count({
      where: { institutionId: session.institutionId },
    });
    const instCode = session.institutionId.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase();
    let receiptNumber = `REC-2026-${instCode}-${String(payCount + 1).padStart(4, "0")}`;
    let recCollision = await prisma.payment.findUnique({ where: { receiptNumber } });
    let recCounter = payCount + 1;
    while (recCollision) {
      recCounter++;
      receiptNumber = `REC-2026-${instCode}-${String(recCounter).padStart(4, "0")}`;
      recCollision = await prisma.payment.findUnique({ where: { receiptNumber } });
    }

    const payDate = body.paymentDate || new Date().toISOString().split("T")[0];
    const payAmount = Number(amount);

    // Run transaction: link existing or create invoice -> create payment -> update invoice status
    const result = await prisma.$transaction(async (tx) => {
      let targetInvoice: any = null;

      // 1. If invoiceId passed, verify it belongs to this tenant and student
      if (invoiceId) {
        targetInvoice = await tx.invoice.findFirst({
          where: { id: invoiceId, institutionId: session.institutionId },
        });
      }

      // 2. If no valid invoice specified, find student's open unpaid invoice to prevent duplicates
      if (!targetInvoice) {
        targetInvoice = await tx.invoice.findFirst({
          where: {
            institutionId: session.institutionId,
            studentId: student.id,
            status: { in: ["UNPAID", "PARTIALLY_PAID"] },
          },
          orderBy: { createdAt: "desc" },
        });
      }

      // 3. If still no invoice exists, automatically generate an official invoice (Student -> Invoice -> Payment)
      if (!targetInvoice) {
        const invCount = await tx.invoice.count({
          where: { institutionId: session.institutionId },
        });
        let invNumber = `INV-2026-${instCode}-${String(invCount + 1).padStart(4, "0")}`;
        let invCollision = await tx.invoice.findUnique({ where: { invoiceNumber: invNumber } });
        let invCounter = invCount + 1;
        while (invCollision) {
          invCounter++;
          invNumber = `INV-2026-${instCode}-${String(invCounter).padStart(4, "0")}`;
          invCollision = await tx.invoice.findUnique({ where: { invoiceNumber: invNumber } });
        }

        targetInvoice = await tx.invoice.create({
          data: {
            institutionId: session.institutionId,
            invoiceNumber: invNumber,
            studentId: student.id,
            parentId: student.parentId || undefined,
            issueDate: payDate,
            dueDate: payDate,
            subtotal: payAmount,
            discountTotal: 0,
            finalTotal: payAmount,
            amountPaid: 0,
            status: "UNPAID",
            notes: notes || "رسوم دراسية واشتراك شهري",
            items: {
              create: [
                {
                  description: `اشتراك ورسوم دراسية (${student.academicLevel}${student.stream ? ` - ${student.stream}` : ""})`,
                  amount: payAmount,
                },
              ],
            },
          },
        });
      }

      // 4. Create Payment record linked to Invoice
      const newPayment = await tx.payment.create({
        data: {
          institutionId: session.institutionId,
          studentId: student.id,
          parentId: student.parentId || undefined,
          invoiceId: targetInvoice.id,
          receiptNumber,
          amount: payAmount,
          paymentDate: payDate,
          method: method || "CASH",
          notes: notes || undefined,
        },
      });

      // 5. Update invoice paid amount and status
      const updatedPaid = targetInvoice.amountPaid + payAmount;
      const updatedStatus = updatedPaid >= targetInvoice.finalTotal ? "PAID" : "PARTIALLY_PAID";
      const finalInvoice = await tx.invoice.update({
        where: { id: targetInvoice.id },
        data: {
          amountPaid: updatedPaid,
          status: updatedStatus,
        },
        include: { items: true },
      });

      // 6. Audit log
      await tx.auditLog.create({
        data: {
          institutionId: session.institutionId,
          userId: session.userId,
          action: "PAYMENT_RECORDED",
          entity: "Payment",
          entityId: newPayment.id,
          details: `تحصيل مبلغ ${payAmount} دج برقم الوصل ${receiptNumber} مرتبط بالفاتورة ${finalInvoice.invoiceNumber}`,
        },
      });

      return { payment: newPayment, invoice: finalInvoice };
    });

    return NextResponse.json({
      success: true,
      payment: result.payment,
      invoice: {
        id: result.invoice.id,
        invoiceNumber: result.invoice.invoiceNumber,
        finalTotal: result.invoice.finalTotal,
        amountPaid: result.invoice.amountPaid,
        status: result.invoice.status,
        issueDate: result.invoice.issueDate,
        studentName: `${student.firstName} ${student.lastName}`,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
