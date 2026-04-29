"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { fadeUp, staggerContainer, fadeIn } from "@/lib/animations";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { ParticleBackground } from "@/components/auth/ParticleBackground";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <ParticleBackground />

      {/* Navbar */}
      <motion.nav
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-primary rotate-45" />
          <span className="font-display text-2xl tracking-wide text-gradient-primary">
            LIVEPASS
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">
              Cadastre-se
            </Button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <motion.main
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32 max-w-5xl mx-auto"
      >
        <motion.div variants={fadeUp} className="mb-6">
          <span className="inline-block px-4 py-1.5 rounded-full text-body-sm font-body text-primary border border-primary/30 bg-primary/5">
            Plataforma de Eventos
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="font-display text-display-xl tracking-tight mb-6 leading-[1.05]"
        >
          <span className="text-text-primary">Ingressos </span>
          <span className="text-gradient-primary">inteligentes</span>
          <br />
          <span className="text-text-primary">para eventos </span>
          <span className="text-gradient-primary">únicos</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-body-lg text-text-secondary font-body max-w-2xl mb-10 leading-relaxed"
        >
          Compre com PIX, receba QR Code dinâmico com renovação a cada 30
          segundos. Segurança e praticidade para organizadores e participantes.
        </motion.p>

        <motion.div variants={fadeUp} className="flex items-center gap-4">
          <Link href="/register">
            <Button variant="primary" size="lg">
              Começar agora →
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="lg">
              Já tenho conta
            </Button>
          </Link>
        </motion.div>
      </motion.main>
    </div>
  );
}
