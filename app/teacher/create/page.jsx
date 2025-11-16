"use client";
import { useState } from "react";

export default function CreateUnitPage() {
  const [form, setForm] = useState({
    userEmail: "",
    schoolName: "",
    programName: "",
    semesterName: "",
    courseCode: "",
    courseName: "",
    courseId: "",
    unitCode: "",
    title: "",
    profName: "",
  });

  const [pptFile, setPptFile] = useState(null);
  const [otherFiles, setOtherFiles] = useState([]);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();

    const fd = new FormData();
    for (const key in form) fd.append(key, form[key]);

    if (pptFile) fd.append("ppt", pptFile);
    otherFiles.forEach((f) => fd.append("otherFiles", f));

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

        <input name="userEmail" placeholder="Teacher Email" onChange={update} />
        <br />

        <input name="schoolName" placeholder="School Name" onChange={update} />
        <br />

        <input name="programName" placeholder="Program Name" onChange={update} />
        <br />

        <input name="semesterName" placeholder="Semester Name" onChange={update} />
        <br />

        <input name="courseCode" placeholder="Course Code" onChange={update} />
        <br />

        <input name="courseName" placeholder="Course Name" onChange={update} />
        <br />

        <input name="courseId" placeholder="Course ID" onChange={update} />
        <br />

        <input name="unitCode" placeholder="Unit Code (U01V01)" onChange={update} />
        <br />

        <input name="title" placeholder="Unit Title" onChange={update} />
        <br />

        <input name="profName" placeholder="Professor Name" onChange={update} />
        <br />

        <label>PPT File:</label>
        <input type="file" onChange={(e) => setPptFile(e.target.files[0])} />
        <br />

        <label>Other Materials:</label>
        <input
          type="file"
          multiple
          onChange={(e) => setOtherFiles(Array.from(e.target.files))}
        />
        <br />
        <br />

        <button type="submit">Create Unit</button>
      </form>
    </div>
  );
}
