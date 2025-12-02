import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(req, { params }) {
  const { program_id } = params;

  try {
    const courses = await prisma.courses.findMany({
      where: { program_id: parseInt(program_id) },
      select: {
        course_id: true,
        title: true,
        course_code: true,
        status: true,
      },
    });

    return NextResponse.json(courses);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
