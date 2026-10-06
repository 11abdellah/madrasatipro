import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();

    const notifications = await prisma.notification.findMany({
      where: { institutionId: session.institutionId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { institutionId: session.institutionId, isRead: false },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "تعذر جلب الإشعارات" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await prisma.notification.updateMany({
        where: { institutionId: session.institutionId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "تم تحديد جميع الإشعارات كمقروءة" });
    }

    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "معرف الإشعار مطلوب" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/notifications error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء تحديث الإشعار" }, { status: 500 });
  }
}
