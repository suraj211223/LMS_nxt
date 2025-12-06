import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const courses = await prisma.course.findMany({
            select: {
                id: true,
                title: true,
                courseCode: true,
            }
        });
        return NextResponse.json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
