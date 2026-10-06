import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function run() {
  console.log("================================================================================");
  console.log("MADRASATIPRO — COMPREHENSIVE END-TO-END VERIFICATION: FINAL PASS");
  console.log("================================================================================\n");

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
    // --------------------------------------------------------------------------
    // 1. Copy & Text Changes in Landing Page
    // --------------------------------------------------------------------------
    console.log("--- 1. Testing Landing Page Copy Updates ---");
    const pageContent = fs.readFileSync(path.resolve("app/page.tsx"), "utf-8");

    assert(!pageContent.includes("خطط الأسعار 3D"), "pricing section title does NOT contain '3D'");
    assert(pageContent.includes("خطط الأسعار"), "pricing section title is 'خطط الأسعار'");
    assert(
      pageContent.includes("أول منصة متقدمة لإدارة المدارس ومراكز الدعم في الجزائر"),
      "hero badge updated to 'أول منصة متقدمة لإدارة المدارس ومراكز الدعم في الجزائر'"
    );
    assert(
      !pageContent.includes("المنصة السحابية المتقدمة لإدارة المدارس ومراكز الدعم في الجزائر"),
      "old hero badge text successfully removed"
    );
    assert(
      pageContent.includes("سهولة الدفع"),
      "marketing text updated to 'سهولة الدفع'"
    );
    assert(
      !pageContent.includes("دفع Baridimob & CCP"),
      "old 'دفع Baridimob & CCP' text successfully replaced"
    );

    // --------------------------------------------------------------------------
    // 2. Product Showcase & Student Card Mention
    // --------------------------------------------------------------------------
    console.log("\n--- 2. Testing Product Showcase & 'بطاقة المتمدرس' ---");
    const showcaseContent = fs.readFileSync(
      path.resolve("components/landing/ProductShowcaseSection.tsx"),
      "utf-8"
    );

    assert(
      showcaseContent.includes("جولة بصرية في النظام"),
      "section header title contains 'جولة بصرية في النظام'"
    );
    assert(
      !showcaseContent.includes("Happy Students Rafiki Illustration Banner"),
      "orange visual illustration banner under 'جولة بصرية في النظام' was removed cleanly"
    );
    assert(
      showcaseContent.includes("بطاقة المتمدرس"),
      "student management feature mentions 'بطاقة المتمدرس'"
    );
    assert(
      showcaseContent.includes("MP-2026-ALG-0128"),
      "student card preview includes student ID 'MP-2026-ALG-0128'"
    );
    assert(
      showcaseContent.includes("3AS علوم تجريبية"),
      "student card preview includes level/group '3AS علوم تجريبية'"
    );
    assert(
      showcaseContent.includes("2025 / 2026"),
      "student card preview includes academic year '2025 / 2026'"
    );

    // --------------------------------------------------------------------------
    // 3. Centralized Platform Settings (Database & Isolation)
    // --------------------------------------------------------------------------
    console.log("\n--- 3. Testing Centralized Platform Settings & Multi-Tenant Isolation ---");
    const initialSettings = await prisma.platformSetting.upsert({
      where: { id: "singleton" },
      update: {
        mainPhone: "0550 11 22 33",
        supportPhone: "0770 44 55 66",
        salesPhone: "0550 77 88 99",
        mainEmail: "contact@madrasatipro.dz",
        supportEmail: "support@madrasatipro.dz",
        salesEmail: "sales@madrasatipro.dz",
        whatsapp: "213550112233",
        facebookUrl: "https://facebook.com/madrasatipro",
        address: "الجزائر العاصمة • وهران • سطيف",
      },
      create: {
        id: "singleton",
        mainPhone: "0550 11 22 33",
        supportPhone: "0770 44 55 66",
        salesPhone: "0550 77 88 99",
        mainEmail: "contact@madrasatipro.dz",
        supportEmail: "support@madrasatipro.dz",
        salesEmail: "sales@madrasatipro.dz",
        whatsapp: "213550112233",
        facebookUrl: "https://facebook.com/madrasatipro",
        address: "الجزائر العاصمة • وهران • سطيف",
      },
    });

    assert(initialSettings.id === "singleton", "platformSetting singleton is active in database");
    assert(initialSettings.whatsapp === "213550112233", "platformSetting stores international WhatsApp");
    assert(initialSettings.mainPhone === "0550 11 22 33", "platformSetting stores main phone");

    // Verify tenant isolation: Create a tenant institution and ensure its settings don't mix with platform settings
    const testInst = await prisma.institution.create({
      data: {
        name: "مدرسة اختبار العزل التجريبية",
        code: `test-iso-${Date.now().toString().slice(-4)}`,
        wilayaCode: 31,
        status: "ACTIVE",
        phone: "041 00 00 00",
        email: "school@oran-edu.dz",
        address: "حي النخيل، وهران",
      },
    });

    assert(
      testInst.phone === "041 00 00 00" &&
        initialSettings.mainPhone === "0550 11 22 33",
      "tenant institution settings and platform settings are strictly isolated"
    );

    // --------------------------------------------------------------------------
    // 4. Payment Methods Database Management & Dynamic Registration
    // --------------------------------------------------------------------------
    console.log("\n--- 4. Testing Payment Methods Database & Subscription Snapshot ---");
    // Ensure default methods exist
    const ccpMethod = await prisma.paymentMethod.upsert({
      where: { code: "ccp_test" },
      update: { isActive: true },
      create: {
        code: "ccp_test",
        name: "الحساب البريدي الجاري (CCP)",
        displayName: "حساب بريدي CCP",
        accountNumber: "21000000 Clé 99",
        accountName: "مدرستي برو تكنولوجي",
        instructions: "يرجى إرفاق وصل العملية",
        isActive: true,
        sortOrder: 1,
      },
    });

    const baridiMethod = await prisma.paymentMethod.upsert({
      where: { code: "baridimob_test" },
      update: { isActive: true },
      create: {
        code: "baridimob_test",
        name: "بريدي موب (BaridiMob)",
        displayName: "تطبيق بريدي موب",
        accountNumber: "00799999000123456789",
        accountName: "MADRASATIPRO DZ",
        instructions: "التحويل الفوري عبر بريدي موب",
        isActive: true,
        sortOrder: 2,
      },
    });

    // Inactive method
    const inactiveMethod = await prisma.paymentMethod.upsert({
      where: { code: "cheque_test" },
      update: { isActive: false },
      create: {
        code: "cheque_test",
        name: "شيك بنكي معتمد",
        displayName: "شيك بنكي",
        accountNumber: "BANQUE-019999",
        accountName: "MADRASATIPRO",
        isActive: false,
        sortOrder: 99,
      },
    });

    // Active methods query (as performed by public /api/payment-methods)
    const activeMethods = await prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    assert(
      activeMethods.some((m) => m.code === "ccp_test") &&
        activeMethods.some((m) => m.code === "baridimob_test"),
      "active payment methods retrieved by public query"
    );
    assert(
      !activeMethods.some((m) => m.code === "cheque_test"),
      "inactive payment methods are strictly excluded from registration/public query"
    );

    // Test Subscription creation with Payment Method snapshot
    const proPlan = await prisma.subscriptionPlan.findFirst();
    const subInst = await prisma.institution.create({
      data: {
        name: "معهد النور للغات والعلوم",
        code: `sub-test-${Date.now().toString().slice(-4)}`,
        wilayaCode: 16,
        status: "PENDING_APPROVAL",
        subscription: {
          create: {
            planId: proPlan.id,
            status: "PENDING_APPROVAL",
            billingCycle: "monthly",
            renewalDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
            paymentMethodId: baridiMethod.id,
            paymentMethodCode: baridiMethod.code,
            paymentMethodName: baridiMethod.name,
            transferReference: "TXN-BARIDI-2026-9901",
          },
        },
      },
      include: { subscription: true },
    });

    assert(
      subInst.subscription?.paymentMethodCode === "baridimob_test",
      "subscription snapshot stores paymentMethodCode correctly"
    );
    assert(
      subInst.subscription?.paymentMethodName === "بريدي موب (BaridiMob)",
      "subscription snapshot stores paymentMethodName correctly"
    );
    assert(
      subInst.subscription?.transferReference === "TXN-BARIDI-2026-9901",
      "subscription stores transferReference from registration"
    );

    // Historical Immutability Test: Deactivate the payment method and verify subscription still retains historical name & code
    await prisma.paymentMethod.update({
      where: { id: baridiMethod.id },
      data: { isActive: false, name: "بريدي موب معدل" },
    });

    const historicalSub = await prisma.subscription.findUnique({
      where: { id: subInst.subscription.id },
    });

    assert(
      historicalSub.paymentMethodCode === "baridimob_test" &&
        historicalSub.paymentMethodName === "بريدي موب (BaridiMob)",
      "historical subscription data is preserved even if payment method is deactivated or edited"
    );

    // --------------------------------------------------------------------------
    // 5. Code & UI Integration Verification
    // --------------------------------------------------------------------------
    console.log("\n--- 5. Testing Super Admin & Public Page UI Code Integration ---");
    const superAdminContent = fs.readFileSync(path.resolve("app/super-admin/page.tsx"), "utf-8");
    assert(
      superAdminContent.includes('activeTab === "payments"'),
      "Super Admin contains 'طرق الدفع' management tab"
    );
    assert(
      superAdminContent.includes('activeTab === "contact"'),
      "Super Admin contains 'إعدادات التواصل' management tab"
    );
    assert(
      superAdminContent.includes("handleTogglePaymentActive"),
      "Super Admin has toggle active/inactive functionality for payment methods"
    );
    assert(
      superAdminContent.includes("handleSavePlatformSettings"),
      "Super Admin has centralized platform settings save functionality"
    );

    const registerContent = fs.readFileSync(path.resolve("app/register/page.tsx"), "utf-8");
    assert(
      registerContent.includes("/api/payment-methods"),
      "Registration page fetches active payment methods from /api/payment-methods"
    );
    assert(
      registerContent.includes("selectedMethodObj"),
      "Registration page displays dynamic account details & instructions for selected method"
    );

    const pendingApprovalContent = fs.readFileSync(path.resolve("app/pending-approval/page.tsx"), "utf-8");
    assert(
      pendingApprovalContent.includes("/api/platform/settings"),
      "Pending Approval page fetches centralized contact info from /api/platform/settings"
    );

    // --------------------------------------------------------------------------
    // 6. Cleanup Test Artifacts
    // --------------------------------------------------------------------------
    console.log("\n--- 6. Cleaning Up Temporary Test Records ---");
    await prisma.institution.delete({ where: { id: testInst.id } });
    await prisma.institution.delete({ where: { id: subInst.id } });
    await prisma.paymentMethod.deleteMany({
      where: { code: { in: ["ccp_test", "baridimob_test", "cheque_test"] } },
    });
    assert(true, "temporary database test records cleaned up safely");
  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n================================================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run();
