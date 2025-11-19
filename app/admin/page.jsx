"use client";

export default function AdminDashboard() {
  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Admin Dashboard</h1>
      <p style={{ marginTop: "10px" }}>
        Manage academic structure and user permissions.
      </p>

      <div style={{ marginTop: "30px", display: "flex", flexDirection: "column", gap: "15px" }}>
        
        <a
          href="/admin/schools/create"
          style={{
            padding: "12px 18px",
            background: "#4A90E2",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            width: "250px",
            textAlign: "center"
          }}
        >
         Create School
        </a>

        <a
          href="/admin/programs/create"
          style={{
            padding: "12px 18px",
            background: "#50C878",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            width: "250px",
            textAlign: "center"
          }}
        >
          Create Program
        </a>

        <a
          href="/admin/courses/create"
          style={{
            padding: "12px 18px",
            background: "#FF8C00",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            width: "250px",
            textAlign: "center"
          }}
        >
          Create Course
        </a>

        <a
          href="/schools"
          style={{
            padding: "12px 18px",
            background: "#6A5ACD",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            width: "250px",
            textAlign: "center"
          }}
        >
          View Structure
        </a>

      </div>
    </div>
  );
}
