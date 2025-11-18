export default async function UnitPage({ params }) {
  const { course_id, unit_id } = await  params;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Unit #{unit_id}</h1>
      <p>This is a placeholder page.</p>

      <p>Later this page will show:</p>
      <ul>
        <li>PPT link</li>
        <li>Material files</li>
        <li>Workflow status</li>
        <li>Teacher/Editor actions</li>
      </ul>

      <a href={`/courses/${course_id}/units`}>← Back to Units</a>
    </div>
  );
}
