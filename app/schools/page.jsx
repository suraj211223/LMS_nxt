export default async function SchoolsPage() {
  const res = await fetch("http://localhost:3000/api/navigation/schools", {
    cache: "no-store"
  });
  const schools = await res.json();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Schools</h1>
      <ul>
        {schools.map((s) => (
          <li key={s.school_id}>
            <a href={`/schools/${s.school_id}/programs`}>{s.school_name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
