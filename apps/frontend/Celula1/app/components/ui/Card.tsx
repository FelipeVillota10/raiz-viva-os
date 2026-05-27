'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function Card({
  children,
  className = '',
  onClick,
  selected = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative
        ${selected
          ? 'border-[#3E853F] bg-[#EFF7EA]'
          : 'border-[#E6D3A3] bg-white hover:border-[#3E853F]/50'
        }
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}