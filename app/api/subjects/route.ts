import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, handleApiError } from "@/lib/auth/session";
import { ensureInstitutionSubjects } from "@/lib/constants/subjects";

export const dynamic = "force-dynamic";

// GET /api/subjects - List all available subjects for current institution
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();

    // Check count and ensure default Algerian subjects exist without duplicates
    const count = await prisma.subject.count({
      where: { institutionId: session.institutionId },
    });

    if (count < 5) {
      await ensureInstitutionSubjects(session.institutionId, prisma);
    }

    const subjects = await prisma.subject.findMany({
      where: {
        institutionId: session.institutionId,
        active: true,
      },
      orderBy: { nameAr: "asc" },
      select: {
        id: true,
        code: true,
        nameAr: true,
        nameFr: true,
        color: true,
        active: true,
      },
    });

    return NextResponse.json({
      success: true,
      subjects,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/subjects - Create a new custom subject for the institution
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    const { nameAr, nameFr, code, color } = body;

    if (!nameAr || !nameAr.trim()) {
      return NextResponse.json(
        { error: "يرجى تحديد اسم المادة باللغة العربية" },
        { status: 400 }
      );
    }

    const generatedCode = code?.trim() || nameAr.trim().slice(0, 4).toUpperCase();
    const resolvedColor = color || "#6366F1";

    // Prevent duplicate subject with same Arabic name for this institution
    const existing = await prisma.subject.findFirst({
      where: {
        institutionId: session.institutionId,
        nameAr: nameAr.trim(),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "المادة مسجلة بالفعل في مؤسستك", subject: existing },
        { status: 400 }
      );
    }

    const newSubject = await prisma.subject.create({
      data: {
        institutionId: session.institutionId,
        code: generatedCode,
        nameAr: nameAr.trim(),
        nameFr: nameFr?.trim() || nameAr.trim(),
        color: resolvedColor,
        active: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تمت إضافة المادة بنجاح",
      subject: newSubject,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
