import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const topicId = searchParams.get("topicId");
        const type = searchParams.get("type"); // ppt, doc, zip

        if (!topicId || !type) {
            return NextResponse.json({ error: "Missing topicId or type" }, { status: 400 });
        }

        const id = parseInt(topicId);

        // Fetch script with related Content->Section info
        const script = await prisma.contentscript.findUnique({
            where: { contentId: id },
            include: {
                content: {
                    include: {
                        section: true,
                    },
                },
            },
        });

        if (!script) {
            return NextResponse.json({ error: "Script not found" }, { status: 404 });
        }

        let fileData = null;
        let extension = "";
        let contentType = "application/octet-stream";

        if (type === "ppt") {
            fileData = script.pptFileData;
            extension = ".pptx";
            contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        } else if (type === "doc") {
            fileData = script.docFileData;
            extension = ".pdf"; // Defaulting to pdf
            contentType = "application/pdf";
        } else if (type === "zip") {
            fileData = script.zipFileData;
            extension = ".zip";
            contentType = "application/zip";
        } else {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        if (!fileData) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        // --- Calculate Filename ---
        // 1. Unit Number (from Section Order Index)
        const unitNum = (script.content.section.orderIndex || 0).toString().padStart(2, "0");

        // 2. Topic Number (Calculated by counting topics in the same section with lower IDs)
        // Note: We use order by id ascending as the default ordering assumption.
        const prevTopicsCount = await prisma.contentItem.count({
            where: {
                sectionId: script.content.sectionId,
                id: { lt: id }, // Assuming ID order implies chronological/display order
            },
        });
        const topicNum = (prevTopicsCount + 1).toString().padStart(2, "0");

        // 3. Topic Name & Teacher Name
        const topicName = script.content.title || "Untitled";
        const teacherName = script.content.section.profName || "Unknown";

        // Format: U01V01_TopicName_TeacherName.ext
        // We sanitize the names to separate with underscores and remove weird chars if needed, 
        // but user requested "Topic name_teacher name". We will keep spaces or use underscores 
        // based on standard safe file naming.
        // Let's use underscores for spaces to ensure it works well on all OS.
        const safeTopic = topicName.replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "_");
        const safeTeacher = teacherName.replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "_");

        const filename = `U${unitNum}V${topicNum}_${safeTopic}_${safeTeacher}${extension}`;

        // Convert Buffer to Blob-like response
        const headers = new Headers();
        headers.set("Content-Type", contentType);
        headers.set("Content-Disposition", `attachment; filename="${filename}"`);

        return new NextResponse(fileData, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error("Download error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
