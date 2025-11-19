import { NextResponse } from "next/server";
import { pool } from "../../../../lib/db";

export const runtime = "nodejs";

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
    const [result] = await pool.query(
      `INSERT INTO contentitems (section_id, title, estimated_duration_min, workflow_status) 
       VALUES (?, ?, ?, 'Planned')`,
      [unitId, topicName, parseInt(duration) || 0]
    );

    return NextResponse.json({
      success: true,
      topicId: result.insertId,
      message: "Topic created successfully"
    });

  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json(
      { error: "Failed to create topic" },
      { status: 500 }
    );
  }
}
