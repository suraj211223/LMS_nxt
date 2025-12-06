import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { topicId, newStatus } = await request.json();

    if (!topicId || !newStatus) {
      return new NextResponse("Missing topicId or newStatus", { status: 400 });
    }

    // Map frontend status to DB enum if needed
    let dbStatus = newStatus;
    if (newStatus === "Post-Editing") dbStatus = "Post_Editing";
    if (newStatus === "Ready_for_Video_Prep") dbStatus = "ReadyForVideoPrep";
    if (newStatus === "Under_Review") dbStatus = "Under_Review";

    const updateData = {
      workflowStatus: dbStatus,
    };

    // ✨ Update Timestamps based on status
    if (newStatus === "Approved") {
      updateData.approvedAt = new Date();
    }
    if (newStatus === "Published") {
      updateData.publishedAt = new Date();
    }

    // If Reversing (Admin or Mistake Correction), clear future timestamps
    // e.g. if going back to Draft/Planned, it's not Published anymore
    if (newStatus !== "Published") {
      updateData.publishedAt = null;
    }
    if (newStatus !== "Published" && newStatus !== "Approved") {
      updateData.approvedAt = null;
    }

    // If moving to Post-Editing (Start Recording), assign the current user IF they are an Editor
    if (newStatus === "Post-Editing" || newStatus === "Post_Editing") {
      const cookieStore = await cookies();
      const userId = cookieStore.get("userId")?.value;

      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(userId) },
          include: { role: true }
        });

        if (user?.role?.roleName === "Editor") {
          updateData.assignedEditorId = parseInt(userId);
        }
      }
    }

    const updatedTopic = await prisma.contentItem.update({
      where: {
        id: parseInt(topicId),
      },
      data: updateData,
    });

    return NextResponse.json(updatedTopic);
  } catch (error) {
    console.error("Error updating topic status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
