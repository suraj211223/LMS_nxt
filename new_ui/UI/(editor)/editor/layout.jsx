import React from 'react'
import AdminNav from '../../client/Admincomponents/AdminNav';
import EditorNav from '../../client/Editorcomponents/EditorNav';

export default function Layout({ children }) {
  return (
    <>
      <EditorNav/>
      {children}
    </>
  );
}
