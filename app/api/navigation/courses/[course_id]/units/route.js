import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(req, { params }) {
  const { course_id } = params;

  try {
    const sections = await prisma.courseSection.findMany({
      where: {
        courseId: parseInt(course_id),
      },
      select: {
        section_id: true,
        title: true,
        unit_code: true,
        prof_name: true,
        storage_path: true,
        ppt_filename: true,
      },
      orderBy: {
        order_index: "asc",
      },
    });

    const renamedSections = sections.map((section) => ({
      section_id: section.section_id,
      unit_title: section.title,
      unit_code: section.unit_code,
      prof_name: section.prof_name,
      storage_path: section.storage_path,
      ppt_filename: section.ppt_filename,
    }));

    return NextResponse.json(renamedSections);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
