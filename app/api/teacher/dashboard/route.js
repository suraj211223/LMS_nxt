import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";

import { promises as fs } from "fs";
import path from "path";

// Use the environment variable for Railway Volume, or fallback to local "uploads" folder
const STORAGE_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(process.cwd(), "uploads");

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
                        contents: true
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
        await Promise.all(courses.map(async course => {
            await Promise.all(course.sections.map(async section => {
                await Promise.all(section.contents.map(async topic => {
                    if (topic.workflowStatus === "Under_Review") {

                        // CHECK DISK FOR FILES
                        let hasPpt = false;
                        let hasDoc = false;
                        let hasZip = false;

                        // We need access to contentscript ID. 
                        // But wait, the previous query didn't include contentscript. 
                        // I must update the Prisma query first.
                        const script = await prisma.contentscript.findUnique({
                            where: { contentId: topic.id }
                        });

                        if (script) {
                            const topicDir = path.join(STORAGE_PATH, topic.id.toString());
                            try {
                                const files = await fs.readdir(topicDir);
                                hasPpt = files.some(f => f.startsWith("ppt."));
                                hasDoc = files.some(f => f.startsWith("doc."));
                                hasZip = files.some(f => f.startsWith("refs."));
                            } catch (e) { }
                        }

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
                            has_ppt: hasPpt,
                            has_doc: hasDoc,
                            has_zip: hasZip
                        });
                    }
                }));
            }));
        }));

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
