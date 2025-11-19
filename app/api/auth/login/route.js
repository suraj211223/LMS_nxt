import { NextResponse } from "next/server";
import { pool } from "../../../../lib/db";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const [rows] = await pool.query(
      "SELECT user_id, role_id, password_hash, first_name, last_name FROM Users WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = rows[0];

    // For demo purposes, checking against plain text password 'dummy'
    // In production, you should use bcrypt to hash and compare passwords
    if (user.password_hash !== password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    //fetches role name
    const [roles] = await pool.query(
      "SELECT role_name FROM Roles WHERE role_id = ?",
      [user.role_id]
    );

    const role = roles[0].role_name.toLowerCase(); // Convert to lowercase for comparison

    //decides dashboard
    let redirect = "/login";

    if (role === "teacher") redirect = "/teachers/courses";
    if (role === "admin") redirect = "/admin/dashboard";
    if (role === "editor") redirect = "/editor/dashboard";

    return NextResponse.json({ 
      success: true, 
      redirect,
      user: {
        id: user.user_id,
        email: email,
        name: `${user.first_name} ${user.last_name}`,
        role: role
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
