import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const { topicId, feedback } = await req.json();

        if (!topicId || !feedback) {
            return NextResponse.json(
                { error: "Missing topicId or feedback" },
                { status: 400 }
            );
        }

        const updatedTopic = await prisma.contentItem.update({
            where: { id: parseInt(topicId) },
            data: {
                reviewNotes: feedback,
                workflowStatus: "Post_Editing", // Send back to editor
            },
        });

        return NextResponse.json({ success: true, topic: updatedTopic });
    } catch (error) {
        console.error("Error submitting feedback:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
