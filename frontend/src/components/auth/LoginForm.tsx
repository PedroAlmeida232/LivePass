"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";

import { loginSchema, type LoginFormData } from "@/lib/validators";
import { fadeUp, shakeAnimation } from "@/lib/animations";
import { useAuth } from "@/hooks/useAuth";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setHasError(false);
    try {
      await login(data.email, data.password);
    } catch {
      setHasError(true);
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
            Sistema de Eventos
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
            label="Senha"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            loading={isLoading}
            className="w-full mt-2"
            size="lg"
          >
            Entrar
          </Button>
        </form>

        <Divider className="my-6" />

        {/* Footer */}
        <p className="text-center text-body-sm text-text-secondary font-body">
          Não tem conta?{" "}
          <Link
            href="/register"
            className="text-primary hover:text-primary-light transition-colors duration-200 font-medium"
          >
            Cadastre-se
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
