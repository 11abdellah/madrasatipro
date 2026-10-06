import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, handleApiError } from "@/lib/auth/session";
import { assertWithinLimit } from "@/lib/services/entitlements";
import { studentSchema } from "@/lib/validations/student";
import { ALGERIAN_WILAYAS } from "@/lib/constants/algeria";

export const dynamic = "force-dynamic";

// GET /api/students - List students for current institution with filtering & search
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const level = searchParams.get("level") || "all";
    const status = searchParams.get("status") || "all";

    const where: any = {
      institutionId: session.institutionId,
    };

    if (level !== "all") where.academicLevel = level;
    if (status !== "all") where.status = status;

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const students = await prisma.student.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        parent: true,
        enrollments: {
          include: {
            group: true,
          },
        },
        attendances: true,
        invoices: true,
      },
    });

    const formatted = students.map((s) => {
      const groupName = s.enrollments[0]?.group?.name || "فوج عام";
      const totalAttendances = s.attendances.length;
      const presentCount = s.attendances.filter((a) => a.status === "PRESENT").length;
      const attendanceRate = totalAttendances > 0 ? Math.round((presentCount / totalAttendances) * 100) : 0;

      const totalDue = s.invoices.reduce((acc, inv) => acc + inv.finalTotal, 0);
      const totalPaid = s.invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
      const balance = Math.max(0, totalDue - totalPaid);

      const wilayaName =
        ALGERIAN_WILAYAS.find((w) => w.code === s.wilayaCode)?.nameAr || `ولاية ${s.wilayaCode}`;
      const instCode = session.institutionId.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase();
      const stableNumber = s.studentNumber || `MP-2026-${instCode}-${s.id.slice(0, 4).toUpperCase()}`;

      return {
        id: s.id,
        studentNumber: stableNumber,
        photoUrl: s.photoUrl || null,
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        email: s.email,
        gender: s.gender,
        dateOfBirth: s.dateOfBirth,
        wilayaCode: s.wilayaCode,
        wilayaName,
        address: s.address || "",
        academicLevel: s.academicLevel,
        stream: s.stream,
        groupName,
        groupId: s.enrollments[0]?.groupId || "",
        parentId: s.parentId,
        parentName: s.parent?.fullName || "الولي",
        parentPhone: s.parent?.phone || "",
        parentRelationship: s.parent?.relationship || "الأب",
        enrollmentDate: s.enrollmentDate || "",
        status: s.status.toLowerCase(),
        attendanceRate,
        averageGrade: 15.0,
        totalDue,
        totalPaid,
        balance,
        monthlyFee: s.monthlyFee,
      };
    });

    return NextResponse.json({ students: formatted });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/students - Register a new student
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();

    const parseResult = studentSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "بيانات الطالب غير صالحة";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = parseResult.data;

    // Use Prisma interactive transaction for race-condition safe limit check and atomic creation
    const result = await prisma.$transaction(async (tx) => {
      // 0. Enforce Subscription Limit for Students atomically inside transaction
      await assertWithinLimit(session.institutionId, "students", tx);

      // 1. Create or link Parent
      let parent = await tx.parent.findFirst({
        where: {
          institutionId: session.institutionId,
          phone: data.parentPhone,
        },
      });

      if (!parent) {
        parent = await tx.parent.create({
          data: {
            institutionId: session.institutionId,
            fullName: data.parentName,
            phone: data.parentPhone,
            relationship: data.parentRelationship,
          },
        });
      }

      // 2. Generate unique stable student registration number (MP-2026-XXXX)
      const studentCount = await tx.student.count({
        where: { institutionId: session.institutionId },
      });
      const instCode = session.institutionId.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase();
      let studentNumber = data.studentNumber || `MP-2026-${instCode}-${String(studentCount + 1).padStart(4, "0")}`;
      let collision = await tx.student.findFirst({
        where: { institutionId: session.institutionId, studentNumber },
      });
      let counter = studentCount + 1;
      while (collision) {
        counter++;
        studentNumber = `MP-2026-${instCode}-${String(counter).padStart(4, "0")}`;
        collision = await tx.student.findFirst({
          where: { institutionId: session.institutionId, studentNumber },
        });
      }

      // 3. Create Student
      const student = await tx.student.create({
        data: {
          institutionId: session.institutionId,
          branchId: session.branchId || undefined,
          parentId: parent.id,
          studentNumber,
          photoUrl: data.photoUrl || undefined,
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
          phone: data.phone || data.parentPhone || parent.phone || "0550000000",
          email: data.email || undefined,
          wilayaCode: data.wilayaCode,
          address: data.address,
          academicLevel: data.academicLevel,
          stream: data.stream,
          monthlyFee: data.monthlyFee,
          status: "ACTIVE",
          enrollmentDate: new Date().toISOString().split("T")[0],
        },
      });

      // 3. Create Enrollment if groupId provided and exists in institution
      let groupRecord = null;
      if (data.groupId && data.groupId !== "none" && data.groupId !== "") {
        groupRecord = await tx.classGroup.findFirst({
          where: { id: data.groupId, institutionId: session.institutionId },
        });
        if (groupRecord) {
          await tx.enrollment.create({
            data: {
              studentId: student.id,
              groupId: groupRecord.id,
            },
          });
        }
      }

      // 4. Create Initial Registration Invoice
      const invoiceCount = await tx.invoice.count({
        where: { institutionId: session.institutionId },
      });
      let invNumber = `INV-2026-${instCode}-${String(invoiceCount + 1).padStart(4, "0")}`;
      let invCollision = await tx.invoice.findUnique({ where: { invoiceNumber: invNumber } });
      let invCounter = invoiceCount + 1;
      while (invCollision) {
        invCounter++;
        invNumber = `INV-2026-${instCode}-${String(invCounter).padStart(4, "0")}`;
        invCollision = await tx.invoice.findUnique({ where: { invoiceNumber: invNumber } });
      }
      const invoiceTotal = Math.max(0, data.monthlyFee + data.registrationFee - data.discount);

      await tx.invoice.create({
        data: {
          institutionId: session.institutionId,
          invoiceNumber: invNumber,
          studentId: student.id,
          parentId: parent.id,
          issueDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          subtotal: data.monthlyFee + data.registrationFee,
          discountTotal: data.discount,
          finalTotal: invoiceTotal,
          amountPaid: 0,
          status: "UNPAID",
          items: {
            create: [
              { description: `اشتراك شهري — ${data.academicLevel}`, amount: data.monthlyFee },
              { description: "حقوق التسجيل السنوية", amount: data.registrationFee },
            ],
          },
        },
      });

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          institutionId: session.institutionId,
          userId: session.userId,
          action: "STUDENT_REGISTERED",
          entity: "Student",
          entityId: student.id,
          details: `تسجيل الطالب الجديد ${student.firstName} ${student.lastName} في المستوى ${student.academicLevel}`,
        },
      });

      const wilayaName =
        ALGERIAN_WILAYAS.find((w) => w.code === student.wilayaCode)?.nameAr || `ولاية ${student.wilayaCode}`;

      return {
        id: student.id,
        studentNumber: student.studentNumber,
        photoUrl: student.photoUrl || null,
        firstName: student.firstName,
        lastName: student.lastName,
        phone: student.phone || parent.phone,
        email: student.email,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        wilayaCode: student.wilayaCode,
        wilayaName,
        address: student.address || "",
        academicLevel: student.academicLevel,
        stream: student.stream,
        groupName: groupRecord ? groupRecord.name : "بدون فوج حالياً",
        groupId: groupRecord ? groupRecord.id : "",
        parentId: parent.id,
        parentName: parent.fullName,
        parentPhone: parent.phone,
        parentRelationship: parent.relationship,
        enrollmentDate: student.enrollmentDate,
        status: student.status.toLowerCase(),
        attendanceRate: 0,
        averageGrade: 15.0,
        totalDue: invoiceTotal,
        totalPaid: 0,
        balance: invoiceTotal,
        monthlyFee: student.monthlyFee,
      };
    });

    return NextResponse.json({ success: true, student: result });
  } catch (error) {
    return handleApiError(error);
  }
}
