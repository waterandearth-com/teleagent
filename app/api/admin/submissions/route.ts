import { NextResponse } from "next/server";
import { listSubmissions } from "@/lib/submissions";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const providedPassword = request.headers.get("x-admin-password");

  if (!configuredPassword || providedPassword !== configuredPassword) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const submissions = await listSubmissions();
    return NextResponse.json({ success: true, submissions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
