"use client";

import { useScanner } from "@/hooks/useScanner";
import { CameraView } from "@/components/scanner/CameraView";
import { ValidationFeedback } from "@/components/scanner/ValidationFeedback";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";

export default function ScannerPage() {
  const { status, result, validateTicket } = useScanner();

  const handleScan = (decodedText: string) => {
    try {
      // Format defined in architecture: ticketUuid:token
      const [ticketUuid, totpToken] = decodedText.split(':');
      
      if (ticketUuid && totpToken) {
        validateTicket(ticketUuid, totpToken);
      } else {
        console.warn("QR Code com formato inválido. Esperado 'uuid:token', recebido:", decodedText);
      }
    } catch (e) {
      console.error("Erro ao processar QR Code:", e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="text-center mb-12"
      >
        <h1 className="font-display text-display-lg text-text-primary mb-2">
          Validar Ingresso
        </h1>
        <p className="text-body-md text-text-secondary max-w-sm mx-auto">
          Aponte a câmera para o QR Code dinâmico no celular do cliente.
        </p>
      </motion.div>

      <div className="relative w-full flex justify-center">
        <CameraView 
          onScan={handleScan} 
          isPaused={status !== "idle"} 
        />
      </div>

      <div className="mt-12 w-full max-w-md">
        <div className="bg-surface-2/30 border border-border/50 rounded-2xl p-6">
          <h4 className="text-xs font-mono uppercase tracking-widest text-text-muted mb-4 text-center">
            Instruções de Uso
          </h4>
          <ul className="space-y-3">
            <li className="flex gap-3 text-body-sm text-text-secondary">
              <span className="text-primary">1.</span>
              Certifique-se que o cliente está com o brilho da tela alto.
            </li>
            <li className="flex gap-3 text-body-sm text-text-secondary">
              <span className="text-primary">2.</span>
              O QR Code é renovado a cada 30 segundos automaticamente.
            </li>
            <li className="flex gap-3 text-body-sm text-text-secondary">
              <span className="text-primary">3.</span>
              Aguarde o feedback visual antes de liberar a entrada.
            </li>
          </ul>
        </div>
      </div>

      <ValidationFeedback status={status} result={result} />
    </div>
  );
}
