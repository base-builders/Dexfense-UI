"use client";

import { useState, FC, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/shared/store";

type DexModalProps = {
  onClose: () => void;
};

export const DexModal: FC<DexModalProps> = ({ onClose }) => {
  const [visible, setVisible] = useState(true);
  const [token1Amount, setToken1Amount] = useState<number>(0);
  const [token1Balance, setToken1Balance] = useState<number>(0);
  const [token2Amount, setToken2Amount] = useState<number>(0);
  const [token2Balance, setToken2Balance] = useState<number>(0);
  const [feeRate, setFeeRate] = useState<number>(0);
  const [ratio, setRatio] = useState<number>(-1);
  const [output, setOutput] = useState<"" | "token1" | "token2">("");
  const [isSwapping, setIsSwapping] = useState(false);

  const token = useAuthStore.getState().token;
  const user = useAuthStore.getState().address; // user도 꺼내야 함

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    getExpectRatio();
    getUserBalance();
  }, []);
  console.log("DEX Modal rendered");
  const getUserBalance = async () => {
    if (!token) {
      console.error("No auth token or address provided");
      return;
    }
    const res = await fetch(`/api/users/balance?address=${user}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("❌ Failed to fetch user balance");
      return;
    }
    const data = await res.json();
    setToken1Balance(data.userBalance.token1Amount);
    setToken2Balance(data.userBalance.token2Amount);
  };

  const getExpectRatio = async () => {
    const res = await fetch("/api/pools/expectRatio", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.error("❌ Failed to fetch expectRatio");
      return;
    }
    const data = await res.json();

    setRatio(data.expectRatio.token2Amount);
    setFeeRate(data.expectRatio.fee);
  };

  const handleToken1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 정규식: 숫자와 소수점 하나만 허용
    if (!/^\d*\.?\d*$/.test(value)) {
      return; // 잘못된 입력 무시
    }

    if (Number(value) === 0) {
      resetInputs();
      return;
    }
    setOutput("token2");
    setToken1Amount(Number(value));
    setToken2Amount(Number(value) * ratio);
  };

  const handleToken2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 정규식: 숫자와 소수점 하나만 허용
    if (!/^\d*\.?\d*$/.test(value)) {
      return; // 잘못된 입력 무시
    }

    if (Number(value) === 0) {
      resetInputs();
      return;
    }
    setOutput("token1");
    setToken2Amount(Number(value));
    setToken1Amount(Number(value) / ratio);
  };

  const handleSwap = async () => {
    setIsSwapping(true); // 🔥 스왑 시작할 때 버튼 비활성화
    const token = useAuthStore.getState().token;
    if (!token || !user) {
      console.error("No token or address provided");
      resetInputs();
      alert("Please log in again");
      handleClose();
      return;
    }
    const inputToken1Amount = output === "token1" ? 0 : token1Amount;
    const inputToken2Amount = output === "token2" ? 0 : token2Amount;

    try {
      const res = await fetch("/api/pools/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`, // 토큰 넣기
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
    setToken1Amount(0);
    setToken2Amount(0);
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
              onClick={getExpectRatio}
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
                {ratio > 0 ? (
                  <>
                    <div className="flex items-center justify-center gap-4">
                      <span>Solana</span> 1
                    </div>
                    :
                    <div className="flex items-center justify-center gap-4">
                      <span>USDT</span>${ratio.toFixed(4)}{" "}
                    </div>
                  </>
                ) : (
                  "Loading..."
                )}
              </span>
            </div>

            <hr className="border-t-[2px] border-blue-600 mb-6" />

            <p className="m-4">Solana&nbsp;(Balance : {token1Balance})</p>
            <input
              type="text"
              placeholder="Enter Token1 Amount"
              className="w-full mb-4 p-3 rounded-full border-2 border-gray-300 text-black bg-white shadow disabled:bg-gray-300 disabled:cursor-not-allowed"
              value={token1Amount}
              onChange={handleToken1Change}
              disabled={output === "token1"} // 고정
            />

            <p className="m-4">USDT&nbsp;(Balance : {token2Balance})</p>
            <input
              type="text"
              placeholder="Enter Solana"
              className="w-full mb-4 p-3 rounded-full border-2 border-gray-300 text-black bg-white shadow disabled:bg-gray-300 disabled:cursor-not-allowed"
              value={token2Amount}
              onChange={handleToken2Change}
              disabled={output === "token2"} // 고정
            />

            <p className="text-white mb-2" style={outline}>
              Fee ({(feeRate * 100).toFixed(2)}%) :
              <span className="font-bold ml-1">
                {(token2Amount * feeRate).toFixed(3)}{" "}
                {output === "token2" ? "Solana" : "USDT"}
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
                {output === "token2"
                  ? token2Amount.toFixed(4)
                  : token1Amount.toFixed(4)}{" "}
                {output}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
