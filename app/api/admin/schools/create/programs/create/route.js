import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { school_id, program_name, program_code } = await req.json();

    if (!school_id || !program_name || !program_code) {
      return NextResponse.json(
        { error: "school_id, program_name, and program_code are required" },
        { status: 400 }
      );
    }

    const school = await prisma.school.findUnique({
      where: { id: parseInt(school_id) },
    });

    if (!school) {
      return NextResponse.json(
        { error: "Invalid school_id: school does not exist" },
        { status: 404 }
      );
    }

    await prisma.program.create({
      data: {
        schoolId: parseInt(school_id),
        programName: program_name,
        programCode: program_code,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Program created successfully",
    });
  } catch (err) {
    console.error("Admin Create Program Error:", err);
    if (err.code === "P2002" && err.meta?.target?.includes("programCode")) {
      return NextResponse.json(
        { error: "A program with this code already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error", details: String(err) },
      { status: 500 }
    );
  }
}
