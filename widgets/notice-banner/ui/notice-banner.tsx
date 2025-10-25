"use client";
import { useState } from "react";

export function NoticeBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center pointer-events-none">
      <div className="max-w-3xl w-full mx-4 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 pointer-events-auto flex items-start justify-between">
        <div className="text-sm text-white/90 leading-snug">
          <div className="font-semibold mb-1">
            🧱 Welcome to DexFense Closed Beta
          </div>
          <div>
            Normally, you’d connect your wallet here... but this build’s all
            off-chain — no tricks, no traps, no back doors.
          </div>
          <div className="mt-1">
            Just hit the green Login button, enter username & password, and jump
            right into battle.
          </div>
          <div className="mt-1 text-xs text-white/70">
            (Full wallet integration comes after validation phase 🔒)
          </div>
        </div>

        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => setVisible(false)}
            className="bg-emerald-500 text-white rounded-md px-3 py-1 text-sm font-semibold shadow hover:brightness-95"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
