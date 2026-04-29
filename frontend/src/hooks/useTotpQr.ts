"use client";

import { useState, useEffect, useCallback } from "react";
import { authenticator } from "otplib";
import api from "@/lib/api";

interface TotpSeedResponse {
  secret: string;
}

export const useTotpQr = (ticketUuid: string) => {
  const [token, setToken] = useState<string | null>(null);
  const [seed, setSeed] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the seed only once
  const fetchSeed = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get<TotpSeedResponse>(`/tickets/${ticketUuid}/totp-seed`);
      setSeed(data.secret);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch TOTP seed", error);
      setIsLoading(false);
    }
  }, [ticketUuid]);

  useEffect(() => {
    fetchSeed();
  }, [fetchSeed]);

  useEffect(() => {
    if (!seed) return;

    const updateToken = () => {
      try {
        const newToken = authenticator.generate(seed);
        setToken(newToken);
        
        // Synchronize countdown with the 30-second TOTP step
        const epoch = Math.floor(Date.now() / 1000);
        const timeRemaining = 30 - (epoch % 30);
        setCountdown(timeRemaining);
      } catch (err) {
        console.error("Error generating TOTP token", err);
      }
    };

    // Initial update
    updateToken();

    // Update every second to keep the countdown fluid
    const timer = setInterval(updateToken, 1000);

    return () => clearInterval(timer);
  }, [seed]);

  return { token, countdown, isLoading };
};
