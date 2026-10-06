import fs from "fs";
import path from "path";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

let testSessionCookie = "";
let superAdminCookie = "";
let testInstId = "";
let testPlanId = "";

function parseCookie(res) {
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) return "";
  const match = setCookie.match(/noubla_session=([^;]+)/);
  return match ? `noubla_session=${match[1]}` : "";
}

async function runTests() {
  console.log("==================================================");
  console.log("🚀 STARTING PRODUCTION READINESS TEST SUITE");
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
    // TEST 1: Unauthenticated Requests MUST Return 401 (Zero Leakage)
    // -------------------------------------------------------------
    console.log("📌 TEST 1: Unauthenticated Requests Security & No Demo Fallback");
    const unauthedStats = await fetch(`${BASE_URL}/api/dashboard/stats`);
    assert(unauthedStats.status === 401, `GET /api/dashboard/stats unauthenticated returns 401 (got ${unauthedStats.status})`);

    const unauthedStudents = await fetch(`${BASE_URL}/api/students`);
    assert(unauthedStudents.status === 401, `GET /api/students unauthenticated returns 401 (got ${unauthedStudents.status})`);

    const unauthedMe = await fetch(`${BASE_URL}/api/auth/me`);
    const meData = await unauthedMe.json();
    assert(unauthedMe.status === 401 && meData.authenticated === false, `GET /api/auth/me returns 401 { authenticated: false }`);

    // -------------------------------------------------------------
    // TEST 2: Super Admin Login
    // -------------------------------------------------------------
    console.log("\n📌 TEST 2: Super Admin Login & Setup");
    const saLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "superadmin@madrasatipro.dz",
        password: "SuperMadrasati2026!",
      }),
    });
    assert(saLoginRes.ok, "Super Admin login succeeds");
    superAdminCookie = parseCookie(saLoginRes);
    assert(superAdminCookie.length > 0, "Super Admin session cookie received");

    // -------------------------------------------------------------
    // TEST 3: Create a Dedicated Test Plan for Limit Verification
    // -------------------------------------------------------------
    console.log("\n📌 TEST 3: Create Dedicated Test Plan with strict limit (maxStudents = 2)");
    const planSlug = `test-tier-${Date.now()}`;
    const testPlan = await prisma.subscriptionPlan.create({
      data: {
        name: "خطة تجريبية للاختبار (Test Tier)",
        slug: planSlug,
        priceDZD: 3000,
        billingPeriod: "MONTHLY",
        maxStudents: 2,
        maxTeachers: 2,
        maxGroups: 2,
        maxBranches: 1,
        storageLimitGB: 5,
        features: "[]",
        isActive: true,
      },
    });
    testPlanId = testPlan.id;
    assert(testPlan.id.length > 0, `Test Plan created in DB with maxStudents = 2 (id: ${testPlan.id})`);

    // -------------------------------------------------------------
    // TEST 4: Create a Brand New Institution with the Test Plan
    // -------------------------------------------------------------
    console.log("\n📌 TEST 4: Register & Approve New Institution");
    const uniqueNum = Date.now().toString().slice(-5);
    const testAdminEmail = `owner_${uniqueNum}@testschool.dz`;
    const instCode = `ecole-test-${uniqueNum}`;

    const regRes = await fetch(`${BASE_URL}/api/super-admin/institutions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: superAdminCookie,
      },
      body: JSON.stringify({
        name: `مدرسة الاختبار والتفوق ${uniqueNum}`,
        code: instCode,
        wilayaCode: 16, // Algiers
        adminName: `أ. عمار بوزيد ${uniqueNum}`,
        adminEmail: testAdminEmail,
        adminPhone: "0550123456",
        password: "SchoolPassword2026!",
        planId: testPlan.id,
        status: "ACTIVE",
      }),
    });

    const regData = await regRes.json();
    assert(regRes.ok, `Institution created successfully (status ${regRes.status})`);
    testInstId = regData.institution.id;

    // -------------------------------------------------------------
    // TEST 5: Login as New School Admin
    // -------------------------------------------------------------
    console.log("\n📌 TEST 5: Login as New School Admin");
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testAdminEmail,
        password: "SchoolPassword2026!",
      }),
    });
    assert(loginRes.ok, "New School Admin login succeeds");
    testSessionCookie = parseCookie(loginRes);

    // -------------------------------------------------------------
    // TEST 6: VERIFY ZERO DATA FOR NEW INSTITUTION (KPIs & Lists)
    // -------------------------------------------------------------
    console.log("\n📌 TEST 6: Verify New Institution Starts with Pure ZERO Data");
    const statsRes = await fetch(`${BASE_URL}/api/dashboard/stats`, {
      headers: { Cookie: testSessionCookie },
    });
    const stats = await statsRes.json();
    assert(stats.totalStudents === 0, `totalStudents === 0 (got ${stats.totalStudents})`);
    assert(stats.activeTeachers === 0, `activeTeachers === 0 (got ${stats.activeTeachers})`);
    assert(stats.todayAttendanceRate === 0, `todayAttendanceRate === 0 (got ${stats.todayAttendanceRate})`);
    assert(stats.monthlyRevenue === 0, `monthlyRevenue === 0 (got ${stats.monthlyRevenue})`);
    assert(stats.collectedRevenue === 0, `collectedRevenue === 0 (got ${stats.collectedRevenue})`);
    assert(stats.dueDebts === 0, `dueDebts === 0 (got ${stats.dueDebts})`);
    assert(stats.topTeachers.length === 0, `topTeachers.length === 0 (got ${stats.topTeachers.length})`);
    assert(stats.upcomingSessions.length === 0, `upcomingSessions.length === 0 (got ${stats.upcomingSessions.length})`);

    const studentsRes = await fetch(`${BASE_URL}/api/students`, {
      headers: { Cookie: testSessionCookie },
    });
    const studentsData = await studentsRes.json();
    assert(studentsData.students.length === 0, `GET /api/students returns empty list (length: ${studentsData.students.length})`);

    const teachersRes = await fetch(`${BASE_URL}/api/teachers`, {
      headers: { Cookie: testSessionCookie },
    });
    const teachersData = await teachersRes.json();
    assert(teachersData.teachers.length === 0, `GET /api/teachers returns empty list (length: ${teachersData.teachers.length})`);

    const invoicesRes = await fetch(`${BASE_URL}/api/finance/invoices`, {
      headers: { Cookie: testSessionCookie },
    });
    const invoicesData = await invoicesRes.json();
    assert(invoicesData.invoices.length === 0, `GET /api/finance/invoices returns empty list (length: ${invoicesData.invoices.length})`);

    // -------------------------------------------------------------
    // TEST 7: Subscription Usage Endpoint Check
    // -------------------------------------------------------------
    console.log("\n📌 TEST 7: Verify /api/subscription/usage");
    const usageRes = await fetch(`${BASE_URL}/api/subscription/usage`, {
      headers: { Cookie: testSessionCookie },
    });
    const usage = await usageRes.json();
    assert(usage.limits.students === 2, `Usage endpoint reports plan maxStudents = 2 (got ${usage.limits.students})`);
    assert(usage.usage.students === 0, `Usage endpoint reports current students = 0 (got ${usage.usage.students})`);
    assert(usage.remaining.students === 2, `Usage endpoint reports remaining students = 2 (got ${usage.remaining.students})`);

    // -------------------------------------------------------------
    // TEST 8: Server-Side Enforcement: Add Student #1 (Allowed)
    // -------------------------------------------------------------
    console.log("\n📌 TEST 8: Add Student #1 (Under Limit)");
    const addS1Res = await fetch(`${BASE_URL}/api/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: testSessionCookie },
      body: JSON.stringify({
        firstName: "يوسف",
        lastName: "مفتاح",
        gender: "male",
        dateOfBirth: "2008-05-10",
        phone: "0550111222",
        wilayaCode: 16,
        academicLevel: "3AS",
        stream: "علوم تجريبية",
        parentName: "مفتاح سليم",
        parentPhone: "0550999888",
        parentRelationship: "الأب",
        monthlyFee: 4000,
        registrationFee: 1000,
        discount: 0,
        paymentMethod: "CASH",
      }),
    });
    assert(addS1Res.ok, `Student #1 added successfully (HTTP ${addS1Res.status})`);

    // -------------------------------------------------------------
    // TEST 9: Server-Side Enforcement: Add Student #2 (Allowed - at limit)
    // -------------------------------------------------------------
    console.log("\n📌 TEST 9: Add Student #2 (Under Limit)");
    const addS2Res = await fetch(`${BASE_URL}/api/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: testSessionCookie },
      body: JSON.stringify({
        firstName: "مريم",
        lastName: "طاهري",
        gender: "female",
        dateOfBirth: "2008-09-15",
        phone: "0550333444",
        wilayaCode: 16,
        academicLevel: "3AS",
        stream: "رياضيات",
        parentName: "طاهري كمال",
        parentPhone: "0550777666",
        parentRelationship: "الأب",
        monthlyFee: 4000,
        registrationFee: 1000,
        discount: 0,
        paymentMethod: "CASH",
      }),
    });
    assert(addS2Res.ok, `Student #2 added successfully (HTTP ${addS2Res.status})`);

    // -------------------------------------------------------------
    // TEST 10: Server-Side Enforcement: Add Student #3 (MUST BE BLOCKED 409)
    // -------------------------------------------------------------
    console.log("\n📌 TEST 10: Add Student #3 (Limit Exceeded - MUST BE REJECTED 409)");
    const addS3Res = await fetch(`${BASE_URL}/api/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: testSessionCookie },
      body: JSON.stringify({
        firstName: "أنس",
        lastName: "بن خليل",
        gender: "male",
        dateOfBirth: "2008-01-20",
        phone: "0550555666",
        wilayaCode: 16,
        academicLevel: "3AS",
        stream: "علوم تجريبية",
        parentName: "بن خليل أحمد",
        parentPhone: "0550444333",
        parentRelationship: "الأب",
        monthlyFee: 4000,
        registrationFee: 1000,
        discount: 0,
        paymentMethod: "CASH",
      }),
    });
    const addS3Data = await addS3Res.json();
    assert(addS3Res.status === 409, `Student #3 rejected with HTTP 409 (got ${addS3Res.status})`);
    assert(addS3Data.code === "PLAN_LIMIT_REACHED", `Error code is PLAN_LIMIT_REACHED (got ${addS3Data.code})`);
    assert(addS3Data.maxLimit === 2, `maxLimit returned is 2 (got ${addS3Data.maxLimit})`);
    assert(addS3Data.currentUsage === 2, `currentUsage returned is 2 (got ${addS3Data.currentUsage})`);

    // -------------------------------------------------------------
    // TEST 11: Dynamic Limit Update (Super Admin updates plan limit to 3)
    // -------------------------------------------------------------
    console.log("\n📌 TEST 11: Dynamic Limit Update — Super Admin updates plan limit from 2 to 3");
    await prisma.subscriptionPlan.update({
      where: { id: testPlanId },
      data: { maxStudents: 3 },
    });

    // Attempt Student #3 again: MUST succeed immediately!
    const addS3Retry = await fetch(`${BASE_URL}/api/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: testSessionCookie },
      body: JSON.stringify({
        firstName: "أنس",
        lastName: "بن خليل",
        gender: "male",
        dateOfBirth: "2008-01-20",
        phone: "0550555666",
        wilayaCode: 16,
        academicLevel: "3AS",
        stream: "علوم تجريبية",
        parentName: "بن خليل أحمد",
        parentPhone: "0550444333",
        parentRelationship: "الأب",
        monthlyFee: 4000,
        registrationFee: 1000,
        discount: 0,
        paymentMethod: "CASH",
      }),
    });
    assert(addS3Retry.ok, `Student #3 successfully added after plan limit increased to 3 (HTTP ${addS3Retry.status})`);

    // -------------------------------------------------------------
    // TEST 12: Safe Limit Reduction (No Data Loss, Further Additions Blocked)
    // -------------------------------------------------------------
    console.log("\n📌 TEST 12: Limit Reduction Safety — Plan limit reduced to 1 (Below current usage of 3)");
    await prisma.subscriptionPlan.update({
      where: { id: testPlanId },
      data: { maxStudents: 1 },
    });

    // Check database: All 3 students MUST remain untouched
    const currentStudentsCount = await prisma.student.count({
      where: { institutionId: testInstId, status: { not: "ARCHIVED" } },
    });
    assert(currentStudentsCount === 3, `All 3 existing students remain preserved in DB (count: ${currentStudentsCount})`);

    // Attempt to add a 4th student: MUST be blocked with 409
    const addS4Res = await fetch(`${BASE_URL}/api/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: testSessionCookie },
      body: JSON.stringify({
        firstName: "خالد",
        lastName: "علال",
        gender: "male",
        phone: "0550999111",
        academicLevel: "3AS",
        parentName: "علال عمر",
        parentPhone: "0550888222",
        monthlyFee: 4000,
        registrationFee: 1000,
        discount: 0,
      }),
    });
    assert(addS4Res.status === 409, `Student #4 blocked when usage (3) > limit (1) (HTTP ${addS4Res.status})`);

    // -------------------------------------------------------------
    // TEST 13: Subscription Status Inactive Block (Suspended)
    // -------------------------------------------------------------
    console.log("\n📌 TEST 13: Inactive Subscription Check (Suspended Status)");
    await prisma.subscription.update({
      where: { institutionId: testInstId },
      data: { status: "SUSPENDED" },
    });

    const addWhenSuspended = await fetch(`${BASE_URL}/api/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: testSessionCookie },
      body: JSON.stringify({
        firstName: "سمير",
        lastName: "بلال",
        gender: "male",
        phone: "0550333222",
        academicLevel: "3AS",
        parentName: "بلال رشيد",
        parentPhone: "0550444555",
        monthlyFee: 4000,
        registrationFee: 1000,
        discount: 0,
      }),
    });
    assert(addWhenSuspended.status === 403, `Creation blocked with 403 when subscription is SUSPENDED (got ${addWhenSuspended.status})`);

    // Restore to ACTIVE
    await prisma.subscription.update({
      where: { institutionId: testInstId },
      data: { status: "ACTIVE" },
    });

    // -------------------------------------------------------------
    // TEST 14: Tenant-Scoped Logo Upload & Isolation
    // -------------------------------------------------------------
    console.log("\n📌 TEST 14: Tenant-Scoped Logo Upload & Isolation");
    
    // Create a 1x1 transparent PNG buffer
    const dummyPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );

    const formData = new FormData();
    const blob = new Blob([dummyPng], { type: "image/png" });
    formData.append("logo", blob, "test-school-logo.png");

    const uploadRes = await fetch(`${BASE_URL}/api/settings/logo`, {
      method: "POST",
      headers: {
        Cookie: testSessionCookie,
      },
      body: formData,
    });

    const uploadData = await uploadRes.json();
    assert(uploadRes.ok, `Logo upload succeeded (HTTP ${uploadRes.status})`);
    assert(Boolean(uploadData.logoUrl), `logoUrl returned: ${uploadData.logoUrl}`);
    assert(uploadData.logoUrl.includes(testInstId), `logoUrl is strictly scoped to tenant ID: ${uploadData.logoUrl}`);

    // Verify DB updated
    const instInDb = await prisma.institution.findUnique({ where: { id: testInstId } });
    assert(instInDb.logoUrl === uploadData.logoUrl, `Institution in DB updated with logoUrl: ${instInDb.logoUrl}`);

    // Verify disk file exists
    const diskPath = path.join(process.cwd(), "public", uploadData.logoUrl);
    assert(fs.existsSync(diskPath), `Logo file physically exists on disk: ${diskPath}`);

    // Verify Tenant B has NO access / its logo is NOT changed
    const seedInst = await prisma.institution.findFirst({
      where: { id: { not: testInstId } },
    });
    assert(seedInst.logoUrl !== uploadData.logoUrl, `Cross-tenant logo isolation verified: Tenant ${seedInst.name} unaffected`);

    // -------------------------------------------------------------
    // TEST 15: Logo Removal
    // -------------------------------------------------------------
    console.log("\n📌 TEST 15: Logo Removal (DELETE /api/settings/logo)");
    const deleteRes = await fetch(`${BASE_URL}/api/settings/logo`, {
      method: "DELETE",
      headers: { Cookie: testSessionCookie },
    });
    const deleteData = await deleteRes.json();
    assert(deleteRes.ok, `Logo delete succeeded (HTTP ${deleteRes.status})`);

    const instAfterDelete = await prisma.institution.findUnique({ where: { id: testInstId } });
    assert(instAfterDelete.logoUrl === null, "Institution.logoUrl in DB set back to null");
    assert(!fs.existsSync(diskPath), "Logo file successfully unlinked from disk");

    // Clean up test plan & institution in correct foreign-key order
    console.log("\n📌 Cleaning up test data...");
    await prisma.auditLog.deleteMany({ where: { institutionId: testInstId } });
    await prisma.payment.deleteMany({ where: { institutionId: testInstId } });
    await prisma.invoiceItem.deleteMany({ where: { invoice: { institutionId: testInstId } } });
    await prisma.invoice.deleteMany({ where: { institutionId: testInstId } });
    await prisma.attendance.deleteMany({ where: { institutionId: testInstId } });
    await prisma.enrollment.deleteMany({ where: { student: { institutionId: testInstId } } });
    await prisma.student.deleteMany({ where: { institutionId: testInstId } });
    await prisma.parent.deleteMany({ where: { institutionId: testInstId } });
    await prisma.classGroup.deleteMany({ where: { institutionId: testInstId } });
    await prisma.teacher.deleteMany({ where: { institutionId: testInstId } });
    await prisma.classroom.deleteMany({ where: { institutionId: testInstId } });
    await prisma.subject.deleteMany({ where: { institutionId: testInstId } });
    await prisma.branch.deleteMany({ where: { institutionId: testInstId } });
    await prisma.user.deleteMany({ where: { institutionId: testInstId } });
    await prisma.subscription.deleteMany({ where: { institutionId: testInstId } });
    await prisma.institution.delete({ where: { id: testInstId } });
    await prisma.subscriptionPlan.delete({ where: { id: testPlanId } });

    console.log("\n==================================================");
    console.log(`🏁 TEST SUITE COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Fatal test error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
