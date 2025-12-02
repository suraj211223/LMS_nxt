"use client"
import React from 'react'
import Nav from "@/new_ui/UI/teacherscomponents/Navbar"

export default function Layout({ children }) {
  return (
    <>
      <Nav />
      <main className="pt-16">
        {children}
      </main>
    </>
  );
}
