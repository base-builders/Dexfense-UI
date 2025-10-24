import { http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const config = getDefaultConfig({
  appName: "DexFense Protocol",
  projectId: process.env.NEXT_PUBLIC_WC_ID!,
  chains: [base, baseSepolia],
  transports: { [base.id]: http(), [baseSepolia.id]: http() },
  ssr: true,
});
