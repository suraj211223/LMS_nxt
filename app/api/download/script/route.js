import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

// Use the environment variable for Railway Volume, or fallback to local "uploads" folder
const STORAGE_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(process.cwd(), "uploads");

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
                        uploadedByEditor: true // Include uploader for fallback
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
        let diskFilename = "";

        let searchPrefix = "";
        if (type === "ppt") searchPrefix = "ppt.";
        else if (type === "doc") searchPrefix = "doc.";
        else if (type === "zip") searchPrefix = "refs.";
        else return NextResponse.json({ error: "Invalid type" }, { status: 400 });

        // --- 1. Check Disk Storage (Volume) ---
        const topicDir = path.join(STORAGE_PATH, id.toString());

        try {
            const files = await fs.readdir(topicDir);
            const match = files.find(f => f.startsWith(searchPrefix));

            if (match) {
                fileData = await fs.readFile(path.join(topicDir, match));
                // Determine mime/ext
                const ext = path.extname(match).toLowerCase();
                extension = ext;

                // Set Content Type
                if (ext === ".pptx") contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
                else if (ext === ".ppt") contentType = "application/vnd.ms-powerpoint";
                else if (ext === ".pdf") contentType = "application/pdf";
                else if (ext === ".docx") contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                else if (ext === ".doc") contentType = "application/msword";
                else if (ext === ".zip") contentType = "application/zip";
            }
        } catch (e) {
            // Not found or error
        }

        // --- 2. Fallback to Database (REMOVED) ---
        // if (!fileData) ...

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

        // Teacher Name Logic
        let teacherName = script.content.section.profName;
        const isPlaceholder = !teacherName || ["tbd", "to be decided", "unknown"].includes(teacherName.toLowerCase());

        if (isPlaceholder) {
            // Priority: Find the "Teacher" assigned to this Course
            const assignedTeacher = await prisma.userCourseAssignment.findFirst({
                where: {
                    courseId: script.content.section.courseId,
                    user: {
                        role: {
                            roleName: "Teacher"
                        }
                    }
                },
                include: {
                    user: true
                }
            });

            if (assignedTeacher && assignedTeacher.user) {
                teacherName = `${assignedTeacher.user.firstName} ${assignedTeacher.user.lastName || ''}`.trim();
            } else {
                teacherName = "TBD";
            }
        }

        // Format: U01V01 - Topic Name - Teacher Name.ext
        // We sanitize the names to allow spaces and dashes but remove other special chars.
        const safeTopic = topicName.replace(/[^a-zA-Z0-9 \-]/g, "").trim();
        const safeTeacher = teacherName.replace(/[^a-zA-Z0-9 \-]/g, "").trim();

        const filename = `U${unitNum}V${topicNum} - ${safeTopic} - ${safeTeacher}${extension}`;

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
