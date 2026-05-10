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
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#353535]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8F9F81]">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full px-4 py-3 rounded-xl border-2 bg-gray-50 text-[#231F20] placeholder:text-gray-400
            transition-all duration-200
            ${icon ? 'pl-11' : ''}
            ${error
              ? 'border-[#E53935] focus:border-[#E53935] focus:ring-2 focus:ring-[#E53935]/20'
              : 'border-transparent focus:border-[#3E853F] focus:ring-2 focus:ring-[#3E853F]/20'
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
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  options,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-[#353535]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          w-full px-4 py-3 rounded-xl border-2 bg-gray-50 text-[#231F20]
          transition-all duration-200 cursor-pointer appearance-none
          ${error
            ? 'border-[#E53935] focus:border-[#E53935] focus:ring-2 focus:ring-[#E53935]/20'
            : 'border-transparent focus:border-[#3E853F] focus:ring-2 focus:ring-[#3E853F]/20'
          }
          ${className}
        `}
        {...props}
      >
        <option value="">Seleccione una opción</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-[#353535]">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`
          w-full px-4 py-3 rounded-xl border-2 bg-gray-50 text-[#231F20] placeholder:text-gray-400
          transition-all duration-200 resize-none
          ${error
            ? 'border-[#E53935] focus:border-[#E53935] focus:ring-2 focus:ring-[#E53935]/20'
            : 'border-transparent focus:border-[#3E853F] focus:ring-2 focus:ring-[#3E853F]/20'
          }
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