import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import AdmZip from "adm-zip";

const prisma = new PrismaClient();

import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

// Use the environment variable for Railway Volume, or fallback to local "uploads" folder
const STORAGE_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(process.cwd(), "uploads");

// Helper to ensure directory exists
async function ensureDir(dir) {
    try {
        await fs.access(dir);
    } catch (e) {
        await fs.mkdir(dir, { recursive: true });
    }
}

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

        // -------------------------------------------------------------
        // NEW STORAGE LOGIC: Save to Disk (Volume)
        // -------------------------------------------------------------
        // Create directory for this topic: /uploads/{topicId}
        const topicDir = path.join(STORAGE_PATH, topicIdInt.toString());
        await ensureDir(topicDir);

        // Helper to remove existing files of a certain type (to prevent collisions like doc.pdf vs doc.docx)
        const clearOld = async (prefix) => {
            try {
                const files = await fs.readdir(topicDir);
                for (const f of files) {
                    if (f.startsWith(prefix + ".")) {
                        await fs.unlink(path.join(topicDir, f)).catch(() => { });
                    }
                }
            } catch (e) { }
        };

        if (pptFileData) {
            await clearOld("ppt");
            // Preserve original extension if possible, default to .pptx
            const ext = (pptFile && pptFile.name) ? path.extname(pptFile.name) : ".pptx";
            // Ensure extension is safe
            const safeExt = ext || ".pptx";
            await fs.writeFile(path.join(topicDir, `ppt${safeExt}`), pptFileData);
        }

        if (docFileData) {
            await clearOld("doc");
            const ext = (courseMaterialFile && courseMaterialFile.name) ? path.extname(courseMaterialFile.name) : ".pdf";
            const safeExt = ext || ".pdf";
            await fs.writeFile(path.join(topicDir, `doc${safeExt}`), docFileData);
        }

        if (zipFileData) {
            await clearOld("refs");
            await fs.writeFile(path.join(topicDir, "refs.zip"), zipFileData);
        }

        // Upsert Contentscript (Update metadata, leave BLOBs null to save DB space for new uploads)
        // Note: For existing records, we don't clear the BLOBs here to be safe (migration is manual),
        // but for new uploads or updates, we just don't write to the BLOB columns.
        // Actually, if we are overwriting, we SHOULD probably clear the DB BLOB to free space.
        // Let's set them to empty bytes or null if possible. 
        // Prisma schema says `Bytes?`. So `null` is valid.

        await prisma.contentscript.upsert({
            where: { contentId: topicIdInt },
            update: {
                // Metadata only, files are on disk
            },
            create: {
                contentId: topicIdInt,
            },
        });

        // -------------------------------------------------------------
        // LOGIC: Set Uploader (Editor/Teacher) Reference
        // -------------------------------------------------------------
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
