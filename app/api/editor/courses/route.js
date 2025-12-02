import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const courses = await prisma.courses.findMany({
            include: {
                units: true,
                course_content_new: true,
            }
        });

        const coursesWithCounts = courses.map(course => {
            return {
                course_id: course.course_id,
                course_code: course.course_code,
                course_name: course.course_name,
                units_count: course.units.length,
                topics_count: course.course_content_new.length,
            }
        })

        return NextResponse.json(coursesWithCounts);
    } catch (error) {
        console.error("Error fetching courses:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
