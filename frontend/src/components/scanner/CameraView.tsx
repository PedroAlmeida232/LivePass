"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { motion } from "framer-motion";

interface CameraViewProps {
  onScan: (decodedText: string) => void;
  isPaused: boolean;
}

export function CameraView({ onScan, isPaused }: CameraViewProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = "reader";

  useEffect(() => {
    scannerRef.current = new Html5Qrcode(regionId, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false
    });

    const config = { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    };

    scannerRef.current.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        if (!isPaused) {
          onScan(decodedText);
        }
      },
      () => {
        // Ignored: scan failures happen multiple times per second
      }
    ).catch(err => {
      console.error("Erro ao iniciar câmera:", err);
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => console.error("Erro ao parar câmera:", err));
      }
    };
  }, [onScan, isPaused]);

  return (
    <div className="relative w-full max-w-md aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl border border-border">
      <div id={regionId} className="w-full h-full" />
      
      {/* Scan Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Darkening outside the box */}
        <div className="absolute inset-0 border-[60px] border-black/40" />
        
        {/* Animated Scanning Box */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px]">
          {/* Corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg animate-pulse" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg animate-pulse" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg animate-pulse" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg animate-pulse" />
          
          {/* Laser Line */}
          <motion.div 
            className="absolute left-2 right-2 h-0.5 bg-primary shadow-[0_0_15px_rgba(108,142,191,0.8)]"
            animate={{ top: ["5%", "95%", "5%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>

      {isPaused && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-body-sm text-text-primary font-medium">Validando ingresso...</p>
          </div>
        </div>
      )}
    </div>
  );
}
