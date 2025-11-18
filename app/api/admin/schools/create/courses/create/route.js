import { NextResponse } from "next/server";
import { pool } from "../../../../../lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { program_id, course_code, title, status } = body;

    if (!program_id || !course_code || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      `INSERT INTO Courses (program_id, title, course_code, status)
       VALUES (?, ?, ?, ?)`,
      [program_id, title, course_code, status || "Active"]
    );

    return NextResponse.json({
      success: true,
      course_id: result.insertId,
    });

  } catch (err) {
    console.error("ADMIN CREATE COURSE ERROR:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
