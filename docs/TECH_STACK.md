# Tech Stack & Installation Guide

This document provides a comprehensive overview of the **Video Lecture Production Lab (VL ProLab)** technology stack and a detailed guide for setting up the project locally.

---

## Technology Stack Overview

We have chosen a modern, robust, and type-safe stack to ensure scalability and ease of development.

### Core Frameworks
*   **[Next.js 14+](https://nextjs.org/) (App Router)**: The React framework for the web. We use the **App Router** (`app/` directory) for routing, layouts, and server-side rendering.
*   **[Node.js](https://nodejs.org/) (v18+)**: The JavaScript runtime environment.

### Database & Backend
*   **[MySQL](https://www.mysql.com/)**: A reliable relational database management system.
*   **[Prisma](https://www.prisma.io/)**: An Object-Relational Mapper (ORM). It allows us to interact with the database using clean JavaScript/TypeScript code instead of writing raw SQL.

### Frontend & Styling
*   **[React](https://react.dev/)**: The library for building user interfaces.
*   **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework for rapid UI development.

---

## Project Structure Explained

Understanding the folder structure is key to navigating the codebase.

| Directory                  | Purpose                                                                               |
| :------------------------- | :------------------------------------------------------------------------------------ |
| **`app/`**                 | Contains the application source code. Routes are defined by folders (e.g., `app/admin/page.jsx`). |
| &nbsp;&nbsp;`├─ (admin)/`  | "Route Group" for admin pages. The parentheses `()` mean it doesn't affect the URL path. |
| &nbsp;&nbsp;`├─ api/`      | Backend API endpoints (e.g., `api/auth/login`).                                       |
| **`prisma/`**              | Database configuration.                                                               |
| &nbsp;&nbsp;`├─ schema.prisma` | Defines your database tables (Users, Courses, etc.).                                  |
| &nbsp;&nbsp;`├─ seed.js`   | Script to populate the DB with initial data.                                          |
| **`public/`**              | Static assets like images, icons, and fonts.                                          |
| **`docs/`**                | Documentation files (this folder).                                                    |

---

## Step-by-Step Installation

Follow these steps exactly to get the project running on your machine.

### 1. Prerequisites
Before you start, ensure you have:
*   **Node.js**: Run `node -v` in your terminal. It should be v18 or higher.
*   **MySQL Server**: Ensure your MySQL server is running. You can use a local installation (e.g., via XAMPP or Workbench) or a cloud database.

### 2. Install Dependencies
Download all the libraries required by the project.
```bash
npm install
```

### 3. Environment Configuration
The application needs to know how to connect to your database.
1.  Create a file named `.env` in the **root** directory (same level as `package.json`).
2.  Add your connection string:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
```

**Example:**
If your username is `root`, password is `password`, host is `localhost`, port is `3306`, and you want a database named `vl_prolab_db`:
```env
DATABASE_URL="mysql://root:password@localhost:3306/vl_prolab_db"
```

### 4. Database Initialization
Now we need to create the tables and add some data.

**Step A: Generate Prisma Client**
Reads your `schema.prisma` and generates the code needed to talk to the DB.
```bash
npx prisma generate
```

**Step B: Create Tables (Migration)**
Creates the actual tables (User, Course, etc.) in your MySQL database.
```bash
npx prisma migrate dev --name init
```

**Step C: Seed Data**
Adds default users (Admin, Teacher, Editor) so you can log in immediately.
```bash
npm run seed
```
*Note: This creates users like `testteacher@CU.in` with password `dummy`.*

### 5. Running the Application
Start the local development server.
```bash
npm run dev
```
Open your browser and visit `http://localhost:3000`.

---

## Troubleshooting & Common Issues

### "Can't connect to database"
*   **Check MySQL**: Is your MySQL server running?
*   **Check Credentials**: detailed in your `.env` file. Do you have the right password?
*   **Check Port**: Is MySQL actually on port 3306?

### "Prisma Client not initialized"
*   Run `npx prisma generate` again. This is often needed after installing new packages.

### "Table does not exist"
*   Run `npx prisma migrate dev` to create the tables.

---

## Command Reference

| Command                 | Description                   | When to use?                      |
| :---------------------- | :---------------------------- | :-------------------------------- |
| `npx prisma generate`   | Regenerates the client.       | After changing `schema.prisma`.   |
| `npx prisma migrate dev`| Applies schema changes to DB. | When you modify the DB structure. |
| `npx prisma db push`    | Quick sync without history.   | Rapid prototyping (skip migrations). |
| `npx prisma studio`     | Opens a database GUI.         | To view/edit data manually in browser. |
