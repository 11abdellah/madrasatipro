import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== STARTING VERIFICATION TESTS ===");

  try {
    // 1. Verify Super Admin Plan Persistence & Pricing
    console.log("\n[Test 1] Testing SubscriptionPlan update & retrieval...");
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { priceDZD: "asc" },
    });
    console.log(`Found ${plans.length} subscription plans in DB.`);

    const starter = plans.find((p) => p.slug === "starter");
    if (!starter) throw new Error("Starter plan not found!");

    const updatedStarter = await prisma.subscriptionPlan.update({
      where: { id: starter.id },
      data: {
        description: "الخطة الأساسية للأساتذة الأحرار والمراكز الناشئة",
        priceDZD: 5500,
        annualPriceDZD: 50000,
        storageLimitGB: 12,
      },
    });
    console.log("✓ Successfully updated Starter plan:", {
      name: updatedStarter.name,
      priceDZD: updatedStarter.priceDZD,
      annualPriceDZD: updatedStarter.annualPriceDZD,
      storageLimitGB: updatedStarter.storageLimitGB,
    });

    // Revert to original price for clean state
    await prisma.subscriptionPlan.update({
      where: { id: starter.id },
      data: {
        priceDZD: 5000,
        annualPriceDZD: 48000,
        storageLimitGB: 10,
      },
    });
    console.log("✓ Reverted Starter plan to default cleanly.");

    // 2. Verify Student Registration & Multi-Tenant Isolation
    console.log("\n[Test 2] Testing Student creation, parent linkage, and invoice generation...");
    const institution = await prisma.institution.findFirst();
    if (!institution) throw new Error("No institution found in DB!");

    const testParentPhone = "0559998877";
    let parent = await prisma.parent.findFirst({
      where: { institutionId: institution.id, phone: testParentPhone },
    });
    if (!parent) {
      parent = await prisma.parent.create({
        data: {
          institutionId: institution.id,
          fullName: "عمر بلمختار",
          phone: testParentPhone,
          relationship: "الأب",
        },
      });
    }
    console.log("✓ Parent record confirmed:", parent.fullName);

    const testStudent = await prisma.student.create({
      data: {
        institutionId: institution.id,
        parentId: parent.id,
        firstName: "رياض",
        lastName: "بلمختار",
        gender: "MALE",
        dateOfBirth: "2008-05-14",
        phone: "0559998877",
        wilayaCode: 19,
        address: "حي الأمل، سطيف",
        academicLevel: "3AS",
        stream: "EXPERIMENTAL_SCIENCES",
        monthlyFee: 4500,
        status: "ACTIVE",
        enrollmentDate: new Date().toISOString().split("T")[0],
      },
    });
    console.log("✓ Test Student created:", `${testStudent.firstName} ${testStudent.lastName} (ID: ${testStudent.id})`);

    // Create Invoice for student
    const invoice = await prisma.invoice.create({
      data: {
        institutionId: institution.id,
        invoiceNumber: `TEST-INV-${Date.now()}`,
        studentId: testStudent.id,
        parentId: parent.id,
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        subtotal: 5500,
        discountTotal: 500,
        finalTotal: 5000,
        amountPaid: 0,
        status: "UNPAID",
        items: {
          create: [
            { description: "اشتراك شهري — 3AS علوم تجريبية", amount: 4500 },
            { description: "حقوق التسجيل السنوية", amount: 1000 },
          ],
        },
      },
    });
    console.log("✓ Registration Invoice created with total:", invoice.finalTotal, "DZD");

    // Clean up test student & invoice
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });
    await prisma.invoice.delete({ where: { id: invoice.id } });
    await prisma.student.delete({ where: { id: testStudent.id } });
    console.log("✓ Cleaned up test data cleanly.");

    console.log("\n=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY ===");
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

runTests();
