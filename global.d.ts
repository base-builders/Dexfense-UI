declare module "*.css";

declare global {
  interface Window {
    phaserGame: Phaser.Game;
  }
}

export {};
