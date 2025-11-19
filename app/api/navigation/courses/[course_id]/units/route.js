import { NextResponse } from "next/server";
import { pool } from "../../../../../../lib/db";

export const runtime = "nodejs";

export async function GET(req, { params }) {
  const { course_id } = await params;

  try {
    const [rows] = await pool.query(
      `SELECT 
          section_id,
          title AS unit_title,
          unit_code,
          prof_name,
          storage_path,
          ppt_filename
       FROM CourseSections
       WHERE course_id = ?
       ORDER BY order_index ASC`,
      [course_id]
    );

    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
