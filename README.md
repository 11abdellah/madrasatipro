# مدرستي برو — MadrasatiPro (EdTech DZ SaaS)
المنصة السحابية الجزائرية المتكاملة لإدارة المدارس الخاصة ومراكز الدعم التعليمي ومعاهد اللغات.

---

## 🚀 التشغيل السريع (Local Development)

### 1. تثبيت الحزم:
```bash
npm install
```

### 2. ضبط قاعدة البيانات (Supabase PostgreSQL):
يمكنك ضبط كلمة المرور بسهولة وتلقائياً دون الوقوع في خطأ الرموز الخاصة أو الأقواس المربعة عبر الأمر:
```bash
npm run db:setup "كلمة_المرور_الخاصة_بك"
```
أو تشغيل الأمر بدون معاملات وسيطلب منك إدخال كلمة المرور:
```bash
npm run db:setup
```

*(تقوم هذه الأداة تلقائياً بحذف الأقواس المربعة `[ ]` وتشفير أي رموز خاصة مثل `#` أو `@` أو `?` بصيغة URL Encoding لتفادي خطأ P1013).*

### 3. رفع الجداول وتغذية البيانات الأساسية:
```bash
npm run db:push
npm run db:seed
```

### 4. تشغيل خادم التطوير:
```bash
npm run dev
```
افتح المتصفح على: `http://localhost:3000`

---

## 🌐 النشر على GitHub و Vercel (Production Deployment)

### 1. الرفع على GitHub:
```bash
git init
git add .
git commit -m "MadrasatiPro Initial Production Release"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/madrasatipro.git
git push -u origin main
```

### 2. النشر على Vercel:
1. ادخل إلى [Vercel.com](https://vercel.com) واضغط **Import Project** من حسابك على GitHub.
2. في قسم **Environment Variables**، أضف:
   - `DATABASE_URL`: رابط Supabase (نفس القيمة الموجودة في ملف `.env`).
   - `AUTH_SECRET`: مفتاح التشفير السري (مثال: `madrasatipro_production_jwt_key_2026`).
   - `NEXT_PUBLIC_APP_URL`: رابط موقعك على Vercel (مثال: `https://madrasatipro.vercel.app`).
3. اضغط **Deploy**.
