import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { institutionId } = await req.json();

    if (!institutionId) {
      return NextResponse.json({ error: "معرف المؤسسة مطلوب" }, { status: 400 });
    }

    const targetInstitution = await prisma.institution.findUnique({
      where: { id: institutionId },
      include: { branches: true },
    });

    if (!targetInstitution) {
      return NextResponse.json({ error: "المؤسسة المطلوبة غير موجودة" }, { status: 404 });
    }

    const response = NextResponse.json({
      success: true,
      message: `تم التبديل بنجاح إلى مؤسسة: ${targetInstitution.name}`,
      institution: {
        id: targetInstitution.id,
        name: targetInstitution.name,
        code: targetInstitution.code,
        wilayaCode: targetInstitution.wilayaCode,
      },
    });

    // Set tenant override cookie
    response.cookies.set("noubla_tenant_override", targetInstitution.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Switch tenant error:", error);
    return NextResponse.json({ error: "تعذر تبديل المؤسسة" }, { status: 500 });
  }
}
