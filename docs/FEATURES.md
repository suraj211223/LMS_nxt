# Features & Roles

The VL ProLab application uses a hierarchical Role-Based Access Control system defined in the database.

## User Roles

The system recognises the following primary roles:

1.  **Admin**: Full system access. Can manage schools, programs, users, and courses.
2.  **Teacher**: Academic access. Can manage their assigned courses, upload material, and review editor content.
3.  **Editor**: Production access. Can edit specific course content, upload videos, and mark tasks as complete.
4.  **Teaching Assistant (TA)**: Similar to Teacher but with limited scope (often restricted to specific sections).
5.  **Publisher**: Final review and publishing rights (often merged with Editor logic in current implementation).

---

## Permission Matrix (Database Schema)

The detailed permissions are stored in the `Role` table in MySQL (`prisma/schema.prisma`).

| Permission Flag | Description | Admin | Teacher | Editor |
| :--- | :--- | :--- | :--- | :--- |
| **`canManageSystem`** | Create users, schools, programs. | ✅ | ❌ | ❌ |
| **`canEditCourses`** | Create/Edit course structure & curriculum. | ✅ | ✅ (Assigned) | ❌ |
| **`canUploadContent`** | Upload videos, scripts, and notes. | ✅ | ✅ | ✅ |
| **`canApproveContent`** | Approve Editor's work (Script -> Ready). | ✅ | ✅ | ❌ |
| **`canPublishContent`** | Mark content as "Published" (Live). | ✅ | ✅ | ❌ |

---

## Content Workflow Status

Content flows through these states (Enum `WorkflowStatus`):

1.  **Planned**: Initial state.
2.  **Scripted**: Script written/uploaded.
3.  **Editing**: Editor is working on the video.
4.  **Post-Editing**: Final touches.
5.  **Ready_for_Video_Prep**: Ready for processing.
6.  **Under_Review**: Submitted for Teacher/TA approval.
7.  **Approved**: Verified by Teacher.
8.  **Published**: Live for students.

---

## Navigation & Access

| Role | Default Dashboard | Accessible Routes |
| :--- | :--- | :--- |
| **Admin** | `/admin` | `/admin/schools`, `/admin/users`, `/admin/courses` |
| **Teacher** | `/teachers/dashboard` | `/teachers/courses/[id]`, `/teachers/assignments` |
| **Editor** | `/editor/dashboard` | `/editor/tasks`, `/editor/upload` |
