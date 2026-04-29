"use client";

import { motion } from "framer-motion";
import { scaleIn } from "@/lib/animations";
import { Button } from "../ui/Button";
import { Event } from "@/types/ticket";

interface CheckoutCardProps {
  event: Event;
  onGeneratePix: () => void;
  isLoading: boolean;
}

export function CheckoutCard({ event, onGeneratePix, isLoading }: CheckoutCardProps) {
  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="bg-surface border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-display-md text-text-primary mb-2">{event.name}</h2>
          <p className="text-body-sm text-text-secondary">
            {event.date} • {event.location}
          </p>
        </div>

        <div className="h-px bg-border w-full" />

        <div className="flex justify-between items-center">
          <span className="text-body-md text-text-secondary">Preço</span>
          <span className="text-display-sm text-primary">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(event.price)}
          </span>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={onGeneratePix}
          loading={isLoading}
        >
          GERAR PIX
        </Button>

        <p className="text-[10px] text-text-muted text-center uppercase tracking-widest">
          Pagamento processado via PIX de alta segurança
        </p>
      </div>
    </motion.div>
  );
}
