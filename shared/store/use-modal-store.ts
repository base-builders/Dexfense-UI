import { create } from "zustand";

type ModalState = {
  showLoginModal: boolean;
  setShowLoginModal: (val: boolean) => void;
  showDexModal: boolean;
  setShowDexModal: (val: boolean) => void;
};

export const useModalStore = create<ModalState>((set) => ({
  showLoginModal: false,
  setShowLoginModal: (val) => set({ showLoginModal: val }),
  showDexModal: false,
  setShowDexModal: (val) => set({ showDexModal: val }),
}));
