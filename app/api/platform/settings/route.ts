import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS = {
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
};

// GET /api/platform/settings - Public single-source-of-truth contact and social information
export async function GET() {
  try {
    let settings = await prisma.platformSetting.findUnique({
      where: { id: "singleton" },
    });

    if (!settings) {
      settings = await prisma.platformSetting.create({
        data: {
          id: "singleton",
          ...DEFAULT_SETTINGS,
        },
      });
    }

    return NextResponse.json({
      settings: {
        mainPhone: settings.mainPhone || DEFAULT_SETTINGS.mainPhone,
        supportPhone: settings.supportPhone || DEFAULT_SETTINGS.supportPhone,
        salesPhone: settings.salesPhone || DEFAULT_SETTINGS.salesPhone,
        mainEmail: settings.mainEmail || DEFAULT_SETTINGS.mainEmail,
        supportEmail: settings.supportEmail || DEFAULT_SETTINGS.supportEmail,
        salesEmail: settings.salesEmail || DEFAULT_SETTINGS.salesEmail,
        whatsapp: settings.whatsapp || DEFAULT_SETTINGS.whatsapp,
        facebookUrl: settings.facebookUrl || DEFAULT_SETTINGS.facebookUrl,
        instagramUrl: settings.instagramUrl || DEFAULT_SETTINGS.instagramUrl,
        linkedinUrl: settings.linkedinUrl || DEFAULT_SETTINGS.linkedinUrl,
        youtubeUrl: settings.youtubeUrl || DEFAULT_SETTINGS.youtubeUrl,
        tiktokUrl: settings.tiktokUrl || DEFAULT_SETTINGS.tiktokUrl,
        address: settings.address || DEFAULT_SETTINGS.address,
      },
    });
  } catch (error) {
    console.error("Public platform settings GET error:", error);
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  }
}
