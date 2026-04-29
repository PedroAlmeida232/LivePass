"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { PageTransition } from "@/components/layout/PageTransition";
import { StaffHeader } from "@/components/scanner/StaffHeader";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, hydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isAuthenticated && user?.role !== "STAFF") {
      router.push("/tickets");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "STAFF") {
    return null; // Prevent flicker before redirect
  }

  return (
    <div className="min-h-screen bg-bg">
      <StaffHeader />
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
}
