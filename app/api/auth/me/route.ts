import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        institution: {
          include: {
            subscription: { include: { plan: true } },
            branches: true,
          },
        },
      },
    });

    const currentInstitution = await prisma.institution.findUnique({
      where: { id: session.institutionId },
      include: {
        subscription: { include: { plan: true } },
        branches: true,
      },
    });

    // Only return allInstitutions list to SUPER_ADMIN
    const isSuperAdmin = session.role === "SUPER_ADMIN" || Boolean(session.isSuperAdmin);
    let allInstitutions = undefined;

    if (isSuperAdmin) {
      allInstitutions = await prisma.institution.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          wilayaCode: true,
          status: true,
          brandColor: true,
          logoUrl: true,
        },
        orderBy: { name: "asc" },
      });
    }

    return NextResponse.json({
      authenticated: true,
      session,
      isSuperAdmin,
      user: user
        ? {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          }
        : {
            id: session.userId,
            email: session.email,
            fullName: session.fullName,
            role: session.role,
          },
      institution: currentInstitution,
      allInstitutions,
    });
  } catch (error) {
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        institution: null,
        error: "يرجى تسجيل الدخول للوصول إلى الجلسة",
      },
      { status: 401 }
    );
  }
}
