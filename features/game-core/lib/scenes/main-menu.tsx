import { Scene } from "phaser";
import { createPlatforms, GameRegistry } from "@/features/game-core/lib";
import { useModalStore } from "@/shared";

export class MainMenu extends Scene {
  constructor() {
    super({ key: "MainMenu" });
  }

  create() {
    createPlatforms(this);
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

    this.game.registry.events.once(
      "changedata-user",
      (_parent: unknown, value: GameRegistry["user"]) => {
        console.log("✅ User changed:", value);

        const user = this.game.registry.get("user") as GameRegistry["user"];
        if (user?.address) {
          console.log("👤 Logged in user:", user.address);
          this.scene.start("PoolList");
        }
      }
    );
  }

  update() {
    // Update the main menu
  }
}
