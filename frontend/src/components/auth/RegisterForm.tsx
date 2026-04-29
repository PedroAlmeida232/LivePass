"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";

import { registerSchema, type RegisterFormData } from "@/lib/validators";
import { fadeUp, shakeAnimation } from "@/lib/animations";
import { useAuth } from "@/hooks/useAuth";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const handleCpfMask = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    // Aplica a máscara 000.000.000-00
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    
    setValue("cpf", value, { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setHasError(false);
    try {
      await registerUser(data.email, data.password, data.cpf);
    } catch (err: any) {
      setHasError(true);
      if (typeof err === "object" && !err.stack) {
        // Mapeamento de erros específicos de campos retornados pelo backend
        Object.keys(err).forEach((key) => {
          setError(key as any, {
            type: "manual",
            message: err[key],
          });
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md"
    >
      <motion.div
        animate={hasError ? shakeAnimation : {}}
        onAnimationComplete={() => setHasError(false)}
        className="glass-strong rounded-2xl p-8 shadow-2xl shadow-black/50"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-3 h-3 bg-primary rotate-45" />
            <h1 className="font-display text-display-md tracking-wide text-gradient-primary">
              LIVEPASS
            </h1>
          </div>
          <p className="text-text-secondary text-body-sm font-body">
            Crie sua conta para começar
          </p>
        </div>

        <Divider className="mb-8" />

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="CPF"
            type="text"
            placeholder="000.000.000-00"
            error={errors.cpf?.message}
            {...register("cpf")}
            onChange={handleCpfMask}
          />

          <Input
            label="Senha"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />

          <Input
            label="Confirmar senha"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button
            type="submit"
            loading={isLoading}
            className="w-full mt-2"
            size="lg"
          >
            Criar conta
          </Button>
        </form>

        <Divider className="my-6" />

        {/* Footer */}
        <p className="text-center text-body-sm text-text-secondary font-body">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="text-primary hover:text-primary-light transition-colors duration-200 font-medium"
          >
            Entrar
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
