import { LoginForm } from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — LivePass",
  description: "Faça login na sua conta LivePass para acessar seus ingressos.",
};

export default function LoginPage() {
  return <LoginForm />;
}
