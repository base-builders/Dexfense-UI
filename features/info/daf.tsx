"use client";

import React, { useEffect, useState } from "react";

// 카드 색상 및 테두리, 그림자, 배경을 어둡고 투명하게 조정
const difficulties = [
  {
    key: "easy",
    label: "Easy",
    color:
      "bg-gradient-to-br from-green-900/80 to-green-700/60 border-green-400/60",
    text: "text-green-100",
    border: "border-green-400/40",
    shadow: "shadow-green-900/40",
  },
  {
    key: "normal",
    label: "Normal",
    color:
      "bg-gradient-to-br from-yellow-900/80 to-yellow-700/60 border-yellow-400/60",
    text: "text-yellow-100",
    border: "border-yellow-400/40",
    shadow: "shadow-yellow-900/40",
  },
  {
    key: "hard",
    label: "Hard",
    color: "bg-gradient-to-br from-red-900/80 to-red-700/60 border-red-400/60",
    text: "text-red-100",
    border: "border-red-400/40",
    shadow: "shadow-red-900/40",
  },
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return (
    date.toLocaleDateString("en-US") +
    " " +
    date.toLocaleTimeString("en-US", { hour12: false })
  );
}

function formatFactor(value?: number | null) {
  if (value === undefined || value === null) return "-";
  return Number.isInteger(value) ? String(value) : value.toFixed(4);
}

export const DAF = () => {
  const [difficultyData, setDifficultyData] = useState<{
    [key: string]: { factorValue: number };
  }>({
    easy: { factorValue: 1.03 },
    normal: { factorValue: 1.03 },
    hard: { factorValue: 1.03 },
  });

  type GameHistoryEntry = {
    totalMonstersKilled: number;
    createdAt: string;
    user: {
      address: string;
    };
  };

  const [gameHistory, setGameHistory] = useState<{
    [key: string]: GameHistoryEntry[];
  }>({
    easy: [],
    normal: [],
    hard: [],
  });

  useEffect(() => {
    // route handler를 통해 factorValue 가져오기
    difficulties.forEach(async (diff) => {
      try {
        const res = await fetch(`/api/daf?difficulty=${diff.key}`);
        if (res.ok) {
          const data = await res.json();
          setDifficultyData((prev) => ({
            ...prev,
            [diff.key]: { factorValue: data.factorValue },
          }));
        }
      } catch (e) {
        console.error(e);
        // 실패 시 기본값 유지
      }
    });

    // route handler를 통해 게임 히스토리 가져오기
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => setGameHistory(data))
      .catch(() => {
        // 실패 시 기본값 유지
      });
  }, []);

  return (
    <article id="result-log">
      {/* 난이도 카드 3개 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-center gap-8 my-8">
        {difficulties.map((diff) => (
          <div
            key={diff.key}
            className={`
              flex-1 rounded-2xl border-2 ${diff.border} ${diff.color} ${diff.text}
              ${diff.shadow} shadow-lg
              flex flex-col items-center backdrop-blur-md
              transition-all duration-200 hover:scale-105 hover:border-white/80
            `}
            style={{
              background: "rgba(24, 24, 24, 0.6)", // 배경만 60% opacity
            }}
          >
            <h3 className="text-2xl font-bold mb-2 mt-4 drop-shadow-lg">
              {diff.label}
            </h3>
            <div className="text-lg mb-4">
              <span className="font-semibold text-white/80">
                Reward Factor:
              </span>{" "}
              <span className="font-mono text-white">
                {formatFactor(difficultyData[diff.key]?.factorValue)}
              </span>
            </div>
            <div className="w-full px-4 pb-4 flex-1 flex flex-col">
              <h4 className="font-bold mb-2 text-base text-white/80">
                Game History
              </h4>
              {gameHistory[diff.key]?.length === 0 ? (
                <div className="text-gray-400 text-sm flex-1 flex items-center justify-center">
                  No records yet.
                </div>
              ) : (
                <ul className="space-y-2 max-h-40 overflow-y-auto flex-1">
                  {gameHistory[diff.key].map((entry, idx) => (
                    <li
                      key={idx}
                      className="bg-white/10 rounded p-2 text-xs flex flex-col border border-white/10"
                    >
                      <span>
                        <span className="font-semibold text-white/70">
                          User:
                        </span>{" "}
                        <span className="text-white/90">
                          {entry.user.address}
                        </span>
                      </span>
                      <span>
                        <span className="font-semibold text-white/70">
                          Kills:
                        </span>{" "}
                        <span className="text-white/90">
                          {entry.totalMonstersKilled}
                        </span>
                      </span>
                      <span>
                        <span className="font-semibold text-white/70">
                          Date:
                        </span>{" "}
                        <span className="text-white/90">
                          {formatDate(entry.createdAt)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
};
