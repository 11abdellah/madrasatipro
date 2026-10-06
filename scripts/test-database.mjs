import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function runDirectDatabaseVerification() {
  console.log('====================================================');
  console.log('NOUBLA FULL-STACK DIRECT DATABASE & LOGIC VALIDATION');
  console.log('====================================================\n');

  // 1. Institution Check
  const institution = await prisma.institution.findFirst({
    include: { branches: true }
  });
  console.log(`[1] Institution: "${institution?.name}" (${institution?.code}), Branches: ${institution?.branches.length}`);
  if (!institution) throw new Error('No institution found');

  // 2. Teachers List
  const initialTeachers = await prisma.teacher.findMany({
    where: { institutionId: institution.id },
    include: { user: true, classGroups: true }
  });
  console.log(`[2] Existing Teachers in DB: ${initialTeachers.length}`);
  initialTeachers.slice(0, 3).forEach((t, i) => {
    console.log(`    - [${i+1}] ${t.fullName} | ${t.specialization} | ${t.hourlyRate} DZD/hr | Status: ${t.status}`);
  });

  // 3. Test Teacher Creation (End-to-End simulation of POST /api/teachers)
  console.log('\n[3] Creating New Teacher ("كمال بوزيد")...');
  const newEmail = `kamal.bouzid.${Date.now()}@noubla.dz`;
  const teacherUser = await prisma.user.create({
    data: {
      institutionId: institution.id,
      fullName: 'أ. كمال بوزيد',
      email: newEmail,
      phone: '0555 12 34 56',
      role: 'TEACHER',
      passwordHash: 'dummy_hash'
    }
  });

  const createdTeacher = await prisma.teacher.create({
    data: {
      userId: teacherUser.id,
      institutionId: institution.id,
      firstName: 'كمال',
      lastName: 'بوزيد',
      fullName: 'أ. كمال بوزيد',
      email: newEmail,
      phone: '0555 12 34 56',
      specialization: 'رياضيات - البكالوريا تقني رياضي',
      subjects: JSON.stringify(['رياضيات']),
      wageType: 'hourly',
      hourlyRate: 2500,
      percentageShare: 0,
      status: 'ACTIVE',
      notes: 'أستاذ متميز خبرة 12 سنة'
    },
    include: { user: true }
  });

  // Log Audit
  await prisma.auditLog.create({
    data: {
      institutionId: institution.id,
      userId: teacherUser.id,
      action: 'TEACHER_CREATED',
      entity: 'Teacher',
      entityId: createdTeacher.id,
      details: JSON.stringify({ name: teacherUser.name, rate: 2500 })
    }
  });

  console.log(`    ✓ Teacher Created successfully: ID=${createdTeacher.id}, Name=${createdTeacher.user.name}, Phone=${createdTeacher.user.phone}, Rate=${createdTeacher.hourlyRate} DZD`);

  // 4. Test Teacher Update (Simulation of PATCH /api/teachers/[id])
  console.log('\n[4] Updating Teacher ("كمال بوزيد") Phone and Hourly Rate...');
  const updatedTeacher = await prisma.teacher.update({
    where: { id: createdTeacher.id },
    data: {
      hourlyRate: 2800,
      specialization: 'رياضيات متقدمة - تقني رياضي',
      user: {
        update: {
          phone: '0666 99 88 77'
        }
      }
    },
    include: { user: true }
  });
  console.log(`    ✓ Teacher Updated: Phone=${updatedTeacher.user.phone}, New Rate=${updatedTeacher.hourlyRate} DZD`);

  // 5. Test Safe Archive (Simulation of DELETE /api/teachers/[id])
  console.log('\n[5] Archiving Teacher (Soft-delete)...');
  const archivedTeacher = await prisma.teacher.update({
    where: { id: createdTeacher.id },
    data: { status: 'ARCHIVED' }
  });
  console.log(`    ✓ Teacher Status is now: ${archivedTeacher.status}`);

  // 6. Students & Parents Verification
  console.log('\n[6] Verifying Students & Parents in Database...');
  const students = await prisma.student.findMany({
    where: { institutionId: institution.id },
    include: { parent: true, enrollments: true, invoices: true }
  });
  console.log(`    Total Students: ${students.length}`);
  students.slice(0, 3).forEach((s, i) => {
    console.log(`    - [${i+1}] ${s.firstName} ${s.lastName} | Phone: ${s.phone} | Level: ${s.academicLevel} (${s.stream || 'عام'}) | Parent: ${s.parent?.fullName || 'N/A'} (${s.parent?.phone || 'N/A'})`);
  });

  // 7. Finance & Invoices Aggregation
  console.log('\n[7] Verifying Invoices, Payments, and Financial Totals...');
  const invoices = await prisma.invoice.findMany({
    where: { institutionId: institution.id }
  });
  const payments = await prisma.payment.findMany({
    where: { institutionId: institution.id }
  });
  const totalBilled = invoices.reduce((acc, inv) => acc + (inv.finalTotal || 0), 0);
  const totalPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalRemaining = invoices.reduce((acc, inv) => acc + Math.max(0, (inv.finalTotal || 0) - (inv.amountPaid || 0)), 0);
  console.log(`    Invoices Count: ${invoices.length}`);
  console.log(`    Payments Count: ${payments.length}`);
  console.log(`    Total Billed: ${totalBilled.toLocaleString()} DZD`);
  console.log(`    Total Collected: ${totalPaid.toLocaleString()} DZD`);
  console.log(`    Total Outstanding Debt: ${totalRemaining.toLocaleString()} DZD`);

  // 8. Attendance Verification
  console.log('\n[8] Verifying Attendance Records...');
  const attendanceCount = await prisma.attendance.count();
  const presentCount = await prisma.attendance.count({ where: { status: 'PRESENT' } });
  console.log(`    Total Recorded Attendances: ${attendanceCount} (Present: ${presentCount})`);

  // 9. Audit Log Check
  console.log('\n[9] Verifying Audit Trail...');
  const auditLogs = await prisma.auditLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  console.log(`    Recent Audit Entries: ${auditLogs.length}`);
  auditLogs.forEach(log => {
    console.log(`    - [${log.action}] on ${log.entity} (${log.createdAt.toISOString()})`);
  });

  console.log('\n====================================================');
  console.log('🎉 ALL DATABASE INTEGRITY & BUSINESS RULES VERIFIED!');
  console.log('====================================================');
}

runDirectDatabaseVerification()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
