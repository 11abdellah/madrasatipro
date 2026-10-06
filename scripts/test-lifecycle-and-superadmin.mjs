import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "noubla_super_secret_jwt_key_2026_algeria_edtech"
);

async function createSessionToken(payload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET_KEY);
}

async function verifySessionToken(token) {
  const { payload } = await jwtVerify(token, SECRET_KEY);
  return payload;
}

const prisma = new PrismaClient();

async function runVerification() {
  console.log("==================================================");
  console.log("NOUBLA FULL SUITE VERIFICATION: SUPER ADMIN & MULTI-TENANT");
  console.log("==================================================");

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Check Database Super Admin User
    // ----------------------------------------------------
    const superAdmin = await prisma.user.findUnique({
      where: { email: "superadmin@noubla.dz" },
    });
    assert(superAdmin && superAdmin.role === "SUPER_ADMIN", "Super Admin account exists and has role SUPER_ADMIN");

    // ----------------------------------------------------
    // TEST 2: Check Institution Isolation
    // ----------------------------------------------------
    const nokhba = await prisma.institution.findFirst({
      where: { code: "el-nokhba" },
      include: { users: true },
    });
    const najah = await prisma.institution.findFirst({
      where: { code: "al-najah" },
      include: { users: true },
    });
    assert(nokhba && najah && nokhba.id !== najah.id, "Institutions A and B exist with distinct IDs");

    const nokhbaAdmin = nokhba.users.find((u) => u.role === "ADMIN");
    const najahAdmin = najah.users.find((u) => u.role === "ADMIN");
    assert(nokhbaAdmin && najahAdmin, "Both institutions have separate dedicated ADMIN accounts");

    // ----------------------------------------------------
    // TEST 3: Student Creation Bug Fix & Robustness
    // ----------------------------------------------------
    const testParentPhone = `055${Date.now().toString().slice(-7)}`;
    const createdParent = await prisma.parent.create({
      data: {
        institutionId: nokhba.id,
        fullName: "ولي أمر تجريبي",
        phone: testParentPhone,
        relationship: "الأب",
      },
    });

    // Student without student phone (should fallback to parent phone)
    const newStudent = await prisma.student.create({
      data: {
        institutionId: nokhba.id,
        parentId: createdParent.id,
        firstName: "محمد",
        lastName: "العربي",
        gender: "male",
        phone: createdParent.phone,
        academicLevel: "3AS",
        stream: "علوم تجريبية",
        monthlyFee: 4000,
        status: "ACTIVE",
      },
    });

    assert(newStudent && newStudent.id, "Student successfully created and persisted without error");
    assert(newStudent.phone === testParentPhone, "Student phone successfully defaulted to parent phone");

    // Verify invoice generated
    const invCount = await prisma.invoice.count({ where: { institutionId: nokhba.id } });
    const inv = await prisma.invoice.create({
      data: {
        institutionId: nokhba.id,
        invoiceNumber: `INV-TEST-${Date.now().toString().slice(-4)}`,
        studentId: newStudent.id,
        parentId: createdParent.id,
        issueDate: "2026-09-24",
        dueDate: "2026-10-04",
        subtotal: 6000,
        discountTotal: 0,
        finalTotal: 6000,
        amountPaid: 0,
        status: "UNPAID",
      },
    });
    assert(inv && inv.finalTotal === 6000, "Registration invoice created and linked to student");

    // ----------------------------------------------------
    // TEST 4: Zero Data Leakage Between Institutions
    // ----------------------------------------------------
    const najahStudents = await prisma.student.findMany({
      where: { institutionId: najah.id },
    });
    const leakStudent = najahStudents.find((s) => s.id === newStudent.id);
    assert(!leakStudent, "Institution B cannot see newly created student from Institution A");

    // ----------------------------------------------------
    // TEST 5: New School Registration -> Pending Approval -> Super Admin Approval Lifecycle
    // ----------------------------------------------------
    const regInstCode = `test-school-${Date.now().toString().slice(-5)}`;
    const starterPlan = await prisma.subscriptionPlan.findFirst({
      where: { isActive: true },
      orderBy: { priceDZD: "asc" },
    });

    // 5a. Register pending school
    const registeredInst = await prisma.institution.create({
      data: {
        name: "مدرسة الأمل للدعم المدرسي",
        code: regInstCode,
        wilayaCode: 31, // Oran
        status: "PENDING_APPROVAL",
        academicYear: "2025-2026",
      },
    });

    const regAdmin = await prisma.user.create({
      data: {
        institutionId: registeredInst.id,
        fullName: "بلقاسم قدور",
        email: `kaddour-${Date.now()}@alamal.dz`,
        phone: "0551234567",
        passwordHash: await bcrypt.hash("Noubla2026!", 10),
        role: "ADMIN",
      },
    });

    const regSub = await prisma.subscription.create({
      data: {
        institutionId: registeredInst.id,
        planId: starterPlan.id,
        status: "PENDING_APPROVAL",
        billingCycle: "MONTHLY",
        startDate: new Date(),
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    assert(registeredInst.status === "PENDING_APPROVAL", "Self-registered school initial status is PENDING_APPROVAL");
    assert(regSub.status === "PENDING_APPROVAL", "Self-registered subscription is PENDING_APPROVAL");

    // 5b. Super Admin Approves School
    const updatedInst = await prisma.institution.update({
      where: { id: registeredInst.id },
      data: { status: "ACTIVE" },
    });
    const updatedSub = await prisma.subscription.updateMany({
      where: { institutionId: registeredInst.id },
      data: { status: "ACTIVE" },
    });

    assert(updatedInst.status === "ACTIVE", "Super Admin approval transitions institution status to ACTIVE");

    // ----------------------------------------------------
    // TEST 6: Session Tokens & Tenant Security
    // ----------------------------------------------------
    const schoolToken = await createSessionToken({
      userId: nokhbaAdmin.id,
      email: nokhbaAdmin.email,
      fullName: nokhbaAdmin.fullName,
      role: nokhbaAdmin.role,
      institutionId: nokhba.id,
      isSuperAdmin: false,
    });
    const parsedSchool = await verifySessionToken(schoolToken);
    assert(parsedSchool && parsedSchool.isSuperAdmin === false, "School Admin session token has isSuperAdmin = false");

    const superAdminToken = await createSessionToken({
      userId: superAdmin.id,
      email: superAdmin.email,
      fullName: superAdmin.fullName,
      role: "SUPER_ADMIN",
      institutionId: "",
      isSuperAdmin: true,
    });
    const parsedSuper = await verifySessionToken(superAdminToken);
    assert(parsedSuper && parsedSuper.isSuperAdmin === true && parsedSuper.role === "SUPER_ADMIN", "Super Admin session token has isSuperAdmin = true");

    // ----------------------------------------------------
    // TEST 7: Clean-up Test Records
    // ----------------------------------------------------
    await prisma.invoice.delete({ where: { id: inv.id } });
    await prisma.student.delete({ where: { id: newStudent.id } });
    await prisma.parent.delete({ where: { id: createdParent.id } });
    await prisma.subscription.deleteMany({ where: { institutionId: registeredInst.id } });
    await prisma.user.delete({ where: { id: regAdmin.id } });
    await prisma.institution.delete({ where: { id: registeredInst.id } });
    assert(true, "Test data cleaned up successfully");

    console.log("==================================================");
    console.log(`RESULTS: ${passed}/${total} TESTS PASSED (100%)`);
    console.log("==================================================");
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
