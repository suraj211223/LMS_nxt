import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        roleId: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    let passwordMatch = false;
    try {
      if (
        typeof user.passwordHash === "string" &&
        user.passwordHash.startsWith("$2")
      ) {
        passwordMatch = await bcrypt.compare(password, user.passwordHash);
      } else {
        passwordMatch = user.passwordHash === password;
      }
    } catch (err) {
      console.warn(
        "password compare failed, falling back to direct comparison",
        err
      );
      passwordMatch = user.passwordHash === password;
    }

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const role = await prisma.role.findUnique({
      where: { id: user.roleId },
      select: { roleName: true },
    });

    const roleName = role?.roleName.toLowerCase();

    let redirect = "/login";
    const isTeacherOrTA = ['teacher', 'teaching assistant', 'teacher assistant'].includes(roleName);

    if (isTeacherOrTA) redirect = "/teachers/dashboard";
    if (roleName === "admin") redirect = "/admin";
    if (roleName === "editor" || roleName === "publisher") redirect = "/editor/dashboard";

    let assignedCourses = [];
    let assignedPrograms = [];
    if (isTeacherOrTA) {
      const courses = await prisma.course.findMany({
        where: {
          assignments: {
            some: { userId: user.id },
          },
        },
        select: {
          id: true,
          title: true,
          courseCode: true,
        },
      });

      assignedCourses = courses.map((course) => ({
        id: course.id,
        title: course.title,
        courseCode: course.courseCode,
      }));

      const programs = await prisma.program.findMany({
        where: {
          courses: {
            some: {
              assignments: {
                some: { userId: user.id },
              },
            },
          },
        },
        distinct: ["id"],
        select: {
          id: true,
          programName: true,
          programCode: true,
        },
      });

      assignedPrograms = programs.map((program) => ({
        id: program.id,
        name: program.programName,
        code: program.programCode,
      }));
    }

    const response = NextResponse.json({
      success: true,
      redirect,
      user: {
        id: user.id,
        email,
        name: `${user.firstName} ${user.lastName}`,
        role: roleName,
        assignedCourses,
        assignedPrograms,
      },
    });

    response.cookies.set("userId", String(user.id), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
