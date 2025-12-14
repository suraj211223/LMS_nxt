import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    let canPublish = false;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        include: { role: true }
      });
      canPublish = ["publisher"].includes(user?.role?.roleName?.toLowerCase()) || user?.role?.canPublishContent || false;
    }

    // 1. Fetch Active courses (same as course list)
    const courses = await prisma.course.findMany({
      where: {
        status: "Active"
      },
      include: {
        sections: {
          include: {
            contents: {
              include: {
                assignedEditor: {
                  include: { role: true }
                },
                contentscript: {
                  select: {
                    pptFileData: true,
                    docFileData: true,
                    zipFileData: true
                  }
                }
              }
            }
          }
        },
        program: true
      }
    });

    // 2. Calculate stats from fetched courses
    let totalTopics = 0;
    let published = 0;
    let inEditing = 0;
    let scripted = 0;
    let underReview = 0;
    let readyForVideo = 0;
    let approved = 0;

    const topicsInProgress = [];

    courses.forEach(course => {
      course.sections.forEach(section => {
        totalTopics += section.contents.length;

        section.contents.forEach(topic => {
          // Stats Counting
          if (topic.workflowStatus === "Published") published++;
          if (topic.workflowStatus === "Editing") inEditing++;
          if (topic.workflowStatus === "Scripted") scripted++;
          if (topic.workflowStatus === "Under_Review") underReview++;
          if (topic.workflowStatus === "Approved") approved++;
          if (topic.workflowStatus === "ReadyForVideoPrep" || topic.workflowStatus === "Post_Editing") readyForVideo++;

          // Topics In Progress List (Everything except Planned)
          // We want to show Scripted, Editing, Post-Editing, Ready, Under Review, Approved, Published
          if (topic.workflowStatus !== "Planned" && topic.workflowStatus !== "Published") {
            topicsInProgress.push({
              content_id: topic.id,
              topic_title: topic.title,
              workflow_status: topic.workflowStatus, // Will be mapped below
              estimated_duration_min: topic.estimatedDurationMin,
              course_title: course.title,
              unit_title: section.title,
              program_name: course.program?.programName || "Unknown Program",
              video_link: topic.videoLink,
              additionalLink: topic.additionalLink, // Fetch Additional Link
              review_notes: topic.reviewNotes,
              assignedEditor: topic.assignedEditor,
              has_ppt: !!topic.contentscript?.pptFileData,
              has_doc: !!topic.contentscript?.docFileData,
              has_zip: !!topic.contentscript?.zipFileData,
            });
          }
        });
      });
    });

    // Helper to map DB status to Frontend status
    const mapStatus = (status) => status;
    const formattedTopics = topicsInProgress.map((topic) => ({
      content_id: topic.content_id,
      topic_title: topic.topic_title,
      workflow_status: mapStatus(topic.workflow_status),
      estimated_duration_min: topic.estimated_duration_min,
      course_title: topic.course_title,
      unit_title: topic.unit_title,
      program_name: topic.program_name,
      video_link: topic.video_link,
      additional_link: topic.additionalLink, // Map Additional Link
      review_notes: topic.review_notes,
      assigned_editor_name: (topic.assignedEditor && topic.assignedEditor.role && topic.assignedEditor.role.roleName === 'Editor')
        ? `${topic.assignedEditor.firstName || ''} ${topic.assignedEditor.lastName || ''}`.trim()
        : "Unassigned",
      has_ppt: topic.has_ppt,
      has_doc: topic.has_doc,
      has_zip: topic.has_zip,
    }));

    return NextResponse.json({
      stats: {
        totalTopics,
        published,
        inEditing,
        scripted,
        underReview,
        readyForVideo,
        approved
      },
      topicsInProgress: formattedTopics,
      canPublish // Return permission
    });
  } catch (error) {
    console.error("Error fetching editor dashboard data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
