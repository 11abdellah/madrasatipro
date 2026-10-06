import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: "تم تسجيل الخروج بنجاح" });
  response.cookies.delete("noubla_session");
  response.cookies.delete("noubla_tenant_override");
  return response;
}
