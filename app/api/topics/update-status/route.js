import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function POST(request) {
  try {
    const { topicId, newStatus } = await request.json();

    if (!topicId || !newStatus) {
      return new NextResponse("Missing topicId or newStatus", { status: 400 });
    }

    const updatedTopic = await prisma.content.update({
      where: {
        content_id: topicId,
      },
      data: {
        workflow_status: newStatus,
      },
    });

    return NextResponse.json(updatedTopic);
  } catch (error) {
    console.error("Error updating topic status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
