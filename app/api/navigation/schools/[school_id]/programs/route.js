import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";
//...
export async function GET(req, { params }) {
  const { school_id } = params;

  try {
    const programs = await prisma.program.findMany({
      where: { schoolId: parseInt(school_id) },
      select: {
        id: true,
        programName: true,
        programCode: true,
      },
    });
    const renamedPrograms = programs.map((program) => ({
      program_id: program.id,
      program_name: program.programName,
      program_code: program.programCode,
    }));
    return NextResponse.json(renamedPrograms);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
