import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";
//...
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (userId) {
      // Fetch programs for a specific user
      const assignments = await prisma.UserCourseAssignment.findMany({
        where: { userId: parseInt(userId) },
        select: {
          course: {
            select: {
              program: {
                select: {
                  id: true,
                  programName: true,
                  programCode: true,
                  school: {
                    select: {
                      name: true,
                      id: true,
                    },
                  },
                  _count: {
                    select: { courses: true },
                  },
                },
              },
            },
          },
        },
      });

      const programs = assignments.map((assignment) => {
        const program = assignment.course.program;
        return {
          program_id: program.id,
          program_name: program.programName,
          program_code: program.programCode,
          school_name: program.school?.name || null,
          school_id: program.school?.id || null,
          course_count: program._count.courses,
        };
      });

      return NextResponse.json({ programs });
    }

    // Fetch all programs
    const programs = await prisma.program.findMany({
      include: {
        school: true,
        _count: {
          select: { courses: true },
        },
      },
      orderBy: [{ school: { name: "asc" } }, { programName: "asc" }],
    });

    const formattedPrograms = programs.map((program) => ({
      program_id: program.id,
      program_name: program.programName,
      program_code: program.programCode,
      school_name: program.school?.name || null,
      school_id: program.school?.id || null,
      course_count: program._count.courses,
    }));

    return NextResponse.json({ programs: formattedPrograms });
  } catch (err) {
    console.error("GET programs error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
