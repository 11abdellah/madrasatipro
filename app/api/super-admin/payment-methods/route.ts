import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/super-admin/payment-methods - List all payment methods
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (session.role !== "SUPER_ADMIN" && !session.isSuperAdmin) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول إلى إعدادات الدفع" },
        { status: 403 }
      );
    }

    const paymentMethods = await prisma.paymentMethod.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ paymentMethods });
  } catch (error) {
    console.error("Super Admin payment-methods GET error:", error);
    return NextResponse.json(
      { error: "تعذر استرجاع طرق الدفع" },
      { status: 500 }
    );
  }
}

// POST /api/super-admin/payment-methods - Create a new payment method
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (session.role !== "SUPER_ADMIN" && !session.isSuperAdmin) {
      return NextResponse.json(
        { error: "غير مصرح لك بإضافة طرق الدفع" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      displayName,
      code,
      description,
      instructions,
      accountName,
      accountNumber,
      logoUrl,
      isActive,
      sortOrder,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "اسم وسيلة الدفع مطلوب" },
        { status: 400 }
      );
    }

    const generatedCode =
      (code && code.trim()) ||
      name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "_")
        .slice(0, 20) ||
      `method_${Date.now()}`;

    // Check duplicate code
    const existing = await prisma.paymentMethod.findUnique({
      where: { code: generatedCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: "رمز وسيلة الدفع مستخدم بالفعل، يرجى اختيار رمز آخر" },
        { status: 400 }
      );
    }

    const newMethod = await prisma.paymentMethod.create({
      data: {
        name: name.trim(),
        displayName: (displayName && displayName.trim()) || name.trim(),
        code: generatedCode,
        description: description?.trim() || null,
        instructions: instructions?.trim() || null,
        accountName: accountName?.trim() || null,
        accountNumber: accountNumber?.trim() || null,
        logoUrl: logoUrl?.trim() || null,
        isActive: isActive !== false,
        sortOrder: Number(sortOrder) || 0,
      },
    });

    return NextResponse.json({
      message: "تمت إضافة وسيلة الدفع بنجاح",
      paymentMethod: newMethod,
    });
  } catch (error) {
    console.error("Super Admin payment-methods POST error:", error);
    return NextResponse.json(
      { error: "تعذر حفظ وسيلة الدفع الجديدة" },
      { status: 500 }
    );
  }
}
