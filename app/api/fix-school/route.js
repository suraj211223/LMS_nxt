import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const oldName = "School of Management";
        const newName = "School of Commerce, Finance and Accountancy";

        const oldSchool = await prisma.school.findFirst({ where: { name: oldName } });
        const newSchool = await prisma.school.findFirst({ where: { name: newName } });

        let message = "";

        if (oldSchool && newSchool) {
            // Move Programs
            await prisma.program.updateMany({
                where: { schoolId: oldSchool.id },
                data: { schoolId: newSchool.id }
            });
            // Move Users
            await prisma.user.updateMany({
                where: { schoolId: oldSchool.id },
                data: { schoolId: newSchool.id }
            });
            // Delete Old
            await prisma.school.delete({ where: { id: oldSchool.id } });
            message = "Merged Old into New. Deleted Old.";
        }
        else if (oldSchool && !newSchool) {
            await prisma.school.update({
                where: { id: oldSchool.id },
                data: { name: newName }
            });
            message = "Renamed Old to New.";
        } else {
            message = "Nothing to fix.";
        }

        return NextResponse.json({ success: true, message });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
