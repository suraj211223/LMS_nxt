import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Validate input
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

    // Login policy:
    // - Prefer bcrypt compare (seed script writes BCrypt hashes)
    // - For backward compatibility with demo plaintext entries use a fallback
    let passwordMatch = false;
    try {
      // If password_hash looks like a bcrypt hash, try comparing
      if (
        typeof user.passwordHash === "string" &&
        user.passwordHash.startsWith("$2")
      ) {
        passwordMatch = await bcrypt.compare(password, user.passwordHash);
      } else {
        // fallback: some sample/dump data stores 'dummy' in plaintext
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

    // Fetch role name
    const role = await prisma.role.findUnique({
      where: { id: user.roleId },
      select: { roleName: true },
    });

    const roleName = role?.roleName.toLowerCase(); // Convert to lowercase for comparison

    // Decide dashboard
    let redirect = "/login";

    if (roleName === "teacher") redirect = `/teachers/dashboard?userId=${user.id}`;
    if (roleName === "admin") redirect = "/admin";
    if (roleName === "editor") redirect = "/editor/dashboard";

    // If teacher, fetch only their assigned courses and include in response
    let assignedCourses = [];
    let assignedPrograms = [];
    if (roleName === "teacher") {
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

    return NextResponse.json({
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
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
