import { create } from "zustand";
import { persist } from "zustand/middleware";
import { subscribeWithSelector } from "zustand/middleware";

export interface GameState {
  balance: { token1Amount: number; token2Amount: number };
  setBalance: (amount: { token1Amount: number; token2Amount: number }) => void;
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  ratio: string;
  setRatio: (ratio: string) => void;
}

export const useGameStore = create(
  persist(
    subscribeWithSelector<GameState>((set) => ({
      balance: { token1Amount: 0, token2Amount: 0 },
      setBalance: (amount: { token1Amount: number; token2Amount: number }) =>
        set({ balance: amount }),
      exchangeRate: 1,
      setExchangeRate: (rate: number) => set({ exchangeRate: rate }),
      ratio: "1:1",
      setRatio: (ratio: string) => set({ ratio: ratio }),
    })),
    {
      name: "game-storage",
    }
  )
);
