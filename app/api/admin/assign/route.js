import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        let { userId, courseId, email } = await req.json();

        if ((!userId && !email) || !courseId) {
            return new NextResponse("Missing user ID/Email or course ID", { status: 400 });
        }

        if (!userId && email) {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return new NextResponse("User not found", { status: 404 });
            }
            userId = user.id;
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

export async function DELETE(req) {
    try {
        const { userId, courseId } = await req.json();

        if (!userId || !courseId) {
            return new NextResponse("Missing user or course ID", { status: 400 });
        }

        await prisma.userCourseAssignment.delete({
            where: {
                user_course_unique: {
                    userId: parseInt(userId),
                    courseId: parseInt(courseId),
                },
            },
        });

        return new NextResponse("Assignment removed", { status: 200 });
    } catch (error) {
        console.error("Error removing assignment:", error);
        return new NextResponse("Internal Server Error: " + error.message, { status: 500 });
    }
}
