export default async function CoursesPage({ params }) {
  const { program_id } = await params;

  const res = await fetch(
    `http://localhost:3000/api/navigation/programs/${program_id}/courses`,
    { cache: "no-store" }
  );
  const courses = await res.json();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Courses</h1>
      <ul>
        {courses.map((c) => (
          <li key={c.course_id}>
            <a href={`/courses/${c.course_id}/units`}>
              {c.course_code} - {c.course_name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
