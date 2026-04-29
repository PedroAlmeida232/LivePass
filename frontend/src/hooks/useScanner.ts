"use client";

import { useState, useCallback } from "react";
import api from "@/lib/api";

export type ScanStatus = "idle" | "loading" | "valid" | "already_used" | "invalid_token" | "error";

interface ValidationResult {
  valid: boolean;
  message: string;
  holderName?: string; // Assume backend might return this
  eventName?: string;
  usedAt?: string;
}

export function useScanner() {
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [result, setResult] = useState<ValidationResult | null>(null);

  const validateTicket = useCallback(async (ticketId: string, totpToken: string) => {
    if (status === "loading") return;

    setStatus("loading");
    try {
      const { data } = await api.post<ValidationResult>("/scan/validate", {
        ticketId,
        totpToken,
      });

      if (data.valid) {
        setStatus("valid");
        setResult(data);
        // Play success vibration
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(200);
        }
      } else {
        setStatus("invalid_token");
        setResult(data);
      }
    } catch (error: any) {
      const statusCode = error.response?.status;
      if (statusCode === 409) {
        setStatus("already_used");
      } else if (statusCode === 422) {
        setStatus("invalid_token");
      } else {
        setStatus("error");
      }
      setResult(error.response?.data || { message: "Erro na validação" });
      
      // Play error vibration
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } finally {
      // Auto reset after 4 seconds
      setTimeout(() => {
        setStatus("idle");
        setResult(null);
      }, 4000);
    }
  }, [status]);

  return { status, result, validateTicket };
}
