import { NextResponse } from "next/server";
import { getTotalAuditCount } from "@/lib/leads";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await getTotalAuditCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
