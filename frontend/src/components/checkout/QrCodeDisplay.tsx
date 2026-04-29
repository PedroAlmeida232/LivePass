"use client";

import { motion } from "framer-motion";
import { scaleIn } from "@/lib/animations";
import { PixCopyButton } from "./PixCopyButton";
import { StatusPolling } from "./StatusPolling";

interface QrCodeDisplayProps {
  qrCode: string;
  copyPaste: string;
  expiresAt: string;
}

export function QrCodeDisplay({ qrCode, copyPaste, expiresAt }: QrCodeDisplayProps) {
  // O backend agora envia a URL direta ou base64 pronto
  const qrSrc = qrCode;

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="bg-surface border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center"
    >
      <div className="text-center mb-8">
        <h3 className="text-display-md text-text-primary mb-2">Escaneie o QR Code</h3>
        <p className="text-body-sm text-text-secondary">
          Abra o app do seu banco e escolha "Pagar via PIX"
        </p>
      </div>

      {/* Animated QR Code Container */}
      <div className="relative p-1.5 mb-10 group">
        {/* Rotating gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dim via-primary to-primary-light rounded-[22px] animate-spin-slow opacity-30 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Inner white container for QR */}
        <div className="relative bg-white p-6 rounded-[18px] shadow-inner">
          <img 
            src={qrSrc} 
            alt="QR Code PIX" 
            className="w-48 h-48"
          />
        </div>

        {/* Decorative corners */}
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-xl" />
        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-xl" />
        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-xl" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-xl" />
      </div>

      <div className="w-full space-y-8">
        <PixCopyButton copyPaste={copyPaste} />
        <StatusPolling expiresAt={expiresAt} />
      </div>
    </motion.div>
  );
}
