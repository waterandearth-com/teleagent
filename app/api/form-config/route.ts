import { NextResponse } from "next/server";
import { readFormConfig } from "@/lib/form-config";

export const runtime = "nodejs";

export async function GET() {
  try {
    const config = await readFormConfig();
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
