import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(req) {

    try {
        const { topicId, videoLink, additionalLink, newStatus } = await req.json(); // Received additionalLink
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!topicId || !videoLink) {
            return NextResponse.json(
                { error: "Missing topicId or videoLink" },
                { status: 400 }
            );
        }

        // Ensure topicId is an integer
        const id = parseInt(topicId);
        if (isNaN(id)) {
            return NextResponse.json(
                { error: "Invalid topicId" },
                { status: 400 }
            );
        }

        // Map frontend status to DB enum keys
        let dbStatus = newStatus;
        if (newStatus === "Ready_for_Video_Prep") dbStatus = "ReadyForVideoPrep";
        if (newStatus === "Post-Editing") dbStatus = "Post_Editing";
        // Under_Review is the same for both

        console.log(`Updating topic ${id} with videoLink: ${videoLink} and status: ${dbStatus}`);

        // Fetch existing topic to check if uploader is already set
        const existingTopic = await prisma.contentItem.findUnique({
            where: { id: id },
            select: { uploadedByEditorId: true }
        });

        const updateData = {
            videoLink: videoLink,
            additionalLink: additionalLink,
            workflowStatus: dbStatus || "Under_Review",
            uploadedAt: new Date(),
            reviewRequestAt: new Date(),
            ...(userId && { assignedEditorId: parseInt(userId) }),
        };

        // Only set uploader if not already set (preserve original uploader)
        if (userId && existingTopic && !existingTopic.uploadedByEditorId) {
            updateData.uploadedByEditorId = parseInt(userId);
        }

        const updatedTopic = await prisma.contentItem.update({
            where: { id: id },
            data: updateData,
        });

        return NextResponse.json({ success: true, topic: updatedTopic });
    } catch (error) {
        console.error("Error uploading video link:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
