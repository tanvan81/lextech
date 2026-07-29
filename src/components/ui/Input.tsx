import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  type = 'text',
  className = '',
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-2xs">
        <input
          id={inputId}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={`block w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white'
          } ${isPassword ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={4}
        className={`block w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};
