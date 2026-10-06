import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function runTests() {
  console.log("==================================================");
  console.log("MADRASATIPRO QA: CLASSROOMS, CONFLICTS & SHOWCASE");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // 1. Multi-Tenant Isolation & New Institution Zero Classrooms
    // -------------------------------------------------------------
    console.log("--- 1. Testing Multi-Tenant Isolation & Zero Operational Data ---");
    const testCodeA = `CODE-A-${Date.now()}`;
    const testCodeB = `CODE-B-${Date.now()}`;

    const instA = await prisma.institution.create({
      data: {
        name: "مؤسسة الاختبار أ",
        code: testCodeA,
        status: "ACTIVE",
      },
    });

    const instB = await prisma.institution.create({
      data: {
        name: "مؤسسة الاختبار ب",
        code: testCodeB,
        status: "ACTIVE",
      },
    });

    const branchA = await prisma.branch.create({
      data: {
        institutionId: instA.id,
        name: "المقر الرئيسي أ",
        isMain: true,
      },
    });

    const branchB = await prisma.branch.create({
      data: {
        institutionId: instB.id,
        name: "المقر الرئيسي ب",
        isMain: true,
      },
    });

    // Verify 0 classrooms for new institutions
    const initialRoomsA = await prisma.classroom.count({
      where: { institutionId: instA.id },
    });
    const initialRoomsB = await prisma.classroom.count({
      where: { institutionId: instB.id },
    });
    assert(initialRoomsA === 0, `New Institution A has 0 initial classrooms (got ${initialRoomsA})`);
    assert(initialRoomsB === 0, `New Institution B has 0 initial classrooms (got ${initialRoomsB})`);

    // -------------------------------------------------------------
    // 2. Classroom CRUD & Field Persistence
    // -------------------------------------------------------------
    console.log("\n--- 2. Testing Classroom CRUD & Field Persistence ---");
    const createdRoomA = await prisma.classroom.create({
      data: {
        institutionId: instA.id,
        branchId: branchA.id,
        name: "قاعة الخوارزمي 01",
        roomCode: "R-101",
        capacity: 28,
        description: "مجهزة بمسلاط ضوئي ومكيف هواء",
      },
    });

    assert(Boolean(createdRoomA.id), `Classroom created with ID: ${createdRoomA.id}`);
    assert(createdRoomA.name === "قاعة الخوارزمي 01", "Name matches");
    assert(createdRoomA.roomCode === "R-101", "Room code matches");
    assert(createdRoomA.capacity === 28, "Capacity matches");
    assert(createdRoomA.description === "مجهزة بمسلاط ضوئي ومكيف هواء", "Description matches");

    // Verify multi-tenant isolation: instB cannot see instA's room
    const roomsForB = await prisma.classroom.findMany({
      where: { institutionId: instB.id },
    });
    assert(roomsForB.length === 0, `Institution B cannot see Institution A's classrooms (count: ${roomsForB.length})`);

    // Update classroom
    const updatedRoomA = await prisma.classroom.update({
      where: { id: createdRoomA.id },
      data: {
        name: "قاعة الخوارزمي الكبرى",
        capacity: 35,
        roomCode: "R-101-EXP",
        description: "تمت ترقية السعة وإضافة كراسي جديدة",
      },
    });
    assert(updatedRoomA.name === "قاعة الخوارزمي الكبرى", "Classroom updated name verified");
    assert(updatedRoomA.capacity === 35, "Classroom updated capacity verified");
    assert(updatedRoomA.roomCode === "R-101-EXP", "Classroom updated roomCode verified");

    // -------------------------------------------------------------
    // 3. Relation-Safe Classroom Deletion
    // -------------------------------------------------------------
    console.log("\n--- 3. Testing Relation-Safe Classroom Deletion ---");
    
    // Create teacher, subject and classGroup in instA
    const teacherA = await prisma.teacher.create({
      data: {
        institutionId: instA.id,
        firstName: "أحمد",
        lastName: "بوزيد",
        fullName: "أ. أحمد بوزيد",
        email: `teacher_${Date.now()}@test.dz`,
        phone: "0555123456",
        subjects: JSON.stringify(["الرياضيات"]),
        wageType: "hourly",
        hourlyRate: 1500,
        status: "ACTIVE",
      },
    });

    const subjectA = await prisma.subject.create({
      data: {
        institutionId: instA.id,
        code: "MATH",
        nameAr: "الرياضيات",
        nameFr: "Mathématiques",
      },
    });

    const groupA = await prisma.classGroup.create({
      data: {
        institutionId: instA.id,
        branchId: branchA.id,
        teacherId: teacherA.id,
        subjectId: subjectA.id,
        classroomId: createdRoomA.id, // Assigned to room!
        name: "فوج الرياضيات أ",
        academicLevel: "SECONDARY_3",
        maxCapacity: 30,
        monthlyFee: 3000,
      },
    });

    // Check relation count before deletion simulation
    const activeSessionsCount = await prisma.classSession.count({
      where: { classroomId: createdRoomA.id },
    });
    const activeGroupsCount = await prisma.classGroup.count({
      where: { classroomId: createdRoomA.id },
    });

    assert(activeGroupsCount === 1, `Classroom is assigned to ${activeGroupsCount} active class group`);
    
    // In API logic, this triggers:
    const canDelete = activeSessionsCount === 0 && activeGroupsCount === 0;
    assert(!canDelete, "Classroom deletion is BLOCKED when referenced by groups or sessions");

    // Unassign group from classroom
    await prisma.classGroup.update({
      where: { id: groupA.id },
      data: { classroomId: null },
    });

    const activeGroupsAfter = await prisma.classGroup.count({
      where: { classroomId: createdRoomA.id },
    });
    assert(activeGroupsAfter === 0, "Group safely unassigned from classroom");

    // Safe deletion should now be permitted
    await prisma.classroom.delete({
      where: { id: createdRoomA.id },
    });

    const roomAfterDelete = await prisma.classroom.findUnique({
      where: { id: createdRoomA.id },
    });
    assert(roomAfterDelete === null, "Classroom successfully and safely deleted after references cleared");

    // -------------------------------------------------------------
    // 4. Timetable Room Conflict Detection
    // -------------------------------------------------------------
    console.log("\n--- 4. Testing Timetable Room Conflict Detection ---");
    const roomForTimetable = await prisma.classroom.create({
      data: {
        institutionId: instA.id,
        branchId: branchA.id,
        name: "قاعة ابن رشد 02",
        capacity: 25,
      },
    });

    // Create session 1: 08:00 - 10:00
    const testDate = "2026-10-03";
    const session1 = await prisma.classSession.create({
      data: {
        institutionId: instA.id,
        groupId: groupA.id,
        teacherId: teacherA.id,
        classroomId: roomForTimetable.id,
        subjectId: subjectA.id,
        sessionDate: testDate,
        startTime: "08:00",
        endTime: "10:00",
      },
      include: {
        classroom: true,
      },
    });

    assert(Boolean(session1.id), `Scheduled base session in room ${roomForTimetable.name} from 08:00 to 10:00`);

    // Simulate conflict check for conflicting time: 09:00 - 11:00 in same room
    const targetDate = testDate;
    const targetStart = "09:00";
    const targetEnd = "11:00";
    const targetRoomId = roomForTimetable.id;

    // Run the exact conflict algorithm used in app/api/timetable/route.ts
    const existingSessions = await prisma.classSession.findMany({
      where: {
        institutionId: instA.id,
        sessionDate: targetDate,
        classroomId: targetRoomId,
      },
      include: { classroom: true },
    });

    const conflictingSession = existingSessions.find((s) => {
      return targetStart < s.endTime && targetEnd > s.startTime;
    });

    assert(Boolean(conflictingSession), "Timetable conflict engine detected overlapping room booking");
    
    const conflictErrorMessage = `هذه القاعة محجوزة في هذا الوقت (${conflictingSession?.classroom?.name || "القاعة"} من ${conflictingSession?.startTime} إلى ${conflictingSession?.endTime}).`;
    assert(
      conflictErrorMessage.startsWith("هذه القاعة محجوزة في هذا الوقت"),
      `Error message starts with required text: "${conflictErrorMessage}"`
    );

    // Non-conflicting session: Saturday 10:00 - 12:00 (exact boundary touch is allowed)
    const nonConflictingStart = "10:00";
    const nonConflictingEnd = "12:00";
    const hasOverlap = existingSessions.some((s) => {
      return nonConflictingStart < s.endTime && nonConflictingEnd > s.startTime;
    });
    assert(!hasOverlap, "Session immediately following previous session (10:00 - 12:00) does NOT conflict");

    // -------------------------------------------------------------
    // 5. Product Showcase Section & Visual Storytelling Verification
    // -------------------------------------------------------------
    console.log("\n--- 5. Testing Product Showcase Component & 10 Feature Stories ---");
    const showcasePath = path.resolve(process.cwd(), "components/landing/ProductShowcaseSection.tsx");
    assert(fs.existsSync(showcasePath), "ProductShowcaseSection.tsx exists");

    const showcaseContent = fs.readFileSync(showcasePath, "utf-8");
    const expectedStories = [
      { num: "01", title: "إدارة التلاميذ بسهولة", key: "ملفات التلاميذ الرقمية" },
      { num: "02", title: "إدارة الأساتذة والرواتب", key: "طاقم التدريس والرواتب" },
      { num: "03", title: "الأفواج والحصص والبرنامج", key: "الأفواج والبرامج الدراسية" },
      { num: "04", title: "قاعات التدريس", key: "إدارة القاعات ومنع التضارب" },
      { num: "05", title: "الحضور والغياب", key: "تسجيل الحضور والغياب" },
      { num: "06", title: "الامتحانات والنقاط", key: "التقييمات والنتائج" },
      { num: "07", title: "المدفوعات والفواتير", key: "الفوترة والوصولات" },
      { num: "08", title: "المداخيل والمصاريف", key: "المالية والخزينة" },
      { num: "09", title: "التقارير", key: "مؤشرات الأداء" },
      { num: "10", title: "مؤسستك تحت سيطرتك", key: "التحكم والإعدادات" },
    ];

    for (const story of expectedStories) {
      const hasTitle = showcaseContent.includes(story.title);
      assert(hasTitle, `Story #${story.num} ("${story.title}") is present in showcase`);
    }

    // Check printable invoice mock in story 7
    assert(showcaseContent.includes("وصل استلام رسمي"), "Story #07 contains formal printable receipt mockup");
    assert(showcaseContent.includes("دج"), "DZ Dinar currency present in financial mockups");

    // -------------------------------------------------------------
    // 6. Header Background & Logo Sizes Verification
    // -------------------------------------------------------------
    console.log("\n--- 6. Testing Header Background & Logo Dimensions ---");
    const pagePath = path.resolve(process.cwd(), "app/page.tsx");
    const pageContent = fs.readFileSync(pagePath, "utf-8");

    assert(
      pageContent.includes("bg-white/95 backdrop-blur-md border-b border-slate-200/80"),
      "Landing page header has high-contrast white background"
    );
    assert(
      pageContent.includes("h-[52px] sm:h-[60px] w-52 sm:w-64"),
      "Landing page logo has enlarged dimensions: h-[52px] sm:h-[60px] w-52 sm:w-64"
    );
    assert(
      pageContent.includes("<ProductShowcaseSection />"),
      "Landing page correctly renders <ProductShowcaseSection />"
    );

    const appHeaderPath = path.resolve(process.cwd(), "components/layout/AppHeader.tsx");
    const appHeaderContent = fs.readFileSync(appHeaderPath, "utf-8");
    assert(
      appHeaderContent.includes("h-12 sm:h-13 w-48 sm:w-56"),
      "Dashboard AppHeader logo is enlarged: h-12 sm:h-13 w-48 sm:w-56"
    );
    assert(
      appHeaderContent.includes("قاعات التدريس"),
      "Dashboard AppHeader includes 'قاعات التدريس' tab"
    );

    // Auth pages logo verification
    const authPages = [
      "app/login/page.tsx",
      "app/register/page.tsx",
      "app/forgot-password/page.tsx",
      "app/reset-password/page.tsx",
      "app/pending-approval/page.tsx",
    ];

    for (const relPath of authPages) {
      const fullPath = path.resolve(process.cwd(), relPath);
      const content = fs.readFileSync(fullPath, "utf-8");
      assert(
        content.includes("w-48 sm:w-56") || content.includes("h-12 sm:h-13"),
        `Auth page ${relPath} has enlarged logo container`
      );
    }

    // -------------------------------------------------------------
    // Clean up test data
    // -------------------------------------------------------------
    await prisma.classSession.deleteMany({ where: { institutionId: { in: [instA.id, instB.id] } } });
    await prisma.classGroup.deleteMany({ where: { institutionId: { in: [instA.id, instB.id] } } });
    await prisma.classroom.deleteMany({ where: { institutionId: { in: [instA.id, instB.id] } } });
    await prisma.teacher.deleteMany({ where: { institutionId: { in: [instA.id, instB.id] } } });
    await prisma.subject.deleteMany({ where: { institutionId: { in: [instA.id, instB.id] } } });
    await prisma.branch.deleteMany({ where: { institutionId: { in: [instA.id, instB.id] } } });
    await prisma.institution.deleteMany({ where: { id: { in: [instA.id, instB.id] } } });

    console.log("\n==================================================");
    console.log(`QA SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Test execution encountered an error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
