'use client';

import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function InputField({ label, error, className = '', id, ...props }: InputFieldProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  const isEmail = props.type === 'email';

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <label htmlFor={inputId} className="text-sm font-medium text-[#353535]">
        {label}
      </label>
      <div className={`flex items-center bg-[#F5F5F5] rounded-2xl border-2 transition-all duration-200 ${
        error ? 'border-[#E53935]' : 'border-transparent focus-within:border-[#3E853F]'
      }`}>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#EFF7EA] m-2 shrink-0">
          {isEmail ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3E853F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3E853F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </div>
        <input
          id={inputId}
          className="flex-1 bg-transparent py-3 pr-4 text-[#231F20] placeholder:text-gray-400 outline-none"
          {...props}
        />
      </div>
      {error && <span className="text-xs text-[#E53935] font-medium px-1">{error}</span>}
    </div>
  );
}
