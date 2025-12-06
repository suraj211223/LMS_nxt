import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const totalUsers = await prisma.user.count();

    const allRoles = await prisma.role.findMany();

    // Group roles for stats
    const teacherRoleIds = allRoles
      .filter(r => ['teacher', 'teaching assistant', 'teacher assistant'].includes(r.roleName.toLowerCase()))
      .map(r => r.id);

    const editorRoleIds = allRoles
      .filter(r => ['editor', 'publisher'].includes(r.roleName.toLowerCase()))
      .map(r => r.id);

    // Count users matching these roles
    const teachers = teacherRoleIds.length > 0 ? await prisma.user.count({ where: { roleId: { in: teacherRoleIds } } }) : 0;
    const editors = editorRoleIds.length > 0 ? await prisma.user.count({ where: { roleId: { in: editorRoleIds } } }) : 0;

    const programs = await prisma.program.count();
    const topics = await prisma.contentItem.count();

    const usersRaw = await prisma.user.findMany({
      include: {
        role: true,
        school: true // Include school info
      },
      orderBy: { id: 'desc' }
    });

    const usersFormatted = usersRaw.map(u => ({
      id: u.id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
      email: u.email,
      role: u.role ? u.role.roleName.toLowerCase() : 'unknown',
      department: u.school ? u.school.name : 'N/A' // Return department if available
    }));

    return NextResponse.json({
      stats: {
        totalUsers,
        teachers,
        editors,
        programs,
        topics,
      },
      teachers: usersFormatted,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    return new NextResponse("Internal Server Error: " + error.message, { status: 500 });
  }
}
