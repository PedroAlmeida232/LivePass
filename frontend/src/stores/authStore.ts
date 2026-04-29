import { create } from "zustand";
import type { User } from "@/types/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setAuth: (user: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth-user", JSON.stringify(user));
    }
    set({ user, isAuthenticated: true });
  },

  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-user");
    }
    set({ user: null, isAuthenticated: false });
  },

  hydrate: () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("auth-user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr) as User;
          set({ user, isAuthenticated: true });
        } catch {
          localStorage.removeItem("auth-user");
        }
      }
    }
  },
}));
