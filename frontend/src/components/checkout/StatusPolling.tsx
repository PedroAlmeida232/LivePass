"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface StatusPollingProps {
  expiresAt: string;
}

export function StatusPolling({ expiresAt }: StatusPollingProps) {
  const [timeLeft, setTimeLeft] = useState({ minutes: "00", seconds: "00" });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const target = new Date(expiresAt).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft({ minutes: "00", seconds: "00" });
        clearInterval(interval);
      } else {
        const min = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const sec = Math.floor((diff % (1000 * 60)) / 1000);
        
        setTimeLeft({
          minutes: min.toString().padStart(2, "0"),
          seconds: sec.toString().padStart(2, "0")
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center text-body-sm px-1">
        <span className="text-text-secondary">Expira em</span>
        <div className="flex gap-0.5 font-mono font-medium text-primary bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">
          <AnimatePresence mode="wait">
            <motion.span
              key={timeLeft.minutes}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {timeLeft.minutes}
            </motion.span>
          </AnimatePresence>
          <span>:</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={timeLeft.seconds}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {timeLeft.seconds}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 py-4 bg-surface-2/50 rounded-2xl border border-border/50">
        <motion.div
          animate={{ 
            rotate: 360,
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2, 
            ease: "linear" 
          }}
          className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full"
        />
        <span className="text-body-sm text-text-secondary">
          {isExpired ? "O código expirou. Gere um novo." : "Aguardando confirmação do pagamento..."}
        </span>
      </div>
    </div>
  );
}
