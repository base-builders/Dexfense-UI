import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
export const wagmiConfig = getDefaultConfig({
  appName: "DexFense Protocol",
  projectId: process.env.NEXT_PUBLIC_WC_ID!,
  chains: [base],
  transports: { [base.id]: http() },
});
