import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import AdmZip from "adm-zip";

const prisma = new PrismaClient();

export const runtime = "nodejs";

export async function POST(req) {
    try {
        const form = await req.formData();

        const topicId = form.get("topicId");
        const topicPrefix = form.get("topicPrefix"); // e.g. U1V1
        const pptFile = form.get("ppt");
        const courseMaterialFile = form.get("courseMaterial");
        const referenceFiles = form.getAll("referenceMaterials"); // Get all files

        // Get User from Cookie
        const { cookies } = require("next/headers");
        const cookieStore = await cookies();
        const userIdCookie = cookieStore.get("userId");
        const userId = userIdCookie?.value;

        if (!topicId || isNaN(parseInt(topicId))) {
            return NextResponse.json(
                { error: "Invalid or missing topicId" },
                { status: 400 }
            );
        }

        const topicIdInt = parseInt(topicId);

        // Prepare file buffers
        let pptFileData = null;
        if (pptFile && typeof pptFile !== 'string') {
            const arrayBuffer = await pptFile.arrayBuffer();
            pptFileData = Buffer.from(arrayBuffer);
        }

        let docFileData = null;
        if (courseMaterialFile && typeof courseMaterialFile !== 'string') {
            const arrayBuffer = await courseMaterialFile.arrayBuffer();
            docFileData = Buffer.from(arrayBuffer);
        }

        // Handle Reference Materials (Zip them)
        let zipFileData = null;
        if (referenceFiles && referenceFiles.length > 0) {
            const zip = new AdmZip();

            for (const file of referenceFiles) {
                if (file && typeof file !== 'string') {
                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    // Use original filename inside the zip
                    zip.addFile(file.name, buffer);
                }
            }

            // Create buffer from zip
            zipFileData = zip.toBuffer();
        }

        // Upsert Contentscript
        await prisma.contentscript.upsert({
            where: { contentId: topicIdInt },
            update: {
                ...(pptFileData && { pptFileData }),
                ...(docFileData && { docFileData }),
                ...(zipFileData && { zipFileData }),
            },
            create: {
                contentId: topicIdInt,
                pptFileData,
                docFileData,
                zipFileData,
            },
        });

        // -------------------------------------------------------------
        // LOGIC: Set Teacher Name if missing ("one who uploads first")
        // -------------------------------------------------------------
        if (userId) {
            // 1. Get Uploader Name
            const uploader = await prisma.user.findUnique({
                where: { id: parseInt(userId) },
                select: { firstName: true, lastName: true }
            });

            if (uploader) {
                const teacherName = `${uploader.firstName || ""} ${uploader.lastName || ""}`.trim();

                // 2. Find the Section ID for this Topic
                const topicItem = await prisma.contentItem.findUnique({
                    where: { id: topicIdInt },
                    select: { sectionId: true }
                });

                if (topicItem) {
                    // 3. Check if profName is already set
                    const section = await prisma.courseSection.findUnique({
                        where: { id: topicItem.sectionId },
                        select: { profName: true }
                    });

                    // 4. Update ONLY if empty/null
                    if (!section?.profName) {
                        await prisma.courseSection.update({
                            where: { id: topicItem.sectionId },
                            data: { profName: teacherName }
                        });
                        console.log(`Updated profName for Section ${topicItem.sectionId} to: ${teacherName}`);
                    }
                }
            }
        }

        // Update Workflow Status
        const topic = await prisma.contentItem.findUnique({
            where: { id: topicIdInt },
            select: { workflowStatus: true }
        });

        if (topic && topic.workflowStatus === 'Planned') {
            await prisma.contentItem.update({
                where: { id: topicIdInt },
                data: { workflowStatus: 'Scripted' }
            });
        }

        return NextResponse.json({
            success: true,
            message: "Materials uploaded successfully",
        });
    } catch (err) {
        console.error("upload-topic-materials error:", err);
        return NextResponse.json(
            { error: String(err) },
            { status: 500 }
        );
    }
}
