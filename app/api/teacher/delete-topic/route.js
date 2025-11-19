import { NextResponse } from "next/server";
import { pool } from "../../../../lib/db";

export const runtime = "nodejs";

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get('topicId');

    // Validate required fields
    if (!topicId) {
      return NextResponse.json(
        { error: "Missing required field: topicId" },
        { status: 400 }
      );
    }

    // Check if the topic exists before deleting
    const [existingTopic] = await pool.query(
      `SELECT content_id FROM contentitems WHERE content_id = ?`,
      [topicId]
    );

    if (existingTopic.length === 0) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    // Delete the topic from the database
    const [result] = await pool.query(
      `DELETE FROM contentitems WHERE content_id = ?`,
      [topicId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Failed to delete topic" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Topic deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting topic:", error);
    return NextResponse.json(
      { error: "Failed to delete topic" },
      { status: 500 }
    );
  }
}
