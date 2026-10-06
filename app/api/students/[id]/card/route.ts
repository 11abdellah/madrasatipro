import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, handleApiError } from "@/lib/auth/session";
import { ALGERIAN_WILAYAS } from "@/lib/constants/algeria";

export const dynamic = "force-dynamic";

// GET /api/students/[id]/card - Fetch student card details with strict tenant isolation
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();

    // 1. Strict Tenant Isolation Query
    const student = await prisma.student.findFirst({
      where: {
        id: params.id,
        institutionId: session.institutionId,
      },
      include: {
        institution: true,
        enrollments: {
          include: { group: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "الطالب غير موجود أو ليس لديك صلاحية الوصول إلى بطاقته المدرسية" },
        { status: 404 }
      );
    }

    // 2. Format Institution and Student Card Details
    const instCode = session.institutionId.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase();
    const studentNumber =
      student.studentNumber || `MP-2026-${instCode}-${student.id.slice(0, 4).toUpperCase()}`;

    const wilayaObj = ALGERIAN_WILAYAS.find((w) => w.code === student.wilayaCode);
    const studentWilaya = wilayaObj ? wilayaObj.nameAr : `ولاية ${student.wilayaCode}`;

    const instWilayaObj = ALGERIAN_WILAYAS.find((w) => w.code === student.institution.wilayaCode);
    const institutionWilaya = instWilayaObj ? instWilayaObj.nameAr : `ولاية ${student.institution.wilayaCode}`;

    const groupName = student.enrollments[0]?.group?.name || null;

    const card = {
      studentId: student.id,
      studentNumber,
      fullName: `${student.firstName} ${student.lastName}`,
      firstName: student.firstName,
      lastName: student.lastName,
      photoUrl: student.photoUrl || null,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth || null,
      academicLevel: student.academicLevel,
      stream: student.stream || null,
      groupName,
      phone: student.phone,
      studentWilaya,
      enrollmentDate: student.enrollmentDate || null,
      status: student.status,

      // Institution Branding (Prioritizing the school's own identity)
      institutionId: student.institution.id,
      institutionName: student.institution.name,
      institutionLogo: student.institution.logoUrl || null,
      institutionWilaya,
      institutionAddress: student.institution.address || null,
      institutionPhone: student.institution.phone || null,
      academicYear: student.institution.academicYear || "2025-2026",
    };

    return NextResponse.json({ success: true, card });
  } catch (error) {
    return handleApiError(error);
  }
}
