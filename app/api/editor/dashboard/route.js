import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Fetch counts
    const totalTopics = await prisma.contentItem.count();
    const published = await prisma.contentItem.count({ where: { workflowStatus: "Published" } });
    const inEditing = await prisma.contentItem.count({ where: { workflowStatus: "Editing" } });
    const scripted = await prisma.contentItem.count({ where: { workflowStatus: "Scripted" } });
    const underReview = await prisma.contentItem.count({
      where: {
        workflowStatus: { in: ["Under_Review", "Post_Editing"] }
      }
    });
    const readyForVideo = await prisma.contentItem.count({ where: { workflowStatus: "ReadyForVideoPrep" } });

    // 2. Fetch topics in progress (not Published)
    const topicsInProgress = await prisma.contentItem.findMany({
      where: {
        workflowStatus: {
          not: "Published"
        }
      },
      include: {
        section: {
          include: {
            course: {
              include: {
                program: true,
              },
            },
          },
        },
      },
    });

    // Helper to map DB status to Frontend status
    const mapStatus = (status) => {
      const map = {
        "Post_Editing": "Ready_for_Video_Prep",
        "ReadyForVideoPrep": "Ready_for_Video_Prep",
        "Under_Review": "Under_Review",
        "Published": "Published"
      };
      return map[status] || status;
    };

    // 3. Format data
    const formattedTopics = topicsInProgress.map((topic) => ({
      content_id: topic.id,
      topic_title: topic.title,
      workflow_status: mapStatus(topic.workflowStatus),
      estimated_duration_min: topic.estimatedDurationMin,
      course_title: topic.section?.course?.title || "Unknown Course",
      unit_title: topic.section?.title || "Unknown Unit",
      program_name: topic.section?.course?.program?.programName || "Unknown Program",
      video_link: topic.videoLink,
      review_notes: topic.reviewNotes,
    }));

    return NextResponse.json({
      stats: {
        totalTopics,
        published,
        inEditing,
        scripted,
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
