import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

import { promises as fs } from "fs";
import path from "path";

// Use the environment variable for Railway Volume, or fallback to local "uploads" folder
const STORAGE_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(process.cwd(), "uploads");

export const runtime = "nodejs";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    let canPublish = false;

    if (userId && !isNaN(parseInt(userId))) {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        include: { role: true }
      });
      const roleName = user?.role?.roleName?.toLowerCase();
      canPublish = (roleName === "publisher") || user?.role?.canPublishContent || false;
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
                contentscript: true
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

    // Process courses sequentially for async filesystem checks
    await Promise.all(courses.map(async course => {
      await Promise.all(course.sections.map(async section => {
        totalTopics += section.contents.length;

        await Promise.all(section.contents.map(async topic => {
          // Stats Counting
          if (topic.workflowStatus === "Published") published++;
          if (topic.workflowStatus === "Editing") inEditing++;
          if (topic.workflowStatus === "Scripted") scripted++;
          if (topic.workflowStatus === "Under_Review") underReview++;
          if (topic.workflowStatus === "Approved") approved++;
          if (topic.workflowStatus === "ReadyForVideoPrep" || topic.workflowStatus === "Post_Editing") readyForVideo++;

          // Topics In Progress List (Everything except Planned)
          // We want to show Scripted, Editing, Post-Editing, Ready, Under Review, Approved, Published
          // BUT: Only show if materials are approved (implied by workflow > Scripted OR boolean flag)
          // For now, let's use the explicit boolean flag we added to the schema: materialsApproved

          const isMaterialsApproved = topic.materialsApproved === true;

          // Assignment Logic: 
          // 1. If Unassigned (assignedEditorId is null), show to everyone (Job Board)
          // 2. If Assigned, ONLY show to the assigned editor
          const isAssignedToMe = !topic.assignedEditorId || (userId && topic.assignedEditorId === parseInt(userId)) || (canPublish && topic.workflowStatus === "Approved");

          if (topic.workflowStatus !== "Planned" && topic.workflowStatus !== "Scripted" && topic.workflowStatus !== "Published" && isAssignedToMe) {

            // CHECK DISK FOR FILES
            let hasPpt = false;
            let hasDoc = false;
            let hasZip = false;

            if (topic.contentscript) {
              const topicDir = path.join(STORAGE_PATH, topic.id.toString());
              try {
                const files = await fs.readdir(topicDir);
                hasPpt = files.some(f => f.startsWith("ppt."));
                hasDoc = files.some(f => f.startsWith("doc."));
                hasZip = files.some(f => f.startsWith("refs."));
              } catch (e) {
                // No dir => no files
              }
            }

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
              has_ppt: hasPpt,
              has_doc: hasDoc,
              has_zip: hasZip,
            });
          }
        }));
      }));
    }));

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
