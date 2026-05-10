'use client';

import React from 'react';
import { RoleSelector, useRoleSelector } from '../components/RoleSelector';

export default function RegistroPage() {
  const { selectedRoles, toggleRole } = useRoleSelector();

  return (
    <RoleSelector selectedRoles={selectedRoles} onRoleToggle={toggleRole} />
  );
}