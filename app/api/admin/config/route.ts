import { NextResponse } from "next/server";
import { readFormConfig, writeFormConfig } from "@/lib/form-config";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const providedPassword = request.headers.get("x-admin-password");

  return Boolean(configuredPassword && providedPassword === configuredPassword);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const config = await readFormConfig();
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { config?: unknown };
    const config = await writeFormConfig(body.config);
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
