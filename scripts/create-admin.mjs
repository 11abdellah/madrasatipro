import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import bcrypt from "bcryptjs";
import readline from "readline";

const prisma = new PrismaClient();

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

async function main() {
  console.log("==================================================");
  console.log("   👤 أداة إنشاء وتعديل حسابات المشرفين (Admin)");
  console.log("==================================================\n");

  let email = process.argv[2];
  let password = process.argv[3];
  let role = process.argv[4] || "ADMIN"; // ADMIN or SUPER_ADMIN
  let fullName = process.argv[5] || "مدير النظام";

  if (!email || !password) {
    email = await prompt("📧 أدخل البريد الإلكتروني (مثال: admin@madrasatipro.dz): ");
    password = await prompt("🔑 أدخل كلمة المرور: ");
    const roleChoice = await prompt("🏷️ اختر نوع الحساب (1: مدير مدرسة ADMIN | 2: مشرف عام SUPER_ADMIN) [الافتراضي: 1]: ");
    role = roleChoice === "2" ? "SUPER_ADMIN" : "ADMIN";
    fullName = await prompt("👤 أدخل الاسم الكامل [الافتراضي: المشرف]: ") || "المشرف";
  }

  if (!email || !password) {
    console.error("❌ البريد الإلكتروني وكلمة المرور مطلوبان!");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let institutionId = null;
  if (role === "ADMIN") {
    // Find or create default institution
    let inst = await prisma.institution.findFirst({ where: { status: "ACTIVE" } });
    if (!inst) {
      inst = await prisma.institution.create({
        data: {
          code: `inst-${Date.now().toString().slice(-4)}`,
          name: "مؤسسة مدرستي التعليمية",
          wilayaCode: 16,
          address: "الجزائر العاصمة",
          status: "ACTIVE",
        },
      });
    }
    institutionId = inst.id;
  }

  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase().trim() },
    update: {
      passwordHash,
      fullName,
      role,
      isActive: true,
      ...(institutionId ? { institutionId } : {}),
    },
    create: {
      email: email.toLowerCase().trim(),
      passwordHash,
      fullName,
      role,
      isActive: true,
      institutionId,
    },
  });

  console.log("\n✅ تم إنشاء/تحديث الحساب بنجاح!");
  console.log("--------------------------------------------------");
  console.log(`📌 البريد الإلكتروني: ${user.email}`);
  console.log(`📌 نوع الصلاحية: ${user.role}`);
  console.log(`📌 الاسم الكامل: ${user.fullName}`);
  if (user.role === "SUPER_ADMIN") {
    console.log(`🌐 رابط الدخول: http://localhost:3000/super-admin أو عبر صفحة الدخول`);
  } else {
    console.log(`🌐 رابط الدخول: http://localhost:3000/dashboard أو عبر صفحة الدخول`);
  }
  console.log("--------------------------------------------------\n");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("❌ حدث خطأ:", e);
  await prisma.$disconnect();
  process.exit(1);
});
