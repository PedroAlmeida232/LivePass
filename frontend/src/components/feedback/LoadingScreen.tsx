"use client";

import { Spinner } from "@/components/ui/Spinner";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-bg flex flex-col items-center justify-center gap-6 z-50">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-primary rotate-45" />
        <h1 className="font-display text-display-md text-text-primary tracking-wide">
          LIVEPASS
        </h1>
      </div>
      <Spinner size="lg" />
    </div>
  );
}
