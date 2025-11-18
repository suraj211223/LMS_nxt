import Hello from "./client/components/Navbar";

export default function Home() {
  console.log("this is server");

  return (
    <div style={{ padding: "20px" }}>
      <h1>LMS Home</h1>

      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <a href="/login">Login</a>
        <a href="/schools">Go to LMS Navigation</a>
      </div>
    </div>
  );
}
