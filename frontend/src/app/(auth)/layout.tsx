import { ParticleBackground } from "@/components/auth/ParticleBackground";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <ParticleBackground />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
