import { NextResponse } from "next/server";
import { pool } from "../../../../lib/db";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

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

    //validate teacher
    const [rows] = await pool.query(
      "SELECT user_id FROM Users WHERE email = ?",
      [userEmail]
    );

    if (!rows.length) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 401 });
    }

    const teacher = rows[0];

    const SAFE = (s = "") => String(s).replace(/[\/\\:?<>|"]/g, "-");

    const base = process.env.STORAGE_BASE;
    const school = SAFE(schoolName);
    const program = SAFE(programName);
    const semester = SAFE(semesterName);
    const courseFolder = SAFE(`${courseCode} - ${courseName}`);
    const unitFolder = SAFE(`${unitCode} - ${title} - ${profName}`);

    const fullPath = path.join(base, school, program, semester, courseFolder, unitFolder);

    await fs.mkdir(fullPath, { recursive: true });
    await fs.mkdir(path.join(fullPath, "Materials"), { recursive: true });

    let pptFilename = null;

    //save PPT
    if (pptFile && pptFile.name) {
      const arrayBuffer = await pptFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      pptFilename = `${unitFolder}${path.extname(pptFile.name)}`;
      await fs.writeFile(path.join(fullPath, pptFilename), buffer);
    }

    //insert section
    const [insert] = await pool.query(
      `INSERT INTO CourseSections 
       (course_id, title, order_index, unit_code, prof_name, storage_path, ppt_filename)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        courseId,
        title,
        0,
        unitCode,
        profName,
        fullPath,
        pptFilename
      ]
    );

    const sectionId = insert.insertId;

    //save other materials
    for (const file of otherFiles) {
      if (!file || !file.name) continue;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const filename = SAFE(file.name);
      const filePath = path.join(fullPath, "Materials", filename);

      await fs.writeFile(filePath, buffer);

      await pool.query(
        `INSERT INTO UnitMaterials (section_id, filename, file_path, file_type, uploaded_by)
        VALUES (?, ?, ?, ?, ?)`,
        [
          sectionId,
          filename,
          filePath,
          path.extname(filename),
          teacher.user_id
        ]
      );
    }

    return NextResponse.json({ success: true, directory: fullPath });

  } catch (err) {
    console.error("route error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
