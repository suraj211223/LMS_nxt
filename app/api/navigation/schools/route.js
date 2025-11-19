import { NextResponse } from "next/server";
import { pool } from "../../../../lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT school_id, school_name FROM Schools");
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
