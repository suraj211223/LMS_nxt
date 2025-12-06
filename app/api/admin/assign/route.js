import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const { userId, courseId } = await req.json();

        if (!userId || !courseId) {
            return new NextResponse("Missing user or course ID", { status: 400 });
        }

        // Check if assignment exists
        const existing = await prisma.userCourseAssignment.findUnique({
            where: {
                user_course_unique: {
                    userId: parseInt(userId),
                    courseId: parseInt(courseId),
                },
            },
        });

        if (existing) {
            return new NextResponse("User is already assigned to this course", { status: 409 });
        }

        const assignment = await prisma.userCourseAssignment.create({
            data: {
                userId: parseInt(userId),
                courseId: parseInt(courseId),
            },
        });

        return NextResponse.json(assignment);
    } catch (error) {
        console.error("Error assigning course:", error);
        return new NextResponse("Internal Server Error: " + error.message, { status: 500 });
    }
}
