import { getExpectedRatio, getUserBalance } from "../api";
import { useGameStore, useAuthStore } from "@/shared";

export async function refreshUserBalance() {
  const address = useAuthStore.getState().address;
  if (!address) throw new Error("No address found");

  const data = await getUserBalance(address);
  if (!data) throw new Error("Failed to fetch balance");
  useGameStore.getState().setBalance({
    token1Amount: data.token1Amount,
    token2Amount: data.token2Amount,
  });

  return data; // 필요 시 반환도 가능
}

export async function refreshExchangeRate() {
  const data = await getExpectedRatio();
  if (!data) throw new Error("Failed to fetch expected ratio");

  useGameStore.getState().setExchangeRate(data.token2Amount);
  useGameStore.getState().setRatio(`1:${Number(data.token2Amount).toFixed(4)}`);
}
