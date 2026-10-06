import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();

    const existing = await prisma.classSession.findFirst({
      where: {
        id: params.id,
        institutionId: session.institutionId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "الحصة غير موجودة" }, { status: 404 });
    }

    // Delete session (cascade removes attendances if any)
    await prisma.classSession.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        institutionId: session.institutionId,
        userId: session.userId,
        action: "SESSION_DELETED",
        entity: "ClassSession",
        entityId: params.id,
      },
    });

    return NextResponse.json({ success: true, message: "تم حذف الحصة بنجاح" });
  } catch (error) {
    console.error("DELETE /api/timetable/[id] error:", error);
    return NextResponse.json({ error: "تعذر حذف الحصة" }, { status: 500 });
  }
}
