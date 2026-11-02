import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdmin, readSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = readSession(req);

  if (!session || !(await isAdmin(req))) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.userId,
      email: session.email,
      name: session.email,
      role: session.role,
    },
  });
}
