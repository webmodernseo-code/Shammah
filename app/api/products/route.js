import { NextResponse } from "next/server";
import { fetchDatabaseProducts } from "@/lib/neon-products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await fetchDatabaseProducts();
    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: [],
    });
  }
}

