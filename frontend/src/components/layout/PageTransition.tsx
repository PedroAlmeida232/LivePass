"use client";

import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
