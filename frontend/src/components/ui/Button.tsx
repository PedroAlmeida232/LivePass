"use client";

import { motion, AnimatePresence } from "framer-motion";
import { buttonTap } from "@/lib/animations";
import { Spinner } from "./Spinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-gradient-to-r from-primary-dim to-primary text-white hover:from-primary hover:to-primary-light shadow-lg shadow-primary/20 hover:shadow-primary/40",
  ghost:
    "bg-transparent text-text-secondary border border-border hover:bg-surface-2 hover:text-text-primary hover:border-primary/50",
  danger:
    "bg-gradient-to-r from-red-900 to-error text-white hover:from-error hover:to-red-400 shadow-lg shadow-error/20",
};

const sizeStyles: Record<string, string> = {
  sm: "px-4 py-2 text-body-sm",
  md: "px-6 py-3 text-body-md",
  lg: "px-8 py-4 text-body-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={!disabled && !loading ? buttonTap : undefined}
      className={`
        relative inline-flex items-center justify-center gap-2
        font-body font-medium rounded-xl
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span
            key="spinner"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <Spinner size="sm" />
            <span>Carregando...</span>
          </motion.span>
        ) : (
          <motion.span
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
