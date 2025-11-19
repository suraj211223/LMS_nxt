import { NextResponse } from "next/server";
import { pool } from "../../../../../../lib/db";

export const runtime = "nodejs";

export async function GET(req, { params }) {
  const { program_id } = await params;

  try {
    const [rows] = await pool.query(
      `SELECT course_id, title AS course_name, course_code, status
       FROM Courses
       WHERE program_id = ?`,
      [program_id]
    );

    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
