import { z } from "zod";

export const studentSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "اسم الطالب مطلوب ويجب أن يتكون من حرفين على الأقل" }),
  lastName: z
    .string()
    .min(2, { message: "لقب الطالب مطلوب ويجب أن يتكون من حرفين على الأقل" }),
  gender: z.enum(["male", "female"]).default("male"),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }).optional().or(z.literal("")),
  wilayaCode: z.coerce.number().default(19),
  address: z.string().optional(),

  academicLevel: z.string().min(1, { message: "يرجى تحديد المستوى الدراسي" }),
  stream: z.string().optional(),
  groupId: z.string().optional().or(z.literal("")),

  parentName: z.string().min(2, { message: "اسم ولي الأمر مطلوب" }),
  parentPhone: z.string().min(9, { message: "رقم هاتف ولي الأمر غير صالح" }),
  parentRelationship: z.string().default("الأب"),

  studentNumber: z.string().optional(),
  photoUrl: z.string().optional().or(z.literal("")),

  monthlyFee: z.coerce.number().min(0).default(4000),
  registrationFee: z.coerce.number().min(0).default(2000),
  discount: z.coerce.number().min(0).default(0),
  paymentMethod: z.string().default("cash"),
});

export type StudentInput = z.infer<typeof studentSchema>;
