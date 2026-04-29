"use client";

import { useTickets } from "@/hooks/useTickets";
import { TicketList } from "@/components/tickets/TicketList";
import { Spinner } from "@/components/ui/Spinner";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";

export default function TicketsPage() {
  const { data: tickets, isLoading } = useTickets();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="mb-10"
      >
        <h1 className="font-display text-display-lg text-text-primary mb-2">
          Meus Ingressos
        </h1>
        <p className="text-body-md text-text-secondary">
          Gerencie e visualize seus ingressos para eventos.
        </p>
        <div className="h-px bg-gradient-to-r from-primary/50 to-transparent w-full mt-6" />
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <TicketList tickets={tickets || []} />
      )}
    </div>
  );
}
