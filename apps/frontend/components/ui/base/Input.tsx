/**
 * Componentes de formulario reutilizables
 * @celula - Celula1
 * Input, Select y Textarea con validación y estilos consistentes.
 */

'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-0.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-base font-bold text-[#231F20]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3b5630]">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          aria-invalid={!!error}
          className={`
            w-full px-3 py-2 rounded-xl border-2 bg-[#F4F1EA] text-[#231F20] placeholder:text-[#8c9a80]
            transition-all duration-200
            ${icon ? 'pl-11' : ''}
            ${error
              ? 'border-[#E53935] focus:border-[#E53935] focus:ring-2 focus:ring-[#E53935]/20'
              : 'border-[#E6D3A3] focus:border-[#3b5630] focus:ring-2 focus:ring-[#3b5630]/20'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-[#E53935] font-medium">{error}</span>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  icon,
  options,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-0.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-base font-bold text-[#231F20]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-[#3b5630] pointer-events-none">
            {icon}
          </div>
        )}
        <select
          id={selectId}
          aria-invalid={!!error}
          className={`
          w-full py-3 rounded-xl border-2 bg-[#F4F1EA] text-[#231F20]
          transition-all duration-200 cursor-pointer appearance-none
          ${icon ? 'pl-11 pr-10' : 'pl-4 pr-10'}
          ${error
            ? 'border-[#E53935] focus:border-[#E53935] focus:ring-2 focus:ring-[#E53935]/20'
            : 'border-[#E6D3A3] focus:border-[#3b5630] focus:ring-2 focus:ring-[#3b5630]/20'
          }
          ${className}
        `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#3b5630]" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
      {error && (
        <span className="text-xs text-[#E53935] font-medium">{error}</span>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-0.5 w-full">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-[#231F20]">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        aria-invalid={!!error}
        className={`
          w-full px-4 py-3 rounded-xl border-2 bg-[#F4F1EA] text-[#231F20] placeholder:text-[#8c9a80]
          transition-all duration-200 resize-none
          ${error
            ? 'border-[#E53935] focus:border-[#E53935] focus:ring-2 focus:ring-[#E53935]/20'
            : 'border-[#E6D3A3] focus:border-[#3b5630] focus:ring-2 focus:ring-[#3b5630]/20'
          }
          ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-xs text-[#E53935] font-medium">{error}</span>
      )}
    </div>
  );
}
