import { create } from "zustand";

interface NotificationState {
  queue: string[];
  push: (msg: string) => void;
  shift: () => string | undefined;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  queue: [],
  push: (msg) => set((state) => ({ queue: [...state.queue, msg] })),
  shift: () => {
    const [first, ...rest] = get().queue;
    set({ queue: rest });
    return first;
  },
  clear: () => set({ queue: [] }),
}));
