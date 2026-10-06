import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "يرجى إدخال بريد إلكتروني صالح" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists (without revealing status to the client)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    let resetTokenForDev: string | undefined = undefined;

    if (user && user.isActive) {
      // Invalidate any existing unused reset tokens for this email
      await prisma.passwordResetToken.updateMany({
        where: { email: normalizedEmail, usedAt: null },
        data: { usedAt: new Date() },
      });

      // Generate cryptographically secure random token
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: {
          email: normalizedEmail,
          tokenHash,
          expiresAt,
        },
      });

      // Reset URL
      const host = req.headers.get("host") || "localhost:3000";
      const protocol = req.headers.get("x-forwarded-proto") || "http";
      const resetUrl = `${protocol}://${host}/reset-password?token=${rawToken}`;

      console.log(`[PASSWORD_RESET] Reset link generated for ${normalizedEmail}: ${resetUrl}`);

      // In non-production or for testing, provide the token/link so QA tests can proceed seamlessly
      if (process.env.NODE_ENV !== "production") {
        resetTokenForDev = rawToken;
      }
    }

    // Always return generic uniform message to prevent email enumeration attacks
    return NextResponse.json({
      success: true,
      message: "إذا كان هذا البريد مسجلاً لدينا، فستتلقى رابطاً لإعادة تعيين كلمة المرور.",
      devResetToken: resetTokenForDev,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء معالجة طلبك" },
      { status: 500 }
    );
  }
}
