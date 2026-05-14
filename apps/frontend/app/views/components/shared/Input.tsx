// views/components/shared/Input.tsx
'use client';
 
import React from 'react';
 
// ─── Input ────────────────────────────────────────────────────────────────────
 
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:  string;
  error?:  string;
  hint?:   string;
}
 
export function Input({
  label,
  error,
  hint,
  required,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
 
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-[#2c3a26]"
        >
          {label}
          {required && <span className="text-[#557149] ml-0.5">*</span>}
        </label>
      )}
 
      <input
        {...props}
        id={inputId}
        required={required}
        className={[
          'w-full rounded-lg px-3 py-2.5 text-sm text-[#2c3a26]',
          'bg-[#f9f3e7] border transition-colors duration-150 outline-none',
          'placeholder:text-[#9eaa94]',
          'focus:border-[#557149] focus:bg-white',
          error
            ? 'border-red-400 bg-red-50 focus:border-red-500'
            : 'border-[#c9d4be]',
          className,
        ].join(' ')}
      />
 
      {error && (
        <p className="text-[11px] text-red-500 font-medium leading-tight">{error}</p>
      )}
      {hint && !error && (
        <p className="text-[10px] text-[#6b7a63] leading-tight">{hint}</p>
      )}
    </div>
  );
}
 
// ─── Textarea ─────────────────────────────────────────────────────────────────
 
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:    string;
  error?:    string;
  hint?:     string;
  charCount?: { current: number; max: number };
}
 
export function Textarea({
  label,
  error,
  hint,
  required,
  charCount,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const textareaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
 
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-medium text-[#2c3a26]"
        >
          {label}
          {required && <span className="text-[#557149] ml-0.5">*</span>}
        </label>
      )}
 
      <textarea
        {...props}
        id={textareaId}
        required={required}
        className={[
          'w-full rounded-lg px-3 py-2.5 text-sm text-[#2c3a26]',
          'bg-[#f9f3e7] border transition-colors duration-150 outline-none resize-none',
          'placeholder:text-[#9eaa94]',
          'focus:border-[#557149] focus:bg-white',
          error
            ? 'border-red-400 bg-red-50 focus:border-red-500'
            : 'border-[#c9d4be]',
          className,
        ].join(' ')}
      />
 
      <div className="flex items-center justify-between">
        <div>
          {error && (
            <p className="text-[11px] text-red-500 font-medium leading-tight">{error}</p>
          )}
          {hint && !error && (
            <p className="text-[10px] text-[#6b7a63] leading-tight">{hint}</p>
          )}
        </div>
        {charCount && (
          <span
            className={[
              'text-[10px] ml-auto shrink-0',
              charCount.current > charCount.max * 0.9
                ? 'text-amber-500'
                : 'text-[#9eaa94]',
            ].join(' ')}
          >
            {charCount.current}/{charCount.max}
          </span>
        )}
      </div>
    </div>
  );
}