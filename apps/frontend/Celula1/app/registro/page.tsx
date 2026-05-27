'use client';

import React, { useState, useEffect } from 'react';
import { RoleSelector, useRoleSelector } from '../components/RoleSelector';
import { HeaderSecundario } from '../components/HeaderSecundario';
import { Footer } from '../components/Footer';

export default function RegistroPage() {
  const { selectedRoles, toggleRole } = useRoleSelector();
  const [backRoute, setBackRoute] = useState('/');

  useEffect(() => {
    const referrer = document.referrer;
    if (referrer.includes('/login/inicio')) {
      setBackRoute('/login/inicio');
    } else {
      setBackRoute('/');
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F1EA]">
      <HeaderSecundario backRoute={backRoute} title="Registro" />
      <main className="flex-1">
        <RoleSelector selectedRoles={selectedRoles} onRoleToggle={toggleRole} />
      </main>
      <Footer />
    </div>
  );
}