import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

// Use the environment variable for Railway Volume, or fallback to local "uploads" folder
const STORAGE_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(process.cwd(), "uploads");

export const runtime = "nodejs";

// GET route to fetch courses
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const programId = searchParams.get("programId");
    const schoolId = searchParams.get("schoolId");

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { role: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const userRole = user.role?.roleName || "Teacher";

    if (courseId) {
      const whereCondition = {
        id: parseInt(courseId)
      };

      if (['Teacher', 'Teaching Assistant', 'Teacher Assistant'].includes(userRole)) {
        whereCondition.assignments = {
          some: { userId: parseInt(userId) }
        };
      }

      const course = await prisma.course.findFirst({
        where: whereCondition,
        include: {
          program: {
            include: { school: true },
          },
          assignments: {
            include: {
              user: true
            }
          },
          sections: {
            orderBy: { id: 'asc' },
            include: {
              contents: {
                orderBy: { id: 'asc' },
                include: {
                  contentscript: true,
                },
              },
              materials: true,
            },
          },
        },
      });

      if (!course) {
        return NextResponse.json({ error: "Course not found or access denied" }, { status: 404 });
      }

      const courseData = {
        userRole,
        course_id: course.id,
        name: course.title,
        course_code: course.courseCode,
        status: course.status,
        program: course.program?.programName,
        department: course.program?.school?.name,
        units: await Promise.all(course.sections.map(async (section) => ({
          id: `u${section.id}`,
          section_id: section.id,
          name: section.title,
          order: section.orderIndex,
          storagePath: section.storagePath,
          pptFilename: section.pptFilename,
          materials: section.materials,
          topics: await Promise.all(section.contents.map(async (item) => {
            // Check disk for files to enable download buttons
            let hasPpt = false;
            let hasDoc = false;
            let hasZip = false;

            // We only check if contentscript entry exists at all first maybe? 
            // Actually, checks disk directly is safer.
            if (item.contentscript) {
              const topicDir = path.join(STORAGE_PATH, item.id.toString());
              try {
                const files = await fs.readdir(topicDir);
                hasPpt = files.some(f => f.startsWith("ppt."));
                hasDoc = files.some(f => f.startsWith("doc."));
                hasZip = files.some(f => f.startsWith("refs."));
              } catch (e) {
                // No dir => no files
              }
            }

            return {
              id: `t${item.id}`,
              content_id: item.id,
              name: item.title,
              estimatedTime: item.estimatedDurationMin || 0,
              status: mapWorkflowStatus(item.workflowStatus),
              learning_objectives: item.learningObjectives,
              videoLink: item.videoLink,
              script: {
                ppt: hasPpt,
                doc: hasDoc,
                zip: hasZip,
              },
              materialsApproved: item.materialsApproved,
            };
          })),
        }))),
        assigned_teachers: course.assignments.map(a => ({
          id: a.user.id,
          name: `${a.user.firstName} ${a.user.lastName}`,
          email: a.user.email
        })),
      };

      return NextResponse.json(courseData);
    }

    // List courses assigned to the user (unless Admin/Editor)
    const isRestricted = ['Teacher', 'Teaching Assistant', 'Teacher Assistant'].includes(userRole);

    const courses = await prisma.course.findMany({
      where: {
        ...(isRestricted && {
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
      orderBy: { id: 'desc' }
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

function mapWorkflowStatus(dbStatus) {
  const statusMap = {
    Planned: "planned",
    Scripted: "scripted",
    Editing: "editing",
    Post_Editing: "under_review",
    ReadyForVideoPrep: "ready_for_video_prep",
    Under_Review: "under_review",
    Published: "published",
    Approved: "approved",
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