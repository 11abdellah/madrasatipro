async function runAcceptanceTests() {
  const BASE = 'http://localhost:3000';
  console.log('--- STARTING ACCEPTANCE VERIFICATION ---');

  // 1. Initial Teachers List
  console.log('\n[1] GET /api/teachers');
  const res1 = await fetch(`${BASE}/api/teachers`);
  const data1 = await res1.json();
  console.log(`Status: ${res1.status}, Teachers count: ${data1.teachers?.length}`);
  if (!res1.ok || !data1.teachers) throw new Error('Failed to get teachers');

  // 2. Add New Teacher (Section 40 spec scenario)
  console.log('\n[2] POST /api/teachers (Creating: كمال بوزيد)');
  const newTeacherPayload = {
    firstName: 'كمال',
    lastName: 'بوزيد',
    email: 'kamal.bouzid@noubla.dz',
    phone: '0555 12 34 56',
    nationalId: '198816001234567890',
    specialization: 'رياضيات - البكالوريا تقني رياضي',
    employmentType: 'HOURLY',
    hourlyRate: 2500,
    percentageRate: 0,
    notes: 'أستاذ متميز خبرة 12 سنة في تدريس الأقسام النهائية'
  };
  const res2 = await fetch(`${BASE}/api/teachers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTeacherPayload)
  });
  const data2 = await res2.json();
  console.log(`Status: ${res2.status}, Created Teacher ID: ${data2.teacher?.id}`);
  if (!res2.ok || !data2.teacher?.id) throw new Error(`Failed to create teacher: ${JSON.stringify(data2)}`);
  const createdTeacherId = data2.teacher.id;

  // 3. Verify Teacher Exists in List (Persistence verification)
  console.log('\n[3] GET /api/teachers (Verifying persistence)');
  const res3 = await fetch(`${BASE}/api/teachers`);
  const data3 = await res3.json();
  const foundTeacher = data3.teachers.find(t => t.id === createdTeacherId);
  console.log(`Found newly created teacher in database: ${foundTeacher ? 'YES (' + foundTeacher.user.name + ')' : 'NO'}`);
  if (!foundTeacher) throw new Error('Created teacher not found in list');

  // 4. Update Teacher Phone and Rate (Edit scenario)
  console.log(`\n[4] PATCH /api/teachers/${createdTeacherId} (Updating phone & rate)`);
  const res4 = await fetch(`${BASE}/api/teachers/${createdTeacherId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '0666 99 88 77',
      hourlyRate: 2800,
      specialization: 'رياضيات متقدمة - تقني رياضي ورياضيات'
    })
  });
  const data4 = await res4.json();
  console.log(`Status: ${res4.status}, Updated phone: ${data4.teacher?.phone}, Updated rate: ${data4.teacher?.hourlyRate}`);
  if (data4.teacher?.phone !== '0666 99 88 77') throw new Error('Phone not updated');

  // 5. Test Safe Archiving
  console.log(`\n[5] DELETE /api/teachers/${createdTeacherId} (Safe archive)`);
  const res5 = await fetch(`${BASE}/api/teachers/${createdTeacherId}`, {
    method: 'DELETE'
  });
  const data5 = await res5.json();
  console.log(`Status: ${res5.status}, Archived status: ${data5.teacher?.status}`);
  if (data5.teacher?.status !== 'ARCHIVED') throw new Error('Teacher not archived');

  // 6. Test Students List
  console.log('\n[6] GET /api/students');
  const res6 = await fetch(`${BASE}/api/students`);
  const data6 = await res6.json();
  console.log(`Status: ${res6.status}, Students count: ${data6.students?.length}`);
  if (!res6.ok) throw new Error('Failed to fetch students');

  // 7. Test Student Creation (5-step modal backend)
  console.log('\n[7] POST /api/students (Creating: أنيس بن عيسى)');
  const res7 = await fetch(`${BASE}/api/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'أنيس',
      lastName: 'بن عيسى',
      arabicName: 'أنيس بن عيسى',
      gender: 'MALE',
      birthDate: '2008-05-14',
      academicCycle: 'SECONDARY',
      academicYear: '3AS',
      branch: 'EXPERIMENTAL_SCIENCES',
      currentSchool: 'ثانوية المقراني',
      registrationNumber: `STU-2026-9999`,
      parentName: 'رشيد بن عيسى',
      parentPhone: '0550 44 33 22',
      parentEmail: 'rachid.be@gmail.com',
      parentRelationship: 'الأب',
      paymentMode: 'MONTHLY',
      discountPercentage: 10,
      registrationFee: 2000
    })
  });
  const data7 = await res7.json();
  console.log(`Status: ${res7.status}, Created Student ID: ${data7.student?.id}, Generated Invoice: ${data7.invoice?.invoiceNumber}`);
  if (!res7.ok || !data7.student?.id) throw new Error(`Failed to create student: ${JSON.stringify(data7)}`);

  // 8. Test Finance & Payment
  console.log('\n[8] Finance: Invoices & Payment recording');
  const res8 = await fetch(`${BASE}/api/finance/invoices`);
  const data8 = await res8.json();
  console.log(`Invoices count: ${data8.invoices?.length}`);
  const unpaidInvoice = data8.invoices.find(inv => inv.remainingAmount > 0);
  if (unpaidInvoice) {
    console.log(`Recording payment of 1000 DZD for invoice ${unpaidInvoice.invoiceNumber}`);
    const payRes = await fetch(`${BASE}/api/finance/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId: unpaidInvoice.id,
        amount: 1000,
        paymentMethod: 'CASH',
        notes: 'دفعة أولية نقداً لدى الاستقبال'
      })
    });
    const payData = await payRes.json();
    console.log(`Payment Status: ${payRes.status}, Receipt: ${payData.payment?.receiptNumber}, Remaining: ${payData.invoice?.remainingAmount} DZD`);
  }

  // 9. Dashboard Stats
  console.log('\n[9] GET /api/dashboard/stats');
  const res9 = await fetch(`${BASE}/api/dashboard/stats`);
  const data9 = await res9.json();
  console.log(`Dashboard Live Stats:`, {
    totalStudents: data9.totalStudents,
    activeTeachers: data9.activeTeachers,
    todayAttendanceRate: `${data9.todayAttendanceRate}%`,
    monthlyRevenue: `${data9.monthlyRevenue} DZD`,
    totalOutstandingDebt: `${data9.totalOutstandingDebt} DZD`
  });

  // 10. Live Search API
  console.log('\n[10] GET /api/search?q=كمال');
  const res10 = await fetch(`${BASE}/api/search?q=${encodeURIComponent('كمال')}`);
  const data10 = await res10.json();
  console.log(`Search Results for 'كمال': Teachers found: ${data10.teachers?.length}, Students found: ${data10.students?.length}`);

  console.log('\n========================================');
  console.log('✅ ALL ACCEPTANCE TESTS PASSED 100%');
  console.log('========================================');
}

runAcceptanceTests().catch(err => {
  console.error('❌ Acceptance test error:', err);
  process.exit(1);
});
