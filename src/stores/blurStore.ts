"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BlurState {
  isBlurred: boolean;
  toggleBlur: () => void;
  setBlurred: (value: boolean) => void;
}

export const useBlurStore = create<BlurState>()(
  persist(
    (set) => ({
      isBlurred: true,
      toggleBlur: () => set((state) => ({ isBlurred: !state.isBlurred })),
      setBlurred: (value) => set({ isBlurred: value }),
    }),
    { name: "moneylog-blur" }
  )
);
