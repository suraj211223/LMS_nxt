import React from 'react'
import AdminNav from '../../client/Admincomponents/AdminNav';

export default function Layout({ children }) {
  return (
    <>
      <AdminNav/>
      {children}
    </>
  );
}
