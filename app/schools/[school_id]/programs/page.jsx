export default async function ProgramsPage({ params }) {
  const { school_id } = await params;

  const res = await fetch(
    `http://localhost:3000/api/navigation/schools/${school_id}/programs`,
    { cache: "no-store" }
  );
  const programs = await res.json();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Programs</h1>
      <ul>
        {programs.map((p) => (
          <li key={p.program_id}>
            <a href={`/programs/${p.program_id}/courses`}>
              {p.program_name} ({p.program_code})
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
