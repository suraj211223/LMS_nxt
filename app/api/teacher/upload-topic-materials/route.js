import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";

export async function POST(req) {
    try {
        const form = await req.formData();

        const topicId = form.get("topicId");
        const pptFile = form.get("ppt");
        const courseMaterialFile = form.get("courseMaterial");
        const referenceMaterialFile = form.get("referenceMaterial");

        if (!topicId) {
            return NextResponse.json(
                { error: "Missing topicId" },
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

        // Note: Schema has zipFileData, but UI sends referenceMaterial. 
        // We'll map referenceMaterial to zipFileData for now, or just ignore if no field matches.
        // The schema has: pptFileData, docFileData, zipFileData.
        // Let's assume referenceMaterial goes to zipFileData or we just update what we can.

        let zipFileData = null;
        if (referenceMaterialFile && typeof referenceMaterialFile !== 'string') {
            const arrayBuffer = await referenceMaterialFile.arrayBuffer();
            zipFileData = Buffer.from(arrayBuffer);
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

        // Also update workflow status if needed? 
        // The UI logic says "Scripting is complete" if status != planned.
        // Maybe we should update status to "Scripted" or "Review"?
        // Let's update to "Scripted" if it's currently "Planned".

        const topic = await prisma.contentItem.findUnique({
            where: { id: parseInt(topicId) },
            select: { workflowStatus: true }
        });

        if (topic && topic.workflowStatus === 'Planned') {
            await prisma.contentItem.update({
                where: { id: parseInt(topicId) },
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
