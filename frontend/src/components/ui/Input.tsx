"use client";

import { useState, forwardRef } from "react";
import { motion } from "framer-motion";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

    return (
      <div className={`relative ${className}`}>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 pt-6 pb-2
              bg-surface-2 rounded-xl
              text-text-primary font-body text-body-md
              border-2 transition-colors duration-200 ease-out
              placeholder-transparent
              focus:outline-none
              ${
                error
                  ? "border-error"
                  : isFocused
                  ? "border-primary"
                  : "border-border"
              }
            `}
            placeholder={label}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              setIsFocused(false);
              setHasValue(e.target.value.length > 0);
            }}
            onChange={(e) => {
              setHasValue(e.target.value.length > 0);
              props.onChange?.(e);
            }}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          <label
            htmlFor={inputId}
            className={`
              absolute left-4 transition-all duration-200 ease-out
              pointer-events-none font-body
              ${
                isFocused || hasValue
                  ? "top-2 text-xs"
                  : "top-1/2 -translate-y-1/2 text-body-md"
              }
              ${
                error
                  ? "text-error"
                  : isFocused
                  ? "text-primary"
                  : "text-text-muted"
              }
            `}
          >
            {label}
          </label>
        </div>

        {error && (
          <motion.p
            id={`${inputId}-error`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-xs text-error font-body pl-1"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
