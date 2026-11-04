import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getMemoryAnalysis } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ error: "Missing slug." }, { status: 400 });
    }

    // 1. Try Neon Database if configured
    if (process.env.DATABASE_URL) {
      try {
        const rows = await sql`
          SELECT * FROM analyses WHERE slug = ${slug} LIMIT 1
        `;

        if (rows.length > 0) {
          const row = rows[0];
          return NextResponse.json({
            ...row,
            net_worth: parseFloat(row.net_worth || "0"),
          });
        }
      } catch (dbErr) {
        console.warn("DB query failed, falling back to memory cache:", dbErr);
      }
    }

    // 2. Fall back to in-memory store
    const memData = getMemoryAnalysis(slug);
    if (memData) {
      return NextResponse.json(memData);
    }

    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  } catch (err) {
    console.error("Report fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch report." },
      { status: 500 }
    );
  }
}
