"use client";

import { useEffect } from "react";

export default function TeacherRootRedirect() {
  useEffect(() => {
    window.location.href = "/teacher/dashboard";
  }, []);

  return <p>Redirecting…</p>;
}
