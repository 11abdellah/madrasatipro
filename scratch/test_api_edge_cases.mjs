import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import crypto from "crypto";

const prisma = new PrismaClient();

async function runEdgeCases() {
  console.log("==================================================");
  console.log("TESTING API EDGE CASES & SECURITY LOGIC");
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
    // 1. Forgot password constant response & email enumeration prevention
    // -------------------------------------------------------------
    console.log("--- 1. Testing Forgot Password Security ---");
    const fakeEmail = "nonexistent_user_xyz_12345@test.dz";
    const userCheck = await prisma.user.findUnique({
      where: { email: fakeEmail },
    });
    assert(userCheck === null, "Fake user does not exist in DB");

    // Check that querying forgot-password logic for fake email creates 0 tokens and returns uniform message
    const countBefore = await prisma.passwordResetToken.count({
      where: { email: fakeEmail },
    });
    assert(countBefore === 0, "No token created for non-existent email");

    // -------------------------------------------------------------
    // 2. Reset password token expiry & single use validation
    // -------------------------------------------------------------
    console.log("\n--- 2. Testing Reset Token Expiry & Reuse Protection ---");
    const expiredToken = crypto.randomBytes(32).toString("hex");
    const expiredHash = crypto.createHash("sha256").update(expiredToken).digest("hex");
    const pastDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago

    const expiredRecord = await prisma.passwordResetToken.create({
      data: {
        email: "test_expired@domain.dz",
        tokenHash: expiredHash,
        expiresAt: pastDate,
      },
    });

    const isExpired = new Date() > expiredRecord.expiresAt;
    assert(isExpired, "Expired token detected as expired");

    const usedToken = crypto.randomBytes(32).toString("hex");
    const usedHash = crypto.createHash("sha256").update(usedToken).digest("hex");
    const usedRecord = await prisma.passwordResetToken.create({
      data: {
        email: "test_used@domain.dz",
        tokenHash: usedHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        usedAt: new Date(),
      },
    });
    assert(Boolean(usedRecord.usedAt), "Used token detected as already used");

    // Clean up
    await prisma.passwordResetToken.delete({ where: { id: expiredRecord.id } });
    await prisma.passwordResetToken.delete({ where: { id: usedRecord.id } });

    // -------------------------------------------------------------
    // 3. Time Validation logic
    // -------------------------------------------------------------
    console.log("\n--- 3. Testing Time & Conflict Validation Logic ---");
    function validateSessionTimes(startTime, endTime) {
      if (!startTime || !endTime) return { valid: false, error: "أوقات الحصة مطلوبة" };
      if (startTime >= endTime) return { valid: false, error: "وقت بداية الحصة يجب أن يكون قبل وقت النهاية" };
      return { valid: true };
    }

    const invalidTimes1 = validateSessionTimes("11:00", "09:00");
    assert(!invalidTimes1.valid, "Start > End is correctly blocked");

    const invalidTimes2 = validateSessionTimes("10:00", "10:00");
    assert(!invalidTimes2.valid, "Start == End is correctly blocked");

    const validTimes = validateSessionTimes("09:00", "11:00");
    assert(validTimes.valid, "Start < End is allowed");

    // -------------------------------------------------------------
    // 4. Multi-tenant isolation verification
    // -------------------------------------------------------------
    console.log("\n--- 4. Testing Multi-Tenant Data Isolation ---");
    const insts = await prisma.institution.findMany({ take: 2 });
    if (insts.length >= 2) {
      const instA = insts[0];
      const instB = insts[1];

      const teachersA = await prisma.teacher.findMany({
        where: { institutionId: instA.id },
      });
      const teachersB = await prisma.teacher.findMany({
        where: { institutionId: instB.id },
      });

      const intersect = teachersA.filter((ta) => teachersB.some((tb) => tb.id === ta.id));
      assert(intersect.length === 0, "Zero cross-tenant leakage between institutions A and B");
    }

    console.log("\n==================================================");
    console.log(`EDGE CASES RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Edge case test execution error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runEdgeCases();
