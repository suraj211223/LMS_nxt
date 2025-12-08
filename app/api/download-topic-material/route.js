import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get("topicId");
    const type = searchParams.get("type"); // 'ppt', 'doc', 'zip'

    if (!topicId || !type) {
        return NextResponse.json({ error: "Missing topicId or type" }, { status: 400 });
    }

    try {
        const script = await prisma.contentscript.findUnique({
            where: { contentId: parseInt(topicId) },
        });

        if (!script) {
            return NextResponse.json({ error: "Script not found" }, { status: 404 });
        }

        // Fetch topic details for naming
        const topic = await prisma.contentItem.findUnique({
            where: { id: parseInt(topicId) },
            include: { section: true }
        });

        // --- Calculate Filename ---
        // 1. Unit Number (from Section Order Index)
        const unitNum = (topic.section.orderIndex || 0).toString().padStart(2, "0");

        // 2. Topic Number (Calculated by counting topics in the same section with lower IDs)
        // We need to count topics to get the correct index 1..N
        const prevTopicsCount = await prisma.contentItem.count({
            where: {
                sectionId: topic.sectionId,
                id: { lt: parseInt(topicId) },
            },
        });
        const topicNum = (prevTopicsCount + 1).toString().padStart(2, "0");

        // 3. Topic Name & Teacher Name
        const topicName = topic.title || "Untitled";
        const teacherName = topic.section.profName || "Unknown";

        const safeTopic = topicName.replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "_");
        const safeTeacher = teacherName.replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "_");

        const filenameBase = `U${unitNum}V${topicNum}_${safeTopic}_${safeTeacher}`;

        let fileData = null;
        let filename = "";
        let contentType = "application/octet-stream";

        if (type === "ppt") {
            fileData = script.pptFileData;
            filename = `${filenameBase}.pptx`;
            contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        } else if (type === "doc") {
            fileData = script.docFileData;
            filename = `${filenameBase}.pdf`; // Defaulting to pdf as per user preference in other route
            contentType = "application/pdf";
        } else if (type === "zip") {
            fileData = script.zipFileData;
            filename = `${filenameBase}.zip`;
            contentType = "application/zip";
        }

        if (!fileData) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const response = new NextResponse(fileData);
        response.headers.set("Content-Disposition", `attachment; filename="${filename}"`);
        response.headers.set("Content-Type", contentType);

        return response;
    } catch (err) {
        console.error("Download error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
