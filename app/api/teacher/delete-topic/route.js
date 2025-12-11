import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export const runtime = "nodejs";

import { promises as fs } from "fs";
import path from "path";

// Use the environment variable for Railway Volume, or fallback to local "uploads" folder
const STORAGE_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(process.cwd(), "uploads");

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get("topicId");

    // Validate required fields
    if (!topicId) {
      return NextResponse.json(
        { error: "Missing required field: topicId" },
        { status: 400 }
      );
    }

    // Check if the topic exists before deleting
    const existingTopic = await prisma.contentItem.findUnique({
      where: { id: parseInt(topicId) },
    });

    if (!existingTopic) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    // Check user role for Admin override
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    let isAdmin = false;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        include: { role: true }
      });
      if (user && user.role?.roleName === 'Admin') {
        isAdmin = true;
      }
    }

    // Prevent deletion if topic is Published (unless Admin)
    if (existingTopic.workflowStatus === "Published" && !isAdmin) {
      return NextResponse.json(
        { error: "Cannot delete a published topic." },
        { status: 403 }
      );
    }

    // Delete the topic from the database
    const result = await prisma.contentItem.delete({
      where: { id: parseInt(topicId) },
    });

    // Cleanup: Delete files from disk (Volume) if they exist
    try {
      const topicDir = path.join(STORAGE_PATH, topicId);
      await fs.rm(topicDir, { recursive: true, force: true });
      // console.log(`Deleted files for topic ${topicId}`);
    } catch (cleanupError) {
      console.error("Error cleaning up files for deleted topic:", cleanupError);
      // We generally don't want to fail the request just because file cleanup failed, 
      // as the DB record is already gone.
    }

    if (!result) {
      return NextResponse.json(
        { error: "Failed to delete topic" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Topic deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting topic:", error);
    return NextResponse.json(
      { error: "Failed to delete topic" },
      { status: 500 }
    );
  }
}
