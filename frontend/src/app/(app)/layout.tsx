"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/layout/PageTransition";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Client-side protection (middleware handles the main one)
  useEffect(() => {
    if (!isAuthenticated) {
      // Small delay to allow hydration to finish if it's slow
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          router.push("/login");
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="pt-24 pb-12">
        {children}
      </main>
    </div>
  );
}
