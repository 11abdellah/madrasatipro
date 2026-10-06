import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

// Load .env automatically if present
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

const prisma = new PrismaClient();

async function main() {
  console.log("==================================================");
  console.log("   🌱 تغذية قاعدة بيانات MadrasatiPro بالكامل");
  console.log("==================================================\n");

  // 1. Subscription Plans
  console.log("1️⃣ إنشاء وتحديث خطط الاشتراك (Subscription Plans)...");
  const plansData = [
    {
      slug: "free",
      name: "الخطة التجريبية المجانية (Free Trial)",
      description: "خطة تجريبية مجانية بالكامل لاكتشاف إمكانيات المنصة بدون أي تكاليف",
      priceDZD: 0,
      annualPriceDZD: 0,
      billingPeriod: "MONTHLY",
      maxStudents: 30,
      maxTeachers: 5,
      maxBranches: 1,
      maxGroups: 5,
      storageLimitGB: 2,
      features: JSON.stringify(["students", "teachers", "groups", "attendance", "invoicing"]),
    },
    {
      slug: "starter",
      name: "الخطة الأساسية (Starter)",
      description: "مناسبة للمدارس الناشئة ومراكز الدعم الصغيرة",
      priceDZD: 5000,
      annualPriceDZD: 50000,
      billingPeriod: "MONTHLY",
      maxStudents: 50,
      maxTeachers: 10,
      maxBranches: 1,
      maxGroups: 10,
      storageLimitGB: 5,
      features: JSON.stringify(["students", "teachers", "groups", "attendance", "invoicing"]),
    },
    {
      slug: "pro",
      name: "الخطة الاحترافية (Professional)",
      description: "الخطة الأكثر طلباً للمدارس الخاصة ومراكز اللغات المتقدمة",
      priceDZD: 15000,
      annualPriceDZD: 150000,
      billingPeriod: "MONTHLY",
      maxStudents: 300,
      maxTeachers: 25,
      maxBranches: 3,
      maxGroups: 50,
      storageLimitGB: 20,
      features: JSON.stringify(["students", "teachers", "groups", "attendance", "invoicing", "payroll", "sms", "multi_branch"]),
    },
    {
      slug: "business",
      name: "خطة الأعمال والمؤسسات (Business)",
      description: "حل متكامل للمجمعات التعليمية والمعاهد الكبرى",
      priceDZD: 35000,
      annualPriceDZD: 350000,
      billingPeriod: "MONTHLY",
      maxStudents: 1000,
      maxTeachers: 100,
      maxBranches: 10,
      maxGroups: 200,
      storageLimitGB: 100,
      features: JSON.stringify(["all_features", "priority_support", "custom_domain", "api_access"]),
    },
  ];

  const plans = {};
  for (const p of plansData) {
    const plan = await prisma.subscriptionPlan.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
    plans[p.slug] = plan;
    console.log(`   ✅ خطة ${p.name} جاهزة.`);
  }

  // 2. Platform Settings
  console.log("\n2️⃣ إعدادات المنصة العامة (Platform Settings)...");
  await prisma.platformSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
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
  console.log("   ✅ إعدادات المنصة جاهزة.");

  // 3. Payment Methods
  console.log("\n3️⃣ طرق الدفع بالدينار الجزائري (Payment Methods)...");
  const defaultMethods = [
    {
      code: "baridimob",
      name: "بريدي موب (Baridimob)",
      displayName: "BaridiMob",
      description: "تحويل فوري عبر تطبيق بريدي موب RIP",
      instructions: "قم بتحويل المبلغ إلى الحساب البريدي عبر تطبيق بريدي موب، واحتفظ بوصل التحويل لتأكيد العملية.",
      accountName: "SARL MADRASATIPRO EDTECH ALGERIE",
      accountNumber: "007999990022334455 88",
      sortOrder: 1,
      isActive: true,
    },
    {
      code: "ccp",
      name: "حوالة بريدية (CCP)",
      displayName: "CCP",
      description: "عبر أي مكتب بريد في 58 ولاية",
      instructions: "ادفع في أقرب مكتب بريد باستخدام الصك البريدي أو الحوالة، ثم أرسل إشعار الدفع.",
      accountName: "SARL MADRASATIPRO EDTECH ALGERIE",
      accountNumber: "21045892 مفتاح 45",
      sortOrder: 2,
      isActive: true,
    },
    {
      code: "bank_transfer",
      name: "تحويل بنكي رسمي (Virement)",
      displayName: "تحويل بنكي",
      description: "عبر الحساب البنكي الوطني (BNA / BEA)",
      instructions: "قم بالتحويل البنكي المباشر إلى الحساب التجاري للمنصة مع كتابة اسم المؤسسة كمرجع.",
      accountName: "SARL MADRASATIPRO EDTECH ALGERIE",
      accountNumber: "00100654030000000000 12",
      sortOrder: 3,
      isActive: true,
    },
  ];

  for (const m of defaultMethods) {
    await prisma.paymentMethod.upsert({
      where: { code: m.code },
      update: m,
      create: m,
    });
    console.log(`   ✅ طريقة الدفع ${m.name} جاهزة.`);
  }

  // 4. Super Admin User
  console.log("\n4️⃣ إنشاء حساب المشرف العام للمنصة (Super Admin)...");
  const adminPasswordHash = await bcrypt.hash("AdminPassword2026!", 10);

  await prisma.user.upsert({
    where: { email: "superadmin@madrasatipro.dz" },
    update: {
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
    create: {
      email: "superadmin@madrasatipro.dz",
      passwordHash: adminPasswordHash,
      fullName: "المشرف العام لمنصة مدرستي برو",
      phone: "0555 00 00 00",
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });
  console.log("   ✅ حساب المشرف العام: superadmin@madrasatipro.dz جاهز.");

  // 5. Institution (مؤسسة نموذجية مفعّلة)
  console.log("\n5️⃣ إنشاء مؤسسة تعليمية مفعّلة (مؤسسة النخبة)...");
  let institution = await prisma.institution.findUnique({
    where: { code: "el-nokhba" },
  });

  if (!institution) {
    institution = await prisma.institution.create({
      data: {
        code: "el-nokhba",
        name: "مؤسسة النخبة للتعليم والدعم المدرسي",
        wilayaCode: 19, // سطيف
        address: "حي 1014 مسكن، سطيف",
        phone: "0550 12 34 56",
        email: "contact@el-nokhba.dz",
        brandColor: "#F47A3C",
        academicYear: "2025-2026",
        status: "ACTIVE",
      },
    });
  }

  // Branch
  let branch = await prisma.branch.findFirst({
    where: { institutionId: institution.id },
  });
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        institutionId: institution.id,
        name: "المقر الرئيسي — سطيف",
        wilayaCode: 19,
        address: "حي 1014 مسكن، سطيف",
        isMain: true,
      },
    });
  }

  // Subscription for Institution (Active Pro Plan)
  const existingSub = await prisma.subscription.findFirst({
    where: { institutionId: institution.id },
  });
  if (!existingSub) {
    await prisma.subscription.create({
      data: {
        institutionId: institution.id,
        planId: plans["pro"].id,
        status: "ACTIVE",
        billingCycle: "MONTHLY",
        startDate: new Date(),
        renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // 6. School Admin User (مدير المؤسسة)
  console.log("\n6️⃣ إنشاء حساب مدير المدرسة (School Admin)...");
  await prisma.user.upsert({
    where: { email: "admin@madrasatipro.dz" },
    update: {
      institutionId: institution.id,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      institutionId: institution.id,
      email: "admin@madrasatipro.dz",
      passwordHash: adminPasswordHash,
      fullName: "أحمد بلحاج (مدير المدرسة)",
      phone: "0550 12 34 56",
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log("   ✅ حساب مدير المدرسة: admin@madrasatipro.dz جاهز.");

  // 7. Classrooms
  console.log("\n7️⃣ إنشاء قاعات التدريس...");
  const rooms = [
    { name: "قاعة الخوارزمي (01)", capacity: 25 },
    { name: "قاعة ابن الهيثم (02)", capacity: 20 },
    { name: "مخبر العلوم واللغات (03)", capacity: 30 },
  ];
  for (const r of rooms) {
    const existingRoom = await prisma.classroom.findFirst({
      where: { institutionId: institution.id, name: r.name },
    });
    if (!existingRoom) {
      await prisma.classroom.create({
        data: {
          institutionId: institution.id,
          branchId: branch.id,
          name: r.name,
          capacity: r.capacity,
        },
      });
    }
  }

  // 8. Subjects
  console.log("8️⃣ إنشاء المواد الدراسية...");
  const subjectsData = [
    { code: "MATH", nameAr: "الرياضيات", nameFr: "Mathématiques", color: "#6366F1" },
    { code: "PHYS", nameAr: "العلوم الفيزيائية", nameFr: "Physique-Chimie", color: "#0EA5E9" },
    { code: "SCI", nameAr: "علوم الطبيعة والحياة", nameFr: "Sciences Naturelles", color: "#10B981" },
    { code: "ENG", nameAr: "اللغة الإنجليزية", nameFr: "Anglais", color: "#F59E0B" },
    { code: "ARA", nameAr: "اللغة العربية وآدابها", nameFr: "Langue Arabe", color: "#8B5CF6" },
  ];
  for (const s of subjectsData) {
    const existingSubj = await prisma.subject.findFirst({
      where: { institutionId: institution.id, code: s.code },
    });
    if (!existingSubj) {
      await prisma.subject.create({
        data: {
          institutionId: institution.id,
          code: s.code,
          nameAr: s.nameAr,
          nameFr: s.nameFr,
          color: s.color,
        },
      });
    }
  }

  // 9. Sample Teachers
  console.log("9️⃣ إضافة أساتذة نموذجية...");
  const teachersData = [
    { firstName: "عبد القادر", lastName: "بوعلام", fullName: "عبد القادر بوعلام", email: "boualam@madrasatipro.dz", phone: "0551 22 33 44", specialization: "الرياضيات", hourlyRate: 2000, fixedSalary: 45000 },
    { firstName: "سميرة", lastName: "بن عيسى", fullName: "سميرة بن عيسى", email: "samira@madrasatipro.dz", phone: "0662 33 44 55", specialization: "العلوم الفيزيائية", hourlyRate: 1800, fixedSalary: 40000 },
    { firstName: "طارق", lastName: "مزيان", fullName: "طارق مزيان", email: "tarek@madrasatipro.dz", phone: "0770 44 55 66", specialization: "علوم الطبيعة والحياة", hourlyRate: 1900, fixedSalary: 42000 },
  ];
  for (const t of teachersData) {
    const existingT = await prisma.teacher.findFirst({
      where: { institutionId: institution.id, email: t.email },
    });
    if (!existingT) {
      await prisma.teacher.create({
        data: {
          institutionId: institution.id,
          firstName: t.firstName,
          lastName: t.lastName,
          fullName: t.fullName,
          email: t.email,
          phone: t.phone,
          specialization: t.specialization,
          subjects: JSON.stringify([t.specialization]),
          hourlyRate: t.hourlyRate,
          fixedSalary: t.fixedSalary,
          contractType: "hourly",
          wageType: "hourly",
          status: "ACTIVE",
        },
      });
    }
  }

  // 10. Sample Students
  console.log("🔟 إضافة تلاميذ نموذجية...");
  const studentsData = [
    { firstName: "يوسف", lastName: "قادري", academicLevel: "3AS", phone: "0555 11 22 33" },
    { firstName: "مريم", lastName: "براهيمي", academicLevel: "3AS", phone: "0556 22 33 44" },
    { firstName: "إلياس", lastName: "بن زيان", academicLevel: "4AM", phone: "0557 33 44 55" },
  ];
  for (const st of studentsData) {
    const existingSt = await prisma.student.findFirst({
      where: { institutionId: institution.id, firstName: st.firstName, lastName: st.lastName },
    });
    if (!existingSt) {
      await prisma.student.create({
        data: {
          institutionId: institution.id,
          branchId: branch.id,
          firstName: st.firstName,
          lastName: st.lastName,
          academicLevel: st.academicLevel,
          phone: st.phone,
          monthlyFee: 4000,
          status: "ACTIVE",
        },
      });
    }
  }

  console.log("\n==================================================");
  console.log("   🎉 تم إنشاء جميع الحسابات والبيانات بنجاح 100%!");
  console.log("==================================================");
  console.log("\n🔑 بيانات تسجيل الدخول الجاهزة:");
  console.log("--------------------------------------------------");
  console.log("1️⃣ حساب مدير المدرسة (School Admin Dashboard):");
  console.log("   - البريد: admin@madrasatipro.dz");
  console.log("   - كلمة المرور: AdminPassword2026!");
  console.log("   - الصلاحية: ADMIN");
  console.log("   - التوجيه التلقائي: /dashboard");
  console.log("--------------------------------------------------");
  console.log("2️⃣ حساب المشرف العام للمنصة (SaaS Super Admin):");
  console.log("   - البريد: superadmin@madrasatipro.dz");
  console.log("   - كلمة المرور: AdminPassword2026!");
  console.log("   - الصلاحية: SUPER_ADMIN");
  console.log("   - التوجيه التلقائي: /super-admin");
  console.log("--------------------------------------------------\n");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("❌ حدث خطأ:", e);
  await prisma.$disconnect();
  process.exit(1);
});
