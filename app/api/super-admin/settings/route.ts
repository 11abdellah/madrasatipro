import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/super-admin/settings - Retrieve platform settings for editing
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (session.role !== "SUPER_ADMIN" && !session.isSuperAdmin) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول إلى إعدادات المنصة" },
        { status: 403 }
      );
    }

    let settings = await prisma.platformSetting.findUnique({
      where: { id: "singleton" },
    });

    if (!settings) {
      settings = await prisma.platformSetting.create({
        data: {
          id: "singleton",
          mainPhone: "0550 00 00 00",
          supportPhone: "0550 12 34 56",
          salesPhone: "0550 99 88 77",
          mainEmail: "contact@madrasatipro.dz",
          supportEmail: "support@madrasatipro.dz",
          salesEmail: "sales@madrasatipro.dz",
          whatsapp: "213550123456",
          facebookUrl: "https://facebook.com/madrasatipro",
          instagramUrl: "https://instagram.com/madrasatipro",
          linkedinUrl: "https://linkedin.com/company/madrasatipro",
          youtubeUrl: "https://youtube.com/@madrasatipro",
          tiktokUrl: "https://tiktok.com/@madrasatipro",
          address: "الجزائر العاصمة • سطيف",
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Super Admin settings GET error:", error);
    return NextResponse.json(
      { error: "تعذر استرجاع إعدادات المنصة" },
      { status: 500 }
    );
  }
}

// PATCH /api/super-admin/settings - Update centralized contact & social settings
export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (session.role !== "SUPER_ADMIN" && !session.isSuperAdmin) {
      return NextResponse.json(
        { error: "غير مصرح لك بتعديل إعدادات المنصة" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const updated = await prisma.platformSetting.upsert({
      where: { id: "singleton" },
      update: {
        ...(body.mainPhone !== undefined && { mainPhone: body.mainPhone?.trim() || null }),
        ...(body.supportPhone !== undefined && { supportPhone: body.supportPhone?.trim() || null }),
        ...(body.salesPhone !== undefined && { salesPhone: body.salesPhone?.trim() || null }),
        ...(body.mainEmail !== undefined && { mainEmail: body.mainEmail?.trim() || null }),
        ...(body.supportEmail !== undefined && { supportEmail: body.supportEmail?.trim() || null }),
        ...(body.salesEmail !== undefined && { salesEmail: body.salesEmail?.trim() || null }),
        ...(body.whatsapp !== undefined && { whatsapp: body.whatsapp?.trim() || null }),
        ...(body.facebookUrl !== undefined && { facebookUrl: body.facebookUrl?.trim() || null }),
        ...(body.instagramUrl !== undefined && { instagramUrl: body.instagramUrl?.trim() || null }),
        ...(body.linkedinUrl !== undefined && { linkedinUrl: body.linkedinUrl?.trim() || null }),
        ...(body.youtubeUrl !== undefined && { youtubeUrl: body.youtubeUrl?.trim() || null }),
        ...(body.tiktokUrl !== undefined && { tiktokUrl: body.tiktokUrl?.trim() || null }),
        ...(body.address !== undefined && { address: body.address?.trim() || null }),
      },
      create: {
        id: "singleton",
        mainPhone: body.mainPhone?.trim() || "0550 00 00 00",
        supportPhone: body.supportPhone?.trim() || "0550 12 34 56",
        salesPhone: body.salesPhone?.trim() || "0550 99 88 77",
        mainEmail: body.mainEmail?.trim() || "contact@madrasatipro.dz",
        supportEmail: body.supportEmail?.trim() || "support@madrasatipro.dz",
        salesEmail: body.salesEmail?.trim() || "sales@madrasatipro.dz",
        whatsapp: body.whatsapp?.trim() || "213550123456",
        facebookUrl: body.facebookUrl?.trim() || null,
        instagramUrl: body.instagramUrl?.trim() || null,
        linkedinUrl: body.linkedinUrl?.trim() || null,
        youtubeUrl: body.youtubeUrl?.trim() || null,
        tiktokUrl: body.tiktokUrl?.trim() || null,
        address: body.address?.trim() || "الجزائر العاصمة • سطيف",
      },
    });

    return NextResponse.json({
      message: "تم تحديث إعدادات المنصة ومعلومات التواصل بنجاح",
      settings: updated,
    });
  } catch (error) {
    console.error("Super Admin settings PATCH error:", error);
    return NextResponse.json(
      { error: "تعذر تحديث إعدادات المنصة" },
      { status: 500 }
    );
  }
}
