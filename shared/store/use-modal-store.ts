import { create } from "zustand";

type ModalState = {
  showLoginModal: boolean;
  setShowLoginModal: (val: boolean) => void;
};

export const useModalStore = create<ModalState>((set) => ({
  showLoginModal: false,
  setShowLoginModal: (val) => set({ showLoginModal: val }),
}));
