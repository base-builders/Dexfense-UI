import { getExpectedRatio, getUserBalance } from "../api";
import { useGameStore, useAuthStore } from "@/shared";
import { StartGameData } from "../api/types";
import { Difficulty } from "../types";

export async function refreshUserBalance() {
  try {
    const address = useAuthStore.getState().address;
    if (!address) throw new Error("No address found");

    const data = await getUserBalance(address);
    if (!data) throw new Error("Failed to fetch balance");
    useGameStore.getState().setBalance({
      token1Amount: data.token1Amount,
      token2Amount: data.token2Amount,
    });

    return data; // 필요 시 반환도 가능
  } catch (err) {
    alert("Failed to refresh user balance. Please log in again.");
    useAuthStore.getState().clearAuth();
    console.error("Error refreshing user balance:", err);
  }
}

export async function refreshExchangeRate() {
  const data = await getExpectedRatio();
  if (!data) throw new Error("Failed to fetch expected ratio");

  useGameStore.getState().setExchangeRate(data.token2Amount);
  useGameStore.getState().setFee(data.fee);
  useGameStore.getState().setRatio(`1:${Number(data.token2Amount).toFixed(4)}`);
}

export async function getDafGameData(difficulty: string) {
  try {
    const res = await fetch(`/api/games/daf?difficulty=${difficulty}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching DAF game data:", error);
  }
}

export async function startGame(
  difficulty: Difficulty
): Promise<StartGameData | undefined> {
  try {
    console.log("Start Game");
    const res = await fetch(`/api/games/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: useAuthStore.getState().token || "",
      },
      body: JSON.stringify({ difficulty }),
    });
    if (!res.ok) {
      alert("Your session has been expired. Please log in again.");
      useAuthStore.getState().clearAuth();
      throw new Error(`Failed to start game: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error("Error starting DAF game:", error);
  }
}
