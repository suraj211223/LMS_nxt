import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

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
    await prisma.school.create({
      data: {
        name: schoolName,
      },
    });

    return NextResponse.json({
      success: true,
      message: "School created successfully",
    });
  } catch (err) {
    console.error("Admin Create School Error:", err);
    // Check for unique constraint violation
    if (err.code === "P2002" && err.meta?.target?.includes("name")) {
      return NextResponse.json(
        { error: "School with this name already exists" },
        { status: 409 } // 409 Conflict
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error", details: String(err) },
      { status: 500 }
    );
  }
}
