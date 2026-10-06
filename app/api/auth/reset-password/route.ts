import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/auth/reset-password?token=... — Check token validity
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "رمز الاستعادة مفقود" },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { valid: false, error: "رابط استعادة كلمة المرور غير صالح" },
        { status: 400 }
      );
    }

    if (resetRecord.usedAt) {
      return NextResponse.json(
        { valid: false, error: "تم استخدام رابط الاستعادة هذا مسبقاً" },
        { status: 400 }
      );
    }

    if (new Date() > resetRecord.expiresAt) {
      return NextResponse.json(
        { valid: false, error: "انتهت صلاحية هذا الرابط (صالح لمدة ساعة واحدة فقط)" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: resetRecord.email,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { valid: false, error: "فشل التحقق من صلاحية الرابط" },
      { status: 500 }
    );
  }
}

// POST /api/auth/reset-password — Set new password
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "رمز الاستعادة وكلمة المرور الجديدة مطلوبان" },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل" },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: "رابط استعادة كلمة المرور غير صالح أو غير موجود" },
        { status: 400 }
      );
    }

    if (resetRecord.usedAt) {
      return NextResponse.json(
        { error: "تم استخدام رابط الاستعادة هذا مسبقاً، يرجى طلب رابط جديد" },
        { status: 400 }
      );
    }

    if (new Date() > resetRecord.expiresAt) {
      return NextResponse.json(
        { error: "انتهت صلاحية رابط الاستعادة (مدة الصلاحية ساعة واحدة)" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: resetRecord.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "المستخدم المرتبط بهذا الرابط غير موجود" },
        { status: 404 }
      );
    }

    // Hash the new password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Atomic transaction: update password & mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
      prisma.auditLog.create({
        data: {
          institutionId: user.institutionId,
          userId: user.id,
          action: "PASSWORD_RESET_SUCCESS",
          entity: "User",
          entityId: user.id,
          details: `تمت استعادة كلمة المرور بنجاح للمستخدم ${user.email}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إعادة تعيين كلمة المرور" },
      { status: 500 }
    );
  }
}
