import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";
//...

export async function POST(req) {
  try {
    const { unitId, topicName, duration } = await req.json();

    // Validate required fields
    if (!unitId || !topicName) {
      return NextResponse.json(
        { error: "Missing required fields: unitId and topicName" },
        { status: 400 }
      );
    }

    // Insert the new topic into the database
    const result = await prisma.contentItem.create({
      data: {
        sectionId: parseInt(unitId),
        title: topicName,
        estimatedDurationMin: parseInt(duration) || 0,
        workflowStatus: "Planned",
      },
    });

    return NextResponse.json({
      success: true,
      topicId: result.id,
      message: "Topic created successfully",
    });
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json(
      { error: "Failed to create topic" },
      { status: 500 }
    );
  }
}
