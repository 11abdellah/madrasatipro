import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// PATCH /api/super-admin/payment-methods/[id] - Update payment method
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (session.role !== "SUPER_ADMIN" && !session.isSuperAdmin) {
      return NextResponse.json(
        { error: "غير مصرح لك بتعديل طرق الدفع" },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await req.json();

    const existing = await prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "وسيلة الدفع غير موجودة" },
        { status: 404 }
      );
    }

    const updated = await prisma.paymentMethod.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.displayName !== undefined && { displayName: body.displayName.trim() }),
        ...(body.description !== undefined && { description: body.description?.trim() || null }),
        ...(body.instructions !== undefined && { instructions: body.instructions?.trim() || null }),
        ...(body.accountName !== undefined && { accountName: body.accountName?.trim() || null }),
        ...(body.accountNumber !== undefined && { accountNumber: body.accountNumber?.trim() || null }),
        ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl?.trim() || null }),
        ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
        ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
      },
    });

    return NextResponse.json({
      message: "تم تحديث وسيلة الدفع بنجاح",
      paymentMethod: updated,
    });
  } catch (error) {
    console.error("Super Admin payment-method PATCH error:", error);
    return NextResponse.json(
      { error: "تعذر تحديث بيانات وسيلة الدفع" },
      { status: 500 }
    );
  }
}

// DELETE /api/super-admin/payment-methods/[id] - Delete payment method
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (session.role !== "SUPER_ADMIN" && !session.isSuperAdmin) {
      return NextResponse.json(
        { error: "غير مصرح لك بحذف طرق الدفع" },
        { status: 403 }
      );
    }

    const { id } = params;

    const existing = await prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "وسيلة الدفع غير موجودة" },
        { status: 404 }
      );
    }

    await prisma.paymentMethod.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "تم حذف وسيلة الدفع بنجاح",
    });
  } catch (error) {
    console.error("Super Admin payment-method DELETE error:", error);
    return NextResponse.json(
      { error: "تعذر حذف وسيلة الدفع" },
      { status: 500 }
    );
  }
}
