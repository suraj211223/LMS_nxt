# LMS Project — Database Schema Requirements

_Last updated: 2025-11-16_

This document describes the database requirements expected by the LMS backend.
The DB maintainer uses this file to update the schema (via DDL and ALTER scripts).
No SQL commands here, this is only for reference.

---

## 1. Core Tables Required

### Schools

- school_id (PK)
- school_name (unique)

### Programs

- program_id (PK)
- school_id (FK → Schools)
- program_name
- program_code

### Courses

- course_id (PK)
- program_id (FK → Programs)
- title
- course_code (unique)
- status (`Draft`, `Active`, `Archived`)
- content_folder_url (optional)

### CourseSections (Units)

Columns required by backend:

| Column       | Purpose                |
| ------------ | ---------------------- |
| section_id   | primary key            |
| course_id    | FK to Courses          |
| title        | unit title             |
| order_index  | ordering of units      |
| unit_code    | e.g., U01V01           |
| prof_name    | instructor name        |
| storage_path | filesystem folder path |
| ppt_filename | saved PPT file name    |

### UnitMaterials

Columns required by backend:

| Column      | Purpose              |
| ----------- | -------------------- |
| material_id | primary key          |
| section_id  | FK to CourseSections |
| filename    | material filename    |
| file_path   | absolute file path   |
| file_type   | file extension       |
| uploaded_by | FK to Users          |
| uploaded_at | timestamp            |

### Users

- user_id (PK)
- role_id (FK → Roles)
- email (unique)
- password_hash
- first_name
- last_name

### Roles

- role_id (PK)
- role_name (`admin`, `teacher`, `editor`)
- permission flags (optional)

---

## 2. Teacher Workflow Requirements

Backend route: POST /api/teacher/create-unit

Backend requires:

- Valid teacher user in `Users` table
- school_name, program_name, semester_name, course_code, course_name must reference existing rows
- course_id must exist in `Courses`
- backend inserts into `CourseSections`
- backend inserts materials into `UnitMaterials`

Fields backend depends on:

- unit_code
- prof_name
- storage_path
- ppt_filename

---

## 3. Required Test Data

To run backend locally, DB must contain:

- School: **School of Science**
- Program: **BSc Computer Science** (program_code: BSC)
- Course: **BSC-OS-101 — Operating Systems** (course_id = 1)
- Teacher:
  - email: **testteacher@college.edu**
  - role: **teacher**

These entries exist in `test.sql`.

---

## 4. For DB

- Convert the requirements (in this file) into SQL inside `ddl_alter.sql`.
- Update `full_schema.md` (whenever needed).
- Keep schema synchronized with backend expectations.
- Test changes locally using `test.sql`.
- Confirm foreign keys, constraints, and fields are correct.
- Report mismatches between backend logic and schema.

---

## 5. Backend Interaction Summary

Backend performs:

### Reads:

- Users (validate teacher email)
- Courses (validate course_id)

### Writes:

- Inserts into CourseSections
- Inserts into UnitMaterials
- Saves files to filesystem using storage_path

---

## 6. Upcoming Schema requirements

To support editor and teacher interactions (content review, editing, approval), the following schema changes are required:

---

### Add workflow_status to CourseSections

Represents the current lifecycle stage of the unit.

Required ENUM:

- `Planned`
- `Scripted`
- `Editing`
- `Post-Editing`
- `Ready_for_Video_Prep`
- `Under_Review`
- `Published`

Add column:

- workflow_status ENUM (default `'Planned'`)

# End of schema_reference.md
