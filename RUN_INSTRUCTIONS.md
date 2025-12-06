# Project Run Instructions

This document outlines how to set up the LMS_nxt project, create the database, and run the application.

## 1. Prerequisites
- **Node.js**: Ensure Node.js is installed.
- **MySQL**: You need a running MySQL server.

## 2. Initial Setup

1.  **Install Dependencies**
    Download all necessary libraries.
    ```bash
    npm install
    ```

2.  **Environment Configuration**
    Create a `.env` or `.env.local` file in the root directory if it doesn't exist. Add your database connection string:
    ```env
    DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
    # Example: mysql://root:password@localhost:3306/lms_db
    ```

## 3. Database Setup (Important!)

Before running the app, you must create the database schema and add the default users.

1.  **Generate Prisma Client**
    This creates the Javascript client based on your schema.
    ```bash
    npx prisma generate
    ```

2.  **Run Migrations**
    This creates the actual tables in your MySQL database.
    ```bash
    npx prisma migrate dev --name init
    ```

3.  **Seed the Database (Create Users)**
    This runs the script to add the default users (Teacher, Editor, TA, Publisher).
    ```bash
    npm run seed
    # OR directly:
    # npx prisma db seed
    ```
    *Note: This will create users like `testteacher@CU.in`, `editor1@CU.in`, `publisher1@CU.in`, etc. with password `dummy`.*

## 4. Running the Application

1.  **Start Development Server**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

## 5. Hosting / Deployment

When you are ready to host (e.g., on GoDaddy, AWS, Vercel, or a VPS):

1.  **Database**: You cannot use `localhost`. You need a hosted MySQL database (e.g., AWS RDS, DigitalOcean Managed Database, or GoDaddy MySQL).
    *   Get the **connection string** from your hosting provider.
    *   Update the `DATABASE_URL` in the environment variables of your hosting server.

2.  **Build the App**:
    In production, you don't run `npm run dev`. You build the optimized version:
    ```bash
    npm run build
    npm start
    ```

3.  **Run Migrations on Server**:
    On your server (or via a release command), you must run migrations to set up the production database tables:
    ```bash
    npx prisma migrate deploy
    # Note: 'deploy' is safer than 'dev' for production
    ```

4.  **Seed Production Data**:
    Run the seed script on the production server if you want the default users there too:
    ```bash
    npm run seed
    ```
