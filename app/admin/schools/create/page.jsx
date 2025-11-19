"use client";

import { useState } from "react";

export default function CreateSchoolPage() {
  const [schoolName, setSchoolName] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("/api/admin/schools/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolName }),
    });

    const data = await res.json();

    if (data.success) {
      alert("School created successfully!");
      setSchoolName("");
    } else {
      alert(data.error || "Failed to create school");
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Create School</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <label>School Name:</label>
        <br />
        <input
          type="text"
          required
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          style={{ width: "300px" }}
        />

        <br /><br />
        <button type="submit">Create School</button>
      </form>
    </div>
  );
}
