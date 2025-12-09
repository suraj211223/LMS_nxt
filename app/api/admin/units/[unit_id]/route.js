import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { promises as fs } from "fs";

const prisma = new PrismaClient();

export async function DELETE(request, { params }) {
    try {
        const { unit_id } = await params;

        // Check authentication and role
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            include: { role: true },
        });

        if (!user || user.role?.roleName !== "Admin") {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        // Check if section exists
        const section = await prisma.courseSection.findUnique({
            where: { id: parseInt(unit_id) },
        });

        if (!section) {
            return NextResponse.json({ error: "Unit not found" }, { status: 404 });
        }

        // Attempt to delete files from disk if storagePath exists
        if (section.storagePath) {
            try {
                await fs.rm(section.storagePath, { recursive: true, force: true });
            } catch (fsError) {
                console.error("Failed to delete directory from disk:", fsError);
                // Continue with DB delete
            }
        }

        // Cascade delete is handled by Prisma schema
        await prisma.courseSection.delete({
            where: { id: parseInt(unit_id) },
        });

        return NextResponse.json({ success: true, message: "Unit deleted successfully" });
    } catch (error) {
        console.error("Error deleting unit:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
