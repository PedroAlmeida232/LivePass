"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTotpQr } from "@/hooks/useTotpQr";
import { TotpCountdown } from "./TotpCountdown";
import { Spinner } from "../ui/Spinner";
import { QRCodeSVG } from "qrcode.react";

interface TotpQrCodeProps {
  ticketUuid: string;
}

export function TotpQrCode({ ticketUuid }: TotpQrCodeProps) {
  const { token, countdown, isLoading } = useTotpQr(ticketUuid);
  
  // Format defined in architecture: uuid:token
  const qrValue = token ? `${ticketUuid}:${token}` : "";

  return (
    <div className="flex flex-col items-center">
      <div className="relative group mb-8 p-4 bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[240px] min-w-[240px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isLoading || !token ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Spinner size="lg" />
            </motion.div>
          ) : (
            <motion.div
              key={token}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="relative z-10"
            >
              <QRCodeSVG
                value={qrValue}
                size={208} // Equivalent to w-52 (52 * 4px)
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/favicon.ico", // Optional: Add a small logo in the center
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Subtle scan line effect */}
        {!isLoading && token && (
          <motion.div
            className="absolute left-0 right-0 h-1 bg-primary/20 z-20"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>

      <TotpCountdown countdown={countdown} />
      
      <p className="mt-8 text-body-sm text-text-muted text-center max-w-[280px]">
        Apresente este QR Code ao staff na entrada do evento.
      </p>
    </div>
  );
}
