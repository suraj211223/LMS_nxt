import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function DELETE(request, { params }) {
    try {
        const { course_id } = await params;

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

        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id: parseInt(course_id) },
        });

        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        // Delete the course (Cascade delete configured in schema)
        await prisma.course.delete({
            where: { id: parseInt(course_id) },
        });

        return NextResponse.json({ success: true, message: "Course deleted successfully" });
    } catch (error) {
        console.error("Error deleting course:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
