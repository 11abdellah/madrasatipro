# مدرستي برو — MadrasatiPro (EdTech DZ SaaS)
المنصة السحابية الجزائرية المتكاملة لإدارة المدارس الخاصة ومراكز الدعم التعليمي ومعاهد اللغات.

---

## 🔑 بيانات تسجيل الدخول الافتراضية (Default Admin Accounts)

تمت تغذية قاعدة البيانات بحسابين جاهزين للدخول مباشرة:

### 1️⃣ حساب مدير المدرسة (School Admin):
- **البريد الإلكتروني:** `admin@madrasatipro.dz`
- **كلمة المرور:** `AdminPassword2026!`
- **الصلاحية:** `ADMIN` (مدير مؤسسة النخبة النموذجية)
- **التوجيه التلقائي:** `/dashboard` (لوحة تحكم المدرسة: التلاميذ، الأساتذة، الأفواج، القاعات، المالية، الحضور)

### 2️⃣ حساب المشرف العام للمنصة (SaaS Super Admin):
- **البريد الإلكتروني:** `superadmin@madrasatipro.dz`
- **كلمة المرور:** `AdminPassword2026!`
- **الصلاحية:** `SUPER_ADMIN`
- **التوجيه التلقائي:** `/super-admin` (إدارة المشتركين، المؤسسات، خطط الأسعار، وطرق الدفع)

---

## 👤 إنشاء وتعديل حسابات المشرفين يدوياً

يمكنك في أي وقت إنشاء حساب مدير جديد أو تغيير كلمة المرور عبر الأمر التفاعلي:
```bash
npm run create:admin
```
أو تمرير البيانات مباشرة في سطر الأوامر:
```bash
# إنشاء مدير مدرسة (ADMIN):
node scripts/create-admin.mjs "myemail@gmail.com" "MyPassword123" "ADMIN" "الاسم الكامل"

# إنشاء مشرف عام للمنصة (SUPER_ADMIN):
node scripts/create-admin.mjs "super@domain.dz" "MyPassword123" "SUPER_ADMIN" "المشرف العام"
```

---

## 🚀 التشغيل السريع (Local Development)

### 1. تثبيت الحزم:
```bash
npm install
```

### 2. ضبط قاعدة البيانات (Supabase PostgreSQL):
```bash
npm run db:setup "كلمة_المرور_الخاصة_بك"
```

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
git add .
git commit -m "Update seed and admin management"
git push -u origin main
```

### 2. النشر على Vercel:
1. ادخل إلى [Vercel.com](https://vercel.com) واضغط **Import Project** من حسابك على GitHub.
2. في قسم **Environment Variables**، أضف:
   - `DATABASE_URL`: رابط Supabase الموجود في ملف `.env`.
   - `AUTH_SECRET`: مفتاح التشفير السري (`madrasatipro_super_secret_jwt_key_2026_algeria_edtech`).
   - `NEXT_PUBLIC_APP_URL`: رابط موقعك على Vercel (مثال: `https://madrasatipro.vercel.app`).
3. اضغط **Deploy**.
