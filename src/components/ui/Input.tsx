import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-text-muted">
            {label}
            {props.required && <span className="text-accent-rose ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`input-field ${icon ? 'pl-10' : ''} ${error ? 'border-accent-rose focus:border-accent-rose focus:ring-accent-rose/30' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-accent-rose mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-text-muted">
            {label}
            {props.required && <span className="text-accent-rose ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`input-field min-h-[80px] resize-y ${error ? 'border-accent-rose' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-accent-rose mt-1">{error}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-text-muted">
            {label}
            {props.required && <span className="text-accent-rose ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`input-field appearance-none ${error ? 'border-accent-rose' : ''} ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-accent-rose mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
