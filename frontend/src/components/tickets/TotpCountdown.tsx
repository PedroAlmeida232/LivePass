"use client";

import { motion } from "framer-motion";

interface TotpCountdownProps {
  countdown: number;
}

export function TotpCountdown({ countdown }: TotpCountdownProps) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = (countdown / 30) * circumference;

  return (
    <div className="flex items-center gap-3 bg-surface-2/50 px-4 py-2 rounded-full border border-border/50">
      <div className="relative w-10 h-10 flex items-center justify-center">
        {/* Background Ring */}
        <svg className="absolute w-full h-full -rotate-90">
          <circle
            cx="20"
            cy="20"
            r={radius}
            className="stroke-border/30 fill-none"
            strokeWidth="3"
          />
          {/* Progress Ring */}
          <motion.circle
            cx="20"
            cy="20"
            r={radius}
            className="stroke-primary fill-none"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: progress }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>
        <span className="text-[10px] font-mono font-bold text-primary relative z-10">
          {countdown}s
        </span>
      </div>
      <span className="text-body-sm text-text-secondary font-medium">
        Renova em {countdown}s
      </span>
    </div>
  );
}
