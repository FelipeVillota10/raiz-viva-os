// views/components/shared/Button.tsx
'use client';
 
import React from 'react';
 
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  'primary' | 'secondary' | 'danger';
  size?:     'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children:  React.ReactNode;
}
 
const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   'bg-[#557149] hover:bg-[#3b5630] text-white border-transparent disabled:bg-[#8c9a80]',
  secondary: 'bg-[#f4ede0] hover:bg-[#e8e0d0] text-[#557149] border-[#c9d4be] hover:border-[#8c9a80]',
  danger:    'bg-red-500 hover:bg-red-600 text-white border-transparent',
};
 
const SIZE_CLASSES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};
 
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={[
        'inline-flex items-center justify-center gap-2',
        'font-medium border transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#557149]/50',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}