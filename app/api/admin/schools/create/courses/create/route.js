import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { program_id, course_code, title } = body;

    // Remove status from input if not needed, as schema sets default
    if (!program_id || !course_code || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        programId: parseInt(program_id), // Parsing int
        title: title,
        courseCode: course_code,
        // status: "Active" // Prisma default 'Active' will take over
      },
    });

    return NextResponse.json({
      success: true,
      course_id: course.id,
    });

  } catch (err) {
    console.error("ADMIN CREATE COURSE ERROR:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
