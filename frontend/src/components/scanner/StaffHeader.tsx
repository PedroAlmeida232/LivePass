"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "../ui/Button";
import Link from "next/link";

export function StaffHeader() {
  const { logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-body-sm font-mono tracking-widest text-text-primary uppercase">
              Staff Mode <span className="text-text-muted mx-2">·</span> Scanner
            </span>
          </div>

          <Button variant="ghost" size="sm" onClick={logout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
