import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function GET() {
  try {
    const totalTopics = await prisma.content.count();
    const published = await prisma.content.count({ where: { workflow_status: "Published" } });
    const inEditing = await prisma.content.count({ where: { workflow_status: "Editing" } });
    const underReview = await prisma.content.count({ where: { workflow_status: "Under_Review" } });
    const readyForVideo = await prisma.content.count({ where: { workflow_status: "Ready_for_Video_Prep" } });

    const topicsInProgress = await prisma.content.findMany({
      where: {
        workflow_status: {
          not: "Published",
        },
      },
      include: {
        units: {
          include: {
            courses: {
              include: {
                programs: true,
              },
            },
          },
        },
      },
    });

    const formattedTopics = topicsInProgress.map((topic) => ({
      content_id: topic.content_id,
      topic_title: topic.name,
      workflow_status: topic.workflow_status,
      estimated_duration_min: topic.estimated_duration,
      course_title: topic.units.courses.name,
      unit_title: topic.units.name,
      program_name: topic.units.courses.programs.program_name,
    }));

    return NextResponse.json({
      stats: {
        totalTopics,
        published,
        inEditing,
        underReview,
        readyForVideo,
      },
      topicsInProgress: formattedTopics,
    });
  } catch (error) {
    console.error("Error fetching editor dashboard data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
