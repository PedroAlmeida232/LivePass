"use client";

import { motion } from "framer-motion";
import { Ticket } from "@/types/ticket";
import { StatusBadge } from "@/components/checkout/StatusBadge";
import Link from "next/link";

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  return (
    <Link href={`/tickets/${ticket.id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        className="bg-surface border border-border rounded-2xl p-6 shadow-lg hover:shadow-primary/10 transition-shadow cursor-pointer group"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path>
              <path d="M13 5v2"></path>
              <path d="M13 17v2"></path>
              <path d="M13 11v2"></path>
            </svg>
          </div>
          <StatusBadge status={ticket.status === "PAID" ? "PAID" : "PENDING"} />
        </div>

        <div className="space-y-1 mb-6">
          <h3 className="font-display text-body-lg text-text-primary group-hover:text-primary transition-colors">
            Evento Principal
          </h3>
          <p className="text-body-sm text-text-secondary">
            {new Date(ticket.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center justify-between text-body-sm pt-4 border-t border-border">
          <span className="text-text-muted font-mono uppercase tracking-tighter">
            #{ticket.id.slice(0, 8)}
          </span>
          <span className="text-primary flex items-center gap-1 font-medium">
            Ver ingresso
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
