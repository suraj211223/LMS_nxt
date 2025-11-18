"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (data.redirect) {
      window.location.href = data.redirect;
    } else {
      alert(data.error || "Login failed");
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Login</h1>
      <form onSubmit={handleLogin} style={{ marginTop: "20px" }}>
        <label>Email:</label>
        <br />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "250px" }}
        />
        <br /><br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
