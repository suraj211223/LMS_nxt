# Deployment Guide (Detailed)

This guide covers everything related to deploying the **Video Lecture Production Lab (VL ProLab)** application. While tailored for **Railway**, the concepts apply to most modern hosting providers (Vercel, AWS, DigitalOcean).

---

## Deployment Overview

To deploy this application, you need two things:
1.  **Hosting for the App**: A server to run the Next.js code.
2.  **Hosting for the Database**: A MySQL database accessible from the internet.

We recommend **[Railway.app](https://railway.app/)** because it handles both easily.

---

## Railway Configuration

### Why these cryptic commands?
Next.js supports a "Standalone" output mode, which drastically reduces the size of the deployed app by only including necessary files. However, it sometimes misses non-code assets (like the `prisma` folder needed for database migrations).

We use custom commands to ensure *everything* works in production.

### 1. The Build Command
This runs once when you push your code. It prepares the application.

```bash
npx prisma generate && npm run build && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/ && node copy_prisma.js
```

**Breakdown:**
*   `npx prisma generate`: Creates the database client so the app can talk to the DB.
*   `npm run build`: Compiles the Next.js app into the `.next` folder.
*   `cp -r public ...`: Copies your images/assets to the standalone build folder (Standalone doesn't copy `public/` by default).
*   `cp -r .next/static ...`: Copies the static CSS/JS files.
*   `node copy_prisma.js`: A custom script we wrote to ensure the `prisma/` folder (with your schema) is inside the build, so we can run migrations later.

### 2. The Start Command
This runs every time the server starts up.

```bash
npx prisma db push --schema=.next/standalone/prisma/schema.prisma && node .next/standalone/prisma/seed.js && HOSTNAME=0.0.0.0 node .next/standalone/server.js
```

**Breakdown:**
*   `npx prisma db push ...`: Automatically updates your production database schema to match your code. This ensures your DB is always in sync with your deployment.
*   `node .../seed.js`: Runs the seed script. If your users already exist, it does nothing; if the DB is empty, it creates the default Admin/Teacher users.
*   `node .../server.js`: Finally, starts the actual web server.

---

## Environment Variables (Production)

When deploying, you MUST set these variables in your hosting provider's dashboard (e.g., Railway "Variables" tab).

| Variable          | Description                                                            |
| :---------------- | :--------------------------------------------------------------------- |
| `DATABASE_URL`    | The connection string to your *production* MySQL database.             |
| `NEXTAUTH_SECRET` | (If using NextAuth) A random string to secure logins.                  |
| `NEXTAUTH_URL`    | The full URL of your deployed site (e.g., `https://vl-pro.cucs.in`).   |

---

## Custom Domain Setup

To connect a professional domain (e.g., `vl-pro.cucs.in`) instead of `myapp.up.railway.app`.

### Recommended Method: Subdomain
**Target**: `vl-pro.cucs.in`

1.  **In Railway**:
    *   Go to **Settings** -> **Networking** -> **Custom Domain**.
    *   Enter `vl-pro.cucs.in`.
    *   Railway will give you a "DNS Value" (usually ends in `.up.railway.app`).

2.  **In Your DNS Provider (GoDaddy, Namecheap, etc.)**:
    *   Go to DNS Management for `cucs.in`.
    *   Add a **New Record**:
        *   **Type**: `CNAME`
        *   **Name**: `vl-pro` (This is the subdomain part)
        *   **Value** (or Target): Paste the value from Railway.
        *   **TTL**: `1 Hour` (Default).
    *   Save.

### Verification
Wait a few minutes (DNS propagation takes time). Then visit `https://vl-pro.cucs.in`. Railway automatically handles the SSL (HTTPS) certificate for you.

---

## Deployment Troubleshooting

### "Application crashes on start"
*   Check your **Build Logs** in Railway. Did the build fail?
*   Check your **Deploy Logs**. Did the database connection fail?
*   **Fix**: Ensure `DATABASE_URL` is correct and the database is reachable (not on localhost!).

### "Missing images or styles"
*   This usually means the `cp` commands in the Build Command failed or were removed. Ensure the Build Command is exactly as listed above.

### "Login fails in production"
*   Did you set `NEXTAUTH_URL` and `NEXTAUTH_SECRET`?
*   Are you using the correct seeded credentials (`testteacher@CU.in` / `dummy`)?
