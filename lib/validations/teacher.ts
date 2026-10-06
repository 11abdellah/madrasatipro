import { z } from "zod";

export const teacherSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "الاسم مطلوب ويجب أن يتكون من حرفين على الأقل" })
    .max(50, { message: "الاسم طويل جدًا" }),
  lastName: z
    .string()
    .min(2, { message: "اللقب مطلوب ويجب أن يتكون من حرفين على الأقل" })
    .max(50, { message: "اللقب طويل جدًا" }),
  email: z
    .string()
    .email({ message: "صيغة البريد الإلكتروني غير صحيحة" }),
  phone: z
    .string()
    .min(9, { message: "رقم الهاتف غير صالح (يجب أن يبدأ بـ 05 أو 06 أو 07)" }),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female"]).default("male"),
  wilayaCode: z.number().default(19),
  address: z.string().optional(),

  specialization: z.string().optional(),
  subjects: z
    .array(z.string())
    .min(1, { message: "يرجى تحديد مادة واحدة على الأقل" }),
  yearsExperience: z.number().min(0).default(0),
  contractType: z.enum(["hourly", "fixed", "percentage", "monthly"]).default("hourly"),
  joinDate: z.string().optional(),
  startDate: z.string().optional(),

  wageType: z.enum(["hourly", "fixed", "percentage", "monthly"]).default("hourly"),
  hourlyRate: z.number().min(0, { message: "سعر الساعة يجب أن يكون 0 دج أو أكثر" }).default(2000),
  fixedSalary: z.number().min(0).default(0),
  percentageShare: z.number().min(0).max(100).default(0),

  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).default("ACTIVE"),
  notes: z.string().optional(),
  branchId: z.string().optional(),
});

export type TeacherInput = z.infer<typeof teacherSchema>;
