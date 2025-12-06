import React from 'react'
import AdminNav from '../../client/components/admin/AdminNav';

export default function Layout({ children }) {
  return (
    <>
      <AdminNav />
      {children}
    </>
  );
}
