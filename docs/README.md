# VL ProLab Documentation Structure

Welcome to the **Video Lecture Production Lab (VL ProLab)** documentation.
Please refer to the specific guides below for detailed information.

## Documentation Partitions

### 1. [Tech Stack & Installation](./TECH_STACK.md)
**Refer to this guide for:**
*   List of technologies used (Next.js, Prisma, MySQL, etc.).
*   Local development setup.
*   Installation commands (`npm install`).
*   Database initialization (`prisma migrate`, `seed`).

### 2. [Deployment Guide](./DEPLOYMENT.md)
**Refer to this guide for:**
*   How to deploy to **Railway**.
*   Production build and start commands.
### 3. [Git Workflow Guide](./WORKFLOW.md)
**Refer to this guide for:**
*   **Current Workflow**: How to use `main` vs `dev` branches.
*   **Scalable Workflow**: Guide for future PR-based collaboration.
*   Branching strategies (Feature/Fix).

### 4. [API Reference](./API.md)
**Refer to this guide for:**
*   Backend API Endpoints (`/api/auth`, `/api/admin`, etc.).
*   Authentication details.

### 5. [Features & Roles](./FEATURES.md)
**Refer to this guide for:**
*   User Roles (Admin, Teacher, Editor).
*   Permission tables (`canManageSystem`, `canEditCourses`).
*   Content Workflow Statuses (`Planned` -> `Published`).

> [!NOTE]
> **Simplicity & Flexibility**: The current stack (Next.js, Mysql, Prisma) was chosen for reliability. However, if you find these faulty or outdated in the future, please feel free to switch to better technologies or software that suit the project's evolving needs.

---
*This README serves as the central index for project documentation.*
