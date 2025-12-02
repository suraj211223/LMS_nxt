import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const form = await req.formData();

    const course_id = form.get("course_id");
    const unit_title = form.get("unit_title");
    const unit_code = form.get("unit_code");
    const prof_name = form.get("prof_name");

    const pptFile = form.get("ppt");
    const materialsFile = form.get("materials");

    if (!course_id || !unit_title || !unit_code || !prof_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure the course exists
    const course = await prisma.course.findUnique({
      where: { id: parseInt(course_id) },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Calculate the next order_index for the new unit
    const nextOrderIndex = await prisma.courseSection.aggregate({
      where: { courseId: parseInt(course_id) },
      _max: { orderIndex: true },
    });

    const orderIndex = (nextOrderIndex._max.orderIndex || 0) + 1;

    // Ensure section exists or create it
    const section = await prisma.courseSection.upsert({
      where: { courseId_title: { courseId: parseInt(course_id), title: unit_title } },
      update: { orderIndex: orderIndex, unitCode: unit_code, profName: prof_name },
      create: {
        courseId: parseInt(course_id),
        title: unit_title,
        orderIndex: orderIndex,
        unitCode: unit_code,
        profName: prof_name,
      },
    });

    // Ensure content exists or create it
    const content = await prisma.contentItem.upsert({
      where: { sectionId_title: { sectionId: section.id, title: unit_title } },
      update: {},
      create: {
        sectionId: section.id,
        title: unit_title,
        workflowStatus: "Planned",
      },
    });

    let pptFileData = null;
    if (pptFile) {
      const arrayBuffer = await pptFile.arrayBuffer();
      pptFileData = Buffer.from(arrayBuffer);
    }

    let materialsFileData = null;
    if (materialsFile) {
      const arrayBuffer = await materialsFile.arrayBuffer();
      materialsFileData = Buffer.from(arrayBuffer);
    }

    // Insert into contentscripts
    await prisma.contentscript.create({
      data: {
        contentId: content.id,
        pptFileData: pptFileData,
        docFileData: materialsFileData,
        introductionScript: unit_title,
        instructionsForEditor: prof_name,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Unit created and files stored successfully",
    });
  } catch (err) {
    console.error("create-unit route error:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
