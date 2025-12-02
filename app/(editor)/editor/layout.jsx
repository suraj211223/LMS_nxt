import React from 'react'
import EditorNav from '../../../client/components/EditorNav';

export default function Layout({ children }) {
  return (
    <>
      <EditorNav/>
      {children}
    </>
  );
}
