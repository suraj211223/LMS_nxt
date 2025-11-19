import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";

export async function GET() {
  try {
    // Test database connection and check tables
    const [tables] = await pool.query("SHOW TABLES");
    console.log("Database tables:", tables);
    
    const [courses] = await pool.query("SELECT * FROM Courses LIMIT 5");
    console.log("Sample courses:", courses);
    
    return NextResponse.json({
      success: true,
      tables: tables.map(row => Object.values(row)[0]),
      courses: courses
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
