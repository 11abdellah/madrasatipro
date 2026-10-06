import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession, handleApiError } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

// POST /api/settings/logo - Upload institution custom logo
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const institutionId = session.institutionId;

    if (!institutionId) {
      return NextResponse.json({ error: "لم يتم العثور على مؤسسة مرتبطة بحسابك" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = (formData.get("logo") || formData.get("file")) as File | null;

    if (!file) {
      return NextResponse.json({ error: "يرجى تحديد ملف صورة للشعار" }, { status: 400 });
    }

    // 1. Validate File Size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "حجم الشعار يتجاوز الحد الأقصى المسموح به (2 ميغابايت). يرجى تقليل حجم الصورة." },
        { status: 400 }
      );
    }

    // 2. Validate MIME Type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: "نوع الملف غير مدعوم. الصيغ المدعومة هي: PNG, JPG, JPEG, WebP." },
        { status: 400 }
      );
    }

    // 3. Prepare Directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "institutions", institutionId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 4. Remove previous logo files to prevent orphan build-up
    try {
      const existingFiles = fs.readdirSync(uploadDir);
      for (const f of existingFiles) {
        if (f.startsWith("logo-")) {
          fs.unlinkSync(path.join(uploadDir, f));
        }
      }
    } catch (e) {
      console.warn("Could not clean old logos:", e);
    }

    // 5. Determine extension & save file
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `logo-${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const logoUrl = `/uploads/institutions/${institutionId}/${filename}`;

    // 6. Update database record
    await prisma.institution.update({
      where: { id: institutionId },
      data: { logoUrl },
    });

    // 7. Audit Log
    await prisma.auditLog.create({
      data: {
        institutionId,
        userId: session.userId,
        action: "LOGO_UPDATED",
        entity: "Institution",
        entityId: institutionId,
        details: `تم تحديث شعار المؤسسة: ${logoUrl}`,
      },
    });

    return NextResponse.json({
      success: true,
      logoUrl,
      message: "تم رفع وتحديث شعار المؤسسة بنجاح",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/settings/logo - Remove institution custom logo
export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const institutionId = session.institutionId;

    if (!institutionId) {
      return NextResponse.json({ error: "لم يتم العثور على مؤسسة مرتبطة بحسابك" }, { status: 400 });
    }

    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (institution?.logoUrl) {
      // Remove file if present
      const uploadDir = path.join(process.cwd(), "public", "uploads", "institutions", institutionId);
      if (fs.existsSync(uploadDir)) {
        try {
          const files = fs.readdirSync(uploadDir);
          for (const f of files) {
            if (f.startsWith("logo-")) {
              fs.unlinkSync(path.join(uploadDir, f));
            }
          }
        } catch (e) {
          console.warn("Error removing logo files:", e);
        }
      }
    }

    // Update database
    await prisma.institution.update({
      where: { id: institutionId },
      data: { logoUrl: null },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        institutionId,
        userId: session.userId,
        action: "LOGO_DELETED",
        entity: "Institution",
        entityId: institutionId,
        details: "تمت إزالة شعار المؤسسة والعودة للشعار الافتراضي",
      },
    });

    return NextResponse.json({
      success: true,
      message: "تمت إزالة شعار المؤسسة بنجاح",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
