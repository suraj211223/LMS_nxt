import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";

import { cookies } from "next/headers";

export async function GET(req) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userIdInt = parseInt(userId);

        // 0. Fetch User Role
        const user = await prisma.user.findUnique({
            where: { id: userIdInt },
            include: { role: true }
        });
        const userRole = user?.role?.roleName || "Teacher";

        // 1. Fetch courses assigned to user (Active only) to ensure consistency with "Your Courses"
        const courses = await prisma.course.findMany({
            where: {
                status: "Active",
                assignments: {
                    some: {
                        userId: userIdInt
                    }
                }
            },
            include: {
                program: true, // Fetch program details
                sections: {
                    include: {
                        contents: {
                            include: {
                                contentscript: true
                            }
                        }
                    }
                }
            }
        });

        // 2. Calculate stats from the fetched courses
        let totalTopics = 0;
        let totalUnits = 0;
        let videosToReview = 0;
        let videosPublished = 0;

        courses.forEach(course => {
            totalUnits += course.sections.length;
            course.sections.forEach(section => {
                totalTopics += section.contents.length;
                section.contents.forEach(topic => {
                    if (topic.workflowStatus === "Under_Review") {
                        videosToReview++;
                    }
                    if (topic.workflowStatus === "Published") {
                        videosPublished++;
                    }
                });
            });
        });

        // 3. Fetch topics for review list
        const topicsForReview = [];
        courses.forEach(course => {
            course.sections.forEach(section => {
                section.contents.forEach(topic => {
                    if (topic.workflowStatus === "Under_Review") {
                        topicsForReview.push({
                            content_id: topic.id,
                            topic_title: topic.title,
                            workflow_status: "Under_Review",
                            estimated_duration_min: topic.estimatedDurationMin,
                            course_id: course.id,
                            course_title: course.title,
                            unit_title: section.title,
                            program_name: course.program?.programName || "Unknown Program", // Map program name
                            videoLink: topic.videoLink,

                            additionalLink: topic.additionalLink, // Return additional link
                            has_ppt: !!topic.contentscript?.pptFileData,
                            has_doc: !!topic.contentscript?.docFileData,
                            has_zip: !!topic.contentscript?.zipFileData
                        });
                    }
                });
            });
        });

        return NextResponse.json({
            stats: {
                totalTopics,
                totalUnits,
                videosToReview,
                videosPublished
            },
            topicsForReview,
            userRole,
            canApprove: ["teacher assistant", "teaching assistant", "publisher"].includes(userRole?.toLowerCase())
        });

    } catch (error) {
        console.error("Error fetching teacher dashboard data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
