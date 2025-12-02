import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const { topicId, videoLink, newStatus } = await req.json();

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

        const updatedTopic = await prisma.contentItem.update({
            where: { id: id },
            data: {
                videoLink: videoLink,
                workflowStatus: dbStatus || "Under_Review",
            },
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
