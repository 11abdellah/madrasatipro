import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, handleApiError } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/students/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const student = await prisma.student.findFirst({
      where: {
        id: params.id,
        institutionId: session.institutionId,
      },
      include: {
        parent: true,
        enrollments: {
          include: { group: true },
        },
        attendances: {
          include: { session: true },
          orderBy: { recordedAt: "desc" },
          take: 10,
        },
        invoices: {
          include: { items: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "الطالب غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/students/[id] - Update student information
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();

    // Check student ownership
    const existingStudent = await prisma.student.findFirst({
      where: {
        id: params.id,
        institutionId: session.institutionId,
      },
      include: {
        parent: true,
      },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "الطالب غير موجود أو ليس لديك صلاحية تعديله" }, { status: 404 });
    }

    const updatedStudent = await prisma.$transaction(async (tx) => {
      // 1. Update or link Parent if provided
      let parentId = existingStudent.parentId;
      if (body.parentName || body.parentPhone || body.parentRelationship) {
        if (parentId) {
          await tx.parent.update({
            where: { id: parentId },
            data: {
              fullName: body.parentName || undefined,
              phone: body.parentPhone || undefined,
              relationship: body.parentRelationship || undefined,
            },
          });
        } else if (body.parentPhone) {
          const newParent = await tx.parent.create({
            data: {
              institutionId: session.institutionId,
              fullName: body.parentName || "الولي",
              phone: body.parentPhone,
              relationship: body.parentRelationship || "الأب",
            },
          });
          parentId = newParent.id;
        }
      }

      // 2. Update Student fields
      const updated = await tx.student.update({
        where: { id: existingStudent.id },
        data: {
          parentId,
          firstName: body.firstName !== undefined ? body.firstName : undefined,
          lastName: body.lastName !== undefined ? body.lastName : undefined,
          phone: body.phone !== undefined ? body.phone : undefined,
          email: body.email !== undefined ? body.email : undefined,
          gender: body.gender !== undefined ? body.gender : undefined,
          dateOfBirth: body.dateOfBirth !== undefined ? body.dateOfBirth : undefined,
          wilayaCode: body.wilayaCode !== undefined ? Number(body.wilayaCode) : undefined,
          address: body.address !== undefined ? body.address : undefined,
          academicLevel: body.academicLevel !== undefined ? body.academicLevel : undefined,
          stream: body.stream !== undefined ? body.stream : undefined,
          monthlyFee: body.monthlyFee !== undefined ? Number(body.monthlyFee) : undefined,
          status: body.status !== undefined ? body.status.toUpperCase() : undefined,
          photoUrl: body.photoUrl !== undefined ? body.photoUrl : undefined,
        },
      });

      // 3. Update Group Enrollment if groupId provided
      if (body.groupId !== undefined) {
        await tx.enrollment.deleteMany({
          where: { studentId: existingStudent.id },
        });

        if (body.groupId && body.groupId.trim() !== "") {
          await tx.enrollment.create({
            data: {
              studentId: existingStudent.id,
              groupId: body.groupId,
            },
          });
        }
      }

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          institutionId: session.institutionId,
          userId: session.userId,
          action: "STUDENT_UPDATED",
          entity: "Student",
          entityId: existingStudent.id,
          details: JSON.stringify({
            updatedFields: Object.keys(body),
          }),
        },
      });

      return updated;
    });

    return NextResponse.json({ success: true, student: updatedStudent });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/students/[id] - Cascade safe deletion
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();

    // Verify student ownership
    const student = await prisma.student.findFirst({
      where: {
        id: params.id,
        institutionId: session.institutionId,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "الطالب غير موجود أو ليس لديك صلاحية حذفه" }, { status: 404 });
    }

    // Atomic cascade deletion in a transaction to satisfy foreign key constraints
    await prisma.$transaction(async (tx) => {
      // 1. Delete payments associated with this student
      await tx.payment.deleteMany({
        where: { studentId: student.id },
      });

      // 2. Delete invoice items then invoices
      await tx.invoiceItem.deleteMany({
        where: { invoice: { studentId: student.id } },
      });
      await tx.invoice.deleteMany({
        where: { studentId: student.id },
      });

      // 3. Delete grades
      await tx.grade.deleteMany({
        where: { studentId: student.id },
      });

      // 4. Delete attendances
      await tx.attendance.deleteMany({
        where: { studentId: student.id },
      });

      // 5. Delete group enrollments
      await tx.enrollment.deleteMany({
        where: { studentId: student.id },
      });

      // 6. Delete student
      await tx.student.delete({
        where: { id: student.id },
      });

      // 7. Audit Log
      await tx.auditLog.create({
        data: {
          institutionId: session.institutionId,
          userId: session.userId,
          action: "STUDENT_DELETED",
          entity: "Student",
          entityId: student.id,
          details: JSON.stringify({
            name: `${student.firstName} ${student.lastName}`,
            academicLevel: student.academicLevel,
          }),
        },
      });
    });

    return NextResponse.json({ success: true, message: "تم حذف الطالب وجميع سجلاته بنجاح" });
  } catch (error) {
    return handleApiError(error);
  }
}
