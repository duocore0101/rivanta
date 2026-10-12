import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-1.5">
            {label}
            {props.required && <span className="text-[#DC2626] ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full bg-white rounded-lg border text-sm text-[#111827] px-3.5 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#172554] focus:border-transparent ${
            error ? 'border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#CBD5E1]'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-[#DC2626] font-medium">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
