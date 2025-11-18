"use client";

import { useState } from "react";

export default function CreateUnitPage() {
  const [form, setForm] = useState({
    course_id: "",
    unit_title: "",
    unit_code: "",
    prof_name: "",
  });

  const [ppt, setPpt] = useState(null);
  const [materials, setMaterials] = useState([]);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();

    const fd = new FormData();

    // required fields
    fd.append("course_id", form.course_id);
    fd.append("unit_title", form.unit_title);
    fd.append("unit_code", form.unit_code);
    fd.append("prof_name", form.prof_name);

    // optional files
    if (ppt) fd.append("ppt", ppt);
    materials.forEach((f) => fd.append("materials", f));

    const res = await fetch("/api/teacher/create-unit", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    alert(JSON.stringify(data, null, 2));
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Create Unit</h1>

      <form onSubmit={submit}>

        <input
          name="course_id"
          placeholder="Course ID"
          value={form.course_id}
          onChange={update}
          required
        />
        <br />

        <input
          name="unit_title"
          placeholder="Unit Title"
          value={form.unit_title}
          onChange={update}
          required
        />
        <br />

        <input
          name="unit_code"
          placeholder="Unit Code (U01V01)"
          value={form.unit_code}
          onChange={update}
          required
        />
        <br />

        <input
          name="prof_name"
          placeholder="Professor Name"
          value={form.prof_name}
          onChange={update}
          required
        />
        <br />

        <label>PPT File:</label>
        <input type="file" onChange={(e) => setPpt(e.target.files[0])} />
        <br />

        <label>Materials:</label>
        <input
          type="file"
          multiple
          onChange={(e) => setMaterials([...e.target.files])}
        />
        <br /><br />

        <button type="submit">Create Unit</button>
      </form>
    </div>
  );
}
