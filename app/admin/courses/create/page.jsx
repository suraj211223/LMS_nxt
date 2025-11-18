"use client";

import { useEffect, useState } from "react";

export default function CreateCoursePage() {
  const [programId, setProgramId] = useState("");
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    async function fetchPrograms() {
      const res = await fetch("/api/navigation/all-programs"); // you have this API from earlier
      const data = await res.json();
      setPrograms(data.programs || []);
    }

    fetchPrograms();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("/api/admin/courses/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ programId, title, courseCode }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Course created!");
      setProgramId("");
      setTitle("");
      setCourseCode("");
    } else {
      alert(data.error || "Failed to create course");
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Create Course</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>

        <label>Select Program:</label>
        <br />
        <select
          required
          value={programId}
          onChange={(e) => setProgramId(e.target.value)}
          style={{ width: "300px" }}
        >
          <option value="">-- Select Program --</option>
          {programs.map((p) => (
            <option key={p.program_id} value={p.program_id}>
              {p.program_name}
            </option>
          ))}
        </select>

        <br /><br />

        <label>Course Title:</label>
        <br />
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "300px" }}
        />

        <br /><br />

        <label>Course Code:</label>
        <br />
        <input
          type="text"
          required
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
          style={{ width: "300px" }}
        />

        <br /><br />

        <button type="submit">Create Course</button>
      </form>
    </div>
  );
}
