import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const oldName = "School of Management";
        const newName = "School of Commerce, Finance and Accountancy";

        // Fetch both schools
        const oldSchool = await prisma.school.findFirst({ where: { name: oldName } });
        const newSchool = await prisma.school.findFirst({ where: { name: newName } });

        let message = "";

        if (oldSchool && newSchool) {
            // Both exist: Merge Old -> New

            // 1. Move Programs
            await prisma.program.updateMany({
                where: { schoolId: oldSchool.id },
                data: { schoolId: newSchool.id }
            });

            // 2. Move Users
            await prisma.user.updateMany({
                where: { schoolId: oldSchool.id },
                data: { schoolId: newSchool.id }
            });

            // 3. Delete Old School
            await prisma.school.delete({ where: { id: oldSchool.id } });

            message = "Success: Merged 'School of Management' into 'School of Commerce...'. Old entry deleted.";
        }
        else if (oldSchool && !newSchool) {
            // Only Old exists: Rename it
            await prisma.school.update({
                where: { id: oldSchool.id },
                data: { name: newName }
            });
            message = "Success: Renamed 'School of Management' to 'School of Commerce...'.";
        }
        else if (!oldSchool && newSchool) {
            message = "Info: 'School of Management' does not exist. 'School of Commerce...' already exists. No action needed.";
        }
        else {
            message = "Error: Neither school found.";
        }

        return NextResponse.json({ success: true, message });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
