import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-1.5">
            {label}
            {props.required && <span className="text-[#DC2626] ml-1">*</span>}
          </label>
        )}
        <div className="relative rounded-lg">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-white rounded-lg border text-sm text-[#111827] placeholder-[#94A3B8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#172554] focus:border-transparent ${
              leftIcon ? 'pl-9' : 'pl-3.5'
            } pr-3.5 py-2.5 ${
              error ? 'border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#CBD5E1]'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-[#DC2626] font-medium">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-[#64748B]">{helperText}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
