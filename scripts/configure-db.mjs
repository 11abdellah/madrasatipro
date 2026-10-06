import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");

function encodePasswordSafely(rawPassword) {
  let cleaned = rawPassword.trim();
  // Strip quotes if wrapped
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  // Strip outer brackets if user typed [mypassword]
  if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
    cleaned = cleaned.slice(1, -1);
  }
  // Encode URI special characters
  return encodeURIComponent(cleaned);
}

function parseAndFixConnectionString(inputStr, fallbackHost = "db.kxatamsrqncgcjgoojvj.supabase.co:5432/postgres") {
  const trimmed = inputStr.trim().replace(/^["']|["']$/g, "");

  // Check if user passed full URL or just a password
  if (trimmed.startsWith("postgresql://") || trimmed.startsWith("postgres://")) {
    const regex = /^(postgres(?:ql)?:\/\/)([^:]+):(.*)@([^@]+)$/;
    const match = trimmed.match(regex);
    if (match) {
      const protocol = match[1];
      const user = match[2];
      const rawPass = match[3];
      const hostAndDb = match[4];
      const safePass = encodePasswordSafely(rawPass);
      return `${protocol}${user}:${safePass}@${hostAndDb}`;
    }
  }

  // Otherwise assume trimmed is the raw password
  const safePass = encodePasswordSafely(trimmed);
  return `postgresql://postgres:${safePass}@${fallbackHost}`;
}

async function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("==================================================");
  console.log("   🚀 أداة ضبط وتهيئة قاعدة بيانات MadrasatiPro");
  console.log("==================================================\n");

  let input = process.argv[2];

  if (!input) {
    console.log("👉 ملاحظة: خطأ P1013 يحدث عادة بسبب:");
    console.log("   1. بقاء الأقواس المربعة [ ] حول كلمة المرور.");
    console.log("   2. احتواء كلمة المرور على رموز خاصة مثل (# أو @ أو ? أو : أو !).\n");
    input = await promptUser("🔑 أدخل كلمة سر Supabase (أو رابط الاتصال كاملاً): ");
  }

  if (!input || input.trim() === "" || input.includes("[YOUR-PASSWORD]")) {
    console.error("❌ خطأ: لم يتم إدخال كلمة سر صالحة!");
    console.log("الاستخدام: npm run db:setup \"كلمة_المرور\"");
    process.exit(1);
  }

  const cleanUrl = parseAndFixConnectionString(input);

  // Read .env or create it
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  } else {
    const envExamplePath = path.join(rootDir, ".env.example");
    if (fs.existsSync(envExamplePath)) {
      envContent = fs.readFileSync(envExamplePath, "utf8");
    }
  }

  // Update or insert DATABASE_URL
  if (/^DATABASE_URL=.*$/m.test(envContent)) {
    envContent = envContent.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL="${cleanUrl}"`);
  } else {
    envContent = `DATABASE_URL="${cleanUrl}"\n` + envContent;
  }

  fs.writeFileSync(envPath, envContent, "utf8");

  console.log("\n✅ تم تحديث ملف .env بنجاح مع تشفير الرموز بأمان (URL Encoded).");
  
  // Mask password for display
  const masked = cleanUrl.replace(/(:[^:@]+@)/, ":******@");
  console.log(`📌 رابط الاتصال المضبوط: ${masked}`);

  // Validate with prisma
  console.log("\n🔍 التحقق من صحة الرابط مع Prisma...");
  try {
    execSync("npx prisma validate", { cwd: rootDir, stdio: "inherit" });
    console.log("\n🎉 رابط قاعدة البيانات صالح 100% وجاهز للربط!");
    console.log("\nالخطوات التالية الآن:");
    console.log("1️⃣ رفع الجداول إلى Supabase:");
    console.log("   npm run db:push");
    console.log("\n2️⃣ تغذية البيانات الافتراضية (طرق الدفع والإعدادات):");
    console.log("   npm run db:seed");
    console.log("\n3️⃣ تشغيل المشروع محلياً:");
    console.log("   npm run dev\n");
  } catch (err) {
    console.error("⚠️ تنبيه: فشل فحص Prisma للرابط. يرجى التأكد من كلمة المرور.");
  }
}

main().catch((err) => {
  console.error("حدث خطأ:", err);
  process.exit(1);
});
