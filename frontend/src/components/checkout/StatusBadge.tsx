"use client";

import { motion } from "framer-motion";
import { scaleIn } from "@/lib/animations";

interface StatusBadgeProps {
  status: "PENDING" | "PAID";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isPaid = status === "PAID";

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={scaleIn}
      className={`
        px-4 py-2 rounded-full border flex items-center gap-2
        ${isPaid 
          ? "bg-success/10 border-success text-success" 
          : "bg-pending/10 border-pending text-pending"
        }
      `}
    >
      <motion.div
        animate={isPaid ? { scale: [1, 1.2, 1] } : { opacity: [1, 0.5, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className={`w-2 h-2 rounded-full ${isPaid ? "bg-success" : "bg-pending"}`}
      />
      <span className="text-body-sm font-medium tracking-wide uppercase">
        {isPaid ? "Pagamento Confirmado" : "Aguardando Pagamento"}
      </span>
    </motion.div>
  );
}
