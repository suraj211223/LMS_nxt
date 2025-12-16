# Railway Deployment Instructions

Here are the correct command configurations for deploying your LMS application on Railway.

## 1. Build Command
This command compiles your Next.js application. It runs once during the build phase.

**Command:**
```bash
npx prisma generate && npm run build && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/ && node copy_prisma.js
```

*   `npx prisma generate`: Generates the Prisma Client.
*   `npm run build`: Runs `next build` (and now `node copy_prisma.js`).
*   `copy_prisma.js`: Ensures the `prisma` folder is available in the standalone build for the start command.

---

## 2. Start Command
This command runs every time your server starts (or restarts). It handles database updates and launches the server.

**Command:**
```bash
npx prisma db push --schema=.next/standalone/prisma/schema.prisma && node .next/standalone/prisma/seed.js && HOSTNAME=0.0.0.0 node .next/standalone/server.js
```

*   `npx prisma db push`: Pushes the schema state to the database (bypassing migration history checks).
*   `node .next/standalone/prisma/seed.js`: Runs your seeding script.
*   `node ...server.js`: Launches the production server.
