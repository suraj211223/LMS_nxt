import { NextResponse } from "next/server";
import { pool } from "../../../../lib/db";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

//to prevent folder name issues on Windows/Linux
const SAFE = (s = "") => String(s).replace(/[\/\\:?<>|"]/g, "-");

export async function POST(req) {
  try {
    const form = await req.formData();

    //these are required fields
    const course_id = form.get("course_id");
    const unit_title = form.get("unit_title");
    const unit_code = form.get("unit_code");
    const prof_name = form.get("prof_name");

    //optional files uploads
    const pptFile = form.get("ppt");
    const materialsFile = form.get("materials");

    if (!course_id || !unit_title || !unit_code || !prof_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    //fetch course details for folder naming
    const [courseRows] = await pool.query(
      `SELECT title, course_code 
       FROM Courses 
       WHERE course_id = ?`,
      [course_id]
    );

    if (!courseRows.length) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const courseTitle = SAFE(courseRows[0].title);
    const courseCode = SAFE(courseRows[0].course_code);

    //building directory structure
    //base storage folder from .env.local
    const base = process.env.STORAGE_BASE;

    if (!base) {
      return NextResponse.json(
        { error: "Missing STORAGE_BASE in environment" },
        { status: 500 }
      );
    }

    // folder structure:
    // STORAGE_BASE / Courses / COURSECODE - COURSENAME / UNITCODE - TITLE - PROF
    const courseFolder = SAFE(`${courseCode} - ${courseTitle}`);
    const unitFolder = SAFE(`${unit_code} - ${unit_title} - ${prof_name}`);

    const fullPath = path.join(base, courseFolder, unitFolder);

    await fs.mkdir(fullPath, { recursive: true });
    await fs.mkdir(path.join(fullPath, "Materials"), { recursive: true });

    // Calculate the next order_index for the new unit
    const [orderResult] = await pool.query(
      `SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM CourseSections WHERE course_id = ?`,
      [course_id]
    );
    const nextOrderIndex = orderResult[0].next_order;

    //optional: save PPT
    let pptFilename = null;

    if (pptFile && pptFile.name) {
      const arrayBuffer = await pptFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      pptFilename = `${unitFolder}${path.extname(pptFile.name)}`;
      await fs.writeFile(path.join(fullPath, pptFilename), buffer);
    }

    // --------- DB INSERT: COURSESECTIONS ----------
    const [insertResult] = await pool.query(
      `INSERT INTO CourseSections 
       (course_id, title, order_index, unit_code, prof_name, storage_path, ppt_filename)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        course_id,
        unit_title,
        nextOrderIndex,
        unit_code,
        prof_name,
        fullPath,
        pptFilename,
      ]
    );

    const section_id = insertResult.insertId;

    // --------- OPTIONAL: SAVE MATERIAL ----------
    if (materialsFile && materialsFile.name) {
      const arrayBuffer = await materialsFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const filename = SAFE(materialsFile.name);
      const filePath = path.join(fullPath, "Materials", filename);

      await fs.writeFile(filePath, buffer);

      await pool.query(
        `INSERT INTO UnitMaterials 
         (section_id, filename, file_path, file_type, uploaded_by)
         VALUES (?, ?, ?, ?, ?)`,
        [
          section_id,
          filename,
          filePath,
          path.extname(filename),
          null   // uploaded_by will be null until you implement login
        ]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Unit created successfully",
      folder: fullPath,
      section_id,
    });

  } catch (err) {
    console.error("create-unit route error:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
