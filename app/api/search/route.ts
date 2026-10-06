import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";

// GET /api/search?q=...
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({ students: [], teachers: [] });
    }

    const students = await prisma.student.findMany({
      where: {
        institutionId: session.institutionId,
        OR: [
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { phone: { contains: query } },
        ],
      },
      take: 6,
    });

    const teachers = await prisma.teacher.findMany({
      where: {
        institutionId: session.institutionId,
        OR: [
          { fullName: { contains: query } },
          { phone: { contains: query } },
          { email: { contains: query } },
        ],
      },
      take: 6,
    });

    return NextResponse.json({ students, teachers });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في البحث" }, { status: 500 });
  }
}
