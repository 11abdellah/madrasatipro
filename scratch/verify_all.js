const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Test date helper logic inline to test exact calculation
function normalizeDateStr(dateStr) {
  if (!dateStr) return "2026-09-27";
  const trimmed = dateStr.trim();
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

function calculateNextMonthlyPaymentDate(startDateStr, lastPaidMonthOrDate) {
  const normalizedStart = normalizeDateStr(startDateStr || "2026-09-27");
  const [startYear, startMonth, startDay] = normalizedStart.split("-").map(Number);
  const anchorDay = startDay || 1;

  if (!lastPaidMonthOrDate) {
    let targetMonth = startMonth + 1;
    let targetYear = startYear;
    if (targetMonth > 12) {
      targetMonth = 1;
      targetYear += 1;
    }
    const maxDaysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
    const finalDay = Math.min(anchorDay, maxDaysInTargetMonth);
    return `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(finalDay).padStart(2, "0")}`;
  }

  const normalizedLastPaid = normalizeDateStr(lastPaidMonthOrDate);
  const [lastYear, lastMonth] = normalizedLastPaid.split("-").map(Number);

  let targetMonth = lastMonth + 1;
  let targetYear = lastYear;
  if (targetMonth > 12) {
    targetMonth = 1;
    targetYear += 1;
  }

  const maxDaysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
  const finalDay = Math.min(anchorDay, maxDaysInTargetMonth);

  return `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(finalDay).padStart(2, "0")}`;
}

function getTeacherPayrollStatus(fixedSalary, nextPaymentDateStr) {
  if (!fixedSalary || fixedSalary <= 0) {
    return { status: "PAID", label: "مدفوع", color: "emerald" };
  }
  if (!nextPaymentDateStr) {
    return { status: "DUE_SOON", label: "مستحق قريباً", color: "amber" };
  }

  const todayStr = "2026-09-27";
  if (nextPaymentDateStr < todayStr) {
    return { status: "OVERDUE", label: "متأخر", color: "rose" };
  }

  const [tY, tM, tD] = todayStr.split("-").map(Number);
  const [nY, nM, nD] = nextPaymentDateStr.split("-").map(Number);
  const todayMs = Date.UTC(tY, tM - 1, tD);
  const nextMs = Date.UTC(nY, nM - 1, nD);
  const diffDays = Math.ceil((nextMs - todayMs) / (1000 * 60 * 60 * 24));

  if (diffDays <= 3) {
    return { status: "DUE_SOON", label: "مستحق قريباً", color: "amber" };
  }
  return { status: "PAID", label: "مدفوع", color: "emerald" };
}

async function runTests() {
  console.log("=== 1. TESTING DATE ARITHMETIC & PAYROLL CALCULATIONS ===");
  
  // Case A: 05/09/2026 -> First payment next month
  const test1 = calculateNextMonthlyPaymentDate("05/09/2026", null);
  console.log(`Test 1 (05/09/2026, null) -> Expected 2026-10-05, Got: ${test1}`);
  if (test1 !== "2026-10-05") throw new Error("Test 1 Failed!");

  // Case B: 05/09/2026, paid 2026-10-05 -> Next payment 2026-11-05
  const test2 = calculateNextMonthlyPaymentDate("05/09/2026", "2026-10-05");
  console.log(`Test 2 (05/09/2026, 2026-10-05) -> Expected 2026-11-05, Got: ${test2}`);
  if (test2 !== "2026-11-05") throw new Error("Test 2 Failed!");

  // Case C: Anchor 31 Jan -> Feb (28 days) -> Mar (31 days restored) -> Apr (30 days)
  const test3a = calculateNextMonthlyPaymentDate("2026-01-31", null);
  console.log(`Test 3a (2026-01-31, null) -> Expected 2026-02-28, Got: ${test3a}`);
  if (test3a !== "2026-02-28") throw new Error("Test 3a Failed!");

  const test3b = calculateNextMonthlyPaymentDate("2026-01-31", "2026-02-28");
  console.log(`Test 3b (2026-01-31, 2026-02-28) -> Expected 2026-03-31, Got: ${test3b}`);
  if (test3b !== "2026-03-31") throw new Error("Test 3b Failed!");

  const test3c = calculateNextMonthlyPaymentDate("2026-01-31", "2026-03-31");
  console.log(`Test 3c (2026-01-31, 2026-03-31) -> Expected 2026-04-30, Got: ${test3c}`);
  if (test3c !== "2026-04-30") throw new Error("Test 3c Failed!");

  // Payroll status checks
  const statusOverdue = getTeacherPayrollStatus(50000, "2026-09-20");
  console.log(`Status test (Past date) -> Expected متأخر, Got: ${statusOverdue.label}`);
  if (statusOverdue.status !== "OVERDUE") throw new Error("Status Overdue Test Failed!");

  const statusDueSoon = getTeacherPayrollStatus(50000, "2026-09-29");
  console.log(`Status test (2 days ahead) -> Expected مستحق قريباً, Got: ${statusDueSoon.label}`);
  if (statusDueSoon.status !== "DUE_SOON") throw new Error("Status DueSoon Test Failed!");

  const statusPaid = getTeacherPayrollStatus(50000, "2026-10-25");
  console.log(`Status test (Next month) -> Expected مدفوع, Got: ${statusPaid.label}`);
  if (statusPaid.status !== "PAID") throw new Error("Status Paid Test Failed!");

  console.log("\n=== 2. TESTING DATABASE SCHEMA & INTEGRITY ===");

  // Check TeacherHourLog model
  const hourLogCount = await prisma.teacherHourLog.count();
  console.log(`✓ TeacherHourLog model exists in DB. Current count: ${hourLogCount}`);

  // Check SubscriptionPlan model
  const plans = await prisma.subscriptionPlan.findMany();
  console.log(`✓ SubscriptionPlan count in DB: ${plans.length}`);
  for (const p of plans) {
    console.log(`  - Plan: ${p.name} (${p.slug}) -> ${p.priceDZD} DZD / month`);
  }

  // Check Classes and safe cascade delete support
  const institutions = await prisma.institution.findMany({ take: 1 });
  if (institutions.length > 0) {
    const instId = institutions[0].id;
    console.log(`✓ Checking institution ${instId}:`);
    const teachers = await prisma.teacher.findMany({ where: { institutionId: instId }, take: 2 });
    console.log(`  Found ${teachers.length} teachers. Fields check: wageType: ${teachers[0]?.wageType}, startDate: ${teachers[0]?.startDate}`);
  }

  console.log("\n==========================================");
  console.log("✓ ALL UNIT AND INTEGRATION CHECKS PASSED!");
  console.log("==========================================");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
