"use client";

import { motion, AnimatePresence } from "framer-motion";
import { slideInRight } from "@/lib/animations";
import { useUIStore, type Toast as ToastType } from "@/stores/uiStore";

const typeStyles: Record<string, { bg: string; border: string; icon: string }> = {
  success: {
    bg: "bg-[#0D2818]",
    border: "border-success",
    icon: "✓",
  },
  error: {
    bg: "bg-[#1A0A0A]",
    border: "border-error",
    icon: "✗",
  },
  info: {
    bg: "bg-[#0A1520]",
    border: "border-primary",
    icon: "ℹ",
  },
};

function ToastItem({ toast }: { toast: ToastType }) {
  const removeToast = useUIStore((s) => s.removeToast);
  const style = typeStyles[toast.type];

  return (
    <motion.div
      layout
      variants={slideInRight}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`
        ${style.bg} ${style.border}
        border rounded-xl px-4 py-3
        flex items-center gap-3
        shadow-2xl min-w-[320px] max-w-[420px]
        cursor-pointer
      `}
      onClick={() => removeToast(toast.id)}
      role="alert"
    >
      <span className="text-lg flex-shrink-0">{style.icon}</span>
      <p className="text-body-sm text-text-primary font-body flex-1">
        {toast.message}
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeToast(toast.id);
        }}
        className="text-text-muted hover:text-text-primary transition-colors text-sm flex-shrink-0"
        aria-label="Fechar notificação"
      >
        ✕
      </button>
    </motion.div>
  );
}

export function Toaster() {
  const toasts = useUIStore((s) => s.toasts);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
