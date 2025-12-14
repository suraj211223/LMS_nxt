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

        // Link Uploader (Editor/Teacher)
        if (userId) {
            const uploaderId = parseInt(userId);

            // Update the topic to link the uploader
            // This ensures we can grab their name later for file naming
            await prisma.contentItem.update({
                where: { id: topicIdInt },
                data: {
                    uploadedByEditorId: uploaderId // This field was added to schema for exactly this purpose
                }
            });

            // Optional: Still update ProfName on Section if missing? 
            // The user asked to "take the name of the person who uploads it for the first time... to have named"
            // Since we now rely on uploadedByEditorId for naming in download route, we don't necessarily need to overwrite profName.
            // But leaving the profName logic might be safer if that's used elsewhere.
            // However, overwriting profName (Section Level) based on a Topic Upload might be too aggressive if multiple people work on a section.
            // Let's stick to updating the TOPIC'S uploader field.
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
