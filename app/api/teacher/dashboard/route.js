import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";

export async function GET(req) {
    try {
        // 1. Fetch counts
        const totalTopics = await prisma.contentItem.count();
        const totalUnits = await prisma.courseSection.count();
        const videosToReview = await prisma.contentItem.count({
            where: { workflowStatus: "Under_Review" }
        });
        const videosPublished = await prisma.contentItem.count({
            where: { workflowStatus: "Published" }
        });

        // 2. Fetch topics for review
        const topicsForReviewRaw = await prisma.contentItem.findMany({
            where: {
                workflowStatus: "Under_Review"
            },
            include: {
                section: {
                    include: {
                        course: {
                            include: {
                                program: true
                            }
                        }
                    }
                }
            }
        });

        // 3. Format topics
        const topicsForReview = topicsForReviewRaw.map(topic => ({
            content_id: topic.id,
            topic_title: topic.title,
            workflow_status: "Under_Review",
            estimated_duration_min: topic.estimatedDurationMin,
            course_id: topic.section?.course?.id,
            course_title: topic.section?.course?.title || "Unknown Course",
            unit_title: topic.section?.title || "Unknown Unit",
            program_name: topic.section?.course?.program?.programName || "Unknown Program",
            videoLink: topic.videoLink
        }));

        return NextResponse.json({
            stats: {
                totalTopics,
                totalUnits,
                videosToReview,
                videosPublished
            },
            topicsForReview
        });

    } catch (error) {
        console.error("Error fetching teacher dashboard data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
