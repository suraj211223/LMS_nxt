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

        if (!topicId || isNaN(parseInt(topicId))) {
            return NextResponse.json(
                { error: "Invalid or missing topicId" },
                { status: 400 }
            );
        }

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
            where: { contentId: parseInt(topicId) },
            update: {
                ...(pptFileData && { pptFileData }),
                ...(docFileData && { docFileData }),
                ...(zipFileData && { zipFileData }),
            },
            create: {
                contentId: parseInt(topicId),
                pptFileData,
                docFileData,
                zipFileData,
            },
        });

        const topic = await prisma.contentItem.findUnique({
            where: { id: parseInt(topicId) },
            select: { workflowStatus: true }
        });

        if (topic && topic.workflowStatus === 'Planned') {
            await prisma.contentItem.update({
                where: { id: parseInt(topicId) },
                data: { workflowStatus: 'Editing' }
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
