import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, handleApiError } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/classrooms - Fetch all classrooms for current institution
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const where: any = {
      institutionId: session.institutionId,
    };

    if (search.trim()) {
      where.OR = [
        { name: { contains: search.trim() } },
        { roomCode: { contains: search.trim() } },
        { description: { contains: search.trim() } },
      ];
    }

    const classrooms = await prisma.classroom.findMany({
      where,
      orderBy: [{ name: "asc" }],
      include: {
        branch: { select: { id: true, name: true } },
        _count: {
          select: {
            sessions: true,
            classGroups: true,
          },
        },
      },
    });

    const totalRooms = classrooms.length;
    const totalCapacity = classrooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
    const roomsWithSessions = classrooms.filter((r) => r._count.sessions > 0).length;

    return NextResponse.json({
      success: true,
      classrooms: classrooms.map((r) => ({
        id: r.id,
        name: r.name,
        roomCode: r.roomCode || "",
        capacity: r.capacity,
        description: r.description || "",
        branchName: r.branch?.name || "المقر الرئيسي",
        branchId: r.branchId,
        sessionsCount: r._count.sessions,
        groupsCount: r._count.classGroups,
        createdAt: r.createdAt,
      })),
      stats: {
        totalRooms,
        totalCapacity,
        activeRooms: roomsWithSessions,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/classrooms - Create a new classroom
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    const { name, roomCode, capacity, description, branchId } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "يرجى إدخال اسم القاعة الدراسية" },
        { status: 400 }
      );
    }

    const numCapacity = Number(capacity);
    if (isNaN(numCapacity) || numCapacity <= 0) {
      return NextResponse.json(
        { error: "سعة القاعة يجب أن تكون عدداً صحيحاً أكبر من الصفر" },
        { status: 400 }
      );
    }

    // Resolve branch
    let finalBranchId = branchId;
    if (!finalBranchId) {
      const defaultBranch = await prisma.branch.findFirst({
        where: { institutionId: session.institutionId },
      });
      finalBranchId = defaultBranch?.id;
    }

    const classroom = await prisma.classroom.create({
      data: {
        institutionId: session.institutionId,
        branchId: finalBranchId || undefined,
        name: name.trim(),
        roomCode: roomCode ? String(roomCode).trim() : null,
        capacity: numCapacity,
        description: description ? String(description).trim() : null,
      },
      include: {
        branch: { select: { id: true, name: true } },
        _count: {
          select: { sessions: true, classGroups: true },
        },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        institutionId: session.institutionId,
        userId: session.userId,
        action: "CLASSROOM_CREATED",
        entity: "Classroom",
        entityId: classroom.id,
        details: JSON.stringify({
          name: classroom.name,
          roomCode: classroom.roomCode,
          capacity: classroom.capacity,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم إنشاء القاعة الدراسية بنجاح",
      classroom: {
        id: classroom.id,
        name: classroom.name,
        roomCode: classroom.roomCode || "",
        capacity: classroom.capacity,
        description: classroom.description || "",
        branchName: classroom.branch?.name || "المقر الرئيسي",
        branchId: classroom.branchId,
        sessionsCount: 0,
        groupsCount: 0,
        createdAt: classroom.createdAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
