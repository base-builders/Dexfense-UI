"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia } from "wagmi/chains";
import { http, createConfig } from "wagmi";

/**
 * RainbowKit / Wagmi 설정 파일
 * - WalletConnect projectId는 .env.local에서 NEXT_PUBLIC_WC_ID로 관리
 * - Base 메인넷 + 테스트넷(Base Sepolia) 지원
 */

export const wagmiConfig = createConfig(
  getDefaultConfig({
    appName: "DexFense Protocol",
    projectId: process.env.NEXT_PUBLIC_WC_ID!, // 👈 WalletConnect ID
    chains: [base, baseSepolia],
    transports: {
      [base.id]: http("https://mainnet.base.org"),
      [baseSepolia.id]: http("https://sepolia.base.org"),
    },
    ssr: true, // Next.js App Router용
  })
);
