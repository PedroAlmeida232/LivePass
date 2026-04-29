import { RegisterForm } from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastro — LivePass",
  description: "Crie sua conta LivePass para comprar ingressos de eventos.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
