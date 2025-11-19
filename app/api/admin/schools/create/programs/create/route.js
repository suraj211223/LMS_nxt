import { NextResponse } from "next/server";
import { pool } from "../../../../../lib/db";

export async function POST(req) {
  try {
    const { school_id, program_name, program_code } = await req.json();

    //basic validation
    if (!school_id || !program_name || !program_code) {
      return NextResponse.json(
        { error: "school_id, program_name, and program_code are required" },
        { status: 400 }
      );
    }

    //verify school
    const [schoolRows] = await pool.query(
      "SELECT school_id FROM Schools WHERE school_id = ?",
      [school_id]
    );

    if (schoolRows.length === 0) {
      return NextResponse.json(
        { error: "Invalid school_id: school does not exist" },
        { status: 404 }
      );
    }

    //insert Program (duplicate-safe)
    await pool.query(
      `INSERT INTO Programs (school_id, program_name, program_code)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE program_name = program_name`,
      [school_id, program_name, program_code]
    );

    return NextResponse.json({
      success: true,
      message: "Program created successfully",
    });
  } catch (err) {
    console.error("Admin Create Program Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(err) },
      { status: 500 }
    );
  }
}
