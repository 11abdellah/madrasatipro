import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding default PaymentMethods and PlatformSettings...");

  // 1. Platform Settings
  const existingSetting = await prisma.platformSetting.findUnique({
    where: { id: "singleton" },
  });

  if (!existingSetting) {
    await prisma.platformSetting.create({
      data: {
        id: "singleton",
        mainPhone: "0550 00 00 00",
        supportPhone: "0550 12 34 56",
        salesPhone: "0550 99 88 77",
        mainEmail: "contact@madrasatipro.dz",
        supportEmail: "support@madrasatipro.dz",
        salesEmail: "sales@madrasatipro.dz",
        whatsapp: "213550123456",
        facebookUrl: "https://facebook.com/madrasatipro",
        instagramUrl: "https://instagram.com/madrasatipro",
        linkedinUrl: "https://linkedin.com/company/madrasatipro",
        youtubeUrl: "https://youtube.com/@madrasatipro",
        tiktokUrl: "https://tiktok.com/@madrasatipro",
        address: "الجزائر العاصمة • سطيف",
      },
    });
    console.log("✅ PlatformSettings seeded.");
  } else {
    console.log("ℹ️ PlatformSettings already exist.");
  }

  // 2. Default Payment Methods
  const defaultMethods = [
    {
      code: "baridimob",
      name: "بريدي موب (Baridimob)",
      displayName: "BaridiMob",
      description: "تحويل فوري عبر تطبيق بريدي موب RIP",
      instructions: "قم بتحويل المبلغ إلى الحساب البريدي عبر تطبيق بريدي موب، واحتفظ بوصل التحويل لتأكيد العملية.",
      accountName: "SARL MADRASATIPRO EDTECH ALGERIE",
      accountNumber: "007999990022334455 88",
      sortOrder: 1,
      isActive: true,
    },
    {
      code: "ccp",
      name: "حوالة بريدية (CCP)",
      displayName: "CCP",
      description: "عبر أي مكتب بريد في 58 ولاية",
      instructions: "ادفع في أقرب مكتب بريد باستخدام الصك البريدي أو الحوالة، ثم أرسل إشعار الدفع.",
      accountName: "SARL MADRASATIPRO EDTECH ALGERIE",
      accountNumber: "21045892 مفتاح 45",
      sortOrder: 2,
      isActive: true,
    },
    {
      code: "bank_transfer",
      name: "تحويل بنكي رسمي (Virement)",
      displayName: "تحويل بنكي",
      description: "عبر الحساب البنكي الوطني (BNA / BEA)",
      instructions: "قم بالتحويل البنكي المباشر إلى الحساب التجاري للمنصة مع كتابة اسم المؤسسة كمرجع.",
      accountName: "SARL MADRASATIPRO EDTECH ALGERIE",
      accountNumber: "00100654030000000000 12",
      sortOrder: 3,
      isActive: true,
    },
  ];

  for (const m of defaultMethods) {
    const existing = await prisma.paymentMethod.findUnique({
      where: { code: m.code },
    });
    if (!existing) {
      await prisma.paymentMethod.create({ data: m });
      console.log(`✅ PaymentMethod ${m.code} created.`);
    } else {
      console.log(`ℹ️ PaymentMethod ${m.code} already exists.`);
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
