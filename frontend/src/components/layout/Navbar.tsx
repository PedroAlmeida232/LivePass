"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "../ui/Button";
import { motion } from "framer-motion";

export function Navbar() {
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-display font-light tracking-widest text-primary">
                ◆ INGRESSO
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/tickets"
                className="text-body-sm text-text-secondary hover:text-primary transition-colors"
              >
                Meus Ingressos
              </Link>
              <Link
                href="/checkout"
                className="text-body-sm text-text-secondary hover:text-primary transition-colors"
              >
                Comprar
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-body-sm text-text-primary font-medium">
                    {user?.email.split("@")[0]}
                  </span>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">
                    {user?.role}
                  </span>
                </div>
                <div className="h-10 w-10 rounded-full bg-surface-2 border border-border flex items-center justify-center text-primary font-display">
                  {user?.email[0].toUpperCase()}
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Sair
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="primary" size="sm">
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
