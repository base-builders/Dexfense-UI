import { useGameStore } from "@/shared";
import { RatioData, BalanceData } from "./types";

export const getUserBalance = async (
  address: string
): Promise<BalanceData | undefined> => {
  try {
    const res = await fetch(`/api/users/${address}/balance`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching balance:", error);
  }
};

export const getExpectedRatio = async (): Promise<RatioData | undefined> => {
  try {
    const res = await fetch(`/api/pools/expect-ratio`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching expected ratio:", error);
  }
};
