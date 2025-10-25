"use client";

import { useState, FC, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore, useGameStore } from "@/shared/store";
import {
  refreshUserBalance,
  refreshExchangeRate,
} from "@/features/game-core/lib/services";

type DexModalProps = {
  onClose: () => void;
};

export const DexModal: FC<DexModalProps> = ({ onClose }) => {
  const { token1Amount: token1Balance, token2Amount: token2Balance } =
    useGameStore((state) => state.balance);
  const fee = useGameStore((state) => state.fee);
  const exchangeRate = useGameStore((state) => state.exchangeRate);
  const [visible, setVisible] = useState(true);
  const [output, setOutput] = useState<"" | "ETH" | "USDT">("");
  const [isSwapping, setIsSwapping] = useState(false);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    const fetchData = async () => {
      await refreshExchangeRate();
      await refreshUserBalance();
    };
    fetchData();
  }, []);

  // 💡 상태를 문자열로 관리
  const [token1Amount, setToken1Amount] = useState<string>("");
  const [token2Amount, setToken2Amount] = useState<string>("");

  const handleToken1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // ✅ 숫자 및 소수점만 허용
    if (!/^\d*\.?\d*$/.test(value)) return;

    // ✅ 소수점 8자리까지만 허용 (ETH)
    if (value.includes(".")) {
      const [int, dec] = value.split(".");
      value = int + "." + dec.slice(0, 8);
    }

    setOutput("USDT");
    setToken1Amount(value);

    // 입력 중 "." 만 입력되었을 경우 계산 안 함
    if (value === "" || value === ".") {
      setToken2Amount("");
      return;
    }

    const num = parseFloat(value);
    if (!isNaN(num)) setToken2Amount((num * exchangeRate).toFixed(2));
  };

  const handleToken2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (!/^\d*\.?\d*$/.test(value)) return;

    // ✅ 소수점 2자리까지만 허용 (USDT)
    if (value.includes(".")) {
      const [int, dec] = value.split(".");
      value = int + "." + dec.slice(0, 2);
    }

    setOutput("ETH");
    setToken2Amount(value);

    if (value === "" || value === ".") {
      setToken1Amount("");
      return;
    }

    const num = parseFloat(value);
    if (!isNaN(num)) setToken1Amount((num / exchangeRate).toFixed(8));
  };

  const handleSwap = async () => {
    setIsSwapping(true); // 🔥 스왑 시작할 때 버튼 비활성화
    const token = useAuthStore.getState().token;
    const address = useAuthStore.getState().address;
    if (!token || !address) {
      console.error("No token or address provided");
      resetInputs();
      alert("User not authenticated. Logging out...");
      useAuthStore.getState().clearAuth();
      handleClose();
      return;
    }
    const inputToken1Amount = output === "ETH" ? 0 : token1Amount;
    const inputToken2Amount = output === "USDT" ? 0 : token2Amount;

    try {
      const res = await fetch("/api/pools/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          token1Amount: inputToken1Amount,
          token2Amount: inputToken2Amount,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Swap failed:", error);
        alert("Swap failed: " + error.message);
        return;
      }
      resetInputs();
      alert("Swap successful!");
      handleClose();
    } catch (error) {
      console.error("❌ Swap failed:", error);
      resetInputs();
      alert("Swap Failed!");
    } finally {
      setIsSwapping(false); // 🔥 스왑 끝나면 버튼 다시 활성화
    }
  };

  const resetInputs = () => {
    setToken1Amount("0");
    setToken2Amount("0");
    setOutput("");
  };

  const outline = { textShadow: "1px 1px 1px #717171" };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 bg-[#00000080] backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-[480px] bg-gray-900 rounded-2xl text-white px-6 py-8 text-center font-start-2p text-xs font-semibold relative"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Refresh Ratio 버튼 */}

            <button
              onClick={refreshExchangeRate}
              disabled={isSwapping}
              className="absolute right-90 top-4 text-l border border-blue-600 rounded text-[383BE9] font-bold px-2 opacity-50"
            >
              Refresh
            </button>
            <button
              className="absolute right-4 top-3 text-xl"
              onClick={handleClose}
              aria-label="Close modal"
            >
              ✖️
            </button>

            <h2 className="text-xl text-white font-bold mb-8" style={outline}>
              📊 DEX
            </h2>

            <div className="text-white mb-4" style={outline}>
              <p> Current Pool Ratio</p> <br />
              <span className="text-lg font-bold">
                {exchangeRate > 0 ? (
                  <>
                    <div className="flex items-center justify-center gap-4">
                      <span>ETH</span> 1
                    </div>
                    :
                    <div className="flex items-center justify-center gap-4">
                      <span>USDT</span>${exchangeRate.toFixed(4)}{" "}
                    </div>
                  </>
                ) : (
                  "Loading..."
                )}
              </span>
            </div>

            <hr className="border-t-[2px] border-blue-600 mb-6" />

            <p className="m-4">ETH&nbsp;(Balance : {token1Balance})</p>
            <input
              type="text"
              placeholder="Enter ETH"
              className="w-full mb-4 p-3 rounded-full border-2 border-gray-300 text-black bg-white shadow disabled:bg-gray-300 disabled:cursor-not-allowed"
              value={token1Amount}
              step="0.00000001"
              inputMode="decimal"
              onChange={handleToken1Change}
              disabled={output === "ETH"} // 고정
            />

            <p className="m-4">USDT&nbsp;(Balance : {token2Balance})</p>
            <input
              type="text"
              placeholder="Enter USDT"
              className="w-full mb-4 p-3 rounded-full border-2 border-gray-300 text-black bg-white shadow disabled:bg-gray-300 disabled:cursor-not-allowed"
              value={token2Amount}
              onChange={handleToken2Change}
              disabled={output === "USDT"} // 고정
            />

            <p className="text-white mb-2" style={outline}>
              Fee ({(fee * 100).toFixed(2)}%) :
              <span className="font-bold ml-1">
                {(parseFloat(token2Amount) * fee).toFixed(3)}{" "}
                {output === "USDT" ? "ETH" : "USDT"}
              </span>
            </p>

            <button
              onClick={handleSwap}
              disabled={isSwapping} // 🔥 스왑 중이면 비활성화
              className={`border-blue-600 w-full bg-[#9799E6] text-white font-bold py-3 px-6 rounded-full transition duration-300 mb-4 mt-5
    ${isSwapping ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}
            >
              {isSwapping ? "⏳ Swapping..." : "🔄 Swap"}
            </button>

            <div className="text-white mb-6" style={outline}>
              <p>You will receive:</p>
              <br />
              <span className="text-xl font-bold">
                {output === "USDT" ? token2Amount : token1Amount} {output}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
