export default async function UnitsPage({ params }) {
  const { course_id } = await params;

  const res = await fetch(
    `http://localhost:3000/api/navigation/courses/${course_id}/units`,
    { cache: "no-store" }
  );
  const units = await res.json();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Units</h1>

      {units.length === 0 && <p>No units found for this course.</p>}

      <ul>
        {units.map((u) => (
          <li key={u.section_id}>
            <a href={`/courses/${course_id}/units/${u.section_id}`}>
              {u.unit_code ? `${u.unit_code} - ` : ""}{u.unit_title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
