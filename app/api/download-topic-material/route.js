import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

// Use the environment variable for Railway Volume, or fallback to local "uploads" folder
const STORAGE_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(process.cwd(), "uploads");

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

        // Fetch topic details for naming, including Uploader (Editor/Teacher) for fallback
        const topic = await prisma.contentItem.findUnique({
            where: { id: parseInt(topicId) },
            include: {
                section: true,
                uploadedByEditor: true // Include the user who uploaded/created this item
            }
        });

        // --- Calculate Filename ---
        // 1. Unit Number (from Section Order Index)
        const unitNum = (topic.section.orderIndex || 0).toString().padStart(2, "0");

        // 2. Topic Number (Calculated by counting topics in the same section with lower IDs)
        const prevTopicsCount = await prisma.contentItem.count({
            where: {
                sectionId: topic.sectionId,
                id: { lt: parseInt(topicId) },
            },
        });
        const topicNum = (prevTopicsCount + 1).toString().padStart(2, "0");

        // 3. Topic Name & Teacher Name
        const topicName = topic.title || "Untitled";

        // Teacher Name Logic
        let teacherName = topic.section.profName;
        const isPlaceholder = !teacherName || ["tbd", "to be decided", "unknown"].includes(teacherName.toLowerCase());

        if (isPlaceholder) {
            // Priority: Find the "Teacher" assigned to this Course
            const assignedTeacher = await prisma.userCourseAssignment.findFirst({
                where: {
                    courseId: topic.section.courseId,
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

        const safeTopic = topicName.replace(/[^a-zA-Z0-9 \-]/g, "").trim();
        const safeTeacher = teacherName.replace(/[^a-zA-Z0-9 \-]/g, "").trim();

        const filenameBase = `U${unitNum}V${topicNum} - ${safeTopic} - ${safeTeacher}`;

        let fileData = null;
        let filename = "";
        let contentType = "application/octet-stream";
        let diskFilename = "";

        let searchPrefix = "";
        if (type === "ppt") searchPrefix = "ppt.";
        else if (type === "doc") searchPrefix = "doc.";
        else if (type === "zip") searchPrefix = "refs.";

        // --- 1. Check Disk Storage (Volume) ---
        const topicDir = path.join(STORAGE_PATH, topicId);
        try {
            const files = await fs.readdir(topicDir);
            const match = files.find(f => f.startsWith(searchPrefix));

            if (match) {
                fileData = await fs.readFile(path.join(topicDir, match));
                const ext = path.extname(match).toLowerCase();

                // Update filename with actual extension
                filename = `${filenameBase}${ext}`;

                if (ext === ".pptx") contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
                else if (ext === ".ppt") contentType = "application/vnd.ms-powerpoint";
                else if (ext === ".pdf") contentType = "application/pdf";
                else if (ext === ".docx") contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                else if (ext === ".doc") contentType = "application/msword";
                else if (ext === ".zip") contentType = "application/zip";
            }
        } catch (e) {
            // Not on disk
        }

        // --- 2. Fallback to Database (REMOVED) ---

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
