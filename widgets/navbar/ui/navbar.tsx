"use client";
import { useAuthStore } from "@/shared/store";
// import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
export const Navbar = () => {
  const userToken = useAuthStore((state) => state.token);
  const [showDexModal, setShowDexModal] = useState(false);
  const handleDexClick = () => {
    setShowDexModal(true);
  };
  //   return <ConnectButton />;
  return (
    <div>
      <div className="flex justify-center mt-20 flex-1 gap-6 font-quantico font-bold text-xl relative">
        <a
          href="https://dexfense-protocol.gitbook.io/fensepedia"
          target="_blank"
          rel="noopener noreferrer"
          className="w-[200px] h-[45px] px-3 py-2 border-2 hover:opacity-60 rounded flex items-center justify-center cursor-pointer bg-white/5"
        >
          📚 Fensepedia
        </a>
        <a
          href="#result-log"
          className="w-[200px] h-[45px] px-3 py-2 border-2 hover:opacity-60 rounded flex items-center justify-center cursor-pointer bg-white/5"
        >
          📝 Result Log
        </a>
        <div className="relative">
          {!userToken && (
            <span className="absolute top-[-48px] left-1/2 text-red-800 mt-2 -translate-x-1/2  text-xs px-4 py-2 rounded shadow z-10 whitespace-nowrap">
              Please login to use DEX feature
            </span>
          )}
          <button
            onClick={handleDexClick}
            className="w-[200px] h-[45px] px-3 py-2 border-2 hover:opacity-60 rounded flex items-center justify-center cursor-pointer bg-white/5 relative"
            disabled={!userToken}
            style={{
              opacity: !userToken ? 0.5 : 1,
              cursor: !userToken ? "not-allowed" : "pointer",
            }}
          >
            📊 DEX
          </button>
        </div>
      </div>
    </div>
  );
};
