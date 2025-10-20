"use client";
import dynamic from "next/dynamic";
const DynamicPhaserGame = dynamic(
  () => import("@/widgets/phaser-game/ui").then((mod) => mod.PhaserGame),
  {
    ssr: false,
  }
);
export const GameClient = () => {
  return <DynamicPhaserGame />;
};
