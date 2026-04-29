"use client";

import { useTickets } from "@/hooks/useTickets";
import { TotpQrCode } from "@/components/tickets/TotpQrCode";
import { StatusBadge } from "@/components/checkout/StatusBadge";
import { Spinner } from "@/components/ui/Spinner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fadeIn, scaleIn } from "@/lib/animations";

export default function TicketDetailPage({ params }: { params: { uuid: string } }) {
  const { data: tickets, isLoading } = useTickets();
  const router = useRouter();
  
  const ticket = tickets?.find((t) => t.id === params.uuid);
  const isPaid = ticket?.status === "PAID";

  if (isLoading) {
    return (
      <div className="flex justify-center py-40">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-40">
        <p className="text-text-secondary mb-4">Ingresso não encontrado.</p>
        <button onClick={() => router.push("/tickets")} className="text-primary hover:underline">
          Voltar para meus ingressos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="mb-12">
        <button 
          onClick={() => router.back()}
          className="text-body-sm text-text-secondary hover:text-primary flex items-center gap-2 transition-colors mb-8"
        >
          ← Voltar para Meus Ingressos
        </button>
        
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h1 className="font-display text-display-lg text-text-primary mb-2">
              Evento Principal
            </h1>
            <p className="text-body-md text-text-secondary">
              26 de Outubro de 2025, 20h • Arena São Paulo
            </p>
          </div>
          <StatusBadge status={isPaid ? "PAID" : "PENDING"} />
        </motion.div>
        
        <div className="h-px bg-border w-full mt-8" />
      </header>

      <div className="flex justify-center">
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="bg-surface border border-border rounded-[40px] p-10 shadow-2xl w-full max-w-md"
        >
          {isPaid ? (
            <TotpQrCode ticketUuid={ticket.id} />
          ) : (
            <div className="text-center py-12 space-y-6">
              <div className="w-20 h-20 bg-pending/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-4xl">!</span>
              </div>
              <p className="text-body-md text-text-secondary">
                O pagamento deste ingresso ainda não foi confirmado. O QR Code será liberado após a confirmação.
              </p>
              <button 
                onClick={() => router.push("/checkout")}
                className="text-primary font-medium hover:underline"
              >
                Ir para o Checkout
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
