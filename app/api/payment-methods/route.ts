import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/payment-methods - Public endpoint returning ACTIVE payment methods for registration
export async function GET() {
  try {
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        displayName: true,
        description: true,
        instructions: true,
        accountName: true,
        accountNumber: true,
        logoUrl: true,
        sortOrder: true,
      },
    });

    return NextResponse.json({ paymentMethods });
  } catch (error) {
    console.error("Failed to fetch public payment methods:", error);
    return NextResponse.json(
      { error: "تعذر استرجاع طرق الدفع المتاحة" },
      { status: 500 }
    );
  }
}
