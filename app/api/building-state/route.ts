import { NextResponse } from "next/server";

export const runtime = "nodejs";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const stateKey = "building-cost-state";
const maxBodySize = 200_000;

async function redisCommand(command: unknown[]) {
  if (!redisUrl || !redisToken) {
    throw new Error("Storage is not configured");
  }

  const response = await fetch(redisUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${redisToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Storage request failed with status ${response.status}`);
  }

  return (await response.json()) as { result?: unknown };
}

export async function GET() {
  if (!redisUrl || !redisToken) {
    return NextResponse.json({ success: false, configured: false }, { status: 503 });
  }

  try {
    const response = await redisCommand(["GET", stateKey]);
    const state = typeof response.result === "string" ? JSON.parse(response.result) : null;
    return NextResponse.json({ success: true, configured: true, state });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, configured: true }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!redisUrl || !redisToken) {
    return NextResponse.json({ success: false, configured: false }, { status: 503 });
  }

  try {
    const body = await request.text();
    if (!body || body.length > maxBodySize) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    JSON.parse(body);
    await redisCommand(["SET", stateKey, body]);
    return NextResponse.json({ success: true, configured: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, configured: true }, { status: 400 });
  }
}
