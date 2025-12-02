import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

export const runtime = "nodejs";

// GET route to fetch courses
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const programId = searchParams.get("programId");
    const schoolId = searchParams.get("schoolId");
    const userId = searchParams.get("userId");

    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: parseInt(courseId) },
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

      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      const courseData = {
        course_id: course.id,
        name: course.title,
        course_code: course.courseCode,
        status: course.status,
        program: course.program?.programName,
        department: course.program?.school?.name,
        units: course.sections.map((section) => ({
          id: `u${section.id}`,
          section_id: section.id,
          name: section.title,
          order: section.orderIndex,
          topics: section.contents.map((item) => ({
            id: `t${item.id}`,
            content_id: item.id,
            name: item.title,
            estimatedTime: item.estimatedDurationMin || 0,
            status: mapWorkflowStatus(item.workflowStatus),
            learning_objectives: item.learningObjectives,
          })),
        })),
      };

      return NextResponse.json(courseData);
    }

    const courses = await prisma.course.findMany({
      where: {
        ...(userId && {
          assignments: {
            some: { userId: parseInt(userId) },
          },
        }),
        ...(programId && { programId: parseInt(programId) }),
        ...(schoolId && {
          program: { schoolId: parseInt(schoolId) },
        }),
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

// Helper function to map database workflow status to frontend status
function mapWorkflowStatus(dbStatus) {
  const statusMap = {
    Planned: "planned",
    Scripted: "scripted",
    Editing: "editing",
    "Post-Editing": "post-editing",
    "Ready_for_Video_Prep": "ready",
    "Under_Review": "review",
    Published: "published",
  };

  return statusMap[dbStatus] || "planned";
}

export async function POST(req) {
  try {
    const form = await req.formData();

    const userEmail = form.get("userEmail");
    const schoolName = form.get("schoolName");
    const programName = form.get("programName");
    const semesterName = form.get("semesterName");
    const courseCode = form.get("courseCode");
    const courseName = form.get("courseName");
    const courseId = form.get("courseId");
    const unitCode = form.get("unitCode");
    const title = form.get("title");
    const profName = form.get("profName");

    const pptFile = form.get("ppt");
    const otherFiles = form.getAll("otherFiles");

    const teacher = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 401 }
      );
    }

    const SAFE = (s = "") => String(s).replace(/[\/\\:?<>|"]/g, "-");

    let base = process.env.STORAGE_BASE;
    if (!base) {
      console.warn("STORAGE_BASE not set, falling back to ./storage");
      base = path.join(process.cwd(), "storage");
    }
    const school = SAFE(schoolName);
    const program = SAFE(programName);
    const semester = SAFE(semesterName);
    const courseFolder = SAFE(`${courseCode} - ${courseName}`);
    const unitFolder = SAFE(`${unitCode} - ${title} - ${profName}`);

    const fullPath = path.join(base, school, program, semester, courseFolder, unitFolder);

    await fs.mkdir(fullPath, { recursive: true });
    await fs.mkdir(path.join(fullPath, "Materials"), { recursive: true });

    let pptFilename = null;

    if (pptFile && pptFile.name) {
      const arrayBuffer = await pptFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      pptFilename = `${unitFolder}${path.extname(pptFile.name)}`;
      await fs.writeFile(path.join(fullPath, pptFilename), buffer);
    }

    const section = await prisma.courseSection.create({
      data: {
        courseId: parseInt(courseId),
        title,
        orderIndex: 0,
        unitCode: unitCode,
        profName: profName,
        storagePath: fullPath,
        pptFilename: pptFilename,
      },
    });

    for (const file of otherFiles) {
      if (!file || !file.name) continue;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const filename = SAFE(file.name);
      const filePath = path.join(fullPath, "Materials", filename);

      await fs.writeFile(filePath, buffer);

      await prisma.unitMaterial.create({
        data: {
          sectionId: section.id,
          filename,
          filePath: filePath,
          fileType: path.extname(filename),
          uploadedBy: teacher.id,
        },
      });
    }

    return NextResponse.json({ success: true, directory: fullPath });
  } catch (err) {
    console.error("route error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}