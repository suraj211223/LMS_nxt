import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Find 'Teacher' role ID first
        const roles = await prisma.role.findMany();
        const teacherRole = roles.find(r => r.roleName.toLowerCase() === 'teacher');

        if (!teacherRole) {
            return NextResponse.json([]);
        }

        const teachers = await prisma.user.findMany({
            where: { roleId: teacherRole.id }
        });

        return NextResponse.json(teachers);
    } catch (error) {
        console.error("Error fetching teachers:", error);
        return new NextResponse("Internal Server Error: " + error.message, { status: 500 });
    }
}
