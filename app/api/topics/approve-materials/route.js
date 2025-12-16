import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const { topicId } = await req.json();

        if (!topicId) {
            return NextResponse.json({ error: "Topic ID is required" }, { status: 400 });
        }

        const updatedTopic = await prisma.contentItem.update({
            where: { id: parseInt(topicId) },
            data: {
                materialsApproved: true,
                workflowStatus: "Editing"
            }
        });

        return NextResponse.json({ success: true, topic: updatedTopic });
    } catch (error) {
        console.error("Error approving materials:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
