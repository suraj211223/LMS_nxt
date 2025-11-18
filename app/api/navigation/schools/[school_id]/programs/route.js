import { NextResponse } from "next/server";
import { pool } from "../../../../../../lib/db";

export const runtime = "nodejs";

export async function GET(req, { params }) {
  const { school_id } = await params;

  try {
    const [rows] = await pool.query(
      "SELECT program_id, program_name, program_code FROM Programs WHERE school_id = ?",
      [school_id]
    );
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
