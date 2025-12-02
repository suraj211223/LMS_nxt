import mysql from "mysql2/promise";

// helper: prefer explicit DB_HOST/DB_USER/DB_PASSWORD/DB_NAME, but also
// support a single DATABASE_URL (mysql://user:pass@host:3306/db) for
// convenience. This makes local dev easier if you have DATABASE_URL set.
function parseDatabaseUrl(url) {
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: u.port ? Number(u.port) : undefined,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname && u.pathname.replace(/\//, ""),
    };
  } catch (err) {
    return null;
  }
}

const defaultConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

let config = defaultConfig;
if (!config.host || !config.user || !config.database) {
  const parsed = process.env.DATABASE_URL ? parseDatabaseUrl(process.env.DATABASE_URL) : null;
  if (parsed) {
    config = { ...parsed, ...config };
  }
}

if (!config.host || !config.user || !config.database) {
  // Log a friendly error for dev — not throwing so app can still start in some environments.
  console.error("lib/db.js - missing DB config. Expected DB_HOST/DB_USER/DB_NAME or DATABASE_URL. Current config:", {
    host: config.host,
    user: config.user,
    database: config.database,
  });
}

export const pool = mysql.createPool({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database,
  waitForConnections: true,
  connectionLimit: 5,
});
