import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function GET() {
  try {
    const totalUsers = await prisma.users.count();
    const teachers = await prisma.users.count({ where: { role: "teacher" } });
    const editors = await prisma.users.count({ where: { role: "editor" } });
    const programs = await prisma.programs.count();
    const topics = await prisma.content.count();

    const teachersList = await prisma.users.findMany({
      where: {
        role: {
          in: ["teacher", "admin", "editor"],
        },
      },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        teachers,
        editors,
        programs,
        topics,
      },
      teachers: teachersList,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
