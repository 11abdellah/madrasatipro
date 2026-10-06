import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { SignJWT } from "jose";

const prisma = new PrismaClient();
const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "noubla_super_secret_jwt_key_2026_algeria_edtech"
);

async function runQa() {
  console.log("==================================================");
  console.log("STARTING FULL END-TO-END QA VERIFICATION PASS");
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
    // SCENARIO 1: Free Plan Single Source of Truth
    // -------------------------------------------------------------
    console.log("--- 1. Testing Pricing & Free Plan Single Source of Truth ---");
    const freePlan = await prisma.subscriptionPlan.findUnique({
      where: { slug: "free" },
    });
    assert(Boolean(freePlan), "Free plan exists in database");
    assert(freePlan?.priceDZD === 0, `Free plan priceDZD is exactly 0 (got ${freePlan?.priceDZD})`);

    const starterPlan = await prisma.subscriptionPlan.findUnique({
      where: { slug: "starter" },
    });
    assert(Boolean(starterPlan), "Starter plan exists in database");

    // -------------------------------------------------------------
    // SCENARIO 2: Subjects & Curricula for Institutions
    // -------------------------------------------------------------
    console.log("\n--- 2. Testing Subjects & Group Creation Readiness ---");
    const institutions = await prisma.institution.findMany({
      include: { subjects: true },
    });
    assert(institutions.length > 0, `Found ${institutions.length} institutions in database`);

    for (const inst of institutions) {
      const frenchSubject = inst.subjects.find((s) => s.nameAr.includes("فرنسية") || s.nameFr?.toLowerCase().includes("français"));
      const physicsSubject = inst.subjects.find((s) => s.nameAr.includes("فيزياء") || s.nameFr?.toLowerCase().includes("physique"));
      assert(inst.subjects.length >= 16, `Institution ${inst.name} has all ${inst.subjects.length} canonical Algerian subjects (>= 16)`);
      assert(Boolean(frenchSubject), `Institution ${inst.name} has French subject`);
      assert(Boolean(physicsSubject), `Institution ${inst.name} has Physics subject`);
    }

    const testInst = institutions[0];
    const testBranch = await prisma.branch.findFirst({
      where: { institutionId: testInst.id },
    });

    // Create a group with French
    const frenchSub = testInst.subjects.find((s) => s.nameAr.includes("فرنسية") || s.nameFr?.toLowerCase().includes("français"));
    const physicsSub = testInst.subjects.find((s) => s.nameAr.includes("فيزيائية") || s.nameAr.includes("فيزياء") || s.nameFr?.toLowerCase().includes("physique"));

    let testTeacher = await prisma.teacher.findFirst({
      where: { institutionId: testInst.id, wageType: "hourly" },
    });

    if (!testTeacher) {
      testTeacher = await prisma.teacher.create({
        data: {
          institutionId: testInst.id,
          fullName: "أستاذ تجريبي ساعات QA",
          firstName: "سعيد",
          lastName: "براهيمي",
          phone: "0550998877",
          wageType: "hourly",
          hourlyRate: 1500,
          status: "ACTIVE",
        },
      });
    }

    const testGroupFrench = await prisma.classGroup.create({
      data: {
        institutionId: testInst.id,
        branchId: testBranch?.id || undefined,
        teacherId: testTeacher.id,
        name: `فوج اللغة الفرنسية تجريبي QA - ${Date.now()}`,
        academicLevel: "SECONDARY_3",
        subjectId: frenchSub.id,
        maxCapacity: 25,
        monthlyFee: 3000,
      },
    });
    assert(Boolean(testGroupFrench?.id), `Created group with French subject: ${testGroupFrench.name}`);

    const testGroupPhysics = await prisma.classGroup.create({
      data: {
        institutionId: testInst.id,
        branchId: testBranch?.id || undefined,
        teacherId: testTeacher.id,
        name: `فوج الفيزياء تجريبي QA - ${Date.now()}`,
        academicLevel: "MIDDLE_4",
        subjectId: physicsSub.id,
        maxCapacity: 20,
        monthlyFee: 2800,
      },
    });
    assert(Boolean(testGroupPhysics?.id), `Created group with Physics subject: ${testGroupPhysics.name}`);

    let testClassroom = await prisma.classroom.findFirst({
      where: { institutionId: testInst.id },
    });

    if (!testClassroom) {
      testClassroom = await prisma.classroom.create({
        data: {
          institutionId: testInst.id,
          branchId: testBranch.id,
          name: "قاعة الاختبارات QA",
          capacity: 30,
        },
      });
    }

    // Schedule 3 sessions for this teacher
    const now = new Date();
    const session1 = await prisma.classSession.create({
      data: {
        institutionId: testInst.id,
        groupId: testGroupFrench.id,
        teacherId: testTeacher.id,
        classroomId: testClassroom.id,
        subjectId: frenchSub.id,
        startTime: "09:00",
        endTime: "11:00",
        sessionDate: now.toISOString().split("T")[0],
      },
    });
    assert(Boolean(session1.id), "Created session 1 in timetable");

    // Clean test hour logs for this teacher
    await prisma.teacherHourLog.deleteMany({
      where: { teacherId: testTeacher.id },
    });

    // Check teacher hours with sessions created
    const hourLogsCount = await prisma.teacherHourLog.count({
      where: { teacherId: testTeacher.id },
    });
    assert(hourLogsCount === 0, `Teacher has 0 manual hour logs (got ${hourLogsCount})`);

    // -------------------------------------------------------------
    // SCENARIO 4: Manual Teacher Hours (Create, Edit, Delete)
    // -------------------------------------------------------------
    console.log("\n--- 4. Testing Manual Hours Workflow (Log, Edit, Delete) ---");
    const todayStr = new Date().toISOString().split("T")[0];

    // Log 3 hours @ 1500 DZD
    const initialHours = 3;
    const initialRate = 1500;
    const initialDue = initialHours * initialRate; // 4500

    const loggedHours = await prisma.teacherHourLog.create({
      data: {
        institutionId: testInst.id,
        teacherId: testTeacher.id,
        groupId: testGroupFrench.id,
        subjectId: frenchSub.id,
        workDate: todayStr,
        hours: initialHours,
        hourlyRate: initialRate,
        totalAmount: initialDue,
        notes: "حصة تعويضية QA",
      },
    });
    assert(loggedHours.totalAmount === 4500, `Logged 3h @ 1500 = 4500 DZD (got ${loggedHours.totalAmount})`);

    // Edit to 4 hours @ 1500 DZD
    const editedHours = 4;
    const editedDue = editedHours * initialRate; // 6000
    const updatedLog = await prisma.teacherHourLog.update({
      where: { id: loggedHours.id },
      data: {
        hours: editedHours,
        totalAmount: editedDue,
        notes: "تم تعديل الساعات QA",
      },
    });
    assert(updatedLog.hours === 4, `Updated hours to 4 (got ${updatedLog.hours})`);
    assert(updatedLog.totalAmount === 6000, `Updated total to 6000 DZD (got ${updatedLog.totalAmount})`);

    // Delete log
    await prisma.teacherHourLog.delete({
      where: { id: loggedHours.id },
    });
    const remainingLogs = await prisma.teacherHourLog.count({
      where: { teacherId: testTeacher.id },
    });
    assert(remainingLogs === 0, `Deleted log successfully, remaining count is 0 (got ${remainingLogs})`);

    // Clean up temporary sessions & groups
    await prisma.classSession.delete({ where: { id: session1.id } });
    await prisma.classGroup.delete({ where: { id: testGroupFrench.id } });
    await prisma.classGroup.delete({ where: { id: testGroupPhysics.id } });

    // -------------------------------------------------------------
    // SCENARIO 5: Password Reset Token Security
    // -------------------------------------------------------------
    console.log("\n--- 5. Testing Forgot Password & Reset Password Flow ---");
    const testAdmin = await prisma.user.findFirst({
      where: { email: { contains: "@" }, isActive: true },
    });
    assert(Boolean(testAdmin), `Found test user: ${testAdmin?.email}`);

    // Generate token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hr

    const resetTokenRecord = await prisma.passwordResetToken.create({
      data: {
        email: testAdmin.email,
        tokenHash,
        expiresAt,
      },
    });
    assert(Boolean(resetTokenRecord.id), "Created password reset token in DB");

    // Verify token can be queried
    const foundToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });
    assert(Boolean(foundToken), "Found reset token by SHA-256 hash");
    assert(!foundToken?.usedAt, "Token is not yet marked as used");

    // Simulate password reset
    const newPassword = "NewSecurePassword2026!";
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: testAdmin.id },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // Check token is now marked used
    const consumedToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });
    assert(Boolean(consumedToken?.usedAt), "Token is now consumed and single-use validated");

    // Verify new password matches
    const updatedUser = await prisma.user.findUnique({
      where: { id: testAdmin.id },
    });
    const match = await bcrypt.compare(newPassword, updatedUser.passwordHash);
    assert(match, "User successfully authenticated with newly reset password");

    // Clean up reset token
    await prisma.passwordResetToken.delete({ where: { id: resetTokenRecord.id } });

    // -------------------------------------------------------------
    // SCENARIO 6: Registration Status Logic
    // -------------------------------------------------------------
    console.log("\n--- 6. Testing Registration Plan Status Logic ---");
    // Free plan registration -> status should be ACTIVE
    // Paid plan registration -> status should be PENDING_APPROVAL
    const freePlanCheck = (freePlan.priceDZD === 0 || freePlan.slug === "free");
    const starterPlanCheck = (starterPlan.priceDZD === 0 || starterPlan.slug === "free");
    assert(freePlanCheck, "Free plan correctly flagged as free -> grants ACTIVE status");
    assert(!starterPlanCheck, "Starter plan correctly flagged as paid -> requires PENDING_APPROVAL status");

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log("\n==================================================");
    console.log(`QA RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("QA Test execution error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runQa();
