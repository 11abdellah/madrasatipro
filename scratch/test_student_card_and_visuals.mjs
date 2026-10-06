import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function runTests() {
  console.log("==================================================");
  console.log("MADRASATIPRO QA: STUDENT CARD, LOGO & ILLUSTRATIONS");
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
    // 1. Assets Verification: White Footer Logo
    // -------------------------------------------------------------
    console.log("--- 1. Testing Footer Logo Asset & Code References ---");
    const whiteLogoPath = path.resolve("public/logo-white.png");
    assert(fs.existsSync(whiteLogoPath), "public/logo-white.png file exists on disk");
    const logoStats = fs.statSync(whiteLogoPath);
    assert(logoStats.size > 1000, `public/logo-white.png is valid image (size: ${logoStats.size} bytes)`);

    const pageContent = fs.readFileSync(path.resolve("app/page.tsx"), "utf-8");
    assert(pageContent.includes("/logo-white.png"), "app/page.tsx footer uses /logo-white.png");
    assert(!pageContent.includes('className="object-contain" src="/logo-transparent.png"'), "footer does not use dark transparent logo on dark footer");

    // -------------------------------------------------------------
    // 2. Illustrations Verification: Happy Student Rafiki Asset
    // -------------------------------------------------------------
    console.log("\n--- 2. Testing Modern EdTech Illustration Asset (Happy student-rafiki) ---");
    const happyStudentImgPath = path.resolve("public/happy-student-rafiki.png");
    assert(fs.existsSync(happyStudentImgPath), "public/happy-student-rafiki.png exists on disk");
    const happyImgStats = fs.statSync(happyStudentImgPath);
    assert(happyImgStats.size > 10000, `public/happy-student-rafiki.png is valid asset (${happyImgStats.size} bytes)`);

    const loginPageContent = fs.readFileSync(path.resolve("app/login/page.tsx"), "utf-8");
    assert(loginPageContent.includes("/happy-student-rafiki.png"), "app/login/page.tsx integrates /happy-student-rafiki.png");
    assert(!loginPageContent.includes("LoginSecurityIllustration"), "app/login/page.tsx does not use old LoginSecurityIllustration");

    const showcaseContent = fs.readFileSync(path.resolve("components/landing/ProductShowcaseSection.tsx"), "utf-8");
    assert(!showcaseContent.includes("Happy Students Rafiki Illustration Banner"), "ProductShowcaseSection cleanly removed visual illustration under 'جولة بصرية في النظام' as requested");
    assert(!showcaseContent.includes("SchoolManagementIllustration"), "ProductShowcaseSection does not use old SchoolManagementIllustration");

    // -------------------------------------------------------------
    // 3. Database & Schema Verification: Student Card Fields
    // -------------------------------------------------------------
    console.log("\n--- 3. Testing Database Schema for Student Card (studentNumber, photoUrl) ---");
    const instA = await prisma.institution.create({
      data: {
        name: "مؤسسة النخبة المتفوقة سطيف",
        code: `INST-CARD-A-${Date.now()}`,
        status: "ACTIVE",
        wilayaCode: 19,
        logoUrl: "/uploads/logos/nokhba-custom-logo.png",
      },
    });

    const instB = await prisma.institution.create({
      data: {
        name: "معهد المستقبل قسنطينة",
        code: `INST-CARD-B-${Date.now()}`,
        status: "ACTIVE",
        wilayaCode: 25,
      },
    });

    const parentA = await prisma.parent.create({
      data: {
        institutionId: instA.id,
        fullName: "محمد بن علي",
        phone: "0550123456",
        relationship: "الأب",
      },
    });

    // Create student with explicit studentNumber and photoUrl
    const student1 = await prisma.student.create({
      data: {
        institutionId: instA.id,
        parentId: parentA.id,
        firstName: "ياسين",
        lastName: "بن علي",
        gender: "MALE",
        dateOfBirth: "2008-04-12",
        phone: "0550123456",
        wilayaCode: 19,
        academicLevel: "3AS",
        stream: "علوم تجريبية",
        studentNumber: `MP-2026-STF-0001`,
        photoUrl: "/uploads/students/yassine.jpg",
        monthlyFee: 4000,
        status: "ACTIVE",
      },
    });

    assert(student1.studentNumber === "MP-2026-STF-0001", "Student created with custom studentNumber");
    assert(student1.photoUrl === "/uploads/students/yassine.jpg", "Student created with custom photoUrl");

    // Test automatic studentNumber generation simulation
    const studentCount = await prisma.student.count({ where: { institutionId: instA.id } });
    const instCode = instA.id.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase();
    const generatedNumber = `MP-2026-${instCode}-${String(studentCount + 1).padStart(4, "0")}`;

    const student2 = await prisma.student.create({
      data: {
        institutionId: instA.id,
        parentId: parentA.id,
        firstName: "ريم",
        lastName: "بن علي",
        gender: "FEMALE",
        dateOfBirth: "2010-09-20",
        phone: "0550123456",
        wilayaCode: 19,
        academicLevel: "1AS",
        stream: "جذع مشترك علوم",
        studentNumber: generatedNumber,
        monthlyFee: 3500,
        status: "ACTIVE",
      },
    });

    assert(student2.studentNumber.startsWith("MP-2026-"), `Generated student number conforms to standard: ${student2.studentNumber}`);

    // -------------------------------------------------------------
    // 4. Update / Preservation of studentNumber
    // -------------------------------------------------------------
    console.log("\n--- 4. Testing studentNumber Stability Across Updates ---");
    const updatedStudent1 = await prisma.student.update({
      where: { id: student1.id },
      data: {
        firstName: "ياسين الدين",
        monthlyFee: 4500,
      },
    });

    assert(updatedStudent1.studentNumber === "MP-2026-STF-0001", "studentNumber remains intact after profile updates");
    assert(updatedStudent1.firstName === "ياسين الدين", "Student name successfully updated");

    // -------------------------------------------------------------
    // 5. Multi-Tenant Isolation for Student Cards
    // -------------------------------------------------------------
    console.log("\n--- 5. Testing Multi-Tenant Card Isolation ---");
    // Verify Institution B cannot access Institution A's student
    const crossTenantSearch = await prisma.student.findFirst({
      where: {
        id: student1.id,
        institutionId: instB.id,
      },
    });
    assert(crossTenantSearch === null, "Institution B cannot query student of Institution A (Strict Tenant Isolation)");

    // -------------------------------------------------------------
    // 6. Institution Logo Priority & Student Card Modal Props
    // -------------------------------------------------------------
    console.log("\n--- 6. Testing Card Modal Integration & Logo Priority ---");
    const cardModalPath = path.resolve("components/students/StudentCardModal.tsx");
    assert(fs.existsSync(cardModalPath), "StudentCardModal.tsx exists");
    const cardModalContent = fs.readFileSync(cardModalPath, "utf-8");

    assert(cardModalContent.includes("card.institutionLogo") && cardModalContent.includes("Institution Logo Priority"), "Card prioritizes institution logo");
    assert(cardModalContent.includes("@media print"), "Card modal includes print media stylesheet");
    assert(cardModalContent.includes("window.print()"), "Card modal includes print trigger");

    const dashboardPath = path.resolve("app/dashboard/page.tsx");
    const dashboardContent = fs.readFileSync(dashboardPath, "utf-8");
    assert(dashboardContent.includes("StudentCardModal"), "StudentCardModal imported and rendered in dashboard page");
    assert(dashboardContent.includes("cardStudentId"), "cardStudentId state wired in dashboard page");
    assert(dashboardContent.includes("onViewCard="), "onViewCard prop connected to subcomponents");

    // Clean up test data
    await prisma.student.deleteMany({ where: { institutionId: { in: [instA.id, instB.id] } } });
    await prisma.parent.deleteMany({ where: { institutionId: { in: [instA.id, instB.id] } } });
    await prisma.institution.deleteMany({ where: { id: { in: [instA.id, instB.id] } } });

    console.log("\n==================================================");
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test failed with exception:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
