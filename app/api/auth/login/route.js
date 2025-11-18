import { NextResponse } from "next/server";
import { pool } from "../../../../lib/db";

export async function POST(req) {
  try {
    const { email } = await req.json();

    const [rows] = await pool.query(
      "SELECT user_id, role_id FROM Users WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = rows[0];

    //fetches role name
    const [roles] = await pool.query(
      "SELECT role_name FROM Roles WHERE role_id = ?",
      [user.role_id]
    );

    const role = roles[0].role_name;

    //decides dashboard
    let redirect = "/login";

    if (role === "teacher") redirect = "/teacher/dashboard";
    if (role === "admin") redirect = "/admin/dashboard";
    if (role === "editor") redirect = "/editor/dashboard";

    return NextResponse.json({ success: true, redirect });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
