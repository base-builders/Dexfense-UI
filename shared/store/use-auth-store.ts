import { create } from "zustand";
import { persist } from "zustand/middleware";
interface AuthState {
  address: string | null;
  token: string | null;
  setAuth: (address: string, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      address: null,
      token: null,
      setAuth: (address: string, token: string) => {
        set({ address, token });
      },
      clearAuth: () => {
        set({ address: null, token: null });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
export const getAuthState = () => useAuthStore.getState();
