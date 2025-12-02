import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    // Test database connection and check tables
    const tables = await prisma.$queryRaw`SHOW TABLES`;
    console.log("Database tables:", tables);
    
    const courses = await prisma.course.findMany({
      take: 5,
    });
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
