import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

// ============================================
// INPUT COMPONENT
// Institutional Luxury Design System
// ============================================

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, type = "text", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-navy mb-1.5">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            `
            w-full px-4 py-3 rounded-lg
            bg-white border border-gray-light
            text-charcoal placeholder:text-gray
            transition-all duration-200 ease-in-out
            focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20
            hover:border-gray
            disabled:bg-mist disabled:cursor-not-allowed
            `,
            error && "border-error focus:border-error focus:ring-error/20",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1 text-sm text-gray">{hint}</p>
        )}
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// ============================================
// TEXTAREA COMPONENT
// ============================================

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-navy mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            `
            w-full px-4 py-3 rounded-lg
            bg-white border border-gray-light
            text-charcoal placeholder:text-gray
            transition-all duration-200 ease-in-out
            focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20
            hover:border-gray
            disabled:bg-mist disabled:cursor-not-allowed
            resize-none min-h-[100px]
            `,
            error && "border-error focus:border-error focus:ring-error/20",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1 text-sm text-gray">{hint}</p>
        )}
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

// ============================================
// SELECT COMPONENT
// ============================================

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-navy mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            `
            w-full px-4 py-3 rounded-lg
            bg-white border border-gray-light
            text-charcoal
            transition-all duration-200 ease-in-out
            focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20
            hover:border-gray
            disabled:bg-mist disabled:cursor-not-allowed
            appearance-none cursor-pointer
            bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23333333%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]
            bg-[length:1.5rem] bg-[right_0.75rem_center] bg-no-repeat
            pr-10
            `,
            error && "border-error focus:border-error focus:ring-error/20",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Input, Textarea, Select };
