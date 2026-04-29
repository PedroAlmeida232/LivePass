"use client";

import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import type { LoginResponse, RegisterRequest } from "@/types/auth";

export function useAuth() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const addToast = useUIStore((s) => s.addToast);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      setAuth({ email: data.email, role: data.role });
      addToast("Login realizado com sucesso!", "success");
      router.push("/tickets");
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401) {
        addToast("Credenciais inválidas", "error");
      } else {
        addToast("Erro ao fazer login. Tente novamente.", "error");
      }
      throw error;
    }
  };

  const register = async (email: string, password: string, cpf: string) => {
    try {
      const cleanCpf = cpf.replace(/\D/g, "");
      
      const payload: RegisterRequest = {
        email,
        password,
        cpf: cleanCpf,
        role: "CUSTOMER",
      };

      await api.post("/auth/register", payload);

      addToast("Conta criada com sucesso! Faça login.", "success");
      router.push("/login");
    } catch (error: any) {
      const backendError = error.response?.data;

      if (error.response?.status === 400 && backendError?.errors) {
        // Retornamos os erros específicos para o componente tratar
        throw backendError.errors;
      }

      if (error.response?.status === 409) {
        addToast("Este e-mail já está cadastrado", "error");
      } else {
        addToast("Erro ao criar conta. Tente novamente.", "error");
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      clearAuth();
      addToast("Você saiu da sua conta", "info");
      router.push("/login");
    } catch {
      clearAuth();
      router.push("/login");
    }
  };

  return { login, register, logout };
}
