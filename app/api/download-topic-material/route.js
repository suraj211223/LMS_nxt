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

        const unitIndex = topic?.section?.orderIndex || 0;
        // We need to find the topic index within the section. 
        // Since we don't have it directly, we might need to count or just use ID.
        // However, the user asked for U{u}V{t}. 
        // Let's try to get the topic index if possible, or fallback to ID.
        // A better way is to fetch all topics in the section and find the index.

        let topicIndex = 0;
        if (topic && topic.section) {
            const topics = await prisma.contentItem.findMany({
                where: { sectionId: topic.section.id },
                orderBy: { id: 'asc' }, // Assuming ordered by ID or creation
                select: { id: true }
            });
            topicIndex = topics.findIndex(t => t.id === parseInt(topicId)) + 1;
        }

        const prefix = `U${unitIndex}V${topicIndex}`;

        let fileData = null;
        let filename = `${prefix}.${type}`;
        let contentType = "application/octet-stream";

        if (type === "ppt") {
            fileData = script.pptFileData;
            filename = `${prefix}.pptx`;
            contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        } else if (type === "doc") {
            fileData = script.docFileData;
            filename = `${prefix}.docx`;
            contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else if (type === "zip") {
            fileData = script.zipFileData;
            filename = `${prefix}-materials.zip`;
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
