"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-display-md text-text-primary">
              Bem-vindo, <span className="text-gradient-primary">{user?.email.split('@')[0]}</span>
            </h1>
            <p className="text-text-secondary font-body mt-1">
              Gerencie seus ingressos e participe de eventos incríveis.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary">Explorar Eventos</Button>
          </div>
        </motion.div>

        <Divider />

        {/* Stats Grid */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass rounded-2xl p-6">
            <p className="text-body-sm text-text-muted mb-1">Meus Ingressos</p>
            <p className="text-display-sm font-display text-text-primary">0</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-body-sm text-text-muted mb-1">Eventos Próximos</p>
            <p className="text-display-sm font-display text-text-primary">0</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-body-sm text-text-muted mb-1">Pontos de Fidelidade</p>
            <p className="text-display-sm font-display text-text-primary">150</p>
          </div>
        </motion.div>

        {/* Content Placeholder */}
        <motion.div variants={fadeUp} className="glass rounded-2xl p-12 text-center border-dashed border-2 border-border/50">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🎟️</span>
            </div>
            <h3 className="font-display text-2xl text-text-primary mb-3">Nenhum ingresso ativo</h3>
            <p className="text-body-md text-text-secondary mb-8">
              Você ainda não possui ingressos para os próximos eventos. Comece a explorar agora mesmo!
            </p>
            <Button variant="outline">Ver Eventos Disponíveis</Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
