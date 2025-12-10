# Railway Deployment Instructions

Here are the correct command configurations for deploying your LMS application on Railway.

## 1. Build Command
This command compiles your Next.js application. It runs once during the build phase.

**Command:**
```bash
npx prisma generate && npm run build
```

*   `npx prisma generate`: Generates the Prisma Client so your code can talk to the database (even though it doesn't connect during build, the types are needed).
*   `npm run build`: Runs `next build` to compile your React/Next.js code.

---

## 2. Start Command
This command runs every time your server starts (or restarts). It handles database updates and launches the server.

**Command:**
```bash
npx prisma migrate deploy && node prisma/seed.js && node .next/standalone/server.js
```

*   `npx prisma migrate deploy`: Updates your production database schema to match your `schema.prisma`.
*   `node prisma/seed.js`: Runs your seeding script to populates default data (Users, Roles, Admins) if they don't exist.
*   `npm start`: Launches the production server (`next start`).
