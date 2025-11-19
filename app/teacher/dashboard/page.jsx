"use client";

export default function TeacherDashboard() {
  return (
    <div style={{ padding: "30px" }}>
      <h1>Teacher Dashboard</h1>

      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
        
        <a
          href="/teacher/create-unit"
          style={{
            padding: "12px 18px",
            background: "#0070f3",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            width: "220px",
            textAlign: "center"
          }}
        >
        Create Unit
        </a>

        <a
          href="/schools"
          style={{
            padding: "12px 18px",
            background: "#6A5ACD",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            width: "220px",
            textAlign: "center"
          }}
        >
        View Structure
        </a>
      </div>
    </div>
  );
}
