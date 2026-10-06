import { prisma } from "@/lib/prisma";

export class LimitExceededError extends Error {
  statusCode = 409;
  code = "PLAN_LIMIT_REACHED";
  resource: string;
  currentUsage: number;
  maxLimit: number;
  planName: string;

  constructor(resource: string, currentUsage: number, maxLimit: number, planName: string) {
    const resourceNamesAr: Record<string, string> = {
      students: "الطلاب",
      teachers: "الأساتذة",
      groups: "الأفواج",
      branches: "الفروع",
    };
    const resAr = resourceNamesAr[resource] || resource;
    const message = `لقد بلغت مؤسستكم الحد الأقصى المسموح به لعدد ${resAr} في خطتكم الحالية (${planName}: الحد الأقصى ${maxLimit}). يرجى ترقية الخطة لمتابعة الإضافة.`;
    super(message);
    this.name = "LimitExceededError";
    this.resource = resource;
    this.currentUsage = currentUsage;
    this.maxLimit = maxLimit;
    this.planName = planName;
  }
}

export class SubscriptionInactiveError extends Error {
  statusCode = 403;
  code = "SUBSCRIPTION_INACTIVE";
  status: string;

  constructor(status: string) {
    const statusAr: Record<string, string> = {
      SUSPENDED: "معلق",
      EXPIRED: "منتهي الصلاحية",
      PENDING_APPROVAL: "قيد المراجعة والاعتماد",
      CANCELLED: "ملغى",
    };
    const message = `اشتراك المؤسسة غير نشط حالياً (${statusAr[status] || status}). يرجى تجديد أو تفعيل الاشتراك للمتابعة.`;
    super(message);
    this.name = "SubscriptionInactiveError";
    this.status = status;
  }
}

export interface SubscriptionContext {
  subscription: {
    id: string;
    status: string;
    billingCycle: string;
    renewalDate: Date;
  };
  plan: {
    id: string;
    name: string;
    slug: string;
    maxStudents: number;
    maxTeachers: number;
    maxGroups: number;
    maxBranches: number;
    storageLimitGB: number;
  };
  usage: {
    students: number;
    teachers: number;
    groups: number;
    branches: number;
  };
  limits: {
    students: number;
    teachers: number;
    groups: number;
    branches: number;
  };
  percentages: {
    students: number;
    teachers: number;
    groups: number;
    branches: number;
  };
  remaining: {
    students: number;
    teachers: number;
    groups: number;
    branches: number;
  };
}

/**
 * Returns live subscription context and usage for an institution.
 * Dynamically queries database counts and limits.
 */
export async function getSubscriptionContext(
  institutionId: string,
  tx: any = prisma
): Promise<SubscriptionContext> {
  const subscription = await tx.subscription.findUnique({
    where: { institutionId },
    include: { plan: true },
  });

  if (!subscription || !subscription.plan) {
    // If no explicit subscription, return fallback starter tier
    const fallbackPlan = {
      id: "fallback-starter",
      name: "الخطة التجريبية (Starter)",
      slug: "starter",
      maxStudents: 50,
      maxTeachers: 10,
      maxGroups: 10,
      maxBranches: 1,
      storageLimitGB: 10,
    };
    const [students, teachers, groups, branches] = await Promise.all([
      tx.student.count({ where: { institutionId, status: { not: "ARCHIVED" } } }),
      tx.teacher.count({ where: { institutionId, status: { not: "ARCHIVED" } } }),
      tx.classGroup.count({ where: { institutionId } }),
      tx.branch.count({ where: { institutionId } }),
    ]);

    return {
      subscription: {
        id: "fallback",
        status: "ACTIVE",
        billingCycle: "MONTHLY",
        renewalDate: new Date(Date.now() + 30 * 86400000),
      },
      plan: fallbackPlan,
      usage: { students, teachers, groups, branches },
      limits: {
        students: fallbackPlan.maxStudents,
        teachers: fallbackPlan.maxTeachers,
        groups: fallbackPlan.maxGroups,
        branches: fallbackPlan.maxBranches,
      },
      percentages: {
        students: Math.min(100, Math.round((students / fallbackPlan.maxStudents) * 100)),
        teachers: Math.min(100, Math.round((teachers / fallbackPlan.maxTeachers) * 100)),
        groups: Math.min(100, Math.round((groups / fallbackPlan.maxGroups) * 100)),
        branches: Math.min(100, Math.round((branches / fallbackPlan.maxBranches) * 100)),
      },
      remaining: {
        students: Math.max(0, fallbackPlan.maxStudents - students),
        teachers: Math.max(0, fallbackPlan.maxTeachers - teachers),
        groups: Math.max(0, fallbackPlan.maxGroups - groups),
        branches: Math.max(0, fallbackPlan.maxBranches - branches),
      },
    };
  }

  const plan = subscription.plan;

  const [students, teachers, groups, branches] = await Promise.all([
    tx.student.count({ where: { institutionId, status: { not: "ARCHIVED" } } }),
    tx.teacher.count({ where: { institutionId, status: { not: "ARCHIVED" } } }),
    tx.classGroup.count({ where: { institutionId } }),
    tx.branch.count({ where: { institutionId } }),
  ]);

  return {
    subscription: {
      id: subscription.id,
      status: subscription.status,
      billingCycle: subscription.billingCycle,
      renewalDate: subscription.renewalDate,
    },
    plan: {
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      maxStudents: plan.maxStudents,
      maxTeachers: plan.maxTeachers,
      maxGroups: plan.maxGroups,
      maxBranches: plan.maxBranches,
      storageLimitGB: plan.storageLimitGB,
    },
    usage: { students, teachers, groups, branches },
    limits: {
      students: plan.maxStudents,
      teachers: plan.maxTeachers,
      groups: plan.maxGroups,
      branches: plan.maxBranches,
    },
    percentages: {
      students: Math.min(100, Math.round((students / plan.maxStudents) * 100)),
      teachers: Math.min(100, Math.round((teachers / plan.maxTeachers) * 100)),
      groups: Math.min(100, Math.round((groups / plan.maxGroups) * 100)),
      branches: Math.min(100, Math.round((branches / plan.maxBranches) * 100)),
    },
    remaining: {
      students: Math.max(0, plan.maxStudents - students),
      teachers: Math.max(0, plan.maxTeachers - teachers),
      groups: Math.max(0, plan.maxGroups - groups),
      branches: Math.max(0, plan.maxBranches - branches),
    },
  };
}

/**
 * Asserts that the institution is within its plan limits for the specified resource.
 * Must be executed within a database transaction (tx) during resource creation to prevent race conditions.
 * Throws LimitExceededError or SubscriptionInactiveError if check fails.
 */
export async function assertWithinLimit(
  institutionId: string,
  resource: "students" | "teachers" | "groups" | "branches",
  tx: any = prisma
): Promise<{ allowed: boolean; currentCount: number; maxAllowed: number; planName: string }> {
  const subscription = await tx.subscription.findUnique({
    where: { institutionId },
    include: { plan: true },
  });

  if (!subscription || !subscription.plan) {
    return { allowed: true, currentCount: 0, maxAllowed: 9999, planName: "الخطة الافتراضية" };
  }

  // Check subscription active status
  if (subscription.status !== "ACTIVE" && subscription.status !== "TRIAL") {
    throw new SubscriptionInactiveError(subscription.status);
  }

  const plan = subscription.plan;
  let currentCount = 0;
  let maxAllowed = 0;

  switch (resource) {
    case "students":
      currentCount = await tx.student.count({
        where: { institutionId, status: { not: "ARCHIVED" } },
      });
      maxAllowed = plan.maxStudents;
      break;

    case "teachers":
      currentCount = await tx.teacher.count({
        where: { institutionId, status: { not: "ARCHIVED" } },
      });
      maxAllowed = plan.maxTeachers;
      break;

    case "groups":
      currentCount = await tx.classGroup.count({
        where: { institutionId },
      });
      maxAllowed = plan.maxGroups;
      break;

    case "branches":
      currentCount = await tx.branch.count({
        where: { institutionId },
      });
      maxAllowed = plan.maxBranches;
      break;
  }

  if (currentCount >= maxAllowed) {
    throw new LimitExceededError(resource, currentCount, maxAllowed, plan.name);
  }

  return {
    allowed: true,
    currentCount,
    maxAllowed,
    planName: plan.name,
  };
}
