import { Scene } from "phaser";
import { createPlatforms, GameRegistry } from "@/features/game-core/lib";
import { useAuthStore, useModalStore } from "@/shared";

export class MainMenu extends Scene {
  constructor() {
    super({ key: "MainMenu" });
  }

  create() {
    const unsubscribe = useAuthStore.subscribe(
      (state) => state.address,
      (address) => {
        if (address) {
          console.log("👤 Logged in:", address);
          this.scene.start("PoolList");
        }
      }
    );

    // 씬 종료 시 구독 해제
    this.events.once("shutdown", unsubscribe);
    this.events.once("destroy", unsubscribe);
    createPlatforms.call(this);
    this.add
      .text(this.scale.width / 2, 400, "LOGIN TO START", {
        fontFamily: '"Press Start 2P"',
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#228B22",
        padding: { x: 30, y: 20 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", async () => {
        useModalStore.getState().setShowLoginModal(true);
      });

    const centerX = this.scale.width / 2;

    this.add
      .text(centerX, 120, "Dexfense Protocol", {
        fontFamily: '"Press Start 2P"',
        fontSize: 32,
        color: "#F1FCD1",
        stroke: "#63A363",
        strokeThickness: 6,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.add
      .text(centerX, 300, "Enter the Defense", {
        fontFamily: '"Press Start 2P"',
        fontSize: 20,
        stroke: "#000000",
        strokeThickness: 3,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(100);
  }

  update() {
    // Update the main menu
  }
}
