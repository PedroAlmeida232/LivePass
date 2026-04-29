"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { Ticket } from "@/types/ticket";
import { TicketCard } from "./TicketCard";

interface TicketListProps {
  tickets: Ticket[];
}

export function TicketList({ tickets }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="text-center py-20"
      >
        <p className="text-text-secondary text-body-md">Você ainda não possui ingressos.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {tickets.map((ticket) => (
        <motion.div key={ticket.id} variants={fadeUp}>
          <TicketCard ticket={ticket} />
        </motion.div>
      ))}
    </motion.div>
  );
}
