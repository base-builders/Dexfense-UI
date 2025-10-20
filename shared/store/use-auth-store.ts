import { create } from "zustand";

interface AuthState {
  address: string | null;
  token: string | null;
  setAuth: (address: string, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  address: null,
  token: null,
  setAuth: (address, token) => set({ address, token }),
  clearAuth: () => set({ address: null, token: null }),
}));
