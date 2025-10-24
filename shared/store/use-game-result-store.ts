import { create } from "zustand";

type GameResultState = {
  isPending: boolean;
  gameResultSubmitted: boolean;
  setIsPending: (isPending: boolean) => void;
  setGameResultSubmitted: (submitted: boolean) => void;
};

export const useGameResultStore = create<GameResultState>((set) => ({
  isPending: false,
  gameResultSubmitted: false,
  setGameResultSubmitted: (submitted) =>
    set({ gameResultSubmitted: submitted }),
  setIsPending: (isPending) => set({ isPending }),
}));
