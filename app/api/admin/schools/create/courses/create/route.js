import { NextResponse } from "next/server";
import prisma from "../../../../../../../lib/prisma";

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

    const course = await prisma.course.create({
      data: {
        programId: program_id,
        title: title,
        courseCode: course_code,
        status: status || "Active",
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
