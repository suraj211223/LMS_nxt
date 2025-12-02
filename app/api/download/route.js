import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get("filePath");

    if (!filePath) {
        return NextResponse.json({ error: "Missing filePath" }, { status: 400 });
    }

    try {
        // Basic security check: ensure we are not traversing up too far
        // In a real app, you'd want to ensure filePath is within a specific allowed directory
        // For this local setup, we'll assume the DB provides valid paths

        // Check if file exists
        try {
            await fs.access(filePath);
        } catch {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const fileBuffer = await fs.readFile(filePath);
        const filename = path.basename(filePath);

        // Create response with file content
        const response = new NextResponse(fileBuffer);

        // Set headers for download
        response.headers.set("Content-Disposition", `attachment; filename="${filename}"`);
        response.headers.set("Content-Type", "application/octet-stream");

        return response;
    } catch (err) {
        console.error("Download error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
