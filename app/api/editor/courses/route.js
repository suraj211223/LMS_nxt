import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
    try {
        const courses = await prisma.course.findMany({
            where: {
                status: "Active"
            },
            include: {
                program: {
                    include: { school: true },
                },
                sections: {
                    include: {
                        contents: true,
                    },
                },
            },
        });

        const formattedCourses = courses.map((course) => ({
            course_id: course.id,
            name: course.title,
            course_code: course.courseCode,
            status: course.status,
            program: course.program?.programName,
            department: course.program?.school?.name,
            unit_count: course.sections.length,
            topic_count: course.sections.reduce((acc, section) => acc + section.contents.length, 0),
        }));

        return NextResponse.json({ courses: formattedCourses });
    } catch (err) {
        console.error("GET route error:", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
