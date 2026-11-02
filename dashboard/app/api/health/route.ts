import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ status: "degraded", database: "not_configured" }, { status: 503 });
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "ok" });
  } catch (error) {
    console.error("Dashboard health check failed", error);
    return NextResponse.json({ status: "degraded", database: "unavailable" }, { status: 503 });
  }
}
