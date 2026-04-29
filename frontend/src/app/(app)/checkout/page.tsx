"use client";

import { useState, useEffect } from "react";
import { CheckoutCard } from "@/components/checkout/CheckoutCard";
import { QrCodeDisplay } from "@/components/checkout/QrCodeDisplay";
import { StatusBadge } from "@/components/checkout/StatusBadge";
import { useCheckout } from "@/hooks/useCheckout";
import { useOrderStatus } from "@/hooks/useOrderStatus";
import { useUIStore } from "@/stores/uiStore";
import { CheckoutResponse, Event } from "@/types/ticket";
import { AnimatePresence, motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

// Mock event for Sprint 2 demonstration
const MOCK_EVENT: Event = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Concerto de Gala: Slate Blue Symphony",
  date: "26 de Outubro, 20:00",
  location: "Teatro Municipal, São Paulo",
  price: 120.0,
};

export default function CheckoutPage() {
  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
  const { mutate: generatePix, isPending } = useCheckout();
  const { data: orderStatus } = useOrderStatus(checkoutData?.orderId ?? null);
  const addToast = useUIStore((s) => s.addToast);
  const router = useRouter();

  const handleGeneratePix = () => {
    generatePix(undefined as any, {
      onSuccess: (data) => {
        setCheckoutData(data);
        addToast("PIX gerado com sucesso! Aguardando pagamento.", "info");
      },
      onError: (error: any) => {
        const backendError = error.response?.data;
        if (backendError?.details) {
          console.error("❌ Erro detalhado do PagBank:", backendError.details);
        }
        addToast(backendError?.message || "Erro ao gerar PIX. Tente novamente.", "error");
      }
    });
  };

  const isPaid = orderStatus?.status === "PAID";
  const isCancelled = orderStatus?.status === "CANCELLED";

  useEffect(() => {
    if (isPaid) {
      addToast("Pagamento confirmado! Aproveite seu evento.", "success");
      
      // Automatic redirect after 3 seconds of success feedback
      const timer = setTimeout(() => {
        router.push("/tickets");
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isPaid, addToast, router]);

  useEffect(() => {
    if (isCancelled) {
      addToast("O pedido foi cancelado.", "error");
      setCheckoutData(null); // Reset checkout state
    }
  }, [isCancelled, addToast]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
      <header className="w-full max-w-md mb-12 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="text-body-sm text-text-secondary hover:text-primary flex items-center gap-2 transition-colors"
        >
          ← Voltar
        </button>
        {checkoutData && <StatusBadge status={isPaid ? "PAID" : isCancelled ? "CANCELLED" : "PENDING"} />}
      </header>

      <div className="w-full flex justify-center items-center min-h-[500px]">
        <AnimatePresence mode="wait">
          {!checkoutData ? (
            <CheckoutCard
              key="checkout-card"
              event={MOCK_EVENT}
              onGeneratePix={handleGeneratePix}
              isLoading={isPending}
            />
          ) : isPaid ? (
            <motion.div
              key="success-card"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="bg-surface border border-success/30 rounded-3xl p-12 max-w-md w-full shadow-2xl text-center space-y-8"
            >
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-4xl"
                >
                  ✓
                </motion.span>
              </div>
              <div>
                <h2 className="text-display-md text-text-primary mb-2">Pagamento Confirmado!</h2>
                <p className="text-body-md text-text-secondary">
                  Seu ingresso para o {MOCK_EVENT.name} já está disponível no seu painel.
                </p>
                <p className="text-[11px] text-text-muted mt-4">Redirecionando automaticamente em instantes...</p>
              </div>
              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => router.push("/tickets")}
              >
                VER MEUS INGRESSOS
              </Button>
            </motion.div>
          ) : (
            <QrCodeDisplay
              key="qr-code-display"
              qrCode={checkoutData.qrCode}
              copyPaste={checkoutData.copyPaste}
              expiresAt={checkoutData.expiresAt}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
