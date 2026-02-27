import { create } from "zustand";
import { api } from "@/lib/api-client";

interface User {
  id: string;
  nome: string;
  email: string;
  crc?: string;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,

  login: async (email, senha) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/auth/login", { email, senha });
      sessionStorage.setItem("access_token", data.accessToken);
      set({ user: data.user, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      sessionStorage.removeItem("access_token");
      set({ user: null });
      window.location.href = "/login";
    }
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data });
    } catch {
      set({ user: null });
    }
  },
}));
