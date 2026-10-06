import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSessionToken } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "يرجى إدخال البريد الإلكتروني وكلمة المرور" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        institution: {
          include: { branches: true, subscription: { include: { plan: true } } },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "هذا الحساب معطل حالياً، يرجى التواصل مع الإدارة" }, { status: 403 });
    }

    // Check institution status if institution user
    if (user.institution && user.institution.status === "SUSPENDED") {
      return NextResponse.json({ error: "تم تعليق حساب المؤسسة مؤقتاً بسبب الاشتراك" }, { status: 403 });
    }

    const isSuperAdmin = user.role === "SUPER_ADMIN";
    const institutionId = user.institutionId || (isSuperAdmin ? "" : "");

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      institutionId: institutionId || user.institution?.id || "",
      branchId: user.institution?.branches[0]?.id,
      isSuperAdmin,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        institution: user.institution
          ? {
              id: user.institution.id,
              name: user.institution.name,
              code: user.institution.code,
              brandColor: user.institution.brandColor,
              status: user.institution.status,
              plan: user.institution.subscription?.plan?.name,
            }
          : null,
      },
    });

    // Set HTTP-only session cookie
    response.cookies.set("noubla_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء تسجيل الدخول" }, { status: 500 });
  }
}
