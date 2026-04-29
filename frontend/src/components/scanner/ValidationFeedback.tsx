"use client";

import { motion, AnimatePresence } from "framer-motion";
import { scaleIn, shakeAnimation } from "@/lib/animations";
import { ScanStatus } from "@/hooks/useScanner";
import { useEffect } from "react";

interface ValidationFeedbackProps {
  status: ScanStatus;
  result: any;
}

const statusConfigs = {
  valid: {
    bg: "bg-[#0D2818]",
    border: "border-success",
    title: "INGRESSO VÁLIDO",
    icon: "✓",
    color: "text-success",
  },
  already_used: {
    bg: "bg-[#1A0A0A]",
    border: "border-error",
    title: "INGRESSO JÁ UTILIZADO",
    icon: "✗",
    color: "text-error",
  },
  invalid_token: {
    bg: "bg-[#1A1200]",
    border: "border-warning",
    title: "TOKEN INVÁLIDO OU EXPIRADO",
    icon: "⚠",
    color: "text-warning",
  },
  error: {
    bg: "bg-[#1A0A0A]",
    border: "border-error",
    title: "ERRO NA VALIDAÇÃO",
    icon: "!",
    color: "text-error",
  },
};

export function ValidationFeedback({ status, result }: ValidationFeedbackProps) {
  const playSound = (type: "success" | "error") => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type === "success" ? "sine" : "square";
      osc.frequency.setValueAtTime(type === "success" ? 880 : 220, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn("Audio feedback not supported or blocked");
    }
  };

  useEffect(() => {
    if (status === "valid") playSound("success");
    else if (status !== "idle" && status !== "loading") playSound("error");
  }, [status]);

  if (status === "idle" || status === "loading") return null;

  const config = statusConfigs[status as keyof typeof statusConfigs] || statusConfigs.error;
  const isError = status !== "valid";

  return (
    <AnimatePresence>
      <motion.div
        variants={isError ? shakeAnimation : scaleIn}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, scale: 0.9 }}
        className={`
          fixed bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-96
          ${config.bg} ${config.border} border-2 rounded-2xl p-6 shadow-2xl z-50
        `}
      >
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full ${config.bg} border ${config.border} flex items-center justify-center text-2xl ${config.color}`}>
            {config.icon}
          </div>
          <div className="flex-1">
            <h3 className={`font-display text-lg ${config.color} mb-1`}>
              {config.title}
            </h3>
            <p className="text-body-sm text-text-primary">
              {result?.holderName || "Visitante"}
            </p>
            <p className="text-[11px] text-text-secondary mt-2 font-mono uppercase tracking-wider">
              {status === "valid" 
                ? `Validado às ${new Date().toLocaleTimeString()}`
                : result?.message || "Tente novamente ou solicite suporte."
              }
            </p>
          </div>
        </div>

        {/* Animated progress bar for auto-dismiss */}
        <motion.div 
          className={`absolute bottom-0 left-0 h-1 ${config.border.replace('border-', 'bg-')}`}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 4, ease: "linear" }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
