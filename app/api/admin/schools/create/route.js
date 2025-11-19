import { NextResponse } from "next/server";
import { pool } from "../../../../../lib/db";

export async function POST(req) {
  try {
    const { schoolName } = await req.json();

    if (!schoolName) {
      return NextResponse.json(
        { error: "School name is required" },
        { status: 400 }
      );
    }

    //insert school
    await pool.query(
      `INSERT INTO Schools (school_name) VALUES (?) 
       ON DUPLICATE KEY UPDATE school_name = school_name`,
      [schoolName]
    );

    return NextResponse.json({
      success: true,
      message: "School created successfully",
    });
  } catch (err) {
    console.error("Admin Create School Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(err) },
      { status: 500 }
    );
  }
}
