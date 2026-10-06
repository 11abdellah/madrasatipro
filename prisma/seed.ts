import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Noubla Multi-Tenant SaaS Seeding...");

  // 1. Subscription Plans
  console.log("1. Creating SaaS Subscription Plans...");
  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "free" },
    update: { priceDZD: 0 },
    create: {
      name: "الخطة التجريبية المجانية (Free Trial)",
      slug: "free",
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
  });

  const starterPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "starter" },
    update: {},
    create: {
      name: "الخطة الأساسية (Starter)",
      slug: "starter",
      priceDZD: 5000,
      billingPeriod: "MONTHLY",
      maxStudents: 50,
      maxTeachers: 10,
      maxBranches: 1,
      maxGroups: 10,
      features: JSON.stringify(["students", "teachers", "groups", "attendance", "invoicing"]),
    },
  });

  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "pro" },
    update: {},
    create: {
      name: "الخطة الاحترافية (Professional)",
      slug: "pro",
      priceDZD: 15000,
      billingPeriod: "MONTHLY",
      maxStudents: 300,
      maxTeachers: 25,
      maxBranches: 3,
      maxGroups: 50,
      features: JSON.stringify(["students", "teachers", "groups", "attendance", "invoicing", "payroll", "sms", "multi_branch"]),
    },
  });

  const businessPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "business" },
    update: {},
    create: {
      name: "خطة الأعمال والمؤسسات (Business)",
      slug: "business",
      priceDZD: 35000,
      billingPeriod: "MONTHLY",
      maxStudents: 1000,
      maxTeachers: 100,
      maxBranches: 10,
      maxGroups: 200,
      features: JSON.stringify(["all_features", "priority_support", "custom_domain", "api_access"]),
    },
  });

  // 2. Global Super Admin User (No institution, SaaS operator)
  console.log("2. Creating SaaS Super Admin...");
  const superPassword = await bcrypt.hash("SuperNoubla2026!", 10);
  await prisma.user.upsert({
    where: { email: "superadmin@noubla.dz" },
    update: {},
    create: {
      email: "superadmin@noubla.dz",
      passwordHash: superPassword,
      fullName: "المشرف العام لمنصة مدرستي برو",
      phone: "0555 00 00 00",
      role: "SUPER_ADMIN",
    },
  });

  // 3. Institution A: "مركز النخبة للدعم المدرسي واللغات" (سطيف)
  console.log("3. Creating Institution A: مركز النخبة (سطيف)...");
  const instA = await prisma.institution.create({
    data: {
      code: "el-nokhba",
      name: "مركز النخبة للدعم المدرسي واللغات",
      wilayaCode: 19,
      address: "حي 1014 مسكن، سطيف",
      phone: "0550 12 34 56",
      email: "contact@elitenoubla.dz",
      brandColor: "#E05B3A",
      academicYear: "2025-2026",
      status: "ACTIVE",
    },
  });

  // Subscription for Institution A (Pro Plan)
  await prisma.subscription.create({
    data: {
      institutionId: instA.id,
      planId: proPlan.id,
      status: "ACTIVE",
      billingCycle: "MONTHLY",
      startDate: new Date(),
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const branchA = await prisma.branch.create({
    data: {
      institutionId: instA.id,
      name: "المقر الرئيسي — حي 1014 مسكن",
      wilayaCode: 19,
      address: "عمارة B، حي 1014 مسكن، سطيف",
      isMain: true,
    },
  });

  const defaultPassword = await bcrypt.hash("Noubla2026!", 10);
  const adminA = await prisma.user.create({
    data: {
      institutionId: instA.id,
      email: "ahmed@noubla.dz",
      passwordHash: defaultPassword,
      fullName: "أحمد بلحاج",
      phone: "0550 12 34 56",
      role: "ADMIN",
    },
  });

  // Classrooms for Institution A
  const roomA1 = await prisma.classroom.create({
    data: { institutionId: instA.id, branchId: branchA.id, name: "قاعة الخوارزمي (03)", capacity: 25 },
  });
  const roomA2 = await prisma.classroom.create({
    data: { institutionId: instA.id, branchId: branchA.id, name: "مخبر ابن الهيثم (01)", capacity: 20 },
  });
  const roomA3 = await prisma.classroom.create({
    data: { institutionId: instA.id, branchId: branchA.id, name: "قاعة ابن سينا (04)", capacity: 25 },
  });

  // Subjects for Institution A
  const subMath = await prisma.subject.create({
    data: { institutionId: instA.id, code: "MATH", nameAr: "الرياضيات", nameFr: "Mathématiques", color: "#6366F1" },
  });
  const subPhys = await prisma.subject.create({
    data: { institutionId: instA.id, code: "PHYS", nameAr: "العلوم الفيزيائية", nameFr: "Physique-Chimie", color: "#0EA5E9" },
  });
  const subSci = await prisma.subject.create({
    data: { institutionId: instA.id, code: "SCI", nameAr: "علوم الطبيعة والحياة", nameFr: "Sciences Naturelles", color: "#10B981" },
  });
  const subEng = await prisma.subject.create({
    data: { institutionId: instA.id, code: "ENG", nameAr: "اللغة الإنجليزية", nameFr: "Anglais", color: "#F59E0B" },
  });
  const subAra = await prisma.subject.create({
    data: { institutionId: instA.id, code: "ARA", nameAr: "اللغة العربية وآدابها", nameFr: "Langue Arabe", color: "#8B5CF6" },
  });

  // Teachers for Institution A
  const teachersDataA = [
    { first: "عبد القادر", last: "بوعلام", spec: "أستاذ مبرز في الرياضيات - البكالوريا", rate: 2000, sub: "الرياضيات", phone: "0551 22 33 44", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80" },
    { first: "سميرة", last: "بن عيسى", spec: "أستاذة التعليم الثانوي فيزياء", rate: 1800, sub: "العلوم الفيزيائية", phone: "0662 33 44 55", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80" },
    { first: "طارق", last: "مزيان", spec: "مفتش سابق في علوم الطبيعة", rate: 1900, sub: "علوم الطبيعة والحياة", phone: "0770 44 55 66", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80" },
    { first: "فاطمة الزهراء", last: "قادري", spec: "أستاذة معتمدة للغة الإنجليزية", rate: 1600, sub: "اللغة الإنجليزية", phone: "0553 55 66 77", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80" },
    { first: "مراد", last: "سليماني", spec: "أستاذ الأدب العربي والبلاغة", rate: 1700, sub: "اللغة العربية وآدابها", phone: "0664 66 77 88", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80" },
  ];

  const createdTeachersA: any[] = [];
  for (const t of teachersDataA) {
    const tUser = await prisma.user.create({
      data: {
        institutionId: instA.id,
        email: `${t.last.toLowerCase()}.${Date.now().toString().slice(-4)}@elitenoubla.dz`,
        passwordHash: defaultPassword,
        fullName: `أ. ${t.first} ${t.last}`,
        phone: t.phone,
        role: "TEACHER",
      },
    });

    const teacher = await prisma.teacher.create({
      data: {
        institutionId: instA.id,
        branchId: branchA.id,
        userId: tUser.id,
        firstName: t.first,
        lastName: t.last,
        fullName: `أ. ${t.first} ${t.last}`,
        email: tUser.email,
        phone: t.phone,
        specialization: t.spec,
        subjects: JSON.stringify([t.sub]),
        hourlyRate: t.rate,
        wageType: "hourly",
        status: "ACTIVE",
        avatarUrl: t.avatar,
      },
    });
    createdTeachersA.push(teacher);
  }

  // Groups for Institution A
  const grpMathBAC = await prisma.classGroup.create({
    data: {
      institutionId: instA.id,
      branchId: branchA.id,
      teacherId: createdTeachersA[0].id,
      subjectId: subMath.id,
      classroomId: roomA1.id,
      name: "3AS علوم تجريبية (فوج النخبة أ)",
      academicLevel: "3AS",
      stream: "علوم تجريبية",
      maxCapacity: 20,
      startTime: "08:30",
      endTime: "10:00",
      dayOfWeek: 6, // السبت
      monthlyFee: 4000,
    },
  });

  const grpPhysBAC = await prisma.classGroup.create({
    data: {
      institutionId: instA.id,
      branchId: branchA.id,
      teacherId: createdTeachersA[1].id,
      subjectId: subPhys.id,
      classroomId: roomA2.id,
      name: "3AS رياضيات وتقني رياضي (فوج ب)",
      academicLevel: "3AS",
      stream: "رياضيات",
      maxCapacity: 18,
      startTime: "10:00",
      endTime: "11:30",
      dayOfWeek: 6, // السبت
      monthlyFee: 4000,
    },
  });

  const grpSciBEM = await prisma.classGroup.create({
    data: {
      institutionId: instA.id,
      branchId: branchA.id,
      teacherId: createdTeachersA[2].id,
      subjectId: subSci.id,
      classroomId: roomA3.id,
      name: "4AM تحضير شهادة التعليم المتوسط (BEM)",
      academicLevel: "4AM",
      stream: "عام",
      maxCapacity: 22,
      startTime: "14:00",
      endTime: "15:30",
      dayOfWeek: 0, // الأحد
      monthlyFee: 3500,
    },
  });

  // Students & Parents for Institution A
  const parentsDataA = [
    { name: "عمر بلقاسم", phone: "0661 11 22 33", rel: "الأب" },
    { name: "فاروق بوجمعة", phone: "0770 99 88 77", rel: "الأب" },
    { name: "سميحة حداد", phone: "0550 44 55 66", rel: "الأم" },
    { name: "بلقاسم زروقي", phone: "0663 77 88 99", rel: "الولي الشرعي" },
  ];

  const createdParentsA: any[] = [];
  for (const p of parentsDataA) {
    const parent = await prisma.parent.create({
      data: {
        institutionId: instA.id,
        fullName: p.name,
        phone: p.phone,
        relationship: p.rel,
      },
    });
    createdParentsA.push(parent);
  }

  const studentsDataA = [
    { first: "محمد أمين", last: "بلقاسم", level: "3AS", stream: "علوم تجريبية", parentIdx: 0, phone: "0551 23 45 67" },
    { first: "سارة", last: "بوجمعة", level: "3AS", stream: "رياضيات", parentIdx: 1, phone: "0662 34 56 78" },
    { first: "ياسين", last: "حداد", level: "2AS", stream: "علوم تجريبية", parentIdx: 2, phone: "0770 12 98 43" },
    { first: "إياد", last: "زروقي", level: "4AM", stream: "عام", parentIdx: 3, phone: "0554 98 76 54" },
    { first: "مريم", last: "بلقاسم", level: "3AS", stream: "علوم تجريبية", parentIdx: 0, phone: "0558 11 22 33" },
  ];

  const createdStudentsA: any[] = [];
  for (const s of studentsDataA) {
    const student = await prisma.student.create({
      data: {
        institutionId: instA.id,
        branchId: branchA.id,
        parentId: createdParentsA[s.parentIdx].id,
        firstName: s.first,
        lastName: s.last,
        phone: s.phone,
        academicLevel: s.level,
        stream: s.stream,
        status: "ACTIVE",
        monthlyFee: 4000,
        wilayaCode: 19,
      },
    });
    createdStudentsA.push(student);

    // Enroll students into groups
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        groupId: s.level === "4AM" ? grpSciBEM.id : grpMathBAC.id,
      },
    });
  }

  // Real Timetable Sessions for Institution A
  const todayStr = new Date().toISOString().split("T")[0];
  const session1 = await prisma.classSession.create({
    data: {
      institutionId: instA.id,
      groupId: grpMathBAC.id,
      teacherId: createdTeachersA[0].id,
      subjectId: subMath.id,
      classroomId: roomA1.id,
      sessionDate: todayStr,
      startTime: "08:30",
      endTime: "10:00",
      status: "completed",
    },
  });

  const session2 = await prisma.classSession.create({
    data: {
      institutionId: instA.id,
      groupId: grpPhysBAC.id,
      teacherId: createdTeachersA[1].id,
      subjectId: subPhys.id,
      classroomId: roomA2.id,
      sessionDate: todayStr,
      startTime: "10:15",
      endTime: "11:45",
      status: "scheduled",
    },
  });

  const session3 = await prisma.classSession.create({
    data: {
      institutionId: instA.id,
      groupId: grpSciBEM.id,
      teacherId: createdTeachersA[2].id,
      subjectId: subSci.id,
      classroomId: roomA3.id,
      sessionDate: todayStr,
      startTime: "14:00",
      endTime: "15:30",
      status: "scheduled",
    },
  });

  // Real Attendance for Session 1
  for (let i = 0; i < createdStudentsA.length; i++) {
    await prisma.attendance.create({
      data: {
        institutionId: instA.id,
        sessionId: session1.id,
        studentId: createdStudentsA[i].id,
        status: i === 3 ? "ABSENT" : "PRESENT",
      },
    });
  }

  // Real Invoices & Payments for Institution A
  const inv1 = await prisma.invoice.create({
    data: {
      institutionId: instA.id,
      invoiceNumber: "INV-2026-000001",
      studentId: createdStudentsA[0].id,
      parentId: createdParentsA[0].id,
      issueDate: "2026-02-01",
      dueDate: "2026-02-10",
      subtotal: 4000,
      discountTotal: 0,
      finalTotal: 4000,
      amountPaid: 4000,
      status: "PAID",
      items: {
        create: [{ description: "اشتراك شهري — مادة الرياضيات 3AS", amount: 4000 }],
      },
    },
  });

  await prisma.payment.create({
    data: {
      institutionId: instA.id,
      branchId: branchA.id,
      invoiceId: inv1.id,
      studentId: createdStudentsA[0].id,
      parentId: createdParentsA[0].id,
      receiptNumber: "REC-2026-000001",
      amount: 4000,
      paymentDate: "2026-02-02",
      method: "CASH",
      notes: "تم الدفع نقداً بالاستقبال",
    },
  });

  const inv2 = await prisma.invoice.create({
    data: {
      institutionId: instA.id,
      invoiceNumber: "INV-2026-000002",
      studentId: createdStudentsA[1].id,
      parentId: createdParentsA[1].id,
      issueDate: "2026-02-01",
      dueDate: "2026-02-10",
      subtotal: 8000,
      discountTotal: 1000,
      finalTotal: 7000,
      amountPaid: 4000,
      status: "PARTIALLY_PAID",
      items: {
        create: [
          { description: "اشتراك شهري — رياضيات وفيزياء 3AS", amount: 8000 },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      institutionId: instA.id,
      branchId: branchA.id,
      invoiceId: inv2.id,
      studentId: createdStudentsA[1].id,
      parentId: createdParentsA[1].id,
      receiptNumber: "REC-2026-000002",
      amount: 4000,
      paymentDate: "2026-02-03",
      method: "BARIDIMOB",
      notes: "تحويل بريدي موب",
    },
  });

  // Real Expenses for Institution A
  await prisma.expense.createMany({
    data: [
      { institutionId: instA.id, branchId: branchA.id, category: "RENT", description: "كراء مقر المركز لشهر فيفري", amount: 65000, expenseDate: "2026-02-01" },
      { institutionId: instA.id, branchId: branchA.id, category: "UTILITIES", description: "فاتورة سونلغاز والكهرباء", amount: 12500, expenseDate: "2026-02-05" },
      { institutionId: instA.id, branchId: branchA.id, category: "INTERNET", description: "اشتراك اتصالات الجزائر ألياف بصرية", amount: 4500, expenseDate: "2026-02-03" },
    ],
  });

  // Real Notifications for Institution A
  await prisma.notification.createMany({
    data: [
      { institutionId: instA.id, title: "غياب طالب", message: "سُجّل غياب الطالب إياد زروقي في حصة الرياضيات الصباحية", type: "ABSENCE" },
      { institutionId: instA.id, title: "مستحقات غير مسددة", message: "فاتورة رقم INV-2026-000002 للطالبة سارة بوجمعة متبقي عليها 3,000 دج", type: "PAYMENT_OVERDUE" },
      { institutionId: instA.id, title: "تذكير حصة قادمة", message: "تبدأ حصة العلوم الفيزيائية مع أ. سميرة بن عيسى بعد 15 دقيقة في مخبر ابن الهيثم", type: "CLASS_SCHEDULE" },
    ],
  });

  // 4. Institution B: "أكاديمية النجاح والتفوق" (الجزائر العاصمة) — Independent Tenant
  console.log("4. Creating Institution B: أكاديمية النجاح (الجزائر العاصمة)...");
  const instB = await prisma.institution.create({
    data: {
      code: "al-najah",
      name: "أكاديمية النجاح والتفوق",
      wilayaCode: 16, // Alger
      address: "شارع ديدوش مراد، الجزائر الوسطى",
      phone: "0560 99 88 77",
      email: "contact@alnajah-dz.com",
      brandColor: "#2563EB",
      academicYear: "2025-2026",
      status: "ACTIVE",
    },
  });

  // Subscription for Institution B (Starter Plan)
  await prisma.subscription.create({
    data: {
      institutionId: instB.id,
      planId: starterPlan.id,
      status: "ACTIVE",
      billingCycle: "MONTHLY",
      startDate: new Date(),
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const branchB = await prisma.branch.create({
    data: {
      institutionId: instB.id,
      name: "فرع الجزائر العاصمة",
      wilayaCode: 16,
      address: "ديدوش مراد، الجزائر العاصمة",
      isMain: true,
    },
  });

  const adminB = await prisma.user.create({
    data: {
      institutionId: instB.id,
      email: "karim@alnajah.dz",
      passwordHash: defaultPassword,
      fullName: "كريم مرواني",
      phone: "0560 99 88 77",
      role: "ADMIN",
    },
  });

  // Teachers for Institution B
  const teacherB1User = await prisma.user.create({
    data: {
      institutionId: instB.id,
      email: "ammar@alnajah.dz",
      passwordHash: defaultPassword,
      fullName: "أ. عمار خليفي",
      phone: "0665 11 22 33",
      role: "TEACHER",
    },
  });

  const teacherB1 = await prisma.teacher.create({
    data: {
      institutionId: instB.id,
      branchId: branchB.id,
      userId: teacherB1User.id,
      firstName: "عمار",
      lastName: "خليفي",
      fullName: "أ. عمار خليفي",
      email: teacherB1User.email,
      phone: "0665 11 22 33",
      specialization: "أستاذ الرياضيات لغات وتسيير",
      subjects: JSON.stringify(["الرياضيات"]),
      hourlyRate: 2200,
      wageType: "hourly",
      status: "ACTIVE",
    },
  });

  // Students for Institution B
  const parentB = await prisma.parent.create({
    data: {
      institutionId: instB.id,
      fullName: "كمال حيمود",
      phone: "0555 77 66 55",
      relationship: "الأب",
    },
  });

  const studentB = await prisma.student.create({
    data: {
      institutionId: instB.id,
      branchId: branchB.id,
      parentId: parentB.id,
      firstName: "أنس",
      lastName: "حيمود",
      phone: "0555 12 99 88",
      academicLevel: "3AS",
      stream: "تسيير واقتصاد",
      status: "ACTIVE",
      monthlyFee: 4500,
      wilayaCode: 16,
    },
  });

  // Invoice for Institution B
  await prisma.invoice.create({
    data: {
      institutionId: instB.id,
      invoiceNumber: "INV-2026-900001",
      studentId: studentB.id,
      parentId: parentB.id,
      issueDate: "2026-02-01",
      dueDate: "2026-02-10",
      subtotal: 4500,
      discountTotal: 0,
      finalTotal: 4500,
      amountPaid: 0,
      status: "UNPAID",
      items: {
        create: [{ description: "اشتراك شهري — تسيير واقتصاد", amount: 4500 }],
      },
    },
  });

  console.log("==================================================");
  console.log("✅ MULTI-TENANT SEEDING COMPLETED SUCCESSFULLY!");
  console.log("==================================================");
  console.log("Super Admin Account: superadmin@noubla.dz / SuperNoubla2026!");
  console.log(`Institution A: "${instA.name}" (ID: ${instA.id}, Code: ${instA.code})`);
  console.log("  Admin: ahmed@noubla.dz / Noubla2026!");
  console.log(`Institution B: "${instB.name}" (ID: ${instB.id}, Code: ${instB.code})`);
  console.log("  Admin: karim@alnajah.dz / Noubla2026!");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
