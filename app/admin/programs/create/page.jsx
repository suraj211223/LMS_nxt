"use client";

import { useState, useEffect } from "react";

export default function CreateProgramPage() {
  const [programName, setProgramName] = useState("");
  const [programCode, setProgramCode] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [schools, setSchools] = useState([]);

  // fetch list of schools for dropdown
  useEffect(() => {
    async function fetchSchools() {
      const res = await fetch("/api/navigation/schools");
      const data = await res.json();
      setSchools(data.schools || []);
    }
    fetchSchools();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("/api/admin/programs/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolId, programName, programCode }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Program created!");
      setProgramName("");
      setProgramCode("");
      setSchoolId("");
    } else {
      alert(data.error || "Failed to create program");
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Create Program</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        
        <label>Select School:</label>
        <br />
        <select
          required
          value={schoolId}
          onChange={(e) => setSchoolId(e.target.value)}
          style={{ width: "300px" }}
        >
          <option value="">-- Select School --</option>
          {schools.map((s) => (
            <option key={s.school_id} value={s.school_id}>
              {s.school_name}
            </option>
          ))}
        </select>

        <br /><br />

        <label>Program Name:</label>
        <br />
        <input
          type="text"
          required
          value={programName}
          onChange={(e) => setProgramName(e.target.value)}
          style={{ width: "300px" }}
        />

        <br /><br />

        <label>Program Code:</label>
        <br />
        <input
          type="text"
          required
          value={programCode}
          onChange={(e) => setProgramCode(e.target.value)}
          style={{ width: "300px" }}
        />

        <br /><br />

        <button type="submit">Create Program</button>
      </form>
    </div>
  );
}
