import React from 'react'
import EditorNav from '@/new_ui/UI/Editorcomponents/EditorNav';

export default function Layout({ children }) {
  return (
    <>
      <EditorNav />
      {children}
    </>
  );
}
